from enum import Enum


class Roles(str, Enum):
    ADMIN = "admin"
    USER = "user"
    ANONYMOUS = "anonymous"
