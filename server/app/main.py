from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, Body
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.schemas import UserCreate, UserLogin, DataProcessingConfig
from app.utils import hash_password, verify_password,  make_dataframe_json_safe, preprocess_dataframe, handle_missing_data
from app import models
from app.database import engine, SessionLocal
import pandas as pd
import io, json
import numpy as np

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


# ===================== USER MANAGEMENT ENDPOINTS =====================
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
        "message": "Login successful",
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
    


## working on this

@app.post("/process")
async def process_file(
    file: UploadFile = File(...),
    config: str = Form(...),
):
    """
    Upload CSV/Excel file + JSON config and get them back
    """
    try:
        # Read file
        content = await file.read()
        ext = file.filename.split('.')[-1].lower()

        if ext == 'csv':
            df = pd.read_csv(io.BytesIO(content))
        elif ext in ['xls', 'xlsx']:
            df = pd.read_excel(io.BytesIO(content))
        else:
            return {"error": "Please upload CSV or Excel file"}
        
        # make df readle by fastAPI
        df = make_dataframe_json_safe(df)
        # handle nan values
        df = df.replace({np.nan : None})
        # Parse config
        config_data = json.loads(config)
        parsed_config = DataProcessingConfig(**config_data)

        # operations based on given queries
        df = preprocess_dataframe(df, parsed_config)

        return {
            "file": file.filename,
            "config": parsed_config.model_dump(),
            "data": df.to_dict(orient="records")
        }
    
    except json.JSONDecodeError:
        return {"error": "Invalid JSON in config"}
    except Exception as e:
        return {"error": str(e)}