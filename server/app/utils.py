from passlib.context import CryptContext
from sklearn.preprocessing import MinMaxScaler, StandardScaler
import pandas as pd
import numpy as np
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


def make_dataframe_json_safe(df: pd.DataFrame) -> pd.DataFrame:
    """
    Prepare a DataFrame to be safely serialized by FastAPI.
    - Converts NaN and infinities to None
    - Converts unsupported dtypes if needed
    """
    # Replace problematic numeric values
    df = df.replace([np.inf, -np.inf], np.nan)
    # Replace NaN with None (JSON-compliant)
    df = df.replace({np.nan: None})
    
    return df



def get_id_columns(df: pd.DataFrame) -> list:
    """
    Identify columns that look like identifiers and should be skipped from numeric operations.
    """
    id_patterns = [
        'id', 'ID', 'Id', 'iD',
        'uuid', 'UUID', 'Uuid',
        'key', 'Key', 'KEY',
        'index', 'Index', 'INDEX',
        'identifier', 'Identifier', 'IDENTIFIER',
        'primary_key', 'Primary_Key', 'PRIMARY_KEY',
        'foreign_key', 'Foreign_Key', 'FOREIGN_KEY'
    ]
    
    id_columns = []
    for col in df.columns:
        col_lower = str(col).lower()
        # Check if column name matches ID patterns
        if any(pattern.lower() in col_lower for pattern in id_patterns):
            id_columns.append(col)
        # Check if column contains unique values (likely an ID)
        elif df[col].nunique() == len(df) and len(df) > 1:
            id_columns.append(col)
    
    return id_columns

def preprocess_dataframe(df: pd.DataFrame, config) -> pd.DataFrame:
    """
    Safely preprocess dataframe based on config flags.
    Handles missing values, normalization, standardization, and duplicates.
    Works with a Pydantic model (DataProcessingConfig).
    Skips ID columns from numeric operations.
    """
    df = df.copy()
    
    # Identify ID columns that should be skipped from numeric operations
    id_columns = get_id_columns(df)
    print(f"🔍 Identified ID columns to skip: {id_columns}", flush=True)

    # --- Remove duplicates ---
    if getattr(config, "remove_deblicate", False):
        before = len(df)
        df = df.drop_duplicates()
        print(f"✅ Duplicates removed. {before - len(df)} rows dropped.", flush=True)

    # --- Normalization ---
    if getattr(config, "normalization", False):
        numeric_cols = df.select_dtypes(include=['number']).columns
        # Exclude ID columns from normalization
        numeric_cols = [col for col in numeric_cols if col not in id_columns]
        if len(numeric_cols) > 0:
            scaler = MinMaxScaler()
            df[numeric_cols] = scaler.fit_transform(df[numeric_cols])
            print(f"✅ Normalized columns: {list(numeric_cols)}", flush=True)
        else:
            print("⚠️ No numeric columns found for normalization (excluding ID columns).", flush=True)

    # --- Standardization ---
    if getattr(config, "standarization", False):
        numeric_cols = df.select_dtypes(include=['number']).columns
        # Exclude ID columns from standardization
        numeric_cols = [col for col in numeric_cols if col not in id_columns]
        if len(numeric_cols) > 0:
            scaler = StandardScaler()
            df[numeric_cols] = scaler.fit_transform(df[numeric_cols])
            print(f"✅ Standardized columns: {list(numeric_cols)}", flush=True)
        else:
            print("⚠️ No numeric columns found for standardization (excluding ID columns).", flush=True)

    # --- Missing Data Handling ---
    if getattr(config, "missing_data", None):
        try:
            print("🔧 Processing missing data...", flush=True)
            df = handle_missing_data(df, config.missing_data.dict())
            print("✅ Missing data handled successfully.", flush=True)
        except Exception as e:
            print(f"❌ Error handling missing data: {e}", flush=True)

    return df


def apply_fill_values(df: pd.DataFrame, fill_values_config: dict) -> pd.DataFrame:
    """
    Fill missing values based on user-selected strategies.
    Handles numeric and categorical columns safely.
    Skips ID columns from fill operations.
    """
    df = df.copy()
    if not fill_values_config:
        print("ℹ️ No fill_values config provided.", flush=True)
        return df

    # Identify ID columns to skip
    id_columns = get_id_columns(df)

    # Ensure numeric columns are properly detected
    df = df.apply(lambda col: pd.to_numeric(col, errors='ignore'))
    numeric_cols = df.select_dtypes(include=['number']).columns
    # Exclude ID columns from numeric operations
    numeric_cols = [col for col in numeric_cols if col not in id_columns]
    all_cols = [col for col in df.columns if col not in id_columns]

    # Mean
    if fill_values_config.get("mean", False):
        for col in numeric_cols:
            df[col] = df[col].fillna(df[col].mean())
        print(f"✅ Filled NaN with MEAN for: {list(numeric_cols)}", flush=True)

    # Median
    if fill_values_config.get("median", False):
        for col in numeric_cols:
            df[col] = df[col].fillna(df[col].median())
        print(f"✅ Filled NaN with MEDIAN for: {list(numeric_cols)}", flush=True)

    # Mode (works for all columns except ID columns)
    if fill_values_config.get("mode", False):
        for col in all_cols:
            mode_val = df[col].mode()
            if not mode_val.empty:
                df[col] = df[col].fillna(mode_val[0])
        print(f"✅ Filled NaN with MODE for columns: {list(all_cols)}", flush=True)

    # Zero (numeric only, excluding ID columns)
    if fill_values_config.get("zero", False):
        for col in numeric_cols:
            df[col] = df[col].fillna(0)
        print(f"✅ Filled NaN with ZERO for: {list(numeric_cols)}", flush=True)

    return df


def handle_missing_data(df: pd.DataFrame, missing_data_config: dict) -> pd.DataFrame:
    """
    Handle missing data using remove_rows, interpolation, or fill_values.
    Works safely for any type of dataset.
    """
    df = df.copy()

    if not missing_data_config:
        print("ℹ️ No missing_data config provided.", flush=True)
        return df

    # --- Remove Rows ---
    if missing_data_config.get("remove_rows", False):
        before = len(df)
        df = df.dropna()
        print(f"✅ Removed rows with missing values: {before - len(df)} rows removed.", flush=True)

    # --- Interpolate (numeric only, excluding ID columns) ---
    if missing_data_config.get("interpolate", False):
        try:
            # Convert columns that can be numeric
            df = df.apply(lambda col: pd.to_numeric(col, errors='ignore'))
            numeric_cols = df.select_dtypes(include=['number']).columns
            # Exclude ID columns from interpolation
            id_columns = get_id_columns(df)
            numeric_cols = [col for col in numeric_cols if col not in id_columns]

            if len(numeric_cols) > 0:
                df[numeric_cols] = df[numeric_cols].interpolate(
                    method='linear',
                    limit_direction='both'
                )
                print(f"✅ Interpolated numeric columns: {list(numeric_cols)}", flush=True)
            else:
                print("⚠️ No numeric columns found for interpolation (excluding ID columns).", flush=True)

        except Exception as e:
            print(f"❌ Error during interpolation: {e}", flush=True)

    # --- Fill Values ---
    fill_values_config = missing_data_config.get("fill_values")
    if fill_values_config:
        df = apply_fill_values(df, fill_values_config)

    return df
