"""Apollo Sandbox for GraphQL development."""

from fastapi import Request
from fastapi.responses import HTMLResponse

# Apollo Sandbox HTML template
# Apollo Sandbox is a cloud-hosted GraphQL IDE that provides a modern development experience.
APOLLO_SANDBOX_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <style>
        body {{
            margin: 0;
            padding: 0;
            height: 100vh;
            width: 100vw;
            overflow: hidden;
        }}
        #sandbox {{
            height: 100%;
            width: 100%;
        }}
    </style>
</head>
<body>
    <div id="sandbox"></div>
    <script src="https://embeddable-sandbox.cdn.apollographql.com/_latest/embeddable-sandbox.umd.production.min.js"></script>
    <script>
        new window.EmbeddedSandbox({{
            target: '#sandbox',
            initialEndpoint: '{endpoint}',
            includeCookies: false,
        }});
    </script>
</body>
</html>"""


def get_apollo_sandbox_html(request: Request, title: str = "Apollo Sandbox") -> str:
    """Generate Apollo Sandbox HTML with the correct endpoint.

    Args:
        request: The FastAPI request object to determine the base URL.
        title: The title for the sandbox page.

    Returns:
        The rendered HTML string for Apollo Sandbox.
    """
    # Construct the GraphQL endpoint URL
    base_url = str(request.base_url).rstrip("/")
    endpoint = f"{base_url}/graphql"

    return APOLLO_SANDBOX_HTML.format(title=title, endpoint=endpoint)


async def apollo_sandbox_handler(request: Request) -> HTMLResponse:
    """FastAPI endpoint handler for Apollo Sandbox.

    Args:
        request: The FastAPI request object.

    Returns:
        HTMLResponse with the Apollo Sandbox page.
    """
    html_content = get_apollo_sandbox_html(request)
    return HTMLResponse(content=html_content)
