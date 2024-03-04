from enum import Enum

from fastapi import APIRouter


# Define an enumeration of model names
# https://fastapi.tiangolo.com/tutorial/path-params/#create-an-enum-class
class ModelName(str, Enum):
    alexnet = "alexnet"
    resnet = "resnet"
    lenet = "lenet"


router = APIRouter()


# Define a route that accepts a path parameter for the model name
# https://fastapi.tiangolo.com/tutorial/path-params/#predefined-values
@router.get("/models/{model_name}")
async def get_model(model_name: ModelName):
    if model_name is ModelName.alexnet:
        return {"model_name": model_name, "message": "Deep Learning FTW!"}

    if model_name.value == "lenet":
        return {"model_name": model_name, "message": "LeCNN all the images"}

    return {"model_name": model_name, "message": "Have some residuals"}
