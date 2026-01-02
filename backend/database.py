import os
import psycopg
from psycopg.rows import dict_row

# Get DB connection string from env or use default
# Note: In docker-compose, hostname is 'db', mostly for backend running in docker.
# If running locally, hostname is 'localhost'.
DB_HOST = os.getenv("POSTGRES_HOST", "localhost")
DB_USER = os.getenv("POSTGRES_USER", "user")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD", "password")
DB_NAME = os.getenv("POSTGRES_DB", "toolshare")
DB_PORT = os.getenv("POSTGRES_PORT", "5432")

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

def get_db_connection():
    """
    Establishes a connection to the PostgreSQL database.
    Returns a connection object.
    """
    try:
        conn = psycopg.connect(DATABASE_URL, row_factory=dict_row)
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        raise e
