from sqlalchemy import Column, String, Text, DateTime, Integer, ForeignKey, Table, Boolean, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timezone
import os
from pathlib import Path

# Database path
DB_PATH = Path(__file__).parent / "tagsnip.db"
DATABASE_URL = f"sqlite+aiosqlite:///{DB_PATH}"

# Create async engine
engine = create_async_engine(DATABASE_URL, echo=False)

# Create async session
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

# Base class for models
Base = declarative_base()

# Association table for snippet-tag many-to-many relationship
snippet_tags = Table(
    'snippet_tags',
    Base.metadata,
    Column('snippet_id', String, ForeignKey('snippets.id', ondelete='CASCADE'), primary_key=True),
    Column('tag_id', String, ForeignKey('tags.id', ondelete='CASCADE'), primary_key=True)
)

class Folder(Base):
    """Folder model for organizing snippets."""
    __tablename__ = 'folders'
    
    id = Column(String, primary_key=True)
    name = Column(String(100), nullable=False)
    color = Column(String(20), default='default')
    user_id = Column(String, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    snippets = relationship('Snippet', back_populates='folder', lazy='selectin')
    user = relationship('User', back_populates='folders')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'color': self.color,
            'snippetCount': len(self.snippets) if self.snippets else 0,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
        }

class User(Base):
    """User model for authentication."""
    __tablename__ = 'users'
    
    id = Column(String, primary_key=True)
    username = Column(String(100), nullable=False, unique=True)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    snippets = relationship('Snippet', back_populates='user', lazy='selectin')
    folders = relationship('Folder', back_populates='user', lazy='selectin')
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
        }

class Snippet(Base):
    """Snippet model for storing code snippets."""
    __tablename__ = 'snippets'
    
    id = Column(String, primary_key=True)
    title = Column(String(255), nullable=False, default='Untitled Snippet')
    description = Column(Text, nullable=True)
    code = Column(Text, nullable=False, default='')
    language = Column(String(50), nullable=False, default='javascript')
    user_id = Column(String, ForeignKey('users.id', ondelete='CASCADE'), nullable=True)
    folder_id = Column(String, ForeignKey('folders.id', ondelete='SET NULL'), nullable=True)
    is_favorite = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    tags = relationship('Tag', secondary=snippet_tags, back_populates='snippets', lazy='selectin')
    user = relationship('User', back_populates='snippets')
    folder = relationship('Folder', back_populates='snippets')
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'code': self.code,
            'language': self.language,
            'tags': [tag.name for tag in self.tags],
            'userId': self.user_id,
            'folderId': self.folder_id,
            'isFavorite': self.is_favorite or False,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
        }

class Tag(Base):
    """Tag model for organizing snippets."""
    __tablename__ = 'tags'
    
    id = Column(String, primary_key=True)
    name = Column(String(100), nullable=False, unique=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Relationship to snippets
    snippets = relationship('Snippet', secondary=snippet_tags, back_populates='tags', lazy='selectin')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'snippetCount': len(self.snippets) if self.snippets else 0,
        }

class OpenTab(Base):
    """Model to persist open tabs state."""
    __tablename__ = 'open_tabs'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    snippet_id = Column(String, ForeignKey('snippets.id', ondelete='CASCADE'), nullable=False)
    order = Column(Integer, default=0)
    is_active = Column(Integer, default=0)  # SQLite doesn't have boolean, use 0/1

async def init_db():
    """Initialize the database, creating tables if they don't exist."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def get_session():
    """Get a database session."""
    async with async_session() as session:
        yield session
