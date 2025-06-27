# Smart Summary App 🧠
A simple full-stack app that summarizes text in real-time using LLMs like Gemini Flash. Built for speed, clarity, and easy deployment.

## 🚀 Live Demo
### Frontend
[Coming soon — deployed with Vercel (frontend) + Render (backend)]

### Backend
https://smart-summary-backend.onrender.com/

## ⚙️ How It Works
Here’s a quick look at the setup:

### Tech Stack
- Frontend: Next.js 14 + React + Tailwind CSS
- Backend: FastAPI (Python async)
- LLM: Google Gemini Flash via LangChain
- Deploy: Vercel (frontend) + Render (backend)

### Architecture

Next.js → Streaming
#### ▼ 
FastAPI →  API
#### ▼ 
Gemini Flash →  Text Summary

### Highlights
- Real-time summaries using Server-Sent Events (SSE)
- LangChain handles LLM orchestration and prompt formatting
- Responsive UI styled with Tailwind
- Clean error handling and user feedback
- Production-ready CORS config out of the box

### 🛠️ Getting Started
#### Prerequisites
- Node.js 18+
- Python 3.12+
- Google Gemini API key (free tier works)

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt

# Set your API key
echo "GOOGLE_API_KEY=your_key_here" > .env

# Start the server
uvicorn app.main:app --reload
```

### Frontend Setup
```bash 
cd frontend
npm install
npm run dev
```

### Environment Variables
#### Backend (.env):
```bash
GOOGLE_API_KEY=your_key_here
FRONTEND_URL=https://your-frontend.vercel.app
```
#### Frontend (.env.local):
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 🎯 How to Use
- Open http://localhost:3000
- Paste or type in up to 10,000 characters of text
- Adjust the summary length (slider from 50 to 500 chars)
- Click “Summarize”
- Watch the output stream in real time as the LLM generates it

### 🔌 API Endpoints
- GET / → basic health ping
- GET /health → service status
- POST /summarize → stream summary response
```
{
  "text": "Your long-form content...",
  "max_length": 150
}
```

### 🚀 Deployment
#### Backend on Render
- Connect your repo to Render
- Runtime: Python 3.12
- Build command:
pip install -r requirements.txt
- Start command:
uvicorn app.main:app --host 0.0.0.0 --port $PORT

Env vars:

- GOOGLE_API_KEY
- FRONTEND_URL

#### Frontend on Vercel
- Connect your repo to Vercel
- Framework preset: Next.js
- Build command: npm run build
- Output directory: .next

Env var:

- NEXT_PUBLIC_API_URL=https://your-backend.onrender.com

### 🧠 Tech Choices, Explained
#### Why LangChain?
Makes it easier to switch LLMs, structure prompts, and stream outputs.

#### Why SSE?
Simple, efficient, and gives users instant feedback without the WebSocket overhead.

#### Why FastAPI?
Modern Python async + built-in docs + Pydantic validation = fast and reliable.

#### Why Gemini Flash?
Solid free tier, great integration with LangChain, and fast responses.

#### Why Vercel + Render?
They offer great free plans, auto-scaling, and are super dev-friendly for Python and Next.js apps.

### 🐛 Common Issues
- ModuleNotFoundError: Make sure you're in the correct project folder
- Invalid API key: Double-check your .env file
- CORS issues: Make sure frontend URL is allowed in backend
- No stream: Ensure browser supports Server-Sent Events



## Built with care by Hugo López for the Smart Summary Technical Challenge ✨
