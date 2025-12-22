from fastapi.testclient import TestClient
from src.app.main import app

client = TestClient(app)


def test_root() -> None:
    """Test the root endpoint returns Hello World."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello World"}
