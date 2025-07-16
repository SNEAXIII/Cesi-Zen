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
HASHED_PASSWORD = "hashed_password"
# TODO put an immortal token here
TOKEN = "TOKEN"

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
