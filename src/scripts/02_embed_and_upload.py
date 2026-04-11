import json
import logging
import uuid
from pathlib import Path
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.http import models

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
PROCESSED_DATA_DIR = PROJECT_ROOT / "data" / "processed"
CHUNKS_FILE = PROCESSED_DATA_DIR / "chunks.json"

# Load config values from environment or config module but for script, we can use simple dotenv
from dotenv import load_dotenv
import os

load_dotenv(PROJECT_ROOT / ".env")

QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
COLLECTION_NAME = "legal_compliance_chunks"
EMBEDDING_MODEL = "all-MiniLM-L6-v2"
VECTOR_SIZE = 384  # Size for all-MiniLM-L6-v2

def upload_to_qdrant():
    if not CHUNKS_FILE.exists():
        logger.error(f"Chunks file not found at {CHUNKS_FILE}. Run 01_chunk_pdfs.py first.")
        return

    # 1. Load JSON Data
    with open(CHUNKS_FILE, "r", encoding="utf-8") as f:
        chunks = json.load(f)
    logger.info(f"Loaded {len(chunks)} chunks from {CHUNKS_FILE}")

    # 2. Init Local Embeddings Model
    logger.info(f"Loading sentence transformer model: {EMBEDDING_MODEL}")
    model = SentenceTransformer(EMBEDDING_MODEL)

    # 3. Connect to Qdrant Cloud
    if not QDRANT_URL or not QDRANT_API_KEY:
        logger.warning("QDRANT_URL or QDRANT_API_KEY not found. Using local in-memory Qdrant for testing.")
        client = QdrantClient(":memory:")
    else:
        logger.info("Connecting to Qdrant Cloud Cluster...")
        client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)

    # 4. Check/Recreate Collection
    try:
        collections = client.get_collections()
        exists = any(c.name == COLLECTION_NAME for c in collections.collections)
        
        if exists:
            logger.info(f"Collection {COLLECTION_NAME} exists, deleting it to start fresh...")
            client.delete_collection(collection_name=COLLECTION_NAME)
            
        logger.info(f"Creating collection {COLLECTION_NAME}...")
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=models.VectorParams(size=VECTOR_SIZE, distance=models.Distance.COSINE)
        )
    except Exception as e:
        logger.error(f"Error managing Qdrant collection: {e}")
        return

    # 5. Embed & Format Payloads in Batches
    batch_size = 64
    points = []
    
    logger.info("Starting embedding generation and batch upload...")
    
    for i in range(0, len(chunks), batch_size):
        batch_chunks = chunks[i:i + batch_size]
        
        # Extract purely the text content to encode
        texts = [chunk["text"] for chunk in batch_chunks]
        
        # Encode with SentenceTransformer
        embeddings = model.encode(texts, convert_to_numpy=True)
        
        # Build PointStruct for each record
        for j, chunk in enumerate(batch_chunks):
            # Using MD5 or UUID for unique vector ID
            point_id = str(uuid.uuid4())
            
            payload = {
                "source": chunk["source"],
                "page_number": chunk["page_number"],
                "text": chunk["text"],
                "chunk_id": chunk.get("chunk_id", f"chunk_{i+j}")
            }
            
            points.append(
                models.PointStruct(
                    id=point_id,
                    vector=embeddings[j].tolist(),
                    payload=payload
                )
            )

        # Upload batch
        try:
            client.upsert(
                collection_name=COLLECTION_NAME,
                points=points
            )
            logger.info(f"Upserted items {int(i)} to {int(i + len(batch_chunks))} out of {len(chunks)}...")
            points = []  # clear for next batch
        except Exception as e:
            logger.error(f"Failed to upsert batch covering items {i} to {i + len(batch_chunks)}: {e}")

    logger.info("Successfully pushed all chunk embeddings to Qdrant.")

if __name__ == "__main__":
    upload_to_qdrant()
