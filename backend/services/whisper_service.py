import os
import openai
from dotenv import load_dotenv
import tempfile
import logging

load_dotenv()
logger = logging.getLogger(__name__)

class WhisperService:
    def __init__(self):
        # Note: Using OPENAI_API_KEY instead of EMERGENT_LLM_KEY
        # because Whisper is only available through OpenAI directly
        self.api_key = os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            # Fallback to EMERGENT_LLM_KEY if available (not recommended for production)
            self.api_key = os.getenv("EMERGENT_LLM_KEY")
        
        if not self.api_key:
            logger.warning("No OpenAI API key found. Whisper transcription will fail.")
        
        self.client = openai.OpenAI(api_key=self.api_key)
    
    async def transcribe(self, audio_content: bytes, filename: str = "audio.mp3") -> dict:
        """Transcribe audio using OpenAI Whisper API"""
        try:
            # Write to temp file (Whisper API requires file object)
            with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as temp_file:
                temp_file.write(audio_content)
                temp_path = temp_file.name
            
            # Transcribe
            with open(temp_path, "rb") as audio_file:
                transcript = self.client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    response_format="json"
                )
            
            # Clean up temp file
            os.unlink(temp_path)
            
            return {
                "text": transcript.text,
                "duration": getattr(transcript, 'duration', None)
            }
        
        except Exception as e:
            logger.error(f"Whisper transcription error: {str(e)}")
            raise
