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
        # Step A: Expand short user input into broader legal-regulatory retrieval text.
        retrieval_query = payload.business_idea
        try:
            retrieval_query = await llm_service.expand_legal_query(payload.business_idea)
        except Exception as expansion_error:
            logger.warning(
                "Query expansion failed; falling back to original user query. Error: %s",
                str(expansion_error)
            )

        # Step B: Retrieve context chunks using expanded query to broaden recall.
        context_chunks = semantic_search.search_legal_context(query=retrieval_query, top_k=18)
        
        if not context_chunks:
            # Although Qdrant will usually return *something* via cosine similarity, handle edge cases
            return LegalQueryResponse(
                response="No relevant legal context was found to evaluate your idea.",
                retrieved_context=[]
            )

        # Step C: Generate final advice for the original specific user query using enriched context.
        llm_answer = await llm_service.generate_legal_advice(
            user_idea=payload.business_idea,
            context_chunks=context_chunks
        )
        
        # Step 3: Return Response
        return LegalQueryResponse(
            response=llm_answer,
            retrieved_context=context_chunks
        )

    except Exception as e:
        # Avoid exposing raw sensitive exception dumps to user
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while analyzing the legal request: {str(e)}"
        )
