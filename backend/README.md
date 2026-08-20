# Community Exchange Network (CEN) — FastAPI Backend API

This repository contains the RESTful FastAPI backend for the **Community Exchange Network (CEN)** platform — a hyper-local skill exchange, shared resource discovery, and community governance application built for residential societies.

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Python 3.10+** (Python 3.10, 3.11, or 3.12 recommended)
- `pip` package manager

---

### Step 1: Clone & Navigate to Backend
```bash
git clone <repository-url>
cd backend
```

---

### Step 2: Set Up Virtual Environment

#### **Windows (Command Prompt / PowerShell):**
```cmd
python -m venv venv
venv\Scripts\activate
```

#### **macOS / Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

---

### Step 3: Install Dependencies

```bash
pip install -r pyproject.toml
```
*Alternatively, install using standard setuptools:*
```bash
pip install fastapi "uvicorn[standard]" sqlalchemy pydantic pydantic-settings pyjwt passlib python-multipart httpx python-dotenv pytest pytest-asyncio
```

---

### Step 4: Configure Environment Variables

Create a local `.env` file by copying the template file:

```bash
# Windows
copy .env.example .env

# macOS / Linux
cp .env.example .env
```

Open `.env` in any text editor and fill in your local values:

```env
PROJECT_NAME="CEN — Community Exchange Network API"
API_V1_STR="/api/v1"
SECRET_KEY="your-secret-key-for-jwt-signing"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Google Gemini API Key for AI features (Chatbot, Auto-tagging, Summarizer, Matching)
GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"

# Local SQLite Database URL
DATABASE_URL="sqlite:///./cen.db"
```

> ⚠️ **Security Notice**: Never commit real secret keys or Gemini API keys to public repositories.

---

## 🤖 Setting Up Google Gemini AI Features

CEN features 6 integrated AI features powered by **Google Gemini LLM** (via `backend/src/ai/`):

1. **Smart AI Assistant / Chatbot (`POST /api/v1/ai/chatbot`)**: Multi-turn RAG assistant using live resident wallet balance, active notices, listings, and society guidelines to provide contextual answers.
2. **Automated Content Auto-Tagging (`POST /api/v1/ai/auto-tag`)**: Extracts searchable category tags from skill and resource descriptions.
3. **Complaint Urgency Classifier (`POST /api/v1/ai/categorize-complaint`)**: Classifies resident complaints and assigns priority levels (`high`, `medium`, `low`).
4. **Noticeboard Summarizer (`POST /api/v1/ai/summarize-notice`)**: Condenses lengthy society announcements into clear, one-sentence summaries.
5. **Natural Language Marketplace Matcher (`POST /api/v1/ai/match-marketplace`)**: Semantic matching connecting free-text resident requests to local skills and tools.
6. **AI Volunteer Candidate Recommender (`GET /api/v1/ai/suggest-volunteers`)**: Analyzes resident 3-step onboarding survey responses to recommend the best candidates for community event rosters.

### 🔑 How to Obtain & Configure your Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/).
2. Sign in with your Google account and click **"Get API key"** (or **"Create API key in new project"**).
3. Copy your API key.
4. Paste it into your `backend/.env` file:
   ```env
   GEMINI_API_KEY="AIzaSy..."
   ```
5. Restart the backend server. The AI services will immediately use live Gemini LLM generation.

> 🛡️ **Built-in Heuristic Fallbacks**: If `GEMINI_API_KEY` is not provided or if the remote Google API is offline, all AI endpoints automatically switch to intelligent local heuristic/rule-based fallbacks. The application and test suite will run seamlessly without crashing.

---

### Step 5: Seed Demo Data (Optional but Recommended)

To seed the local database with pre-populated demo societies, households, users, skills, resources, notices, and disputes:

```bash
python src/seed.py
```

---

### Step 6: Run the FastAPI Server

Start the live backend server using Uvicorn:

```bash
python -m uvicorn src.main:app --host 127.0.0.1 --port 8000 --reload
```

The backend server will start at **`http://127.0.0.1:8000`**.

- **Interactive Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc API Documentation**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- **Health Check Endpoint**: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

---

## 🧪 Running Pytest Automated Tests

To run the complete automated test suite (38 integration & unit tests):

```bash
python run_tests.py
```

Or run via `pytest` directly with verbose output:

```bash
pytest tests/ -v
```

To run with coverage reporting:

```bash
pytest tests/ --cov=src --cov-report=term-missing
```

---

## 🔑 Demo Account Credentials

| Role | Email | Password | Scope |
| :--- | :--- | :--- | :--- |
| **Platform Owner** | `owner@cen.app` | `password123` | Platform setup approvals, cross-society analytics |
| **Society Admin** | `admin@cen.app` | `password123` | Resident onboarding, unit registry, notices broadcast |
| **Coordinator** | `coord@cen.app` | `password123` | Listing moderation, volunteer rosters, dispute audits |
| **Resident** | `resident@cen.app` | `password123` | Skill exchange, resource lending, wallet transfers |

---

## 📁 Directory Structure Overview

```text
backend/
├── pyproject.toml        # Project dependencies and configuration
├── .env.example          # Environment variable template (No secret keys)
├── README.md             # Setup and instruction manual
├── run_tests.py          # Pytest runner helper script
├── src/                  # Core FastAPI Application
│   ├── auth/             # JWT Authentication & Passwords
│   ├── users/            # Resident Profile Management & RBAC
│   ├── societies/        # Society Onboarding & Household Slots
│   ├── wallet/           # Community Credit Banking & Ledger
│   ├── marketplace/      # Skill Exchange & Resource Lending Lifecycles
│   ├── events/           # Community Events & Volunteering
│   ├── complaints/       # Facility Complaints & Audits
│   ├── notices/          # Noticeboard Broadcasts
│   ├── chat/             # Direct Resident Messaging
│   ├── ai/               # Gemini AI Chatbot, Auto-Tagging, Matching, Summarizer
│   ├── disputes/         # Trade Exchange Dispute Moderation
│   ├── analytics/        # Owner & Admin Performance Metrics
│   ├── config.py         # Application settings
│   ├── database.py       # SQLAlchemy engine & session maker
│   └── main.py           # FastAPI application entry point
└── tests/                # Pytest Test Suite (38 test cases across 10 modules)
```
