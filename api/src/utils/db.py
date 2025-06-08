from typing import Annotated

from fastapi import Depends
from sqlmodel import create_engine, Session
from sqlalchemy.ext.asyncio import AsyncEngine
from sqlalchemy.orm import sessionmaker
from sqlmodel.ext.asyncio.session import AsyncSession

from src.security.secrets import SECRET

async_engine = AsyncEngine(
    create_engine(
        url=f"mysql+aiomysql://{SECRET.MARIADB_USER}:{SECRET.MARIADB_PASSWORD}@{SECRET.MARIADB_HOST}/{SECRET.MARIADB_DATABASE}",
        # Enable this for verbose log in the ORM
        # echo=True,
    )
)


async def get_session() -> AsyncSession:
    Session = sessionmaker(
        bind=async_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    async with Session() as session:
        yield session


SessionDep = Annotated[Session, Depends(get_session)]
