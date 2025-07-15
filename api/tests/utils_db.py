import os
import pytest
from typing import List
from sqlmodel import SQLModel, create_engine
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine
from sqlalchemy.orm import sessionmaker
from src.models import Article, Category, User, LoginLog, ExerciseCoherenceCardiac  # noqa: F401


IS_ECHO = True
DB_NAME = "test.db"

sqlite_async_engine: AsyncEngine = create_async_engine(
    url=f"sqlite+aiosqlite:///{DB_NAME}",
    echo=IS_ECHO,
)
sqlite_sync_engine = create_engine(
    f"sqlite:///{DB_NAME}",
    echo=IS_ECHO,
)


async def get_test_session() -> AsyncSession:
    Session = sessionmaker(
        bind=sqlite_async_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    async with Session() as session:
        yield session


@pytest.fixture(autouse=True)
def reset_test_db() -> None:
    sep_lines = "_" * 50
    if os.path.isfile(DB_NAME):
        print(f"Reset db...\n{sep_lines}")
        os.remove(DB_NAME)
        print(f"Done!\n{sep_lines}")
    print(f"Load entities...\n{sep_lines}")
    SQLModel.metadata.create_all(sqlite_sync_engine)
    print(f"Done!\n{sep_lines}")


async def load_objects(objects: List[SQLModel]) -> None:
    async with AsyncSession(
        sqlite_async_engine,
        expire_on_commit=False,
    ) as session:
        for object in objects:
            session.add(object)
        await session.commit()
