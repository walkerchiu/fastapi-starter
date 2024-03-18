from typing import Any

from starlette.responses import JSONResponse
import msgspec


class MsgSpecJSONResponse(JSONResponse):
    def render(self, content: Any) -> bytes:
        """
        Render the JSON response using msgspec encoding.

        Args:
        - content (Any): The content to be rendered.

        Returns:
        - bytes: The rendered response.
        """
        return msgspec.json.encode(content)
