import logging
import json
from emergentintegrations.llm.chat import LlmChat, UserMessage
import os
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

LEARNING_EXTRACTION_PROMPT = """You are analyzing a conversation to extract new learnings about a user who is focused on CAT/MBA or jobs/career.
Be subtle — only infer what's clearly evident, don't hallucinate.

Extract ONLY new information not already in the existing context. Return JSON with these fields (omit empty arrays/nulls):

{
  "big_rocks": ["major life priorities"],
  "recurring_themes": ["patterns like 'overthinks career switches'"],
  "constraints": ["limitations: time, money, geography, family obligations"],
  "north_star": "long-term aspiration if mentioned",
  "communication_style": "concise vs detailed, prefers voice vs text",
  "emotional_patterns": ["emotional tendencies in specific areas"],
  "decision_tendencies": "how they approach decisions",
  "important_people": [{"name": "person", "context": "relationship"}],
  "life_events": [{"event": "event", "context": "details"}]
}

Be conservative — only extract what is clearly stated or strongly implied.
Respond ONLY with valid JSON, nothing else.
"""

class LearningService:
    def __init__(self, db):
        self.db = db
        self.api_key = os.getenv("EMERGENT_LLM_KEY")
    
    async def extract_and_update_learnings(self, user_id: str, conversation_history: list):
        """Extract learnings from conversation and update database"""
        try:
            # Get existing learnings
            existing = await self.db.learnings.find_one({"user_id": user_id})
            
            # Build conversation text
            conv_text = "\n".join([
                f"{msg['role']}: {msg['text']}" for msg in conversation_history[-10:]
            ])
            
            # Extract new learnings
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"learning_{user_id}",
                system_message=LEARNING_EXTRACTION_PROMPT
            ).with_model("gemini", "gemini-2.5-flash")
            
            prompt = f"Conversation:\n{conv_text}\n\nExisting learnings: {json.dumps(existing.get('data') if existing else {})}\n\nExtract new learnings:"
            message = UserMessage(text=prompt)
            response = await chat.send_message(message)
            
            # Parse JSON response
            try:
                # Clean response - remove markdown code blocks if present
                cleaned_response = response.strip()
                if cleaned_response.startswith("```json"):
                    cleaned_response = cleaned_response[7:]
                if cleaned_response.startswith("```"):
                    cleaned_response = cleaned_response[3:]
                if cleaned_response.endswith("```"):
                    cleaned_response = cleaned_response[:-3]
                cleaned_response = cleaned_response.strip()
                
                new_learnings = json.loads(cleaned_response)
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse learnings JSON: {response}")
                return
            
            # Merge with existing learnings
            if existing:
                merged = existing.get("data", {})
                
                # Merge arrays
                for key in ['big_rocks', 'recurring_themes', 'constraints', 'emotional_patterns']:
                    if key in new_learnings:
                        existing_items = set(merged.get(key, []))
                        new_items = set(new_learnings[key])
                        merged[key] = list(existing_items | new_items)
                
                # Update single values
                for key in ['north_star', 'communication_style', 'decision_tendencies']:
                    if key in new_learnings and new_learnings[key]:
                        merged[key] = new_learnings[key]
                
                # Merge objects
                for key in ['important_people', 'life_events']:
                    if key in new_learnings:
                        merged[key] = merged.get(key, []) + new_learnings[key]
                
                # Update database
                await self.db.learnings.update_one(
                    {"user_id": user_id},
                    {"$set": {"data": merged, "updated_at": "now"}}
                )
            else:
                # Create new learnings document
                await self.db.learnings.insert_one({
                    "user_id": user_id,
                    "data": new_learnings,
                    "created_at": "now",
                    "updated_at": "now"
                })
            
            logger.info(f"Updated learnings for user {user_id}")
        
        except Exception as e:
            logger.error(f"Learning extraction error: {str(e)}")
