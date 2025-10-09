from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.schemas import UserCreate, UserLogin
from app.utils import hash_password, verify_password
from app import models
from app.database import engine, SessionLocal

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

@app.get("/users/")
def read_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()
