import uuid
from datetime import datetime


# User
USER_ID = uuid.uuid4()
LOGIN = "login"
EMAIL = f"{LOGIN}@gmail.com"
WRONG_PASSWORD = "WrongPassword"
USER_LOGIN  = "user"
USER_EMAIL = f"{USER_LOGIN}@gmail.com"
ADMIN_LOGIN  = "admin"
ADMIN_EMAIL  = f"{ADMIN_LOGIN}@gmail.com"


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
