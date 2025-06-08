import functools
import asyncio
import bcrypt

bcrypt.__about__ = bcrypt
from passlib.context import CryptContext  # noqa: E402
from src.security.secrets import SECRET  # noqa: E402

crypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class PasswordService:
    @classmethod
    async def verify_password(cls,plain_password: str, hashed_password: str) -> bool:
        return await asyncio.get_event_loop().run_in_executor(
            None, crypt_context.verify, plain_password, hashed_password
        )

    @classmethod
    async def get_string_hash(cls,string: str):
        return await asyncio.get_event_loop().run_in_executor(
            None,
            functools.partial(crypt_context.hash, string, rounds=SECRET.BCRYPT_HASH_ROUND),
        )
