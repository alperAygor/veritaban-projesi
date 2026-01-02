from fastapi import APIRouter, HTTPException, Depends
from dependencies import get_db_connection, get_current_admin_user
import psycopg

router = APIRouter(prefix="/api/admin", tags=["Admin"])

@router.get("/users")
def get_all_users(admin_id: int = Depends(get_current_admin_user)):
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT id, name, email, role, created_at, security_score FROM users ORDER BY id")
        users = cur.fetchall()
        return users
    finally:
        conn.close()

@router.get("/tools")
def get_all_tools_admin(admin_id: int = Depends(get_current_admin_user)):
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        query = """
            SELECT t.id, t.name, t.category, t.daily_price, t.status, u.name as owner_name, u.email as owner_email
            FROM tools t
            JOIN users u ON t.owner_id = u.id
            ORDER BY t.id DESC
        """
        cur.execute(query)
        tools = cur.fetchall()
        return tools
    finally:
        conn.close()

@router.delete("/users/{user_id}")
def delete_user(user_id: int, admin_id: int = Depends(get_current_admin_user)):
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        if user_id == admin_id:
             raise HTTPException(status_code=400, detail="Cannot delete yourself")
             
        cur.execute("DELETE FROM users WHERE id = %s RETURNING id", (user_id,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="User not found")
        conn.commit()
        return {"message": "User deleted"}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@router.get("/stats")
def get_global_stats(admin_id: int = Depends(get_current_admin_user)):
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        
        cur.execute("SELECT COUNT(*) as count FROM users")
        user_count = cur.fetchone()['count']
        
        cur.execute("SELECT COUNT(*) as count FROM tools")
        tool_count = cur.fetchone()['count']
        
        cur.execute("SELECT COUNT(*) as count FROM reservations")
        res_count = cur.fetchone()['count']
        
        cur.execute("SELECT COALESCE(SUM(total_price), 0) as total FROM reservations WHERE status='completed'")
        revenue = cur.fetchone()['total']
        
        return {
            "total_users": user_count,
            "total_tools": tool_count,
            "total_reservations": res_count,
            "total_revenue": revenue,
            "system_status": "Operational" 
        }
    finally:
        conn.close()

@router.get("/activity")
def get_recent_activity(admin_id: int = Depends(get_current_admin_user)):
    """
    New feature: admin activity feed.
    """
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        # Get last 5 reservations
        cur.execute("""
            SELECT 'Reservation' as type, u.name as actor, t.name as target, r.created_at
            FROM reservations r
            JOIN users u ON r.renter_id = u.id
            JOIN tools t ON r.tool_id = t.id
            ORDER BY r.created_at DESC LIMIT 5
        """)
        recent = cur.fetchall()
        return recent
    finally:
        conn.close()
