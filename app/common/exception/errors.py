from typing import Any

from fastapi import HTTPException

from starlette.background import BackgroundTask

from app.common.response.response_code import CustomResponseCode


# Mixin class for defining common attributes for custom exceptions
class BaseExceptionMixin(Exception):
    code: int

    def __init__(
        self,
        *,
        message: str = None,  # Message for the exception
        data: Any = None,  # Additional data for the exception
        background: BackgroundTask | None = None  # Background task to be executed
    ):
        self.message = message
        self.data = data
        self.background = background


# Custom HTTP exception with a specific code and message
class HTTPError(HTTPException):
    def __init__(
        self, *, code: int, message: Any = None, headers: dict[str, Any] | None = None
    ):
        super().__init__(status_code=code, detail=message, headers=headers)


# Exception for handling bad requests (HTTP 400)
class RequestError(BaseExceptionMixin):
    code = CustomResponseCode.HTTP_400.code

    def __init__(
        self,
        *,
        message: str = "Bad Request",
        data: Any = None,
        background: BackgroundTask | None = None
    ):
        super().__init__(message=message, data=data, background=background)


# Exception for handling connection errors (HTTP 500)
class ConnectionError(BaseExceptionMixin):
    code = CustomResponseCode.HTTP_500.code

    def __init__(
        self,
        *,
        message: str = "Connection Error",
        data: Any = None,
        background: BackgroundTask | None = None
    ):
        super().__init__(message=message, data=data, background=background)


# Exception for handling timeouts (HTTP 408)
class TimeoutError(BaseExceptionMixin):
    code = CustomResponseCode.HTTP_408.code

    def __init__(
        self,
        *,
        message: str = "Timeout",
        data: Any = None,
        background: BackgroundTask | None = None
    ):
        super().__init__(message=message, data=data, background=background)


# Exception for handling forbidden requests (HTTP 403)
class ForbiddenError(BaseExceptionMixin):
    code = CustomResponseCode.HTTP_403.code

    def __init__(
        self,
        *,
        message: str = "Forbidden",
        data: Any = None,
        background: BackgroundTask | None = None
    ):
        super().__init__(message=message, data=data, background=background)


# Exception for handling not found errors (HTTP 404)
class NotFoundError(BaseExceptionMixin):
    code = CustomResponseCode.HTTP_404.code

    def __init__(
        self,
        *,
        message: str = "Not Found",
        data: Any = None,
        background: BackgroundTask | None = None
    ):
        super().__init__(message=message, data=data, background=background)


# Exception for handling internal server errors (HTTP 500)
class ServerError(BaseExceptionMixin):
    code = CustomResponseCode.HTTP_500.code

    def __init__(
        self,
        *,
        message: str = "Internal Server Error",
        data: Any = None,
        background: BackgroundTask | None = None
    ):
        super().__init__(message=message, data=data, background=background)


# Exception for handling gateway errors (HTTP 502)
class GatewayError(BaseExceptionMixin):
    code = CustomResponseCode.HTTP_502.code

    def __init__(
        self,
        *,
        message: str = "Bad Gateway",
        data: Any = None,
        background: BackgroundTask | None = None
    ):
        super().__init__(message=message, data=data, background=background)


# Exception for handling authorization errors (HTTP 401)
class AuthorizationError(BaseExceptionMixin):
    code = CustomResponseCode.HTTP_401.code

    def __init__(
        self,
        *,
        message: str = "Permission Denied",
        data: Any = None,
        background: BackgroundTask | None = None
    ):
        super().__init__(message=message, data=data, background=background)


# Exception for handling token errors (HTTP 401)
class TokenError(HTTPError):
    code = CustomResponseCode.HTTP_401.code

    def __init__(
        self,
        *,
        message: str = "Not Authenticated",
        headers: dict[str, Any] | None = None
    ):
        super().__init__(
            code=self.code,
            message=message,
            headers=headers or {"WWW-Authenticate": "Bearer"},
        )
