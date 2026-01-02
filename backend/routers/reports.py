from fastapi import APIRouter, Depends
from dependencies import get_db_connection, get_current_user_id
import psycopg

router = APIRouter(prefix="/api/reports", tags=["Reports"])

@router.get("/activity")
def get_activity_report(current_user_id: int = Depends(get_current_user_id)):
    """
    Requirement 9: Union usage.
    """
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        query = """
            SELECT name, 'Rented' as type, start_date as date FROM reservations r 
            JOIN tools t ON r.tool_id = t.id 
            WHERE r.renter_id = %s
            
            UNION
            
            SELECT name, 'Owned' as type, created_at::date as date FROM tools 
            WHERE owner_id = %s
            
            ORDER BY date DESC
        """
        cur.execute(query, (current_user_id, current_user_id))
        results = cur.fetchall()
        return results
    finally:
        conn.close()

@router.get("/stats")
def get_stats_report(current_user_id: int = Depends(get_current_user_id)):
    """
    Requirement 10: Aggregate functions + Having.
    """
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        query = """
            SELECT u.name, AVG(r.rating) as avg_rating, COUNT(t.id) as tool_count
            FROM users u
            JOIN tools t ON u.id = t.owner_id
            JOIN reservations res ON t.id = res.tool_id
            JOIN reviews r ON res.id = r.reservation_id
            GROUP BY u.id, u.name
            HAVING AVG(r.rating) > 4.0
            ORDER BY avg_rating DESC
        """
        cur.execute(query)
        results = cur.fetchall()
        return results
    finally:
        conn.close()
