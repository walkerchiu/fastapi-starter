import uvicorn

from path import Path

from app.common.log import log
from app.core.conf import settings
from app.core.registrar import register_app

app = register_app()

if __name__ == "__main__":
    try:
        uvicorn.run(
            app=f"{Path(__file__).stem}:app",
            host=settings.UVICORN_HOST,
            port=settings.UVICORN_PORT,
            reload=settings.UVICORN_RELOAD,
        )
    except Exception as e:
        log.error(f"❌ Failed to start application: {e}")
