import logging
from typing import List, Dict, Any
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from src.core.config import settings

logger = logging.getLogger(__name__)

class SemanticSearchService:
    """
    Service responsible for interacting with Qdrant and generating Embeddings.
    """
    def __init__(self):
        logger.info("Initializing Semantic Search Service...")
        
        # Load local Model for generating query embeddings
        self.embedding_model_name = "all-MiniLM-L6-v2"
        logger.info(f"Loading {self.embedding_model_name}...")
        self.model = SentenceTransformer(self.embedding_model_name)
        
        # Initialize Qdrant connection
        if not settings.QDRANT_URL or not settings.QDRANT_API_KEY:
            logger.warning("No Qdrant Cloud credentials found, defaulting to memory db.")
            self.client = QdrantClient(":memory:")
        else:
            self.client = QdrantClient(url=settings.QDRANT_URL, api_key=settings.QDRANT_API_KEY)

        self.collection_name = settings.QDRANT_COLLECTION

    def search_legal_context(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Takes a natural language query, models it into vector, and retrieves closest text chunks from Qdrant.
        """
        logger.info(f"Searching for context related to: {query}")
        
        try:
            # Generate local vector representation of the Query
            query_vector = self.model.encode(query, convert_to_numpy=True).tolist()
            
            # Request Top-K context chunks from Qdrant Cloud
            search_result = self.client.search(
                collection_name=self.collection_name,
                query_vector=query_vector,
                limit=top_k,
                with_payload=True
            )
            
            # Format results
            context_results = []
            for hit in search_result:
                payload = hit.payload
                context_results.append({
                    "score": hit.score,
                    "text": payload.get("text", ""),
                    "source": payload.get("source", "Unknown"),
                    "page_number": payload.get("page_number", 0)
                })
                
            return context_results

        except Exception as e:
            logger.error(f"Failed to query Qdrant vectors: {e}")
            raise e

# Create a singleton instance to be used across endpoints avoiding re-loading Model.
semantic_search = SemanticSearchService()
