import psycopg
import os
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv("POSTGRES_HOST", "localhost")
DB_USER = os.getenv("POSTGRES_USER", "user")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD", "password")
DB_NAME = os.getenv("POSTGRES_DB", "toolshare")
DB_PORT = os.getenv("POSTGRES_PORT", "5432")

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

def fix_db():
    try:
        conn = psycopg.connect(DATABASE_URL)
        with conn.cursor() as cur:
            print("Checking if 'created_at' exists in 'tools'...")
            cur.execute("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='tools' AND column_name='created_at';
            """)
            if cur.fetchone():
                print("Column 'created_at' already exists.")
            else:
                print("Adding 'created_at' column to tools...")
                cur.execute("ALTER TABLE tools ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;")
                conn.commit()
                print("Done.")
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fix_db()
