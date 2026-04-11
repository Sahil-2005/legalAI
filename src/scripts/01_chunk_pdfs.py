import os
import json
import logging
from pathlib import Path
import fitz  # PyMuPDF
from langchain_text_splitters import RecursiveCharacterTextSplitter

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Paths setup based on project root (assuming run from project root)
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
RAW_DATA_DIR = PROJECT_ROOT / "data" / "raw"
PROCESSED_DATA_DIR = PROJECT_ROOT / "data" / "processed"

CHUNK_SIZE = 800
CHUNK_OVERLAP = 100

def clean_text(text: str) -> str:
    """Clean extracted text from PDFs removing extra whitespaces and newlines."""
    # Replace newlines used for wrapping with spaces
    text = text.replace("\n", " ")
    # Shrink multiple spaces into a single space
    text = " ".join(text.split())
    return text.strip()

def process_pdfs():
    """
    Reads PDFs from data/raw/, extracts text page by page, cleans it,
    chunks it, and saves structured JSON chunks into data/processed/.
    """
    # Ensure processed directory exists
    PROCESSED_DATA_DIR.mkdir(parents=True, exist_ok=True)
    
    if not RAW_DATA_DIR.exists() or not os.listdir(RAW_DATA_DIR):
        logger.warning(f"No PDFs found in {RAW_DATA_DIR}. Please add PDFs before running this script.")
        return

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        length_function=len,
        separators=["\n\n", "\n", " ", ""]
    )

    all_chunks = []
    
    # Iterate through PDFs
    for root, _, files in os.walk(RAW_DATA_DIR):
        for file in files:
            if file.lower().endswith(".pdf"):
                file_path = os.path.join(root, file)
                logger.info(f"Processing document: {file}")
                
                try:
                    document = fitz.open(file_path)
                    
                    for page_num in range(len(document)):
                        page = document.load_page(page_num)
                        raw_text = page.get_text()
                        
                        cleaned_text = clean_text(raw_text)
                        
                        if not cleaned_text:
                            continue
                            
                        # Split page text into chunks
                        page_chunks = text_splitter.split_text(cleaned_text)
                        
                        for idx, chunk_text in enumerate(page_chunks):
                            all_chunks.append({
                                "source": file,
                                "page_number": page_num + 1,
                                "chunk_id": f"{file}_p{page_num+1}_c{idx+1}",
                                "text": chunk_text
                            })
                            
                    document.close()
                except Exception as e:
                    logger.error(f"Error processing {file}: {e}")

    # Save to JSON
    output_target = PROCESSED_DATA_DIR / "chunks.json"
    try:
        with open(output_target, "w", encoding="utf-8") as f:
            json.dump(all_chunks, f, indent=4, ensure_ascii=False)
        logger.info(f"Successfully processed {len(all_chunks)} chunks to {output_target}")
    except Exception as e:
        logger.error(f"Failed to save processed chunks: {e}")

if __name__ == "__main__":
    logger.info("Starting PDF chunking pipeline...")
    process_pdfs()
