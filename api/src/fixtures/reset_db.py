from sqlalchemy.exc import OperationalError

import src.models  # noqa: F401
from alembic import command
from alembic.config import Config
from sqlalchemy import text
from sqlmodel import Session, SQLModel, create_engine
from src.security.secrets import SECRET

engine = create_engine(
    f"mysql+pymysql://{SECRET.MARIADB_USER}:{SECRET.MARIADB_PASSWORD}@{SECRET.MARIADB_HOST}/{SECRET.MARIADB_DATABASE}",
    # echo=True,
)

alembic_cfg = Config("alembic.ini")


def reset():
    print("🚀 Resetting database")
    SQLModel.metadata.drop_all(engine)
    try:
        with Session(engine) as session:
            session.exec(text("drop table alembic_version"))
    except OperationalError:
        pass
    print("✅ Database reset with success !")
    print("🚀 Start migration")
    command.upgrade(alembic_cfg, "head")
    print("✅ Migration with success !")


if __name__ == "__main__":
    reset()
