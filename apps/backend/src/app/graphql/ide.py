"""GraphQL IDE handlers for development.

Provides Apollo Sandbox and GraphiQL as alternative GraphQL IDEs.
"""

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

# GraphiQL HTML template
# GraphiQL is the classic GraphQL IDE with a simple, familiar interface.
GRAPHIQL_HTML = """<!DOCTYPE html>
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
        #graphiql {{
            height: 100%;
            width: 100%;
        }}
    </style>
    <link rel="stylesheet" href="https://unpkg.com/graphiql@3/graphiql.min.css" />
</head>
<body>
    <div id="graphiql"></div>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/graphiql@3/graphiql.min.js"></script>
    <script>
        const fetcher = GraphiQL.createFetcher({{
            url: '{endpoint}',
        }});
        ReactDOM.createRoot(document.getElementById('graphiql')).render(
            React.createElement(GraphiQL, {{
                fetcher: fetcher,
                defaultEditorToolsVisibility: true,
            }})
        );
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
    base_url = str(request.base_url).rstrip("/")
    endpoint = f"{base_url}/graphql"
    return APOLLO_SANDBOX_HTML.format(title=title, endpoint=endpoint)


def get_graphiql_html(request: Request, title: str = "GraphiQL") -> str:
    """Generate GraphiQL HTML with the correct endpoint.

    Args:
        request: The FastAPI request object to determine the base URL.
        title: The title for the GraphiQL page.

    Returns:
        The rendered HTML string for GraphiQL.
    """
    base_url = str(request.base_url).rstrip("/")
    endpoint = f"{base_url}/graphql"
    return GRAPHIQL_HTML.format(title=title, endpoint=endpoint)


async def apollo_sandbox_handler(request: Request) -> HTMLResponse:
    """FastAPI endpoint handler for Apollo Sandbox.

    Args:
        request: The FastAPI request object.

    Returns:
        HTMLResponse with the Apollo Sandbox page.
    """
    html_content = get_apollo_sandbox_html(request)
    return HTMLResponse(content=html_content)


async def graphiql_handler(request: Request) -> HTMLResponse:
    """FastAPI endpoint handler for GraphiQL.

    Args:
        request: The FastAPI request object.

    Returns:
        HTMLResponse with the GraphiQL page.
    """
    html_content = get_graphiql_html(request)
    return HTMLResponse(content=html_content)
