import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.core.config import settings
from src.api.routes import router as api_router

# Configure global logger for the server
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG_MODE else logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

def create_app() -> FastAPI:
    """Factory function allocating FastApi core configuration."""
    app = FastAPI(
        title=settings.APP_NAME,
        description="Retrieval-Augmented Generation (RAG) backend utilizing MiniLM Local Embeddings and Cloud LLM handling Indian Startup Compliance.",
        version="1.0.0",
    )

    # Base CORS setup
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"], # For production this restricts allowed external callers.
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Attach endpoint routers
    app.include_router(api_router)

    @app.get("/health", tags=["System"])
    def health_check():
        """Probe verifying service aliveness."""
        return {"status": "healthy", "service": settings.APP_NAME}

    return app

app = create_app()

if __name__ == "__main__":
    import uvicorn
    # Typically booted via CLI command, but supporting native run
    logger.info("Initializing embedded Uvicorn server directly from main...")
    uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=settings.DEBUG_MODE)
