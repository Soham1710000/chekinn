import os
import openai
from dotenv import load_dotenv
import logging

load_dotenv()
logger = logging.getLogger(__name__)

class TTSService:
    def __init__(self):
        # Note: Using OPENAI_API_KEY instead of EMERGENT_LLM_KEY
        # because TTS is only available through OpenAI directly
        self.api_key = os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            # Fallback to EMERGENT_LLM_KEY if available (not recommended for production)
            self.api_key = os.getenv("EMERGENT_LLM_KEY")
        
        if not self.api_key:
            logger.warning("No OpenAI API key found. TTS synthesis will fail.")
        
        self.client = openai.OpenAI(api_key=self.api_key)
    
    async def synthesize(self, text: str, voice: str = "alloy") -> bytes:
        """Synthesize speech from text using OpenAI TTS"""
        try:
            # Validate text length
            if len(text) > 4096:
                logger.warning(f"Text too long ({len(text)} chars), truncating to 4096")
                text = text[:4096]
            
            # Generate speech
            response = self.client.audio.speech.create(
                model="tts-1",
                voice=voice,
                input=text
            )
            
            # Return audio bytes
            return response.content
        
        except Exception as e:
            logger.error(f"TTS synthesis error: {str(e)}")
            raise
