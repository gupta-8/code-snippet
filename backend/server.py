from fastapi import FastAPI, APIRouter, HTTPException, Depends, Query, Header
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from sqlalchemy import select, delete, func, or_, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from passlib.context import CryptContext
import jwt

from database import init_db, get_session, Snippet, Tag, OpenTab, User, Folder, snippet_tags
from schemas import (
    SnippetCreate, SnippetUpdate, SnippetResponse,
    TagCreate, TagResponse,
    SearchQuery, SearchResponse,
    ExportData, ImportData, ImportResult,
    TabState, TabsState,
    StatsResponse,
    UserCreate, UserLogin, UserResponse, Token, RefreshToken,
    FolderCreate, FolderUpdate, FolderResponse
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# JWT Configuration
SECRET_KEY = os.environ.get('JWT_SECRET')
if not SECRET_KEY:
    import warnings
    warnings.warn("JWT_SECRET not set! Using insecure default. Set JWT_SECRET in production!", RuntimeWarning)
    SECRET_KEY = 'dev-only-insecure-key-do-not-use-in-production'
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours
REFRESH_TOKEN_EXPIRE_DAYS = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Create the main app
app = FastAPI(title="Code Snippet Manager API", version="2.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Root-level health check (for Railway - no /api prefix)
@app.get("/health")
async def root_health_check():
    """Root health check for deployment platforms."""
    return {"status": "healthy", "version": "2.0.0"}

# Security
security = HTTPBearer(auto_error=False)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============ Auth Utilities ============

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: AsyncSession = Depends(get_session)
) -> Optional[User]:
    if not credentials:
        return None
    
    token = credentials.credentials
    payload = decode_token(token)
    
    if not payload or payload.get("type") != "access":
        return None
    
    user_id = payload.get("sub")
    if not user_id:
        return None
    
    result = await session.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()

async def require_auth(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: AsyncSession = Depends(get_session)
) -> User:
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    user = await get_current_user(credentials, session)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    return user

# ============ Startup Event ============

@app.on_event("startup")
async def startup():
    await init_db()
    logger.info("Database initialized")

# ============ Health Check ============

@api_router.get("/")
async def root():
    return {"message": "Code Snippet Manager API v2.0", "status": "healthy"}

@api_router.get("/health")
async def health():
    return {"status": "ok", "timestamp": datetime.now(timezone.utc).isoformat()}

# ============ Auth Endpoints ============

@api_router.post("/auth/signup", response_model=UserResponse, status_code=201)
async def signup(
    data: UserCreate,
    session: AsyncSession = Depends(get_session)
):
    """Register a new user."""
    # Check if username exists
    result = await session.execute(select(User).where(User.username == data.username.lower()))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Create user
    user = User(
        id=str(uuid.uuid4()),
        username=data.username.lower(),
        hashed_password=hash_password(data.password),
        created_at=datetime.now(timezone.utc)
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    
    return UserResponse(
        id=user.id,
        username=user.username,
        createdAt=user.created_at.isoformat()
    )

@api_router.post("/auth/login", response_model=Token)
async def login(
    data: UserLogin,
    session: AsyncSession = Depends(get_session)
):
    """Login and get access tokens."""
    result = await session.execute(select(User).where(User.username == data.username.lower()))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    access_token = create_access_token({"sub": user.id})
    refresh_token = create_refresh_token({"sub": user.id})
    
    return Token(access_token=access_token, refresh_token=refresh_token)

@api_router.post("/auth/refresh", response_model=Token)
async def refresh_token(
    data: RefreshToken,
    session: AsyncSession = Depends(get_session)
):
    """Refresh access token using refresh token."""
    payload = decode_token(data.refresh_token)
    
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    user_id = payload.get("sub")
    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    access_token = create_access_token({"sub": user.id})
    new_refresh_token = create_refresh_token({"sub": user.id})
    
    return Token(access_token=access_token, refresh_token=new_refresh_token)

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(user: User = Depends(require_auth)):
    """Get current authenticated user."""
    return UserResponse(
        id=user.id,
        username=user.username,
        createdAt=user.created_at.isoformat() if user.created_at else None
    )

# ============ Snippet CRUD (Protected) ============

@api_router.get("/snippets", response_model=List[SnippetResponse])
async def get_snippets(
    session: AsyncSession = Depends(get_session),
    user: User = Depends(require_auth),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0)
):
    """Get all snippets for current user."""
    result = await session.execute(
        select(Snippet)
        .options(selectinload(Snippet.tags))
        .where(Snippet.user_id == user.id)
        .order_by(Snippet.updated_at.desc())
        .limit(limit)
        .offset(offset)
    )
    snippets = result.scalars().all()
    return [s.to_dict() for s in snippets]

@api_router.get("/snippets/{snippet_id}", response_model=SnippetResponse)
async def get_snippet(
    snippet_id: str,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(require_auth)
):
    """Get a single snippet by ID."""
    result = await session.execute(
        select(Snippet)
        .options(selectinload(Snippet.tags))
        .where(Snippet.id == snippet_id, Snippet.user_id == user.id)
    )
    snippet = result.scalar_one_or_none()
    if not snippet:
        raise HTTPException(status_code=404, detail="Snippet not found")
    return snippet.to_dict()

@api_router.post("/snippets", response_model=SnippetResponse, status_code=201)
async def create_snippet(
    data: SnippetCreate,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(require_auth)
):
    """Create a new snippet."""
    snippet_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    
    # Validate folder if provided
    folder_id = None
    if data.folderId:
        folder_result = await session.execute(
            select(Folder).where(Folder.id == data.folderId, Folder.user_id == user.id)
        )
        folder = folder_result.scalar_one_or_none()
        if folder:
            folder_id = folder.id
    
    snippet = Snippet(
        id=snippet_id,
        title=data.title,
        description=data.description,
        code=data.code,
        language=data.language,
        user_id=user.id,
        folder_id=folder_id,
        is_favorite=data.isFavorite,
        created_at=now,
        updated_at=now
    )
    
    # Handle tags
    if data.tags:
        for tag_name in data.tags:
            tag_name = tag_name.strip().lower()
            if not tag_name:
                continue
            result = await session.execute(select(Tag).where(Tag.name == tag_name))
            tag = result.scalar_one_or_none()
            if not tag:
                tag = Tag(id=str(uuid.uuid4()), name=tag_name)
                session.add(tag)
            snippet.tags.append(tag)
    
    session.add(snippet)
    await session.commit()
    await session.refresh(snippet)
    
    return snippet.to_dict()

@api_router.put("/snippets/{snippet_id}", response_model=SnippetResponse)
async def update_snippet(
    snippet_id: str,
    data: SnippetUpdate,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(require_auth)
):
    """Update an existing snippet."""
    result = await session.execute(
        select(Snippet)
        .options(selectinload(Snippet.tags))
        .where(Snippet.id == snippet_id, Snippet.user_id == user.id)
    )
    snippet = result.scalar_one_or_none()
    if not snippet:
        raise HTTPException(status_code=404, detail="Snippet not found")
    
    if data.title is not None:
        snippet.title = data.title
    if data.description is not None:
        snippet.description = data.description
    if data.code is not None:
        snippet.code = data.code
    if data.language is not None:
        snippet.language = data.language
    if data.isFavorite is not None:
        snippet.is_favorite = data.isFavorite
    if data.folderId is not None:
        # Empty string means remove from folder
        if data.folderId == '':
            snippet.folder_id = None
        else:
            # Validate folder
            folder_result = await session.execute(
                select(Folder).where(Folder.id == data.folderId, Folder.user_id == user.id)
            )
            folder = folder_result.scalar_one_or_none()
            if folder:
                snippet.folder_id = folder.id
    
    snippet.updated_at = datetime.now(timezone.utc)
    
    if data.tags is not None:
        snippet.tags = []
        for tag_name in data.tags:
            tag_name = tag_name.strip().lower()
            if not tag_name:
                continue
            result = await session.execute(select(Tag).where(Tag.name == tag_name))
            tag = result.scalar_one_or_none()
            if not tag:
                tag = Tag(id=str(uuid.uuid4()), name=tag_name)
                session.add(tag)
            snippet.tags.append(tag)
    
    await session.commit()
    await session.refresh(snippet)
    
    return snippet.to_dict()

@api_router.delete("/snippets/{snippet_id}")
async def delete_snippet(
    snippet_id: str,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(require_auth)
):
    """Delete a snippet."""
    result = await session.execute(
        select(Snippet).where(Snippet.id == snippet_id, Snippet.user_id == user.id)
    )
    snippet = result.scalar_one_or_none()
    if not snippet:
        raise HTTPException(status_code=404, detail="Snippet not found")
    
    await session.delete(snippet)
    await session.commit()
    
    return {"message": "Snippet deleted", "id": snippet_id}

@api_router.post("/snippets/{snippet_id}/favorite")
async def toggle_favorite(
    snippet_id: str,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(require_auth)
):
    """Toggle favorite status of a snippet."""
    result = await session.execute(
        select(Snippet)
        .options(selectinload(Snippet.tags))
        .where(Snippet.id == snippet_id, Snippet.user_id == user.id)
    )
    snippet = result.scalar_one_or_none()
    if not snippet:
        raise HTTPException(status_code=404, detail="Snippet not found")
    
    snippet.is_favorite = not snippet.is_favorite
    await session.commit()
    await session.refresh(snippet)
    
    return snippet.to_dict()

# ============ Folders ============

@api_router.get("/folders", response_model=List[FolderResponse])
async def get_folders(
    session: AsyncSession = Depends(get_session),
    user: User = Depends(require_auth)
):
    """Get all folders for current user."""
    result = await session.execute(
        select(Folder)
        .options(selectinload(Folder.snippets))
        .where(Folder.user_id == user.id)
        .order_by(Folder.name)
    )
    folders = result.scalars().all()
    return [f.to_dict() for f in folders]

@api_router.get("/folders/{folder_id}", response_model=FolderResponse)
async def get_folder(
    folder_id: str,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(require_auth)
):
    """Get a single folder by ID."""
    result = await session.execute(
        select(Folder)
        .options(selectinload(Folder.snippets))
        .where(Folder.id == folder_id, Folder.user_id == user.id)
    )
    folder = result.scalar_one_or_none()
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    return folder.to_dict()

@api_router.post("/folders", response_model=FolderResponse, status_code=201)
async def create_folder(
    data: FolderCreate,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(require_auth)
):
    """Create a new folder."""
    folder = Folder(
        id=str(uuid.uuid4()),
        name=data.name.strip(),
        color=data.color,
        user_id=user.id,
        created_at=datetime.now(timezone.utc)
    )
    session.add(folder)
    await session.commit()
    await session.refresh(folder)
    
    return folder.to_dict()

@api_router.put("/folders/{folder_id}", response_model=FolderResponse)
async def update_folder(
    folder_id: str,
    data: FolderUpdate,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(require_auth)
):
    """Update a folder."""
    result = await session.execute(
        select(Folder)
        .options(selectinload(Folder.snippets))
        .where(Folder.id == folder_id, Folder.user_id == user.id)
    )
    folder = result.scalar_one_or_none()
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    
    if data.name is not None:
        folder.name = data.name.strip()
    if data.color is not None:
        folder.color = data.color
    
    await session.commit()
    await session.refresh(folder)
    
    return folder.to_dict()

@api_router.delete("/folders/{folder_id}")
async def delete_folder(
    folder_id: str,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(require_auth)
):
    """Delete a folder. Snippets in folder are moved to 'uncategorized'."""
    result = await session.execute(
        select(Folder).where(Folder.id == folder_id, Folder.user_id == user.id)
    )
    folder = result.scalar_one_or_none()
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    
    # Remove folder_id from all snippets in this folder
    await session.execute(
        update(Snippet).where(Snippet.folder_id == folder_id).values(folder_id=None)
    )
    
    await session.delete(folder)
    await session.commit()
    
    return {"message": "Folder deleted", "id": folder_id}

# ============ Tags ============

@api_router.get("/tags", response_model=List[TagResponse])
async def get_tags(
    session: AsyncSession = Depends(get_session),
    user: User = Depends(require_auth)
):
    """Get all tags with snippet counts for current user."""
    # Get snippets for current user
    snippets_result = await session.execute(
        select(Snippet)
        .options(selectinload(Snippet.tags))
        .where(Snippet.user_id == user.id)
    )
    user_snippets = snippets_result.scalars().all()
    
    # Count tags from user's snippets
    tag_counts = {}
    for snippet in user_snippets:
        for tag in snippet.tags:
            if tag.name not in tag_counts:
                tag_counts[tag.name] = {'id': tag.id, 'name': tag.name, 'count': 0}
            tag_counts[tag.name]['count'] += 1
    
    return [
        TagResponse(id=t['id'], name=t['name'], snippetCount=t['count'])
        for t in tag_counts.values()
    ]

@api_router.post("/tags", response_model=TagResponse, status_code=201)
async def create_tag(
    data: TagCreate,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(require_auth)
):
    """Create a new tag."""
    tag_name = data.name.strip().lower()
    
    result = await session.execute(select(Tag).where(Tag.name == tag_name))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Tag already exists")
    
    tag = Tag(id=str(uuid.uuid4()), name=tag_name)
    session.add(tag)
    await session.commit()
    await session.refresh(tag)
    
    return tag.to_dict()

@api_router.delete("/tags/{tag_id}")
async def delete_tag(
    tag_id: str,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(require_auth)
):
    """Delete a tag."""
    result = await session.execute(select(Tag).where(Tag.id == tag_id))
    tag = result.scalar_one_or_none()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    await session.delete(tag)
    await session.commit()
    
    return {"message": "Tag deleted", "id": tag_id}

# ============ Search ============

@api_router.post("/search", response_model=SearchResponse)
async def search_snippets(
    query: SearchQuery,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(require_auth)
):
    """Search snippets for current user."""
    stmt = select(Snippet).options(selectinload(Snippet.tags)).where(Snippet.user_id == user.id)
    
    if query.query:
        search_term = f"%{query.query.lower()}%"
        stmt = stmt.where(
            or_(
                Snippet.title.ilike(search_term),
                Snippet.code.ilike(search_term),
                Snippet.description.ilike(search_term)
            )
        )
    
    if query.language:
        stmt = stmt.where(Snippet.language == query.language)
    
    result = await session.execute(stmt.order_by(Snippet.updated_at.desc()))
    snippets = result.scalars().all()
    
    if query.tags:
        query_tags = [t.lower() for t in query.tags]
        snippets = [
            s for s in snippets
            if all(tag in [t.name for t in s.tags] for tag in query_tags)
        ]
    
    return SearchResponse(
        snippets=[s.to_dict() for s in snippets],
        total=len(snippets)
    )

@api_router.get("/search")
async def search_snippets_get(
    q: str = Query('', description="Search query"),
    tags: str = Query('', description="Comma-separated tag names"),
    language: str = Query('', description="Filter by language"),
    session: AsyncSession = Depends(get_session),
    user: User = Depends(require_auth)
):
    """Search snippets (GET method)."""
    tag_list = [t.strip() for t in tags.split(',') if t.strip()] if tags else []
    query = SearchQuery(query=q, tags=tag_list, language=language if language else None)
    return await search_snippets(query, session, user)

# ============ Import/Export ============

@api_router.get("/export")
async def export_all(
    session: AsyncSession = Depends(get_session),
    user: User = Depends(require_auth)
):
    """Export all snippets for current user."""
    snippets_result = await session.execute(
        select(Snippet)
        .options(selectinload(Snippet.tags))
        .where(Snippet.user_id == user.id)
    )
    snippets = snippets_result.scalars().all()
    
    # Get unique tags from user's snippets
    user_tags = set()
    for s in snippets:
        for t in s.tags:
            user_tags.add((t.id, t.name))
    
    export_data = ExportData(
        version="2.0",
        exportedAt=datetime.now(timezone.utc).isoformat(),
        snippets=[s.to_dict() for s in snippets],
        tags=[TagResponse(id=t[0], name=t[1], snippetCount=0) for t in user_tags]
    )
    
    return export_data

@api_router.post("/import", response_model=ImportResult)
async def import_snippets(
    data: ImportData,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(require_auth)
):
    """Import snippets for current user."""
    imported = 0
    skipped = 0
    errors = []
    
    for snippet_data in data.snippets:
        try:
            snippet_id = str(uuid.uuid4())
            now = datetime.now(timezone.utc)
            
            snippet = Snippet(
                id=snippet_id,
                title=snippet_data.title,
                description=snippet_data.description,
                code=snippet_data.code,
                language=snippet_data.language,
                user_id=user.id,
                created_at=now,
                updated_at=now
            )
            
            for tag_name in snippet_data.tags:
                tag_name = tag_name.strip().lower()
                if not tag_name:
                    continue
                result = await session.execute(select(Tag).where(Tag.name == tag_name))
                tag = result.scalar_one_or_none()
                if not tag:
                    tag = Tag(id=str(uuid.uuid4()), name=tag_name)
                    session.add(tag)
                snippet.tags.append(tag)
            
            session.add(snippet)
            imported += 1
        except Exception as e:
            errors.append(f"Error importing '{snippet_data.title}': {str(e)}")
            skipped += 1
    
    await session.commit()
    
    return ImportResult(imported=imported, skipped=skipped, errors=errors)

# ============ Tab State ============

@api_router.get("/tabs", response_model=TabsState)
async def get_tabs(
    session: AsyncSession = Depends(get_session),
    user: User = Depends(require_auth)
):
    """Get current tab state."""
    result = await session.execute(
        select(OpenTab).order_by(OpenTab.order)
    )
    tabs = result.scalars().all()
    return TabsState(
        tabs=[TabState(
            snippetId=t.snippet_id,
            order=t.order,
            isActive=bool(t.is_active)
        ) for t in tabs]
    )

@api_router.put("/tabs")
async def save_tabs(
    data: TabsState,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(require_auth)
):
    """Save tab state."""
    await session.execute(delete(OpenTab))
    
    for tab in data.tabs:
        open_tab = OpenTab(
            snippet_id=tab.snippetId,
            order=tab.order,
            is_active=1 if tab.isActive else 0
        )
        session.add(open_tab)
    
    await session.commit()
    return {"message": "Tabs saved"}

# ============ Stats ============

@api_router.get("/stats", response_model=StatsResponse)
async def get_stats(
    session: AsyncSession = Depends(get_session),
    user: User = Depends(require_auth)
):
    """Get statistics for current user."""
    snippets_count = await session.execute(
        select(func.count(Snippet.id)).where(Snippet.user_id == user.id)
    )
    total_snippets = snippets_count.scalar()
    
    lang_result = await session.execute(
        select(Snippet.language, func.count(Snippet.id))
        .where(Snippet.user_id == user.id)
        .group_by(Snippet.language)
    )
    language_distribution = {row[0]: row[1] for row in lang_result.all()}
    
    recent_result = await session.execute(
        select(Snippet)
        .options(selectinload(Snippet.tags))
        .where(Snippet.user_id == user.id)
        .order_by(Snippet.updated_at.desc())
        .limit(5)
    )
    recent_snippets = recent_result.scalars().all()
    
    # Count unique tags
    tags_set = set()
    for s in recent_snippets:
        for t in s.tags:
            tags_set.add(t.id)
    
    return StatsResponse(
        totalSnippets=total_snippets,
        totalTags=len(tags_set),
        languageDistribution=language_distribution,
        recentSnippets=[s.to_dict() for s in recent_snippets]
    )

# ============ Cleanup orphaned tags ============

@api_router.post("/tags/cleanup")
async def cleanup_tags(
    session: AsyncSession = Depends(get_session),
    user: User = Depends(require_auth)
):
    """Remove tags with no associated snippets."""
    result = await session.execute(
        select(Tag).options(selectinload(Tag.snippets))
    )
    tags = result.scalars().all()
    
    removed = 0
    for tag in tags:
        if not tag.snippets:
            await session.delete(tag)
            removed += 1
    
    await session.commit()
    return {"message": f"Removed {removed} orphaned tags"}

# ============ Public Share Endpoint (No Auth Required) ============

@api_router.get("/share/{snippet_id}")
async def get_shared_snippet(
    snippet_id: str,
    session: AsyncSession = Depends(get_session)
):
    """Get a snippet for public sharing (read-only, no auth required)."""
    result = await session.execute(
        select(Snippet)
        .options(selectinload(Snippet.tags))
        .where(Snippet.id == snippet_id)
    )
    snippet = result.scalar_one_or_none()
    if not snippet:
        raise HTTPException(status_code=404, detail="Snippet not found")
    return snippet.to_dict()

# Include the router in the main app
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)