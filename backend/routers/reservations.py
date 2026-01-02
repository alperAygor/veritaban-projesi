from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from datetime import date
from models import ReservationCreate, ReservationStatusUpdate, ReviewCreate
from dependencies import get_db_connection, get_current_user_id
import psycopg

router = APIRouter(prefix="/api", tags=["Reservations"])

@router.get("/reservations/price")
def calculate_price(tool_id: int, start_date: str, end_date: str):
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        # 1. Get daily price
        cur.execute("SELECT daily_price FROM tools WHERE id = %s", (tool_id,))
        tool = cur.fetchone()
        if not tool:
            raise HTTPException(status_code=404, detail="Tool not found")
        
        # 2. Call SQL Function
        cur.execute("SELECT func_calculate_price(%s, %s, %s)", (tool['daily_price'], start_date, end_date))
        result = cur.fetchone()
        return {"total_price": result['func_calculate_price']}
    except Exception as e:
         raise HTTPException(status_code=400, detail=str(e))
    finally:
        conn.close()

@router.put("/reservations/{reservation_id}/status")
async def update_reservation_status(reservation_id: int, status_update: ReservationStatusUpdate, current_user_id: int = Depends(get_current_user_id)):
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        
        # Verify ownership
        cur.execute("""
            SELECT t.owner_id 
            FROM reservations r
            JOIN tools t ON r.tool_id = t.id
            WHERE r.id = %s
        """, (reservation_id,))
        result = cur.fetchone()
        
        if not result:
            raise HTTPException(status_code=404, detail="Reservation not found")
            
        owner_id = result['owner_id']
        if owner_id != current_user_id:
             raise HTTPException(status_code=403, detail="Not authorized to update this reservation")

        # Update status
        cur.execute("""
            UPDATE reservations 
            SET status = %s
            WHERE id = %s
        """, (status_update.status, reservation_id))
        conn.commit()
        
        return {"message": "Reservation status updated", "status": status_update.status}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@router.post("/reservations")
async def create_reservation(reservation: ReservationCreate, current_user_id: int = Depends(get_current_user_id)):
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        
        # Date Validation
        if reservation.start_date < date.today():
             raise HTTPException(status_code=400, detail="Start date cannot be in the past")
        if reservation.end_date < reservation.start_date:
             raise HTTPException(status_code=400, detail="End date must be after start date")

        cur.execute("SELECT daily_price, owner_id FROM tools WHERE id = %s", (reservation.tool_id,))
        tool = cur.fetchone()
        if not tool:
            raise HTTPException(status_code=404, detail="Tool not found")
            
        if tool['owner_id'] == current_user_id:
            raise HTTPException(status_code=400, detail="You cannot reserve your own tool")
 
        cur.execute(
            """
            INSERT INTO reservations (tool_id, renter_id, start_date, end_date, total_price)
            VALUES (%s, %s, %s, %s, func_calculate_price(%s, %s, %s))
            RETURNING id, status, total_price
            """,
            (reservation.tool_id, current_user_id, reservation.start_date, reservation.end_date, tool['daily_price'], reservation.start_date, reservation.end_date)
        )
        new_res = cur.fetchone()
        conn.commit()
        return new_res
    except psycopg.errors.RaiseException as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=f"Reservation failed: {e.diag.message_primary}")
    except Exception as e:
        conn.rollback()
        print(f"Res Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@router.get("/reservations")
def get_my_reservations(current_user_id: int = Depends(get_current_user_id)):
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT r.id, r.tool_id, t.name as tool_name, r.start_date, r.end_date, r.total_price, r.status, 
                   t.owner_id as tool_owner_id, 
                   u_renter.name as renter_name,
                   r.renter_id
            FROM reservations r
            JOIN tools t ON r.tool_id = t.id
            JOIN users u_renter ON r.renter_id = u_renter.id
            WHERE r.renter_id = %s OR t.owner_id = %s
            ORDER BY r.start_date DESC
        """, (current_user_id, current_user_id))
        reservations = cur.fetchall()
        return reservations
    finally:
        conn.close()

@router.post("/reviews")
def create_review(review: ReviewCreate, current_user_id: int = Depends(get_current_user_id)):
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        
        # Verify reservation belongs to user (renter)
        cur.execute("SELECT renter_id FROM reservations WHERE id = %s", (review.reservation_id,))
        res = cur.fetchone()
        if not res or res['renter_id'] != current_user_id:
             raise HTTPException(status_code=403, detail="Not authorized")

        cur.execute(
            """
            INSERT INTO reviews (reservation_id, rating, comment)
            VALUES (%s, %s, %s)
            RETURNING id
            """,
            (review.reservation_id, review.rating, review.comment)
        )
        new_review = cur.fetchone()
        conn.commit()
        return new_review
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
