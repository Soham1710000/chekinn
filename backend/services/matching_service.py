import logging
import json
from emergentintegrations.llm.chat import LlmChat, UserMessage
import os
from dotenv import load_dotenv
from bson import ObjectId
from prompts.matching import get_matching_prompt

load_dotenv()
logger = logging.getLogger(__name__)

class MatchingService:
    def __init__(self, db, gemini_service):
        self.db = db
        self.gemini_service = gemini_service
        self.api_key = os.getenv("EMERGENT_LLM_KEY")
    
    async def find_matches(self, user_id: str, max_matches: int = 3) -> list:
        """Find potential matches for a user"""
        try:
            # Get user info
            user = await self.db.users.find_one({"_id": ObjectId(user_id)})
            if not user or not user.get("open_to_intros"):
                return []
            
            # Get user's learnings
            learnings = await self.db.learnings.find_one({"user_id": user_id})
            user_data = {
                "name": user.get("name"),
                "city": user.get("city"),
                "current_role": user.get("current_role"),
                "intent": user.get("intent"),
                "learnings": learnings.get("data") if learnings else None
            }
            
            # Get user's conversation to determine track
            conversation = await self.db.conversations.find_one({"user_id": user_id})
            user_track = conversation.get("current_track") if conversation else None
            
            # Find candidate users
            # Filter: same city (optional), open to intros, not already matched
            query = {
                "_id": {"$ne": ObjectId(user_id)},
                "open_to_intros": True
            }
            
            if user.get("city"):
                query["city"] = user.get("city")
            
            candidates = await self.db.users.find(query).limit(20).to_list(20)
            
            # Filter out users already matched
            existing_intros = await self.db.intros.find({
                "from_user_id": user_id
            }).distinct("to_user_id")
            
            candidates = [c for c in candidates if str(c["_id"]) not in existing_intros]
            
            # Score each candidate
            scored_matches = []
            
            for candidate in candidates:
                # Get candidate's learnings and track
                candidate_learnings = await self.db.learnings.find_one({"user_id": str(candidate["_id"])})
                candidate_conversation = await self.db.conversations.find_one({"user_id": str(candidate["_id"])})
                candidate_track = candidate_conversation.get("current_track") if candidate_conversation else None
                
                # Skip if tracks don't align (and both are set)
                if user_track and candidate_track and user_track != candidate_track:
                    continue
                
                candidate_data = {
                    "name": candidate.get("name"),
                    "city": candidate.get("city"),
                    "current_role": candidate.get("current_role"),
                    "intent": candidate.get("intent"),
                    "learnings": candidate_learnings.get("data") if candidate_learnings else None
                }
                
                # Use AI to evaluate match
                match_result = await self._evaluate_match(user_data, candidate_data)
                
                if match_result["should_match"] and match_result["score"] >= 0.6:
                    scored_matches.append({
                        "user_id": str(candidate["_id"]),
                        "score": match_result["score"],
                        "reason": match_result["reason"]
                    })
            
            # Sort by score and return top matches
            scored_matches.sort(key=lambda x: x["score"], reverse=True)
            return scored_matches[:max_matches]
        
        except Exception as e:
            logger.error(f"Matching error: {str(e)}")
            return []
    
    async def _evaluate_match(self, user_a: dict, user_b: dict) -> dict:
        """Evaluate if two users should be matched using AI"""
        try:
            # Build matching prompt
            prompt = get_matching_prompt(user_a, user_b)
            
            # Get AI evaluation
            chat = LlmChat(
                api_key=self.api_key,
                session_id="matching_eval",
                system_message="You are a matching algorithm. Respond ONLY with valid JSON."
            ).with_model("gemini", "gemini-2.5-flash")
            
            message = UserMessage(text=prompt)
            response = await chat.send_message(message)
            
            # Parse JSON
            try:
                # Clean response
                cleaned = response.strip()
                if cleaned.startswith("```json"):
                    cleaned = cleaned[7:]
                if cleaned.startswith("```"):
                    cleaned = cleaned[3:]
                if cleaned.endswith("```"):
                    cleaned = cleaned[:-3]
                cleaned = cleaned.strip()
                
                result = json.loads(cleaned)
                return result
            except json.JSONDecodeError:
                logger.error(f"Failed to parse matching JSON: {response}")
                return {"should_match": False, "score": 0.0, "reason": "Evaluation failed"}
        
        except Exception as e:
            logger.error(f"Match evaluation error: {str(e)}")
            return {"should_match": False, "score": 0.0, "reason": "Error occurred"}
