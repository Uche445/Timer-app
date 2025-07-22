from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timedelta
from enum import Enum


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Timer Status Enum
class TimerStatus(str, Enum):
    STOPPED = "stopped"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"


# Timer Models
class TimerTemplate(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    duration_minutes: int
    description: str
    category: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TimerTemplateCreate(BaseModel):
    name: str
    duration_minutes: int
    description: str
    category: str

class Timer(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    duration_seconds: int
    remaining_seconds: int
    status: TimerStatus = TimerStatus.STOPPED
    started_at: Optional[datetime] = None
    paused_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    category: str = "general"
    template_id: Optional[str] = None

class TimerCreate(BaseModel):
    name: str
    duration_seconds: int
    category: str = "general"
    template_id: Optional[str] = None

class TimerUpdate(BaseModel):
    name: Optional[str] = None
    remaining_seconds: Optional[int] = None
    status: Optional[TimerStatus] = None

class TimerSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timer_id: str
    timer_name: str
    category: str
    duration_seconds: int
    completed_seconds: int
    started_at: datetime
    completed_at: Optional[datetime] = None
    session_date: datetime = Field(default_factory=datetime.utcnow)

class TimerStats(BaseModel):
    total_sessions: int
    total_time_seconds: int
    categories: Dict[str, int]
    today_sessions: int
    today_time_seconds: int
    average_session_duration: float


# Basic route
@api_router.get("/")
async def root():
    return {"message": "Power Timer API Ready!"}


# Timer CRUD Operations
@api_router.post("/timers", response_model=Timer)
async def create_timer(timer_data: TimerCreate):
    """Create a new timer"""
    timer_dict = timer_data.dict()
    timer_dict['remaining_seconds'] = timer_data.duration_seconds
    timer = Timer(**timer_dict)
    
    await db.timers.insert_one(timer.dict())
    return timer

@api_router.get("/timers", response_model=List[Timer])
async def get_timers():
    """Get all active timers"""
    timers = await db.timers.find({"status": {"$ne": "completed"}}).to_list(1000)
    return [Timer(**timer) for timer in timers]

@api_router.get("/timers/{timer_id}", response_model=Timer)
async def get_timer(timer_id: str):
    """Get a specific timer"""
    timer = await db.timers.find_one({"id": timer_id})
    if not timer:
        raise HTTPException(status_code=404, detail="Timer not found")
    return Timer(**timer)

@api_router.patch("/timers/{timer_id}", response_model=Timer)
async def update_timer(timer_id: str, update_data: TimerUpdate):
    """Update timer status or remaining time"""
    timer = await db.timers.find_one({"id": timer_id})
    if not timer:
        raise HTTPException(status_code=404, detail="Timer not found")
    
    timer_obj = Timer(**timer)
    update_dict = {}
    
    # Handle status changes
    if update_data.status:
        if update_data.status == TimerStatus.RUNNING:
            update_dict['started_at'] = datetime.utcnow()
            update_dict['paused_at'] = None
        elif update_data.status == TimerStatus.PAUSED:
            update_dict['paused_at'] = datetime.utcnow()
        elif update_data.status == TimerStatus.COMPLETED:
            update_dict['completed_at'] = datetime.utcnow()
            # Create session record
            session = TimerSession(
                timer_id=timer_id,
                timer_name=timer_obj.name,
                category=timer_obj.category,
                duration_seconds=timer_obj.duration_seconds,
                completed_seconds=timer_obj.duration_seconds - timer_obj.remaining_seconds,
                started_at=timer_obj.started_at or datetime.utcnow(),
                completed_at=datetime.utcnow()
            )
            await db.timer_sessions.insert_one(session.dict())
        
        update_dict['status'] = update_data.status
    
    # Handle other updates
    if update_data.name is not None:
        update_dict['name'] = update_data.name
    if update_data.remaining_seconds is not None:
        update_dict['remaining_seconds'] = update_data.remaining_seconds
    
    await db.timers.update_one({"id": timer_id}, {"$set": update_dict})
    
    # Return updated timer
    updated_timer = await db.timers.find_one({"id": timer_id})
    return Timer(**updated_timer)

@api_router.delete("/timers/{timer_id}")
async def delete_timer(timer_id: str):
    """Delete a timer"""
    result = await db.timers.delete_one({"id": timer_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Timer not found")
    return {"message": "Timer deleted successfully"}


# Timer Templates
@api_router.get("/templates", response_model=List[TimerTemplate])
async def get_timer_templates():
    """Get all timer templates"""
    templates = await db.timer_templates.find().to_list(1000)
    return [TimerTemplate(**template) for template in templates]

@api_router.post("/templates", response_model=TimerTemplate)
async def create_timer_template(template_data: TimerTemplateCreate):
    """Create a new timer template"""
    template = TimerTemplate(**template_data.dict())
    await db.timer_templates.insert_one(template.dict())
    return template

@api_router.post("/templates/{template_id}/create-timer", response_model=Timer)
async def create_timer_from_template(template_id: str, name: Optional[str] = None):
    """Create a timer from a template"""
    template = await db.timer_templates.find_one({"id": template_id})
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    template_obj = TimerTemplate(**template)
    timer_data = TimerCreate(
        name=name or template_obj.name,
        duration_seconds=template_obj.duration_minutes * 60,
        category=template_obj.category,
        template_id=template_id
    )
    
    return await create_timer(timer_data)


# Timer Statistics
@api_router.get("/stats", response_model=TimerStats)
async def get_timer_stats():
    """Get timer statistics"""
    # Get all completed sessions
    sessions = await db.timer_sessions.find().to_list(10000)
    
    if not sessions:
        return TimerStats(
            total_sessions=0,
            total_time_seconds=0,
            categories={},
            today_sessions=0,
            today_time_seconds=0,
            average_session_duration=0
        )
    
    # Calculate stats
    total_sessions = len(sessions)
    total_time = sum(session['completed_seconds'] for session in sessions)
    
    # Category breakdown
    categories = {}
    for session in sessions:
        category = session.get('category', 'general')
        categories[category] = categories.get(category, 0) + session['completed_seconds']
    
    # Today's stats
    today = datetime.utcnow().date()
    today_sessions_data = [s for s in sessions if s['session_date'].date() == today]
    today_sessions = len(today_sessions_data)
    today_time = sum(session['completed_seconds'] for session in today_sessions_data)
    
    # Average session duration
    avg_duration = total_time / total_sessions if total_sessions > 0 else 0
    
    return TimerStats(
        total_sessions=total_sessions,
        total_time_seconds=total_time,
        categories=categories,
        today_sessions=today_sessions,
        today_time_seconds=today_time,
        average_session_duration=avg_duration
    )


# Initialize default templates
@api_router.post("/init-templates")
async def initialize_default_templates():
    """Initialize default timer templates"""
    default_templates = [
        {
            "name": "Pomodoro Work",
            "duration_minutes": 25,
            "description": "25-minute focused work session",
            "category": "productivity"
        },
        {
            "name": "Short Break",
            "duration_minutes": 5,
            "description": "5-minute quick break",
            "category": "break"
        },
        {
            "name": "Long Break",
            "duration_minutes": 15,
            "description": "15-minute relaxation break",
            "category": "break"
        },
        {
            "name": "Deep Work",
            "duration_minutes": 90,
            "description": "90-minute deep focus session",
            "category": "productivity"
        },
        {
            "name": "Quick Task",
            "duration_minutes": 10,
            "description": "10-minute quick task timer",
            "category": "tasks"
        }
    ]
    
    created_templates = []
    for template_data in default_templates:
        # Check if template already exists
        existing = await db.timer_templates.find_one({"name": template_data["name"]})
        if not existing:
            template = TimerTemplate(**template_data)
            await db.timer_templates.insert_one(template.dict())
            created_templates.append(template)
    
    return {"message": f"Created {len(created_templates)} default templates"}


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
