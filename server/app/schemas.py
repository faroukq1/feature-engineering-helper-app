from pydantic import BaseModel
from fastapi import UploadFile
from typing import Optional
from enum import Enum
from typing import List, Dict, Any

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


class SaveDatasetRequest(BaseModel):
    user_id: int
    dataset_name: str
    data: List[Dict[str, Any]]

class FillValues(BaseModel):
    mean: Optional[bool] = None
    median: Optional[bool] = None
    mode: Optional[bool] = None
    zero: Optional[bool] = None


class MissingData(BaseModel):
    remove_rows: Optional[bool] = None
    interpolate: Optional[bool] = None
    fill_values: Optional[FillValues] = None


class DataProcessingConfig(BaseModel):
    missing_data: Optional[MissingData] = None
    normalization: Optional[bool] = None
    standarization: Optional[bool] = None
    remove_deplicate: Optional[bool] = None
    target_columns: Optional[List[str]] = None


class FusionRequest(BaseModel):
    """
    Request payload for dataset fusion.
    You can provide either file_ids (with user_id) to load server-side datasets
    or provide raw JSON datasets directly.
    """
    user_id: Optional[int] = None
    file_ids: Optional[List[str]] = None
    datasets: Optional[List[List[Dict[str, Any]]]] = None

