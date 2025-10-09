from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from sqlalchemy.orm import Session
from app.schemas import UserCreate, UserLogin, CleanDataDownload
from app.utils import hash_password, verify_password
from app import models
from app.database import engine, SessionLocal
import pandas as pd
import io
from sklearn.preprocessing import StandardScaler

app = FastAPI()

# Create database tables
models.Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Hello, SQLAlchemy + Argon2!"}

@app.post("/users/")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    # check if email exists
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # hash password before saving
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
    return {"message": f"User {new_user.firstname} created successfully"}

@app.get("/users/")
def read_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()

@app.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    if not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    return {
        "firstname" : db_user.firstname,
        "lastname" : db_user.lastname,
        "email" : db_user.email
    }


@app.post("/dataset")
async def clean_data_download(data: CleanDataDownload = Depends()):
    """
    Process CSV/Excel file and return cleaned file for download
    """
    try:
        # Read file based on type
        if data.file.filename.endswith('.csv'):
            df = pd.read_csv(data.file.file)
            file_extension = "csv"
        elif data.file.filename.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(data.file.file)
            file_extension = "xlsx"
        else:
            raise HTTPException(
                status_code=400,
                detail="File must be CSV or Excel format"
            )

        # Apply data cleaning operations
        if data.missing_data and data.missing_data_strategy == "remove_rows":
            df = df.dropna()
        
        if data.remove_duplicates:
            df = df.drop_duplicates()
        
        if data.standardization:
            numeric_columns = df.select_dtypes(include=['number']).columns
            if len(numeric_columns) > 0:
                scaler = StandardScaler()
                df[numeric_columns] = scaler.fit_transform(df[numeric_columns])
        
        if data.normalization:
            numeric_columns = df.select_dtypes(include=['number']).columns
            if len(numeric_columns) > 0:
                for col in numeric_columns:
                    df[col] = (df[col] - df[col].min()) / (df[col].max() - df[col].min())

        # Return file for download
        if file_extension == "csv":
            output = io.StringIO()
            df.to_csv(output, index=False)
            csv_data = output.getvalue()
            return Response(
                content=csv_data,
                media_type="text/csv",
                headers={"Content-Disposition": f"attachment; filename=cleaned_data.csv"}
            )
        else:
            output = io.BytesIO()
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                df.to_excel(writer, index=False, sheet_name='Cleaned_Data')
            output.seek(0)
            return Response(
                content=output.getvalue(),
                media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                headers={"Content-Disposition": f"attachment; filename=cleaned_data.xlsx"}
            )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")