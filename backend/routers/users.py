from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from models import UserUpdate, UserPasswordUpdate
from dependencies import get_db_connection, get_current_user_id, verify_password, get_password_hash
import psycopg

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.put("/me")
def update_current_user(user_update: UserUpdate, current_user_id: int = Depends(get_current_user_id)):
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        
        # Check if email is taken by another user
        cur.execute("SELECT id FROM users WHERE email = %s AND id != %s", (user_update.email, current_user_id))
        if cur.fetchone():
            raise HTTPException(status_code=400, detail="Email already used")

        cur.execute(
            """
            UPDATE users 
            SET name = %s, email = %s, bio = %s
            WHERE id = %s
            RETURNING id, name, email, role, bio
            """,
            (user_update.name, user_update.email, user_update.bio, current_user_id)
        )
        updated_user = cur.fetchone()
        conn.commit()
        
        return updated_user
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@router.put("/me/password")
def update_password(pw_update: UserPasswordUpdate, current_user_id: int = Depends(get_current_user_id)):
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT password FROM users WHERE id = %s", (current_user_id,))
        user = cur.fetchone()
        
        if not user or not verify_password(pw_update.current_password, user['password']):
            raise HTTPException(status_code=400, detail="Incorrect current password")
            
        hashed_new_pw = get_password_hash(pw_update.new_password)
        
        cur.execute("UPDATE users SET password = %s WHERE id = %s", (hashed_new_pw, current_user_id))
        conn.commit()
        
        return {"message": "Password updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@router.get("/me/stats")
def get_user_stats(current_user_id: int = Depends(get_current_user_id)):
    """
    Requirement 11: 3rd SQL Function ('func_get_user_stats') called from interface.
    """
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM func_get_user_stats(%s)", (current_user_id,))
        stats = cur.fetchone()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
