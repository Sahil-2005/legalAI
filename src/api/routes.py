import logging
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Dict, Any

from src.services.qdrant_client import semantic_search
from src.services.llm_service import llm_service

router = APIRouter(prefix="/api/v1")
logger = logging.getLogger(__name__)

class LegalQueryRequest(BaseModel):
    """Payload sent by the User inquiring about legal compliance."""
    business_idea: str = Field(..., description="The user's business idea or legal question.", min_length=10)

class LegalQueryResponse(BaseModel):
    """Structured response to be returned to the client."""
    response: str
    retrieved_context: List[Dict[str, Any]]

@router.post("/analyze-legal", response_model=LegalQueryResponse, status_code=status.HTTP_200_OK)
async def analyze_legal(payload: LegalQueryRequest):
    """
    RAG Endpoint:
    1. Embeds the user's business idea and searches Qdrant for Top 5 Context chunks.
    2. Sends the contexts + user's query to external LLM to formulate valid legal advice.
    """
    try:
        # Step A: Expand the user's idea into exactly 3 targeted sub-queries.
        sub_queries = await llm_service.expand_legal_query(payload.business_idea)

        # Step B: Run multi-query retrieval (3 x top_k=6) to reduce vector dilution.
        all_context_chunks = []
        for sub_query in sub_queries:
            try:
                chunks = semantic_search.search_legal_context(query=sub_query, top_k=6)
                all_context_chunks.extend(chunks)
            except Exception as search_error:
                logger.warning(
                    "Sub-query retrieval failed; continuing with remaining queries. Query: %s | Error: %s",
                    sub_query,
                    str(search_error)
                )

        if not all_context_chunks:
            # Although Qdrant will usually return *something* via cosine similarity, handle edge cases
            return LegalQueryResponse(
                response="No relevant legal context was found to evaluate your idea.",
                retrieved_context=[]
            )

        # Step C: Generate final advice for the original specific user query using enriched context.
        llm_answer = await llm_service.generate_legal_advice(
            user_idea=payload.business_idea,
            context_chunks=all_context_chunks
        )
        
        # Step 3: Return Response
        return LegalQueryResponse(
            response=llm_answer,
            retrieved_context=all_context_chunks
        )

    except Exception as e:
        # Avoid exposing raw sensitive exception dumps to user
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while analyzing the legal request: {str(e)}"
        )
