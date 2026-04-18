# AMIVRE Legal - AI Compliance Assistant for Indian Startups

![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-00a67e.svg)
![Qdrant](https://img.shields.io/badge/Qdrant-Vector%20Database-fd5269.svg)
![React](https://img.shields.io/badge/React-18.2.0-61dafb.svg)
![Vite](https://img.shields.io/badge/Vite-5.0-646cff.svg)
![Framer Motion](https://img.shields.io/badge/Framer%20Motion-Premium%20Animations-ff0055.svg)

AMIVRE Legal is a premium, full-stack Retrieval-Augmented Generation (RAG) platform tailored to assist with **Indian Startup Compliance**. 

It combines a blazing-fast FastAPI vector-search backend with a "billion-dollar SaaS" tier React frontend. It leverages local MiniLM embeddings, Qdrant for semantic search, and the Gemini 2.5 Flash LLM to generate precise, context-aware legal reports based on real compliance documents (Companies Act, DPDP, IT Act, etc.).

## ✨ Key Features

### 🎨 Premium Frontend (Tier-1 SaaS UX)
- **Glassmorphic Design:** Sleek dark-mode interface with frosted glass components, dynamic gradients, and premium typography (Inter & JetBrains Mono).
- **Advanced Animations:** Powered by Framer Motion and Lenis for buttery-smooth scrolling, scroll-triggered reveal animations, and seamless page transitions.
- **Dynamic AI Loader:** A terminal-styled "thinking" window that streams actual retrieved legal documents in real-time while the AI processes the compliance report.
- **Interactive Reports:** Generates structured compliance dashboards with risk gauges, step-by-step action plans, and clickable URL citations.
- **Export Capabilities:** One-click download of fully styled, standalone HTML compliance reports.

### 🧠 Powerful RAG Backend
- **Hierarchical Document Processing:** Intelligently chunks PDFs while maintaining legal structure (Chapters, Sections) and injects source URLs.
- **Local Embeddings:** Uses `all-MiniLM-L6-v2` locally to compute text embeddings natively, ensuring data privacy and zero embedding API costs.
- **Vector Database Integration:** Stores and queries vector embeddings in **Qdrant** for lightning-fast, highly contextual semantic search.
- **Hallucination Prevention:** Prompts the Gemini LLM strictly with retrieved context, enforcing accurate legal citations and adherence to Indian law.

## 🏗️ Project Structure

```text
├── client/                 # React + Vite Frontend
│   ├── public/
│   ├── src/
│   │   ├── api/            # Axios API client
│   │   ├── components/     # UI Components (Navbar, Hero, AILoader, etc.)
│   │   ├── pages/          # Route pages (Home, GetStarted)
│   │   ├── App.jsx         # Routing and global layout
│   │   └── App.css         # Core Design System (CSS Variables)
│   └── package.json
│
├── data/
│   ├── processed/          # Stores chunked JSON output
│   └── raw/                # Place your raw PDF compliance documents here
│
├── src/                    # FastAPI Backend
│   ├── api/                # FastAPI routers and endpoints
│   ├── core/               # App configuration and settings
│   ├── scripts/            # Data processing scripts
│   │   ├── 01_chunk_pdfs.py
│   │   └── 02_embed_and_upload.py
│   ├── services/           # Business logic (Embeddings, LLM, Qdrant)
│   └── main.py             # FastAPI entry point
│
├── requirements.txt        # Python dependencies
└── README.md
```

## 🚀 Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/Sahil-2005/LegalAI.git
cd LegalAI
```

### 2. Backend Setup
Create a virtual environment and install Python dependencies:
```bash
python -m venv myenv

# Windows
myenv\Scripts\activate
# Linux/Mac
source myenv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in the root directory:
```env
QDRANT_URL=your_qdrant_url
QDRANT_API_KEY=your_qdrant_key
EMBEDDING_MODEL=all-MiniLM-L6-v2
GEMINI_API_KEY=your_gemini_key
GROK_API_KEY=your_grok_key
```

### 3. Frontend Setup
Open a new terminal, navigate to the client folder, and install NPM packages:
```bash
cd client
npm install
```

## ⚙️ Usage Pipeline

### 1. Data Preparation & Upload
Process the raw PDF compliance files and upload vectors to Qdrant:
```bash
# Parse PDFs into JSON chunks
python -m src.scripts.01_chunk_pdfs

# Embed chunks and push to Vector DB
python -m src.scripts.02_embed_and_upload
```

### 2. Run the Application
You need to run both the backend server and the frontend client simultaneously.

**Terminal 1 (Backend):**
```bash
# From the root LegalAI directory
uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 (Frontend):**
```bash
# From the /client directory
npm run dev
```

Visit the application at `http://localhost:5173`.

## 👨‍💻 Author

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
