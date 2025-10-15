from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Path
from fastapi.responses import FileResponse
import urllib.parse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.schemas import UserCreate, UserLogin, DataProcessingConfig, SaveDatasetRequest, FusionRequest

from app.utils import hash_password, verify_password,  make_dataframe_json_safe, preprocess_dataframe
from app import models
from app.database import engine, SessionLocal
import pandas as pd
import io, json
import numpy as np
from typing import List, Dict, Any
import os
import uuid
import json
from datetime import datetime, timezone
from app.models import UserFile

app = FastAPI(title="Data Processing API")

# Create database tables
models.Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    # Accept requests from any origin (all paths) during development
    # Note: When using wildcard origins, credentials must be disabled per CORS spec
    allow_origins=[],
    allow_origin_regex=".*",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    """Dependency to get DB session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    """Root endpoint"""
    return {"message": "Data Processing API is running"}

@app.post("/users/")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """Create a new user with hashed password"""
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pw = hash_password(user.password)
    new_user = models.User(
        firstname=user.firstname,
        lastname=user.lastname,
        email=user.email,
        password=hashed_pw
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": f"User {new_user.firstname} created successfully", "user_id": new_user.id}

@app.get("/users/")
def read_users(db: Session = Depends(get_db)):
    """Retrieve all users"""
    users = db.query(models.User).all()
    return {"total": len(users), "users": users}

@app.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user with email and password"""
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    if not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    return {
        "id": db_user.id,
        "firstname": db_user.firstname,
        "lastname": db_user.lastname,
        "email": db_user.email
    }

@app.post('/jsonify-dataset')
async def jsonify_dataset(file : UploadFile = File(...)):
    content = await file.read()
    file_extension = file.filename.rsplit('.', 1)[-1].lower()

    if file_extension == 'csv':
        df = pd.read_csv(io.BytesIO(content))
    elif file_extension in ['xls', 'xlsx']:
        df = pd.read_excel(io.BytesIO(content))
    else :
        return {'error' : "Please upload CSV or Excel (.xlsx)"}
    
    df = make_dataframe_json_safe(df)

    return df.to_dict(orient='records')
    

@app.post("/json-process")
async def process_file(data: List[Dict[str, Any]], config: dict = None):
    try:
        if not data:
            raise HTTPException(status_code=400, detail="Data array cannot be empty")
        
        # Convert JSON array to DataFrame
        df = pd.DataFrame(data)
        # Make df readable by FastAPI
        df = make_dataframe_json_safe(df)
        # Handle nan values
        df = df.replace({np.nan: None})
        # Parse config if provided
        parsed_config = None
        if config:
            parsed_config = DataProcessingConfig(**config)
            # operations based on given queries
            df = preprocess_dataframe(df, parsed_config)
            # Sanitize again after preprocessing to ensure JSON-compliant values
            df = make_dataframe_json_safe(df)
            df = df.replace({np.nan: None})
        
        return {
            "config": parsed_config.model_dump() if parsed_config else None,
            "data": df.to_dict(orient="records"),
            "row_count": len(df)
        }
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid data format: {str(e)}")
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON in config")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    



@app.post("/save-json-dataset")
async def save_json_dataset(
    req: SaveDatasetRequest,
    db: Session = Depends(get_db),
):
    """Store a JSON dataset (list of objects) on disk + in DB."""

    user_id = req.user_id
    dataset_name = req.dataset_name
    data = req.data

    if not data:
        raise HTTPException(status_code=400, detail="Dataset is empty")

    os.makedirs("downloads", exist_ok=True)

    # Create unique file name
    unique_id = str(uuid.uuid4())
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    safe_name = dataset_name.replace(" ", "_")
    filename = f"{unique_id}_{timestamp}_{safe_name}.json"  # real file name
    file_path = os.path.join("downloads", filename)

    # Save JSON file
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

    file_size = os.path.getsize(file_path)

    # Store metadata in DB
    db_file = UserFile(
        user_id=user_id,
        file_id=unique_id,
        file_data=data,
        original_filename=dataset_name,
        file_path=filename,  # store **actual filename** here
        file_size=file_size,
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)

    return {
        "message": "JSON dataset stored successfully",
        "file_id": db_file.file_id,
        "dataset_name": db_file.original_filename,
        "file_path": db_file.file_path,  # will now reflect the real file name
        "row_count": len(data),
        "download_url": f"download/{db_file.file_path}",  # use real filename
    }



@app.get("/user-files/{user_id}")
def get_user_files(user_id: int, db: Session = Depends(get_db)):
    """
    Fetch all files uploaded by a specific user.
    """
    files = db.query(UserFile).filter(UserFile.user_id == user_id).all()
    # Return an empty list if the user has no files to avoid client-side stale state
    if not files:
        return []

    # Convert ORM objects to dicts
    result = []
    for f in files:
        result.append({
            "file_id": f.file_id,
            "dataset_name": f.original_filename,
            "file_path": f.file_path,
            "file_size": f.file_size,
            "upload_date": f.upload_date,
            "data" : f.file_data,
            # Use the actual filename to match the /downloads/{filename} endpoint
            "download_url": f"downloads/{f.file_path}"
        })
    
    return result


@app.get("/downloads/{filename:path}")
def download_file(filename: str = Path(...)):
    DOWNLOADS_DIR = "downloads"
    # Decode URL-encoded characters
    filename = urllib.parse.unquote(filename)
    file_path = os.path.join(DOWNLOADS_DIR, filename)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(path=file_path, filename=filename, media_type="application/json")


@app.put("/update-dataset/{file_id}")
async def update_dataset(
    file_id: str,
    req: SaveDatasetRequest,
    db: Session = Depends(get_db),
):
    """Update an existing dataset with new data, replacing the old file."""
    
    # Find the existing dataset
    existing_file = db.query(UserFile).filter(UserFile.file_id == file_id).first()
    if not existing_file:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    # Check if user owns this dataset
    if existing_file.user_id != req.user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Delete the old file
    old_file_path = os.path.join("downloads", existing_file.file_path)
    if os.path.exists(old_file_path):
        os.remove(old_file_path)
        print(f"🗑️ Deleted old file: {old_file_path}")
    
    # Create new file with updated data
    os.makedirs("downloads", exist_ok=True)
    
    # Create unique file name for the updated dataset
    unique_id = str(uuid.uuid4())
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    safe_name = req.dataset_name.replace(" ", "_")
    filename = f"{unique_id}_{timestamp}_{safe_name}.json"
    file_path = os.path.join("downloads", filename)
    
    # Save new JSON file
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(req.data, f, indent=4, ensure_ascii=False)
    
    file_size = os.path.getsize(file_path)
    
    # Update the database record
    existing_file.file_data = req.data
    existing_file.file_path = filename
    existing_file.file_size = file_size
    existing_file.upload_date = datetime.now(timezone.utc)
    
    db.commit()
    db.refresh(existing_file)
    
    return {
        "message": "Dataset updated successfully",
        "file_id": existing_file.file_id,
        "dataset_name": existing_file.original_filename,
        "file_path": existing_file.file_path,
        "row_count": len(req.data),
        "download_url": f"download/{existing_file.file_path}",
    }

def _infer_type(value: Any) -> str:
    if value is None:
        return "null"
    if isinstance(value, bool):
        return "boolean"
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        return "number"
    # try date
    try:
        if isinstance(value, str):
            datetime.fromisoformat(value.replace("Z", "+00:00"))
            return "date|string"
    except Exception:
        pass
    return "string"

@app.post("/fuse-datasets")
def fuse_datasets(req: FusionRequest, db: Session = Depends(get_db)):
    """
    Fuse multiple datasets by validating they are uniform and identical in schema.
    Accepts either `file_ids` (with `user_id`) to load datasets from DB or raw `datasets` as arrays of objects.
    Returns can_fuse flag, diagnostics, and fused data when possible.
    """
    # Load datasets
    datasets: List[List[Dict[str, Any]]] = []
    diagnostics: List[str] = []

    if req.file_ids:
        if not req.user_id:
            raise HTTPException(status_code=400, detail="user_id is required when using file_ids")
        files: List[UserFile] = (
            db.query(UserFile)
            .filter(UserFile.file_id.in_(req.file_ids))
            .all()
        )
        missing = set(req.file_ids) - {f.file_id for f in files}
        if missing:
            raise HTTPException(status_code=404, detail=f"Files not found: {', '.join(missing)}")
        # Ownership check
        not_owned = [f.file_id for f in files if f.user_id != req.user_id]
        if not_owned:
            raise HTTPException(status_code=403, detail=f"Access denied for files: {', '.join(not_owned)}")
        datasets = [f.file_data or [] for f in files]
    elif req.datasets:
        datasets = req.datasets
    else:
        raise HTTPException(status_code=400, detail="Provide either file_ids or datasets")

    if len(datasets) < 2:
        raise HTTPException(status_code=400, detail="At least two datasets are required to fuse")

    # Validate non-empty datasets
    empty_idx = [i for i, d in enumerate(datasets) if not d]
    if empty_idx:
        diagnostics.append(f"Empty datasets at indices: {empty_idx}")

    # Schema extraction from first dataset
    def get_schema(ds: List[Dict[str, Any]]):
        if not ds:
            return [], {}
        keys = list(ds[0].keys())
        types: Dict[str, str] = {}
        for k in keys:
            # find first non-null value for type inference
            v = next((row.get(k) for row in ds if row.get(k) is not None), None)
            types[k] = _infer_type(v)
        return keys, types

    base_keys, base_types = get_schema(datasets[0])
    if not base_keys:
        raise HTTPException(status_code=400, detail="Base dataset has no columns")

    # Validate each dataset schema
    can_fuse = True
    for idx, ds in enumerate(datasets[1:], start=1):
        keys, types = get_schema(ds)
        # identical columns set
        if set(keys) != set(base_keys):
            can_fuse = False
            diagnostics.append(
                f"Dataset {idx} columns mismatch. Expected {sorted(base_keys)}, got {sorted(keys)}"
            )
        # type compatibility per column
        for col in set(base_keys) & set(keys):
            bt = base_types.get(col)
            ct = types.get(col)
            if bt != ct:
                # allow number vs string if convertible? Keep strict per request
                diagnostics.append(f"Column '{col}' type mismatch: base={bt}, ds{idx}={ct}")
                can_fuse = False

    if not can_fuse:
        return {
            "can_fuse": False,
            "diagnostics": diagnostics,
            "schema": {"columns": base_keys, "types": base_types},
        }

    # Uniform and identical schema: concatenate rows
    fused: List[Dict[str, Any]] = []
    for ds in datasets:
        # ensure column order consistency
        for row in ds:
            fused.append({k: row.get(k) for k in base_keys})

    return {
        "can_fuse": True,
        "diagnostics": diagnostics,
        "schema": {"columns": base_keys, "types": base_types},
        "row_count": len(fused),
        "data": fused,
    }


@app.post("/fuse-datasets") 
def fuse_datasets(req: FusionRequest, db: Session = Depends(get_db)): 
    """
    Fuse multiple datasets by validating they are uniform and identical in schema.
    Accepts either `file_ids` (with `user_id`) to load datasets from DB or raw `datasets` as arrays of objects.
    Returns can_fuse flag, diagnostics, and fused data when possible.
    """
    # Load datasets
    datasets: List[List[Dict[str, Any]]] = []
    diagnostics: List[str] = []

    if req.file_ids:
        if not req.user_id:
            raise HTTPException(status_code=400, detail="user_id is required when using file_ids")
        files: List[UserFile] = (
            db.query(UserFile)
            .filter(UserFile.file_id.in_(req.file_ids))
            .all()
        )
        missing = set(req.file_ids) - {f.file_id for f in files}
        if missing:
            raise HTTPException(status_code=404, detail=f"Files not found: {', '.join(missing)}")
        # Ownership check
        not_owned = [f.file_id for f in files if f.user_id != req.user_id]
        if not_owned:
            raise HTTPException(status_code=403, detail=f"Access denied for files: {', '.join(not_owned)}")
        datasets = [f.file_data or [] for f in files]
    elif req.datasets:
        datasets = req.datasets
    else:
        raise HTTPException(status_code=400, detail="Provide either file_ids or datasets")

    if len(datasets) < 2:
        raise HTTPException(status_code=400, detail="At least two datasets are required to fuse")

    # Validate non-empty datasets
    empty_idx = [i for i, d in enumerate(datasets) if not d]
    if empty_idx:
        diagnostics.append(f"Empty datasets at indices: {empty_idx}")

    # Schema extraction from first dataset
    def get_schema(ds: List[Dict[str, Any]]):
        if not ds:
            return [], {}
        keys = list(ds[0].keys())
        types: Dict[str, str] = {}
        for k in keys:
            # find first non-null value for type inference
            v = next((row.get(k) for row in ds if row.get(k) is not None), None)
            types[k] = _infer_type(v)
        return keys, types

    base_keys, base_types = get_schema(datasets[0])
    if not base_keys:
        raise HTTPException(status_code=400, detail="Base dataset has no columns")

    # Validate each dataset schema
    can_fuse = True
    for idx, ds in enumerate(datasets[1:], start=1):
        keys, types = get_schema(ds)
        # identical columns set
        if set(keys) != set(base_keys):
            can_fuse = False
            diagnostics.append(
                f"Dataset {idx} columns mismatch. Expected {sorted(base_keys)}, got {sorted(keys)}"
            )
        # type compatibility per column
        for col in set(base_keys) & set(keys):
            bt = base_types.get(col)
            ct = types.get(col)
            if bt != ct:
                diagnostics.append(f"Column '{col}' type mismatch: base={bt}, ds{idx}={ct}")
                can_fuse = False

    if not can_fuse:
        return {
            "can_fuse": False,
            "diagnostics": diagnostics,
            "schema": {"columns": base_keys, "types": base_types},
        }

    # Uniform and identical schema: concatenate rows
    fused: List[Dict[str, Any]] = []
    for ds in datasets:
        for row in ds:
            fused.append({k: row.get(k) for k in base_keys})

    return {
        "can_fuse": True,
        "diagnostics": diagnostics,
        "schema": {"columns": base_keys, "types": base_types},
        "row_count": len(fused),
        "data": fused,
    }

@app.post("/fuse-datasets")
def fuse_datasets(req: FusionRequest, db: Session = Depends(get_db)):
    """
    Fuse multiple datasets by validating they are uniform and identical in schema.
    Accepts either `file_ids` (with `user_id`) to load datasets from DB or raw `datasets` as arrays of objects.
    Returns can_fuse flag, diagnostics, and fused data when possible.
    """
    # Load datasets
    datasets: List[List[Dict[str, Any]]] = []
    diagnostics: List[str] = []

    if req.file_ids:
        if not req.user_id:
            raise HTTPException(status_code=400, detail="user_id is required when using file_ids")
        files: List[UserFile] = (
            db.query(UserFile)
            .filter(UserFile.file_id.in_(req.file_ids))
            .all()
        )
        missing = set(req.file_ids) - {f.file_id for f in files}
        if missing:
            raise HTTPException(status_code=404, detail=f"Files not found: {', '.join(missing)}")
        # Ownership check
        not_owned = [f.file_id for f in files if f.user_id != req.user_id]
        if not_owned:
            raise HTTPException(status_code=403, detail=f"Access denied for files: {', '.join(not_owned)}")
        datasets = [f.file_data or [] for f in files]
    elif req.datasets:
        datasets = req.datasets
    else:
        raise HTTPException(status_code=400, detail="Provide either file_ids or datasets")

    if len(datasets) < 2:
        raise HTTPException(status_code=400, detail="At least two datasets are required to fuse")

    # Validate non-empty datasets
    empty_idx = [i for i, d in enumerate(datasets) if not d]
    if empty_idx:
        diagnostics.append(f"Empty datasets at indices: {empty_idx}")

    # Schema extraction from first dataset
    def get_schema(ds: List[Dict[str, Any]]):
        if not ds:
            return [], {}
        keys = list(ds[0].keys())
        types: Dict[str, str] = {}
        for k in keys:
            # find first non-null value for type inference
            v = next((row.get(k) for row in ds if row.get(k) is not None), None)
            types[k] = _infer_type(v)
        return keys, types

    base_keys, base_types = get_schema(datasets[0])
    if not base_keys:
        raise HTTPException(status_code=400, detail="Base dataset has no columns")

    # Validate each dataset schema
    can_fuse = True
    for idx, ds in enumerate(datasets[1:], start=1):
        keys, types = get_schema(ds)
        # identical columns set
        if set(keys) != set(base_keys):
            can_fuse = False
            diagnostics.append(
                f"Dataset {idx} columns mismatch. Expected {sorted(base_keys)}, got {sorted(keys)}"
            )
        # type compatibility per column
        for col in set(base_keys) & set(keys):
            bt = base_types.get(col)
            ct = types.get(col)
            if bt != ct:
                diagnostics.append(f"Column '{col}' type mismatch: base={bt}, ds{idx}={ct}")
                can_fuse = False

    if not can_fuse:
        return {
            "can_fuse": False,
            "diagnostics": diagnostics,
            "schema": {"columns": base_keys, "types": base_types},
        }

    # Uniform and identical schema: concatenate rows
    fused: List[Dict[str, Any]] = []
    for ds in datasets:
        # ensure column order consistency
        for row in ds:
            fused.append({k: row.get(k) for k in base_keys})

    return {
        "can_fuse": True,
        "diagnostics": diagnostics,
        "schema": {"columns": base_keys, "types": base_types},
        "row_count": len(fused),
        "data": fused,
    }

