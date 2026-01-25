from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# ============ Auth Schemas ============

class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=8, description="Password must be at least 8 characters")

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: str
    username: str
    createdAt: Optional[str] = None
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshToken(BaseModel):
    refresh_token: str

# ============ Snippet Schemas ============

class SnippetBase(BaseModel):
    title: str = Field(default='Untitled Snippet', max_length=255)
    description: Optional[str] = None
    code: str = ''
    language: str = 'javascript'
    tags: List[str] = Field(default_factory=list)
    folderId: Optional[str] = None
    isFavorite: bool = False

class SnippetCreate(SnippetBase):
    pass

class SnippetUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    code: Optional[str] = None
    language: Optional[str] = None
    tags: Optional[List[str]] = None
    folderId: Optional[str] = None
    isFavorite: Optional[bool] = None

class SnippetResponse(SnippetBase):
    id: str
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None
    
    class Config:
        from_attributes = True

# ============ Folder Schemas ============

class FolderBase(BaseModel):
    name: str = Field(max_length=100)
    color: str = Field(default='default')

class FolderCreate(FolderBase):
    pass

class FolderUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None

class FolderResponse(FolderBase):
    id: str
    snippetCount: int = 0
    createdAt: Optional[str] = None
    
    class Config:
        from_attributes = True

# ============ Tag Schemas ============

class TagBase(BaseModel):
    name: str = Field(max_length=100)

class TagCreate(TagBase):
    pass

class TagResponse(TagBase):
    id: str
    snippetCount: int = 0
    
    class Config:
        from_attributes = True

# ============ Search Schemas ============

class SearchQuery(BaseModel):
    query: str = ''
    tags: List[str] = Field(default_factory=list)
    language: Optional[str] = None

class SearchResponse(BaseModel):
    snippets: List[SnippetResponse]
    total: int

# ============ Import/Export Schemas ============

class ExportData(BaseModel):
    version: str = '1.0'
    exportedAt: str
    snippets: List[SnippetResponse]
    tags: List[TagResponse]

class ImportData(BaseModel):
    snippets: List[SnippetCreate]

class ImportResult(BaseModel):
    imported: int
    skipped: int
    errors: List[str] = Field(default_factory=list)

# ============ Tab State Schemas ============

class TabState(BaseModel):
    snippetId: str
    order: int = 0
    isActive: bool = False

class TabsState(BaseModel):
    tabs: List[TabState]

# ============ Stats Schema ============

class StatsResponse(BaseModel):
    totalSnippets: int
    totalTags: int
    languageDistribution: dict
    recentSnippets: List[SnippetResponse]
