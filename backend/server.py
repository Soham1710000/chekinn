from fastapi import FastAPI, APIRouter, File, UploadFile, HTTPException, Form
from fastapi.responses import StreamingResponse, Response
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from bson import ObjectId
import io

# Import services
from services.gemini_service import GeminiService
from services.whisper_service import WhisperService
from services.tts_service import TTSService
from services.learning_service import LearningService
from services.matching_service import MatchingService

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Initialize services
gemini_service = GeminiService()
whisper_service = WhisperService()
tts_service = TTSService()
learning_service = LearningService(db)
matching_service = MatchingService(db, gemini_service)

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============================================================================
# MODELS
# ============================================================================

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")

class UserCreate(BaseModel):
    name: str
    city: Optional[str] = None
    current_role: Optional[str] = None
    industries: Optional[List[str]] = []
    intent: Optional[str] = None
    open_to_intros: bool = True
    preferred_mode: str = "voice"

class UserResponse(BaseModel):
    id: str
    name: str
    city: Optional[str] = None
    current_role: Optional[str] = None
    industries: Optional[List[str]] = []
    intent: Optional[str] = None
    open_to_intros: bool
    preferred_mode: str
    created_at: datetime

class MessageCreate(BaseModel):
    user_id: str
    text: str
    is_voice: bool = False
    audio_duration: Optional[float] = None

class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    role: str  # "user" or "assistant"
    text: str
    track: Optional[str] = None
    is_voice: bool
    audio_duration: Optional[float] = None
    has_audio_response: bool = False
    created_at: datetime

class ConversationResponse(BaseModel):
    id: str
    user_id: str
    current_track: Optional[str] = None
    message_count: int
    created_at: datetime
    updated_at: datetime

class IntroResponse(BaseModel):
    id: str
    from_user_id: str
    to_user_id: str
    status: str  # "pending", "accepted", "declined"
    reason: str
    created_at: datetime

class IntroActionRequest(BaseModel):
    intro_id: str
    action: str  # "accept" or "decline"

class AnalyticsResponse(BaseModel):
    total_users: int
    active_users: int
    total_conversations: int
    total_messages: int
    total_voice_messages: int
    track_distribution: Dict[str, int]
    intros_suggested: int
    intros_accepted: int
    intros_declined: int
    power_users: int

class TrackSelectorRequest(BaseModel):
    user_id: str
    track: str  # "cat_mba" or "jobs_career"

# ============================================================================
# USER ROUTES
# ============================================================================

@api_router.post("/users", response_model=UserResponse)
async def create_user(user: UserCreate):
    """Create a new user"""
    user_dict = user.dict()
    user_dict["created_at"] = datetime.utcnow()
    user_dict["updated_at"] = datetime.utcnow()
    
    result = await db.users.insert_one(user_dict)
    
    # Create initial conversation
    conversation = {
        "user_id": str(result.inserted_id),
        "current_track": None,
        "message_count": 0,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    await db.conversations.insert_one(conversation)
    
    return UserResponse(
        id=str(result.inserted_id),
        **user.dict()
    )

@api_router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: str):
    """Get user by ID"""
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserResponse(
        id=str(user["_id"]),
        name=user["name"],
        city=user.get("city"),
        current_role=user.get("current_role"),
        industries=user.get("industries", []),
        intent=user.get("intent"),
        open_to_intros=user.get("open_to_intros", True),
        preferred_mode=user.get("preferred_mode", "voice"),
        created_at=user["created_at"]
    )

# ============================================================================
# CHAT ROUTES
# ============================================================================

@api_router.post("/chat/message", response_model=MessageResponse)
async def send_message(message: MessageCreate):
    """Send a message and get AI response"""
    try:
        # Get or create conversation
        conversation = await db.conversations.find_one({"user_id": message.user_id})
        if not conversation:
            conversation = {
                "user_id": message.user_id,
                "current_track": None,
                "message_count": 0,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            conv_result = await db.conversations.insert_one(conversation)
            conversation["_id"] = conv_result.inserted_id
        
        # Get user info and learnings
        user = await db.users.find_one({"_id": ObjectId(message.user_id)})
        learnings = await db.learnings.find_one({"user_id": message.user_id})
        
        # Get conversation history
        messages = await db.messages.find(
            {"conversation_id": str(conversation["_id"])}
        ).sort("created_at", -1).limit(20).to_list(20)
        messages.reverse()
        
        # Build conversation history for AI
        conversation_history = []
        for msg in messages:
            conversation_history.append({
                "role": msg["role"],
                "text": msg["text"]
            })
        
        # Save user message
        user_message = {
            "conversation_id": str(conversation["_id"]),
            "role": "user",
            "text": message.text,
            "is_voice": message.is_voice,
            "audio_duration": message.audio_duration,
            "has_audio_response": False,
            "created_at": datetime.utcnow()
        }
        user_msg_result = await db.messages.insert_one(user_message)
        
        # Generate AI response
        ai_response = await gemini_service.generate_response(
            user_message=message.text,
            conversation_history=conversation_history,
            user_context={
                "name": user.get("name", "there"),
                "intent": user.get("intent"),
                "current_track": conversation.get("current_track"),
                "message_count": conversation.get("message_count", 0)
            },
            learnings=learnings.get("data") if learnings else None
        )
        
        # Detect track
        track = await gemini_service.detect_track(message.text, conversation_history)
        
        # Save assistant message
        assistant_message = {
            "conversation_id": str(conversation["_id"]),
            "role": "assistant",
            "text": ai_response,
            "track": track,
            "is_voice": False,
            "has_audio_response": False,
            "created_at": datetime.utcnow()
        }
        assistant_msg_result = await db.messages.insert_one(assistant_message)
        
        # Update conversation
        await db.conversations.update_one(
            {"_id": conversation["_id"]},
            {
                "$set": {
                    "current_track": track,
                    "updated_at": datetime.utcnow()
                },
                "$inc": {"message_count": 2}
            }
        )
        
        # Background: extract learnings (run async)
        if conversation.get("message_count", 0) % 5 == 0:  # Every 5 messages
            # Note: In production, use a task queue like Celery
            await learning_service.extract_and_update_learnings(
                user_id=message.user_id,
                conversation_history=conversation_history + [
                    {"role": "user", "text": message.text},
                    {"role": "assistant", "text": ai_response}
                ]
            )
        
        return MessageResponse(
            id=str(assistant_msg_result.inserted_id),
            conversation_id=str(conversation["_id"]),
            role="assistant",
            text=ai_response,
            track=track,
            is_voice=False,
            has_audio_response=False,
            created_at=assistant_message["created_at"]
        )
    
    except Exception as e:
        logger.error(f"Error in send_message: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/chat/history/{user_id}")
async def get_chat_history(user_id: str, limit: int = 50):
    """Get chat history for a user"""
    conversation = await db.conversations.find_one({"user_id": user_id})
    if not conversation:
        return {"messages": []}
    
    messages = await db.messages.find(
        {"conversation_id": str(conversation["_id"])}
    ).sort("created_at", 1).limit(limit).to_list(limit)
    
    formatted_messages = []
    for msg in messages:
        formatted_messages.append({
            "id": str(msg["_id"]),
            "role": msg["role"],
            "text": msg["text"],
            "track": msg.get("track"),
            "is_voice": msg.get("is_voice", False),
            "audio_duration": msg.get("audio_duration"),
            "has_audio_response": msg.get("has_audio_response", False),
            "created_at": msg["created_at"].isoformat()
        })
    
    return {"messages": formatted_messages}

# ============================================================================
# AUDIO ROUTES
# ============================================================================

@api_router.post("/audio/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    """Transcribe audio file using Whisper API"""
    try:
        # Read file content
        content = await file.read()
        
        # Transcribe using Whisper
        transcription = await whisper_service.transcribe(content, file.filename)
        
        return {
            "success": True,
            "text": transcription["text"],
            "duration": transcription.get("duration")
        }
    
    except Exception as e:
        logger.error(f"Transcription error: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

@api_router.post("/audio/synthesize")
async def synthesize_speech(
    text: str = Form(...),
    voice: str = Form("alloy")
):
    """Synthesize speech from text using OpenAI TTS"""
    try:
        # Generate audio
        audio_data = await tts_service.synthesize(text, voice)
        
        # Return audio as streaming response
        return StreamingResponse(
            io.BytesIO(audio_data),
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": "attachment; filename=speech.mp3"
            }
        )
    
    except Exception as e:
        logger.error(f"TTS error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# TRACK ROUTES
# ============================================================================

@api_router.post("/track/select")
async def select_track(request: TrackSelectorRequest):
    """Set user's focus track"""
    conversation = await db.conversations.find_one({"user_id": request.user_id})
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    await db.conversations.update_one(
        {"_id": conversation["_id"]},
        {"$set": {"current_track": request.track, "updated_at": datetime.utcnow()}}
    )
    
    return {"success": True, "track": request.track}

# ============================================================================
# INTRO/MATCHING ROUTES
# ============================================================================

@api_router.get("/intros/{user_id}")
async def get_intros(user_id: str):
    """Get intro suggestions for a user"""
    intros = await db.intros.find(
        {"$or": [{"from_user_id": user_id}, {"to_user_id": user_id}]}
    ).sort("created_at", -1).to_list(20)
    
    formatted_intros = []
    for intro in intros:
        # Get other user info
        other_user_id = intro["to_user_id"] if intro["from_user_id"] == user_id else intro["from_user_id"]
        other_user = await db.users.find_one({"_id": ObjectId(other_user_id)})
        
        formatted_intros.append({
            "id": str(intro["_id"]),
            "from_user_id": intro["from_user_id"],
            "to_user_id": intro["to_user_id"],
            "other_user": {
                "name": other_user.get("name", "User"),
                "city": other_user.get("city"),
                "current_role": other_user.get("current_role")
            },
            "reason": intro["reason"],
            "status": intro["status"],
            "created_at": intro["created_at"].isoformat()
        })
    
    return {"intros": formatted_intros}

@api_router.post("/intros/action")
async def intro_action(request: IntroActionRequest):
    """Accept or decline an intro"""
    intro = await db.intros.find_one({"_id": ObjectId(request.intro_id)})
    if not intro:
        raise HTTPException(status_code=404, detail="Intro not found")
    
    if request.action not in ["accept", "decline"]:
        raise HTTPException(status_code=400, detail="Invalid action")
    
    new_status = "accepted" if request.action == "accept" else "declined"
    
    await db.intros.update_one(
        {"_id": ObjectId(request.intro_id)},
        {"$set": {"status": new_status, "updated_at": datetime.utcnow()}}
    )
    
    return {"success": True, "status": new_status}

@api_router.post("/intros/generate/{user_id}")
async def generate_intro(user_id: str):
    """Generate intro suggestions for a user (admin/background job)"""
    try:
        suggestions = await matching_service.find_matches(user_id)
        
        # Create intro records
        for suggestion in suggestions:
            intro = {
                "from_user_id": user_id,
                "to_user_id": suggestion["user_id"],
                "reason": suggestion["reason"],
                "status": "pending",
                "match_score": suggestion["score"],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            await db.intros.insert_one(intro)
        
        return {
            "success": True,
            "suggestions_count": len(suggestions)
        }
    
    except Exception as e:
        logger.error(f"Matching error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# ANALYTICS ROUTES
# ============================================================================

@api_router.get("/analytics", response_model=AnalyticsResponse)
async def get_analytics():
    """Get app analytics"""
    # Count users
    total_users = await db.users.count_documents({})
    
    # Count active users (users with messages in last 7 days)
    seven_days_ago = datetime.utcnow()
    seven_days_ago = seven_days_ago.replace(day=seven_days_ago.day - 7)
    active_conversations = await db.conversations.find(
        {"updated_at": {"$gte": seven_days_ago}}
    ).distinct("user_id")
    active_users = len(active_conversations)
    
    # Count conversations and messages
    total_conversations = await db.conversations.count_documents({})
    total_messages = await db.messages.count_documents({})
    total_voice_messages = await db.messages.count_documents({"is_voice": True})
    
    # Track distribution
    track_pipeline = [
        {"$match": {"track": {"$ne": None}}},
        {"$group": {"_id": "$track", "count": {"$sum": 1}}}
    ]
    track_results = await db.messages.aggregate(track_pipeline).to_list(10)
    track_distribution = {item["_id"]: item["count"] for item in track_results}
    
    # Intro stats
    intros_suggested = await db.intros.count_documents({})
    intros_accepted = await db.intros.count_documents({"status": "accepted"})
    intros_declined = await db.intros.count_documents({"status": "declined"})
    
    # Power users (50+ messages)
    power_user_pipeline = [
        {"$group": {"_id": "$conversation_id", "count": {"$sum": 1}}},
        {"$match": {"count": {"$gte": 50}}}
    ]
    power_user_results = await db.messages.aggregate(power_user_pipeline).to_list(1000)
    power_users = len(power_user_results)
    
    return AnalyticsResponse(
        total_users=total_users,
        active_users=active_users,
        total_conversations=total_conversations,
        total_messages=total_messages,
        total_voice_messages=total_voice_messages,
        track_distribution=track_distribution,
        intros_suggested=intros_suggested,
        intros_accepted=intros_accepted,
        intros_declined=intros_declined,
        power_users=power_users
    )

# ============================================================================
# ROOT & HEALTH
# ============================================================================

@api_router.get("/")
async def root():
    return {"message": "Chekinn API - Voice-First Companion"}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

# Include router
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
