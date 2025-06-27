from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from .services.llm_service import LLMService

load_dotenv()

app = FastAPI(
    title="Smart Summary API",
    description="API for generating AI-powered text summaries with streaming",
    version="1.0.0"
)

allowed_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
]

# Add production URLs from environment variables
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url)

# Add common Vercel patterns
vercel_url = os.getenv("VERCEL_URL")
if vercel_url:
    allowed_origins.extend([
        f"https://{vercel_url}",
        f"https://{vercel_url}.vercel.app"
    ])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

llm_service = LLMService()

class TextRequest(BaseModel):
    text: str
    max_length: int = 150

@app.get("/")
async def root():
    return {"message": "Smart Summary API is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "smart-summary-api"}

@app.post("/summarize")
async def summarize_text(request: TextRequest):
    """
    Generate a summary of the provided text using streaming response.
    """
    try:
        if not request.text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        
        if len(request.text) > 10000:
            raise HTTPException(status_code=400, detail="Text too long (max 10,000 characters)")
        
        async def generate_summary():
            async for chunk in llm_service.generate_summary(request.text, request.max_length):
                yield f"data: {chunk}\n\n"
        
        return StreamingResponse(
            generate_summary(),
            media_type="text/plain",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating summary: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port) 