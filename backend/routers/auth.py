from fastapi import APIRouter, HTTPException, Depends
from models import UserRegister, UserLogin, Token
from dependencies import get_db_connection, get_password_hash, create_access_token, verify_password
import psycopg

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/register", response_model=Token)
def register(user: UserRegister):
    if user.role not in ['admin', 'user']:
        raise HTTPException(status_code=400, detail="Invalid role")

    conn = get_db_connection()
    try:
        cur = conn.cursor()
        
        # Check if email exists
        cur.execute("SELECT id FROM users WHERE email = %s", (user.email,))
        if cur.fetchone():
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create user
        hashed_pw = get_password_hash(user.password)
        cur.execute(
            "INSERT INTO users (name, email, password, role) VALUES (%s, %s, %s, %s) RETURNING id, name, role",
            (user.name, user.email, hashed_pw, user.role)
        )
        new_user = cur.fetchone()
        conn.commit()
        
        # Generate Token
        access_token = create_access_token(data={"sub": str(new_user['id']), "role": new_user['role']})
        return {
            "access_token": access_token, 
            "token_type": "bearer",
            "user_id": new_user['id'], 
            "name": new_user['name'],
            "role": new_user['role']
        }
        
    except Exception as e:
        conn.rollback()
        print(e)
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@router.post("/login", response_model=Token)
def login(user: UserLogin):
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT id, name, password, role FROM users WHERE email = %s", (user.email,))
        db_user = cur.fetchone()
        
        if not db_user or not verify_password(user.password, db_user['password']):
            raise HTTPException(status_code=401, detail="Incorrect email or password")
            
        access_token = create_access_token(data={"sub": str(db_user['id']), "role": db_user['role']})
        return {
            "access_token": access_token, 
            "token_type": "bearer",
            "user_id": db_user['id'], 
            "name": db_user['name'],
            "role": db_user['role']
        }
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
