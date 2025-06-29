from time import perf_counter
from fastapi.openapi.utils import get_openapi
import logging
from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from icecream import ic
from starlette import status
from starlette.requests import Request
from starlette.responses import JSONResponse

from src.controllers.admin_controller import admin_controller
from src.controllers.auth_controller import auth_controller
from src.controllers.user_controller import user_controller
from src.controllers.category_controller import category_controller
from fastapi.middleware.cors import CORSMiddleware
# ic.disable()


app = FastAPI()
# origins = ["http://localhost:*", "http://192.168.1.14:3000", "http://127.0.0.1:8000"]
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(admin_controller)
app.include_router(auth_controller)
app.include_router(user_controller)
app.include_router(category_controller)
middleware_logger = logging.getLogger("Middleware")


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="Cesi Zen",
        version="1.0.0",
        description="Documentation for Cesi Zen api backend",
        routes=app.routes,
    )
    ## Uncomment this code if you want to paste
    ## jwt instead of login and password in swagger doc
    # openapi_schema["components"]["securitySchemes"] = {
    #     "BearerAuth": {
    #         "type": "http",
    #         "scheme": "bearer",
    #         "bearerFormat": "JWT"
    #     }
    # }
    # openapi_schema["security"] = [{"bearerAuth": []}]
    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi


@app.middleware("http")
async def check_user_role(
    request: Request,
    next_function,
):
    uri = request.url.path.rstrip("/")
    method = request.method
    body = await request.body()
    ic(f"Requested {method} {uri = }")
    # print(f"{body = }")
    start_time = perf_counter()
    response = await next_function(request)
    process_time = perf_counter() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    """Override default validation error for a better structure"""
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


ic(app.routes)
