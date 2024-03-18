import os

from pathlib import Path


BasePath = Path(__file__).resolve().parent.parent

LogPath = os.path.join(BasePath, "..", "logs")
