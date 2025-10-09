from pydantic import BaseModel
from fastapi import UploadFile
from enum import Enum

class UserCreate(BaseModel):
    firstname: str
    lastname: str
    email: str
    password: str

class UserLogin(BaseModel):
    email : str
    password : str


class MissingDataStrategy(str, Enum):
    FILL_VALUE = "fill_value"
    INTERPOLATE = "interpolate"
    MEAN = "mean"
    MEDIAN = "median"
    MODE = "mode"
    ZERO = "zero"
    REMOVE_ROWS = "remove_rows"

class DatasetOperations(BaseModel):
    file: UploadFile

    class Config:
        arbitrary_types_allowed = True

