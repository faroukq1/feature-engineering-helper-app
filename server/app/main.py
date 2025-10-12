from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, Body
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.schemas import UserCreate, UserLogin, DataProcessingConfig, SaveDatasetRequest
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
    allow_origins=["*"],
    allow_credentials=True,
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
    filename = f"{unique_id}@{timestamp}@{safe_name}.json"
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
        file_path=file_path,
        file_size=file_size,
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)

    return {
        "message": "JSON dataset stored successfully",
        "file_id": db_file.file_id,
        "dataset_name": db_file.original_filename,
        "file_path": db_file.file_path,
        "row_count": len(data),
        "download_url": f"download/{db_file.file_id}",
    }


@app.get("/user-files/{user_id}")
def get_user_files(user_id: int, db: Session = Depends(get_db)):
    """
    Fetch all files uploaded by a specific user.
    """
    files = db.query(UserFile).filter(UserFile.user_id == user_id).all()
    
    if not files:
        raise HTTPException(status_code=404, detail="No files found for this user")
    
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
            "download_url": f"download/{f.file_id}"
        })
    
    return result