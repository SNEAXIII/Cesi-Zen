import os
from typing import List, Optional

from sqlalchemy import Engine
from sqlmodel import SQLModel, create_engine
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine
from sqlalchemy.orm import sessionmaker
from src.models import Article, Category, User, LoginLog, ExerciseCoherenceCardiac  # noqa: F401


IS_ECHO = True
DB_NAME = "test.db"


sqlite_sync_engine: Optional[Engine] = None
sqlite_async_engine: Optional[AsyncEngine] = None


def reset_test_db():
    global sqlite_async_engine, sqlite_sync_engine
    if sqlite_sync_engine:
        try:
            sqlite_sync_engine.dispose()
        except Exception as e:
            print(f"Failed disposing sync engine: {e}")
    if sqlite_async_engine:
        try:
            sqlite_async_engine.sync_engine.dispose()
        except Exception as e:
            print(f"Failed disposing async engine: {e}")
    if os.path.exists(DB_NAME):
        os.remove(DB_NAME)
    sqlite_async_engine = create_async_engine(
        url=f"sqlite+aiosqlite:///{DB_NAME}",
        echo=IS_ECHO,
    )
    sqlite_sync_engine = create_engine(
        f"sqlite:///{DB_NAME}",
        echo=IS_ECHO,
    )
    SQLModel.metadata.create_all(sqlite_sync_engine)


async def get_test_session() -> AsyncSession:
    Session = sessionmaker(
        bind=sqlite_async_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    async with Session() as session:
        yield session


async def load_objects(objects: List[SQLModel]) -> None:
    async with AsyncSession(
        sqlite_async_engine,
        expire_on_commit=False,
    ) as session:
        for object in objects:
            session.add(object)
        await session.commit()
