import asyncio

from bleach.sanitizer import Cleaner


_cleaner = Cleaner(
    tags={
        "b",
        "i",
        "u",
        "em",
        "strong",
        "a",
        "p",
        "ul",
        "ol",
        "li",
        "br",
        "span",
        "blockquote",
        "code",
        "pre",
    },
    attributes={
        "a": ["href", "title", "target"],
        "span": ["style"],
    },
    strip=True,
)


async def sanitize_content_async(content: str) -> str:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _cleaner.clean, content)
