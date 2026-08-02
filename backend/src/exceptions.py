from typing import Any, List, Optional
from fastapi import HTTPException, Request, status
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


class APIException(HTTPException):
    def __init__(
        self,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        detail: str = "An error occurred",
        code: str = "BAD_REQUEST",
        errors: Optional[List[Any]] = None,
    ):
        super().__init__(status_code=status_code, detail=detail)
        self.code = code
        self.errors = errors or []


class UnauthorizedException(APIException):
    def __init__(self, detail: str = "Invalid authentication credentials"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            code="UNAUTHORIZED",
        )


class ForbiddenException(APIException):
    def __init__(self, detail: str = "Operation not permitted for your role"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail,
            code="FORBIDDEN",
        )


class NotFoundException(APIException):
    def __init__(self, detail: str = "Resource not found"):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail,
            code="NOT_FOUND",
        )


class InsufficientCreditsException(APIException):
    def __init__(self, detail: str = "Insufficient credit balance for this operation"):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail,
            code="INSUFFICIENT_CREDITS",
        )


async def api_exception_handler(request: Request, exc: APIException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "code": exc.code,
            "errors": jsonable_encoder(exc.errors),
        },
    )


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Input validation error",
            "code": "VALIDATION_ERROR",
            "errors": jsonable_encoder(exc.errors()),
        },
    )
