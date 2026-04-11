# LegalAI - Indian Startup Compliance RAG Backend

![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-00a67e.svg)
![Qdrant](https://img.shields.io/badge/Qdrant-Vector%20Database-fd5269.svg)
![HuggingFace](https://img.shields.io/badge/HuggingFace-Sentence%20Transformers-ffcc00.svg)

LegalAI is a Retrieval-Augmented Generation (RAG) backend tailored to assist with **Indian Startup Compliance**. It leverages a FastAPI web server, local MiniLM embeddings (via `sentence-transformers`), Qdrant as a vector database for efficient similarity search, and a cloud Language Model to generate precise, context-aware answers to compliance-related queries based on source PDF documents.

## Features

- **PDF Processing & Chunking:** Extracts text from legal/compliance PDF documents using `PyMuPDF` and intelligently splits them using `langchain-text-splitters`.
- **Local Embeddings generation:** Uses lightweight open-source HuggingFace models (e.g. `all-MiniLM-L6-v2`) locally to compute text embeddings without extra API cost.
- **Vector Database Integration:** Stores and queries vector embeddings in **Qdrant** for lightning-fast semantic search.
- **RAG Architecture:** Fetches the most relevant chunks of context from the document knowledge base to augment the prompt for the Cloud LLM, drastically reducing hallucinations.
- **FastAPI Backend:** Modern, fast (high-performance), web framework for building APIs with Python featuring automated interactive API documentation (Swagger UI).

## Project Structure

```text
├── data/
│   ├── processed/      # Stores chunked JSON output
│   └── raw/            # Place your raw PDF compliance documents here
├── src/
│   ├── api/            # FastAPI routers and endpoints
│   ├── core/           # App configuration and Pydantic settings
│   ├── scripts/        # Data processing scripts (PDF chunking, DB population)
│   │   ├── 01_chunk_pdfs.py
│   │   └── 02_embed_and_upload.py
│   ├── services/       # Core business logic
│   │   ├── embeddings.py    # Generates text embeddings
│   │   ├── llm_service.py   # Cloud LLM integration
│   │   └── qdrant_client.py # Vector DB interactions
│   └── main.py         # FastAPI application factory & entry point
├── requirements.txt    # Python dependencies
└── README.md
```

## Setup & Installation

**1. Clone the repository and navigate into it**
```bash
git clone https://github.com/Sahil-2005/LegalAI.git
cd LegalAI
```

**2. Create and activate a Virtual Environment**
```bash
python -m venv myenv

# Windows
myenv\Scripts\activate

# Linux/Mac
source myenv/bin/activate
```

**3. Install Dependencies**
```bash
pip install -r requirements.txt
```

**4. Environment Variables**
Create a `.env` file in the root directory and add your necessary configuration. (e.g. Qdrant URL/API Key, LLM API Key, etc.)

## Usage Pipeline

### 1. Data Preparation
Place your compliance `.pdf` files into the `data/raw/` folder, then run the chunking script:
```bash
python -m src.scripts.01_chunk_pdfs
```
This will parse the PDFs and output chunks into `data/processed/chunks.json`.

### 2. Embed and Upload to Qdrant
Next, convert those text chunks into vector embeddings and upload them to your configured Qdrant cluster:
```bash
python -m src.scripts.02_embed_and_upload
```

### 3. Start the API Server
Start the FastAPI server:
```bash
uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```
Once running, you can visit the interactive API documentation at: [http://localhost:8000/docs](http://localhost:8000/docs).

## Author 👨‍💻

**Sahil Gawade**

You can reach out or check out my work through the following platforms:

<p align="left">
  <a href="https://github.com/Sahil-2005" target="_blank">
    <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" />
  </a>
  <a href="https://www.linkedin.com/in/sahil-gawade-920a0a242/" target="_blank">
    <img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn" />
  </a>
  <a href="mailto:gawadesahil.dev@gmail.com" target="_blank">
    <img src="https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white" alt="Gmail" />
  </a>
  <a href="https://leetcode.com/u/sahilgawade4321/" target="_blank">
    <img src="https://img.shields.io/badge/LeetCode-FFA116?style=for-the-badge&logo=leetcode&logoColor=white" alt="LeetCode" />
  </a>
  <a href="https://sahil-gawade.vercel.app/" target="_blank">
    <img src="https://img.shields.io/badge/Portfolio-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Portfolio" />
  </a>
</p>

---
*If you find this project interesting, feel free to give it a ⭐ on GitHub!*
