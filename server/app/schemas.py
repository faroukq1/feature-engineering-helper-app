from pydantic import BaseModel

class UserCreate(BaseModel):
    firstname: str
    lastname: str
    email: str
    password: str

class UserLogin (BaseModel):
    email : str
    password : str