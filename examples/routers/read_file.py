from fastapi import APIRouter

router = APIRouter()


# Define a route that accepts a path parameter for the file path
# https://fastapi.tiangolo.com/tutorial/path-params/#path-convertor
@router.get("/files/{file_path:path}")
async def read_file(file_path: str):
    # Return a dictionary with the file_path key containing the provided file path
    return {"file_path": file_path}
