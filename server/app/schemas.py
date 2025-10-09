from pydantic import BaseModel
from fastapi import UploadFile

class UserCreate(BaseModel):
    firstname: str
    lastname: str
    email: str
    password: str

class UserLogin(BaseModel):
    email : str
    password : str

class CleanDataDownload(BaseModel):
    file: UploadFile
    missing_data: bool = False
    missing_data_strategy: str = "remove_rows"
    normalization: bool = False
    standardization: bool = False
    remove_duplicates: bool = False

    class Config:
        arbitrary_types_allowed = True