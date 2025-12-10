import os
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage
from prompts.orchestrator import get_system_prompt
import logging
import json

load_dotenv()
logger = logging.getLogger(__name__)

class GeminiService:
    def __init__(self):
        self.api_key = os.getenv("EMERGENT_LLM_KEY")
        if not self.api_key:
            raise ValueError("EMERGENT_LLM_KEY not found in environment")
    
    async def generate_response(
        self,
        user_message: str,
        conversation_history: list = None,
        user_context: dict = None,
        learnings: dict = None
    ) -> str:
        """Generate AI response using Gemini"""
        try:
            # Build system prompt
            system_prompt = get_system_prompt(user_context, learnings)
            
            # Create chat instance
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"user_{user_context.get('name', 'unknown')}",
                system_message=system_prompt
            ).with_model("gemini", "gemini-2.5-flash")
            
            # Build conversation context
            full_message = user_message
            if conversation_history:
                # Include last few messages for context
                recent = conversation_history[-5:] if len(conversation_history) > 5 else conversation_history
                context_text = "\n".join([
                    f"{msg['role']}: {msg['text']}" for msg in recent
                ])
                full_message = f"Previous context:\n{context_text}\n\nUser: {user_message}"
            
            # Create user message
            message = UserMessage(text=full_message)
            
            # Get response
            response = await chat.send_message(message)
            
            return response
        
        except Exception as e:
            logger.error(f"Gemini API error: {str(e)}")
            return "I'm having trouble connecting right now. Could you try again?"
    
    async def detect_track(self, message: str, conversation_history: list = None) -> str:
        """Detect conversation track"""
        try:
            # Simple keyword-based detection (can be enhanced with AI)
            message_lower = message.lower()
            
            # CAT/MBA keywords
            cat_keywords = ['cat', 'mba', 'iim', 'mock test', 'percentile', 'admission', 'gmat', 'entrance']
            if any(keyword in message_lower for keyword in cat_keywords):
                return 'cat_mba'
            
            # Jobs/Career keywords
            career_keywords = ['job', 'career', 'role', 'interview', 'salary', 'promotion', 'company', 'manager', 'switch']
            if any(keyword in message_lower for keyword in career_keywords):
                return 'jobs_career'
            
            # Roast/Play keywords
            roast_keywords = ['roast', 'roast me', 'bored', 'fun', 'joke']
            if any(keyword in message_lower for keyword in roast_keywords):
                return 'roast_play'
            
            # Default: check conversation history for context
            if conversation_history:
                for msg in reversed(conversation_history[-5:]):
                    if msg.get('track'):
                        return msg['track']
            
            return None
        
        except Exception as e:
            logger.error(f"Track detection error: {str(e)}")
            return None
