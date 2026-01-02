from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from models import ToolCreate, ToolUpdate, ReviewCreate
from dependencies import get_db_connection, get_current_user_id
import psycopg

router = APIRouter(prefix="/api/tools", tags=["Tools"])

@router.get("")
def get_tools(category: Optional[str] = None):
    """
    Fetches tools using the SQL View 'view_available_tools' as per Requirement 6.
    """
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        # Use View
        query = "SELECT * FROM view_available_tools"
        params = []
        
        if category:
            query += " WHERE category = %s"
            params.append(category)
        
        cur.execute(query, params)
        tools = cur.fetchall()
        return tools
    finally:
        conn.close()

@router.get("/search")
def search_tools(q: str):
    """
    Searches tools using the SQL Function 'func_search_tools' which returns a CURSOR 
    as per Requirement 11 (Cursor usage).
    Background: This function uses the Index 'idx_tool_search' (Requirement 7).
    """
    conn = get_db_connection()
    try:
        # We must use a transaction block for cursors
        with conn.transaction():
            cur = conn.cursor()
            # Call the function which returns a refcursor name
            cur.execute("SELECT func_search_tools(%s)", (q,))
            cursor_name = cur.fetchone()['func_search_tools']
            
            # Fetch from the returned cursor
            cur.execute(f"FETCH ALL FROM \"{cursor_name}\"")
            results = cur.fetchall()
            return results
    except Exception as e:
        print(f"Search error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@router.post("")
def create_tool(tool: ToolCreate, current_user_id: int = Depends(get_current_user_id)):
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO tools (owner_id, name, description, daily_price, category, image_url, status)
            VALUES (%s, %s, %s, %s, %s, %s, 'available')
            RETURNING id, name, status
            """,
            (current_user_id, tool.name, tool.description, tool.daily_price, tool.category, tool.image_url)
        )
        new_tool = cur.fetchone()
        conn.commit()
        return new_tool
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@router.get("/my")
def get_my_tools(current_user_id: int = Depends(get_current_user_id)):
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM tools WHERE owner_id = %s ORDER BY id DESC", (current_user_id,))
        tools = cur.fetchall()
        return tools
    finally:
        conn.close()

@router.get("/{tool_id}")
def get_tool(tool_id: int):
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        
        cur.execute("SELECT * FROM tools WHERE id = %s", (tool_id,))
        tool = cur.fetchone()
        
        if not tool:
            raise HTTPException(status_code=404, detail="Tool not found")
            
        # Get Average Rating
        cur.execute("""
            SELECT AVG(r.rating) as avg_rating, COUNT(r.id) as review_count
            FROM reviews r
            JOIN reservations res ON r.reservation_id = res.id
            WHERE res.tool_id = %s
        """, (tool_id,))
        rating_data = cur.fetchone()
        
        tool_dict = dict(tool)
        tool_dict['average_rating'] = rating_data['avg_rating'] or 0
        tool_dict['review_count'] = rating_data['review_count'] or 0
        
        return tool_dict
    finally:
        conn.close()

@router.put("/{tool_id}")
def update_tool(tool_id: int, tool: ToolUpdate, current_user_id: int = Depends(get_current_user_id)):
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        # Check ownership
        cur.execute("SELECT owner_id FROM tools WHERE id = %s", (tool_id,))
        existing = cur.fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Tool not found")
        if existing['owner_id'] != current_user_id:
            raise HTTPException(status_code=403, detail="Not authorized to update this tool")
            
        # Build update query dynamically
        fields = []
        params = []
        if tool.name is not None:
            fields.append("name = %s")
            params.append(tool.name)
        if tool.description is not None:
            fields.append("description = %s")
            params.append(tool.description)
        if tool.daily_price is not None:
            fields.append("daily_price = %s")
            params.append(tool.daily_price)
        if tool.category is not None:
            fields.append("category = %s")
            params.append(tool.category)
        if tool.status is not None:
            fields.append("status = %s")
            params.append(tool.status)
        if tool.image_url is not None:
            fields.append("image_url = %s")
            params.append(tool.image_url)
            
        if not fields:
            return {"message": "No changes provided"}
            
        params.append(tool_id)
        query = f"UPDATE tools SET {', '.join(fields)} WHERE id = %s RETURNING *"
        
        cur.execute(query, params)
        updated_tool = cur.fetchone()
        conn.commit()
        return updated_tool
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@router.delete("/{tool_id}")
def delete_tool(tool_id: int, current_user_id: int = Depends(get_current_user_id)):
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        
        # Check tool existence
        cur.execute("SELECT owner_id FROM tools WHERE id = %s", (tool_id,))
        existing = cur.fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Tool not found")

        # Check privileges: Owner OR Admin
        cur.execute("SELECT role FROM users WHERE id = %s", (current_user_id,))
        user_role = cur.fetchone()['role']

        if existing['owner_id'] != current_user_id and user_role != 'admin':
            raise HTTPException(status_code=403, detail="Not authorized to delete this tool")
            
        # Delete
        cur.execute("DELETE FROM tools WHERE id = %s RETURNING id", (tool_id,))
        conn.commit()
        return {"message": "Tool deleted successfully", "id": tool_id}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@router.get("/{tool_id}/reviews")
def get_tool_reviews(tool_id: int):
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        # Verify tool exists
        cur.execute("SELECT id FROM tools WHERE id = %s", (tool_id,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Tool not found")

        # Fetch reviews for this tool
        query = """
            SELECT r.id, r.rating, r.comment, r.created_at, u.name as reviewer_name
            FROM reviews r
            JOIN reservations res ON r.reservation_id = res.id
            JOIN users u ON res.renter_id = u.id
            WHERE res.tool_id = %s
            ORDER BY r.created_at DESC
        """
        cur.execute(query, (tool_id,))
        reviews = cur.fetchall()
        return reviews
    finally:
        conn.close()
