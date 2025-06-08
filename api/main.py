from typing import Annotated

import logging
from fastapi import Depends, FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from icecream import ic
from starlette import status
from starlette.requests import Request
from starlette.responses import JSONResponse

from src.Exceptions.jwt_token_exceptions import (
    JwtError,
)
from src.controllers.auth_controller import auth_controller
from src.dto.dto_utilisateurs import (
    UserProfile,
)
from src.enums.Roles import Roles
from src.models import User
from src.security.casbin import ENFORCER
from src.services.JWTService import (
    oauth2_scheme,
    JWTService,
)
from src.services.AuthService import AuthService

# ic.disable()


app = FastAPI()
app.include_router(auth_controller)
middleware_logger = logging.getLogger("Middleware")


@app.middleware("http")
async def check_user_role(
    request: Request,
    next_function,
):
    uri = request.url.path.rstrip("/")
    ic(f"Requested {uri = }")
    token = None
    # Token recovery
    try:
        token = await oauth2_scheme(request)
    except HTTPException as exception:
        error_message = str(exception)
        middleware_logger.warning("Error while recover Jwt:\n%s", error_message)
    # Token parsing
    role = None
    if token:
        try:
            role = JWTService.decode_jwt(token)["role"]
        except JwtError as exception:
            return_message = str(exception)
            middleware_logger.warning("Error while decoding Jwt:\n%s", return_message)
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"message": return_message},
            )
    # Role verification
    if role is None:
        role = Roles.ANONYMOUS.value
    can_access: bool = ENFORCER.enforce(role, uri, request.method)
    ic(role, uri, request.method, can_access)
    if not can_access:
        middleware_logger.error(f"Can't access to the route {uri} with role {role}")
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"message": "Role insuffisant"},
        )
    middleware_logger.info(f"Can access to the route {uri} with role {role}")
    # Execute the requested function
    response = await next_function(request)
    return response


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    """ "Override default validation error for a better structure"""
    errors_dict = {}
    for error in exc.errors():
        location_list = error.get("loc")
        if not location_list:
            raise ValueError(f"loc parameter is not correct:\n {error}")
        location = location_list[-1]
        # Remove useless error type in final message for display purpose
        error_type = error.get("type").capitalize().replace("_", " ")
        error_message = error.get("msg").removeprefix(f"{error_type}, ")
        errors_dict[location] = {"type": error.get("type"), "message": error_message}
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"message": "Erreur lors de la validation", "errors": errors_dict},
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": exc.detail},
    )


@app.get("/users/profile/", response_model=UserProfile)
async def read_users_me(
    current_user: Annotated[User, Depends(AuthService.get_current_user_in_jwt)],
):
    return current_user
