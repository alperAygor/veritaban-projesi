from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import date

# --- Auth Models ---
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "user" # 'admin' or 'user'

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    name: str
    role: str

# --- User Models ---
class UserUpdate(BaseModel):
    name: str
    email: str
    bio: Optional[str] = None

class UserPasswordUpdate(BaseModel):
    current_password: str
    new_password: str

# --- Tool Models ---
class ToolCreate(BaseModel):
    name: str
    description: str
    daily_price: float
    category: str
    image_url: Optional[str] = None

class ToolUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    daily_price: Optional[float] = None
    category: Optional[str] = None
    status: Optional[str] = None
    image_url: Optional[str] = None

# --- Reservation Models ---
class ReservationCreate(BaseModel):
    tool_id: int
    start_date: date
    end_date: date

class ReservationStatusUpdate(BaseModel):
    status: str

# --- Review Models ---
class ReviewCreate(BaseModel):
    reservation_id: int
    rating: int = Field(..., ge=1, le=5)
    comment: str
