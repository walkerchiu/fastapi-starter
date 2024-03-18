from datetime import datetime
from typing import Any, Type, Union

from pydantic import BaseModel, ConfigDict, create_model

from app.common.response.response_code import CustomResponse, CustomResponseCode
from app.core.conf import settings


def create_response_model(data_model: Type[Any]) -> Type[BaseModel]:
    """
    Creates a Pydantic BaseModel for API responses with the specified data_model as the data field.

    Args:
    - data_model: The Pydantic model representing the structure of the data field.

    Returns:
    - Type[BaseModel]: The Pydantic BaseModel for API responses.
    """
    return create_model(
        "ResponseModel",
        code=(int, CustomResponseCode.HTTP_200.code),
        message=(str, CustomResponseCode.HTTP_200.message),
        data=(Union[data_model, None], None),
        __config__=ConfigDict(
            json_encoders={datetime: lambda x: x.strftime(settings.DATETIME_FORMAT)}
        ),
    )


ResponseModel = create_response_model(Any)


class ResponseBase:
    """
    Base class for creating API responses.

    Provides methods for generating success and failure responses.
    """

    @staticmethod
    async def __response(
        *, res: CustomResponseCode | CustomResponse = None, data: Any | None = None
    ) -> ResponseModel:  # type: ignore
        """
        Generates a response model with the specified response code and data.

        Args:
        - res: The custom response code or response object.
        - data: The data to include in the response.

        Returns:
        - ResponseModel: The generated response model.
        """
        return ResponseModel(code=res.code, message=res.message, data=data)

    async def success(
        self,
        *,
        res: CustomResponseCode | CustomResponse = CustomResponseCode.HTTP_200,
        data: Any | None = None,
    ) -> ResponseModel:  # type: ignore
        """
        Generates a success response with the specified response code and data.

        Args:
        - res: The custom response code or response object (default: HTTP 200).
        - data: The data to include in the response (default: None).

        Returns:
        - ResponseModel: The generated success response model.
        """
        return await self.__response(res=res, data=data)

    async def fail(
        self,
        *,
        res: CustomResponseCode | CustomResponse = CustomResponseCode.HTTP_400,
        data: Any = None,
    ) -> ResponseModel:  # type: ignore
        """
        Generates a failure response with the specified response code and data.

        Args:
        - res: The custom response code or response object (default: HTTP 400).
        - data: The data to include in the response (default: None).

        Returns:
        - ResponseModel: The generated failure response model.
        """
        return await self.__response(res=res, data=data)


response_base = ResponseBase()
