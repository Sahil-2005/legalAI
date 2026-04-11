import logging
import requests
from typing import List, Dict, Any
from src.core.config import settings

logger = logging.getLogger(__name__)

class LLMService:
    """
    Service responsible for interacting with the External LLM API (Google Gemini).
    Assembles prompts enforcing strict QA from provided context and fetches response.
    """
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        # Using the standard gemini-1.5-flash model endpoint for text generation tasks via REST
        self.endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
        
        if not self.api_key or self.api_key == "REPLACE_ME":
            logger.warning("GEMINI_API_KEY is missing or invalid. Generation sequences will fail.")

    def build_prompt(self, user_idea: str, context_chunks: List[Dict[str, Any]]) -> str:
        """
        Creates a strict prompt ensuring the LLM uses only the retrieved context to answer the user's idea.
        """
        # Combine contextual text with citation lines
        context_text = ""
        for i, chunk in enumerate(context_chunks):
            source = chunk.get("source", "Unknown Document")
            page = chunk.get("page_number", "?")
            text = chunk.get("text", "").strip()
            context_text += f"\n--- Context Chunk {i+1} [Source: {source}, Page: {page}] ---\n{text}\n"

        prompt = f"""You are a strict, highly accurate Legal AI Assistant specializing in Indian Startup Compliance.

Your task is to analyze the user's business idea and answer their legal compliance query STRICTLY based on the Context Chunks provided below.

INSTRUCTIONS:
1. ONLY utilize the information provided in the Context Chunks to formulate your response.
2. If the user's query cannot be answered using the given context, clearly state: "I cannot answer this question based on the provided context." Do not hallucinate or rely on outside knowledge.
3. Be professional, concise, and highlight specific obligations or laws mentioned.
4. Provide citations to the Source Document and Page Numbers where possible based on the context snippets.

CONTEXT CHUNKS:{context_text}

USER'S BUSINESS IDEA / QUERY:
{user_idea}

RESPONSE:"""
        return prompt

    def generate_legal_advice(self, user_idea: str, context_chunks: List[Dict[str, Any]]) -> str:
        """
        Calls the Gemini REST API using requests to get a generated answer.
        """
        prompt = self.build_prompt(user_idea, context_chunks)
        
        url_with_key = f"{self.endpoint}?key={self.api_key}"
        
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt}
                    ]
                }
            ],
            # Use lower temperature to reduce hallucination odds
            "generationConfig": {
                "temperature": 0.1,
                "topK": 40,
                "topP": 0.95,
                "maxOutputTokens": 1024,
            }
        }
        
        headers = {
            "Content-Type": "application/json"
        }
        
        try:
            logger.info("Sending prompt to Gemini API...")
            response = requests.post(url_with_key, json=payload, headers=headers)
            response.raise_for_status()
            
            data = response.json()
            
            # Extract response text properly handling the JSON deeply nested structure
            candidates = data.get("candidates", [])
            if not candidates:
                return "The LLM API returned no response candidates."
                
            first_candidate = candidates[0]
            content = first_candidate.get("content", {})
            parts = content.get("parts", [])
            
            if parts:
                return parts[0].get("text", "")
            return "No text content found in the standard response."
            
        except requests.exceptions.HTTPError as http_err:
            logger.error(f"HTTP Error calling LLM API: {response.text}")
            raise Exception(f"External LLM API Error: Status {response.status_code}")
        except Exception as e:
            logger.error(f"Error calling LLM API: {e}")
            raise e

# Create singleton service instance
llm_service = LLMService()
