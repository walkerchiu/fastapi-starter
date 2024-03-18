from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.openapi import utils

from asgiref.sync import sync_to_async
from pydantic import ValidationError
from pydantic.errors import PydanticUserError
from starlette.exceptions import HTTPException
from starlette.middleware.cors import CORSMiddleware
from uvicorn.protocols.http.h11_impl import STATUS_PHRASES

from app.common.exception.errors import BaseExceptionMixin
from app.common.log import log
from app.common.response.response_code import CustomResponseCode
from app.common.response.response_schema import ResponseModel, response_base
from app.core.conf import settings
from app.schemas import (
    CUSTOM_USAGE_ERROR_MESSAGES,
    CUSTOM_VALIDATION_ERROR_MESSAGES,
)
from app.utils.serializers import MsgSpecJSONResponse


@sync_to_async
def _get_exception_code(status_code: int):
    """
    Get the custom exception code for a given status code.

    Args:
    - status_code: The HTTP status code.

    Returns:
    - int: The custom exception code.
    """
    try:
        STATUS_PHRASES[status_code]
    except Exception:
        code = CustomResponseCode.HTTP_400.code
    else:
        code = status_code
    return code


async def _validation_exception_handler(
    request: Request, e: RequestValidationError | ValidationError
):
    """
    Handle validation errors and format them into a standard response format.

    Args:
    - request: The request object.
    - e: The validation error.

    Returns:
    - MsgSpecJSONResponse: The formatted response.
    """
    # Error handling logic
    errors = []
    for error in e.errors():
        custom_message = CUSTOM_VALIDATION_ERROR_MESSAGES.get(error["type"])
        if custom_message:
            ctx = error.get("ctx")
            if not ctx:
                error["message"] = custom_message
            else:
                error["message"] = custom_message.format(**ctx)
                ctx_error = ctx.get("error")
                if ctx_error:
                    error["ctx"]["error"] = (
                        ctx_error.__str__().replace("'", '"')
                        if isinstance(ctx_error, Exception)
                        else None
                    )
        errors.append(error)
    error = errors[0]
    if error.get("type") == "json_invalid":
        message = "Failed to parse json"
    else:
        error_input = error.get("input")
        field = str(error.get("loc")[-1])
        error_msg = error.get("message")
        message = (
            f"{error_msg} '{field}', Input: {error_input}"
            if settings.APP_ENV == "dev"
            else error_msg
        )
    data = {"errors": errors} if settings.APP_ENV == "dev" else None
    content = {
        "code": CustomResponseCode.HTTP_422.code,
        "message": message,
        "data": data,
    }

    # Used to obtain exception information in middleware
    request.state.__request_validation_exception__ = content

    return MsgSpecJSONResponse(status_code=422, content=content)


def register_exception(app: FastAPI):
    """
    Register exception handlers for the FastAPI application.

    Args:
    - app: The FastAPI application instance.
    """
    # Exception handlers registration logic

    # Override fastapi 422 schema
    utils.validation_error_response_definition = ResponseModel.model_json_schema()

    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        if settings.APP_ENV == "dev":
            content = {
                "code": exc.status_code,
                "message": exc.detail,
                "data": None,
            }
        else:
            res = await response_base.fail(res=CustomResponseCode.HTTP_400)
            content = res.model_dump()

        # Used to obtain exception information in middleware
        request.state.__request_http_exception__ = content

        return MsgSpecJSONResponse(
            status_code=await _get_exception_code(exc.status_code),
            content=content,
            headers=exc.headers,
        )

    @app.exception_handler(RequestValidationError)
    async def fastapi_validation_exception_handler(
        request: Request, exc: RequestValidationError
    ):
        return await _validation_exception_handler(request, exc)

    @app.exception_handler(ValidationError)
    async def pydantic_validation_exception_handler(
        request: Request, exc: ValidationError
    ):
        return await _validation_exception_handler(request, exc)

    @app.exception_handler(PydanticUserError)
    async def pydantic_user_error_handler(request: Request, exc: PydanticUserError):
        return MsgSpecJSONResponse(
            status_code=CustomResponseCode.HTTP_500.code,
            content={
                "code": CustomResponseCode.HTTP_500.code,
                "message": CUSTOM_USAGE_ERROR_MESSAGES.get(exc.code),
                "data": None,
            },
        )

    @app.exception_handler(AssertionError)
    async def assertion_error_handler(request: Request, exc: AssertionError):
        if settings.APP_ENV == "dev":
            content = {
                "code": CustomResponseCode.HTTP_500.code,
                "message": str("".join(exc.args) if exc.args else exc.__doc__),
                "data": None,
            }
        else:
            res = await response_base.fail(res=CustomResponseCode.HTTP_500)
            content = res.model_dump()

        return MsgSpecJSONResponse(
            status_code=CustomResponseCode.HTTP_500.code,
            content=content,
        )

    @app.exception_handler(Exception)
    async def all_exception_handler(request: Request, exc: Exception):
        if isinstance(exc, BaseExceptionMixin):
            return MsgSpecJSONResponse(
                status_code=await _get_exception_code(exc.code),
                content={
                    "code": exc.code,
                    "message": str(exc.message),
                    "data": exc.data if exc.data else None,
                },
                background=exc.background,
            )
        else:
            import traceback

            log.error(f"❌ Unknown exception: {exc}")
            log.error(traceback.format_exc())

            if settings.APP_ENV == "dev":
                content = {
                    "code": CustomResponseCode.HTTP_500.code,
                    "message": str(exc),
                    "data": None,
                }
            else:
                res = await response_base.fail(res=CustomResponseCode.HTTP_500)
                content = res.model_dump()

            return MsgSpecJSONResponse(
                status_code=CustomResponseCode.HTTP_500.code, content=content
            )

    if settings.MIDDLEWARE_CORS:
        # CORS middleware exception handler registration logic

        @app.exception_handler(CustomResponseCode.HTTP_500.code)
        async def cors_status_code_500_exception_handler(request, exc):
            if isinstance(exc, BaseExceptionMixin):
                content = {
                    "code": exc.code,
                    "message": exc.message,
                    "data": exc.data,
                }
            else:
                if settings.APP_ENV == "dev":
                    content = {
                        "code": CustomResponseCode.HTTP_500.code,
                        "message": str(exc),
                        "data": None,
                    }
                else:
                    res = await response_base.fail(res=CustomResponseCode.HTTP_500)
                    content = res.model_dump()

            response = MsgSpecJSONResponse(
                status_code=(
                    exc.code
                    if isinstance(exc, BaseExceptionMixin)
                    else CustomResponseCode.HTTP_500.code
                ),
                content=content,
                background=(
                    exc.background if isinstance(exc, BaseExceptionMixin) else None
                ),
            )

            origin = request.headers.get("origin")
            if origin:
                cors = CORSMiddleware(
                    app=app,
                    allow_origins=["*"],
                    allow_credentials=True,
                    allow_methods=["*"],
                    allow_headers=["*"],
                )
                response.headers.update(cors.simple_headers)
                has_cookie = "cookie" in request.headers
                if cors.allow_all_origins and has_cookie:
                    response.headers["Access-Control-Allow-Origin"] = origin
                elif not cors.allow_all_origins and cors.is_allowed_origin(
                    origin=origin
                ):
                    response.headers["Access-Control-Allow-Origin"] = origin
                    response.headers.add_vary_header("Origin")

            return response
