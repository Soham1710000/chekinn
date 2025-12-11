import logging
import re

logger = logging.getLogger(__name__)

class ModerationService:
    """Simple content moderation service"""
    
    def __init__(self):
        # Common inappropriate words/phrases (basic list)
        self.blocked_words = [
            # Add inappropriate words here
            "spam",
            "scam",
        ]
        
        # Patterns for common issues
        self.phone_pattern = re.compile(r'\b\d{10,}\b')
        self.email_pattern = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b')
        self.url_pattern = re.compile(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+')
    
    def moderate(self, text: str) -> dict:
        """
        Check if text is appropriate for peer chat
        Returns: {
            "allowed": bool,
            "reason": str (if not allowed),
            "flags": list
        }
        """
        flags = []
        
        # Check for empty or too short
        if not text or len(text.strip()) < 2:
            return {"allowed": False, "reason": "Message too short", "flags": ["too_short"]}
        
        # Check message length
        if len(text) > 5000:
            return {"allowed": False, "reason": "Message too long", "flags": ["too_long"]}
        
        text_lower = text.lower()
        
        # Check for blocked words
        for word in self.blocked_words:
            if word in text_lower:
                flags.append(f"blocked_word:{word}")
        
        # Check for phone numbers (warn but allow for now)
        if self.phone_pattern.search(text):
            flags.append("phone_number")
        
        # Check for emails (warn but allow for now)
        if self.email_pattern.search(text):
            flags.append("email")
        
        # Check for URLs (warn but allow for now)
        if self.url_pattern.search(text):
            flags.append("url")
        
        # Check for excessive caps (spam indicator)
        caps_count = sum(1 for c in text if c.isupper())
        if len(text) > 10 and caps_count / len(text) > 0.7:
            flags.append("excessive_caps")
        
        # Check for repeated characters (spam indicator)
        if re.search(r'(.)\1{4,}', text):
            flags.append("repeated_chars")
        
        # Decide if message is allowed
        # For now, only block if we have critical flags
        critical_flags = [f for f in flags if f.startswith("blocked_word")]
        
        if critical_flags:
            return {
                "allowed": False,
                "reason": "Message contains inappropriate content",
                "flags": flags
            }
        
        return {
            "allowed": True,
            "reason": None,
            "flags": flags
        }
    
    def log_message(self, user_id: str, text: str, moderation_result: dict):
        """Log moderated messages for review"""
        if moderation_result["flags"]:
            logger.warning(f"Moderated message from {user_id}: flags={moderation_result['flags']}")
