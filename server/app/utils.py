from passlib.context import CryptContext
import hashlib

# Setup Argon2 as the hashing scheme
pwd_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto"
)

def hash_password(password: str) -> str:
    """Hash password with Argon2, truncating if necessary for bcrypt compatibility."""
    truncated_password = password[:72]
    return pwd_context.hash(truncated_password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash."""
    truncated_password = plain_password[:72]
    return pwd_context.verify(truncated_password, hashed_password)