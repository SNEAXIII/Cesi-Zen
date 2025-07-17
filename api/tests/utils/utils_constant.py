import uuid
from datetime import datetime


# User
USER_ID = uuid.uuid4()
EMAIL = "user@gmail.com"
LOGIN = "login"
WRONG_PASSWORD = "WrongPassword"

# Password
PASSWORD = "ComplexPassword1!"
PLAIN_PASSWORD = "password"
HASHED_PASSWORD = "$2b$04$c5i699sDUICKICmOARITy.wCpNpnp8U/hXlqWtHmvgZBtXc4iUF0y"

# TODO put an immortal token here
FAKE_TOKEN = "FAKE_TOKEN"  # For unit test purpose

# Article
LABEL = "label"
CREATED_AT = datetime.now()
TITLE = "title"
CONTENT = "content"

# User pagination
UNKNOWN_ROLE = "unknown"
ROLE = None
STATUS = None
PAGE = 1
SIZE = 10
