import os
import json
import logging
import re
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

CHUNK_SIZE = 1500
CHUNK_OVERLAP = 200

def clean_text(text: str) -> str:
    """Clean extracted text from PDFs removing extra whitespaces, newlines, and gibberish."""
    # Remove non-ASCII characters (resolves gibberish font rendering issues)
    text = re.sub(r'[^\x00-\x7F]+', ' ', text)
    # Remove unprintable control characters
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', text)
    # Remove excessive repeating punctuation / gibberish lines
    text = re.sub(r'([^\w\s])\1{4,}', r'\1', text)
    # Replace newlines used for wrapping with spaces
    text = text.replace("\n", " ")
    # Shrink multiple spaces into a single space
    text = " ".join(text.split())
    return text.strip()

def load_references() -> dict:
    """Load URLs mapped to filenames from docs-references.json"""
    refs = {}
    ref_file = RAW_DATA_DIR / "docs-references.json"
    if not ref_file.exists():
        return refs
    try:
        with open(ref_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
            # Flatten the nested dictionary to {filename: url}
            def flatten_dict(d):
                for k, v in d.items():
                    if isinstance(v, dict):
                        flatten_dict(v)
                    elif isinstance(v, str):
                        refs[k] = v
                        
            flatten_dict(data)
    except Exception as e:
        logger.error(f"Failed to read docs-references.json: {e}")
    return refs

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
    
    references = load_references()

    # Iterate through folders inside RAW_DATA_DIR
    for folder_name in os.listdir(RAW_DATA_DIR):
        folder_path = RAW_DATA_DIR / folder_name
        if not folder_path.is_dir():
            continue
            
        logger.info(f"Processing folder: {folder_name}")
        all_chunks = []
        
        # Iterate through PDFs in this folder
        for root, _, files in os.walk(folder_path):
            for file in files:
                if file.lower().endswith(".pdf"):
                    file_path = os.path.join(root, file)
                    logger.info(f"Processing document: {file} in folder: {folder_name}")
                    
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
                                    "folder": folder_name,
                                    "ref": references.get(file, ""),
                                    "page_number": page_num + 1,
                                    "chunk_id": f"{folder_name}_{file}_p{page_num+1}_c{idx+1}",
                                    "text": chunk_text
                                })
                                
                        document.close()
                    except Exception as e:
                        logger.error(f"Error processing {file}: {e}")

        # Save to JSON for this folder
        if all_chunks:
            output_target = PROCESSED_DATA_DIR / f"{folder_name}_chunks.json"
            try:
                with open(output_target, "w", encoding="utf-8") as f:
                    json.dump(all_chunks, f, indent=4, ensure_ascii=False)
                logger.info(f"Successfully processed {len(all_chunks)} chunks for {folder_name} to {output_target}")
            except Exception as e:
                logger.error(f"Failed to save processed chunks for {folder_name}: {e}")

if __name__ == "__main__":
    logger.info("Starting PDF chunking pipeline...")
    process_pdfs()
