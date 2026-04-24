import logging
import json
import re
import httpx
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
        self.grok_api_key = settings.GROK_API_KEY
        # Using the standard gemini-2.5-flash or pro endpoint
        self.endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
        self.grok_endpoint = "https://api.groq.com/openai/v1/chat/completions"
        
        if not self.api_key or self.api_key == "REPLACE_ME":
            logger.warning("GEMINI_API_KEY is missing or invalid. Generation sequences will fail.")
        if not self.grok_api_key or self.grok_api_key == "REPLACE_ME":
            logger.warning("GROK_API_KEY is missing or invalid. Grok fallback will fail.")

    def build_prompt(self, user_idea: str, context_chunks: List[Dict[str, Any]]) -> str:
        """
        Creates a strict prompt ensuring the LLM uses only the retrieved context to answer the user's idea.
        """
        # Combine contextual text with citation lines
        context_text = ""
        for i, chunk in enumerate(context_chunks):
            source = chunk.get("source", "Unknown Document")
            page = chunk.get("page_number", "?")
            ref_url = chunk.get("ref", "")
            text = chunk.get("text", "").strip()
            context_text += f"\n--- Context Chunk {i+1} [Source: {source}, Page: {page}, URL: {ref_url}] ---\n{text}\n"

        prompt = f"""You are a strict, highly accurate LexAgent AI Assistant specializing in Indian Startup Compliance.

Your task is to analyze the user's business idea and answer their legal compliance query STRICTLY based on the Context Chunks provided below.

CRITICAL CITATION RULE:
Whenever you state a legal requirement, step, or risk, you MUST append a markdown citation at the end of the sentence using the provided context. 
Format it EXACTLY like this: [Document Name, Page X](URL)

Example of correct output:
"You must ensure the security of patient data. ([Telemedicine Guidelines, Page 14](https://esanjeevani.mohfw.gov.in...))"

If a URL is empty, just use the document name and page. Do not hallucinate URLs.

INSTRUCTIONS:
1. ONLY utilize the information provided in the Context Chunks to formulate your response.
2. SMART 360-DEGREE COMPLIANCE (CRITICAL): Review all provided Context Chunks, but ONLY extract and apply compliances that are explicitly relevant to the user's specific business idea. 
   - FORBIDDEN DOMAINS: You are STRICTLY FORBIDDEN from mentioning FSSAI, Food Safety, or Food Labelling regulations UNLESS the user explicitly uses words like "food", "beverage", "restaurant", "grocery", "supplements", or "kitchen" in their idea. 
   - If the user is building a generic tech, software, or e-commerce platform without mentioning food, you MUST ignore all FSSAI chunks provided to you.
3. If the user's query cannot be answered using the given context, clearly state: "I cannot answer this question based on the provided context." Do not hallucinate or rely on outside knowledge.
4. Be professional, concise, and highlight specific obligations or laws mentioned.
5. Provide citations strictly adhering to the CRITICAL CITATION RULE above.
6. You MUST return your response as a valid JSON object matching exactly this schema. IMPORTANT: You must escape any newlines in your strings using \\n so that JSON.parse() does not fail!
{{
  "businessType": "Short classification of the business (max 5 words)",
  "licenses": "Comma separated list of required licenses and compliances",
  "steps": "Maximum 5 concise bullet points of actionable steps",
  "risks": "Maximum 3 main legal risks involved",
  "riskScore": Integer between 0 and 100 representing risk severity,
  "cost": "Estimated cost or statement about cost in 1 sentence",
  "raw": "A concise summary of the legal advice formatted in Markdown (maximum 2 paragraphs)"
}}

CONTEXT CHUNKS:{context_text}

USER'S BUSINESS IDEA / QUERY:
{user_idea}

RESPONSE (OUTPUT ONLY VALID JSON):"""
        return prompt

    async def expand_legal_query(self, user_idea: str) -> List[str]:
        """
        Expands a short business idea into exactly three targeted sub-queries
        optimized for multi-query vector retrieval.
        """
        expansion_prompt = f"""You are a legal query expansion engine for semantic vector search in a RAG system.

Task:
Generate exactly 3 retrieval sub-queries for Indian startup legal compliance.

Strict output rules:
1. Return ONLY a valid JSON array of strings with exactly 3 elements.
2. Do not return markdown, code fences, commentary, or extra keys.
3. Query 1 must focus on industry-specific regulations (e.g., Food, Health, sector licenses, packaging/safety).
4. Query 2 must focus on taxation and corporate structure (e.g., GST, Companies Act, registrations, invoicing, accounting compliance).
5. Query 3 must focus on labor, contracts, and data privacy.
6. Each query should be specific, keyword-dense, and optimized for legal document retrieval in India.

User idea: {user_idea}

Output JSON array only:"""

        url_with_key = f"{self.endpoint}?key={self.api_key}"
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": expansion_prompt}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.1,
                "topK": 40,
                "topP": 0.9,
                "maxOutputTokens": 512
            }
        }
        headers = {
            "Content-Type": "application/json"
        }

        def _parse_sub_queries(raw_text: str) -> List[str]:
            cleaned = (raw_text or "").strip()
            if not cleaned:
                raise ValueError("Empty expansion response")

            # Handle markdown wrapped JSON, e.g. ```json [...] ```
            cleaned = re.sub(r"^```(?:json)?\\s*", "", cleaned, flags=re.IGNORECASE)
            cleaned = re.sub(r"\\s*```$", "", cleaned)

            array_match = re.search(r"\[.*\]", cleaned, flags=re.DOTALL)
            if array_match:
                cleaned = array_match.group(0)

            parsed = json.loads(cleaned)
            if not isinstance(parsed, list):
                raise ValueError("Expansion output is not a JSON array")

            queries = [str(item).strip() for item in parsed if isinstance(item, str) and str(item).strip()]
            if len(queries) != 3:
                raise ValueError("Expansion output must contain exactly 3 non-empty string queries")

            return queries

        async def _expand_with_grok() -> List[str]:
            grok_headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.grok_api_key}"
            }
            grok_payload = {
                "model": "llama-3.3-70b-versatile",
                "messages": [
                    {
                        "role": "system",
                        "content": (
                            "You are a legal query expansion engine for semantic vector search in a RAG system. "
                            "Return only a valid JSON array of exactly 3 strings. "
                            "Do not include markdown or commentary."
                        )
                    },
                    {
                        "role": "user",
                        "content": expansion_prompt
                    }
                ],
                "temperature": 0.1,
                "max_tokens": 300
            }

            logger.info("Gemini query expansion failed. Trying Grok fallback for expansion...")
            async with httpx.AsyncClient(timeout=60) as client:
                response = await client.post(self.grok_endpoint, json=grok_payload, headers=grok_headers)
                response.raise_for_status()

            data = response.json()
            choices = data.get("choices", [])
            if not choices:
                raise Exception("Grok returned no choices for query expansion.")

            message = choices[0].get("message", {})
            return _parse_sub_queries(message.get("content", ""))

        try:
            logger.info("Expanding short legal query for retrieval using Gemini...")
            async with httpx.AsyncClient(timeout=60) as client:
                response = await client.post(url_with_key, json=payload, headers=headers)
                response.raise_for_status()

            data = response.json()
            candidates = data.get("candidates", [])
            if not candidates:
                raise Exception("Gemini returned no candidates for query expansion.")

            content = candidates[0].get("content", {})
            parts = content.get("parts", [])
            return _parse_sub_queries(parts[0].get("text", "") if parts else "")
        except Exception as gemini_error:
            logger.error(f"Query expansion failed with Gemini: {gemini_error}")
            try:
                return await _expand_with_grok()
            except Exception as grok_error:
                logger.error(f"Query expansion failed with Grok fallback: {grok_error}")
                return [user_idea]

    async def generate_with_grok(self, prompt: str) -> str:
        """
        Fallback method using xAI's Grok API.
        """
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.grok_api_key}"
        }
        
        payload = {
            # "model": "grok-beta",
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {
                    "role": "system",
                    "content": "You are a strict, highly accurate LexAgent AI Assistant specializing in Indian Startup Compliance. You must respond in valid JSON format with the exact keys: businessType, licenses, steps, risks, riskScore, cost, and raw.\n\nCRITICAL CITATION RULE:\nWhenever you state a legal requirement, step, or risk, you MUST append a markdown citation at the end of the sentence using the provided context. \nFormat it EXACTLY like this: [Document Name, Page X](URL)\n\nExample of correct output:\n\"You must ensure the security of patient data. ([Telemedicine Guidelines, Page 14](https://esanjeevani.mohfw.gov.in...))\"\n\nIf a URL is empty, just use the document name and page. Do not hallucinate URLs."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.1,
            "max_tokens": 4096
        }
        
        try:
            logger.info("Sending prompt to Grok API fallback...")
            async with httpx.AsyncClient(timeout=120) as client:
                response = await client.post(self.grok_endpoint, json=payload, headers=headers)
                response.raise_for_status()
            
            data = response.json()
            choices = data.get("choices", [])
            if not choices:
                return "The Grok API returned no response choices."
                
            first_choice = choices[0]
            message = first_choice.get("message", {})
            return message.get("content", "No text content found in Grok response.")
            
        except httpx.HTTPStatusError as http_err:
            logger.error(f"HTTP Error calling Grok API: {http_err.response.text}")
            raise Exception(f"Grok API Error: Status {http_err.response.status_code}")
        except Exception as e:
            logger.error(f"Error calling Grok API: {e}")
            raise e

    async def generate_legal_advice(self, user_idea: str, context_chunks: List[Dict[str, Any]]) -> str:
        """
        Calls the Gemini REST API using httpx to get a generated answer.
        Falls back to Grok API if Gemini fails.
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
                "maxOutputTokens": 8192,
                "responseMimeType": "application/json"
            }
        }
        
        headers = {
            "Content-Type": "application/json"
        }
        
        try:
            logger.info("Sending prompt to Gemini API...")
            async with httpx.AsyncClient(timeout=120) as client:
                response = await client.post(url_with_key, json=payload, headers=headers)
                response.raise_for_status()
            
            data = response.json()
            
            # Extract response text properly handling the JSON deeply nested structure
            candidates = data.get("candidates", [])
            if not candidates:
                logger.warning("Gemini returned no candidates, trying Grok...")
                return await self.generate_with_grok(prompt)
                
            first_candidate = candidates[0]
            content = first_candidate.get("content", {})
            parts = content.get("parts", [])
            
            if parts:
                return parts[0].get("text", "")
            
            logger.warning("No text in Gemini response parts, trying Grok...")
            return await self.generate_with_grok(prompt)
            
        except (httpx.RequestError, httpx.HTTPStatusError, Exception) as e:
            logger.error(f"Gemini API failed with error: {e}. Triggering Grok fallback...")
            try:
                return await self.generate_with_grok(prompt)
            except Exception as grok_e:
                raise Exception(f"Both Gemini and Grok APIs failed. Gemini error: {str(e)} | Grok error: {str(grok_e)}")

# Create singleton service instance
llm_service = LLMService()
