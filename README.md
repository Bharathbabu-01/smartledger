# SmartLedger

AI-powered transaction categorizer that compares OpenAI GPT categorization against rule-based logic. Built with FastAPI, PostgreSQL, and React.

## What it does

- Takes a transaction description and amount as input
- OpenAI GPT-3.5 categorizes it into: Food & Dining, Transport, Shopping, Utilities, Entertainment, Healthcare, Travel, Education, or Other
- A rule-based keyword engine categorizes the same transaction
- Dashboard shows agreement rate, confidence scores, spending breakdown donut chart, and AI vs rule-based comparison bar chart

## Setup

### 1. Clone and create database

```bash
git clone <your-repo-url>
cd smartledger
psql -U postgres -c "CREATE DATABASE smartledger;"
```

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Open `.env` and add your OpenAI API key:
```
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://postgres:password@localhost:5432/smartledger
```

Run the backend:
```bash
uvicorn main:app --reload
```

Backend runs at http://localhost:8000

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at http://localhost:5173

## Tech Stack

- **Backend:** FastAPI, SQLAlchemy, PostgreSQL
- **AI:** OpenAI GPT-3.5-turbo
- **Frontend:** React, Recharts, Vite
- **Infra:** Docker Compose, GitHub Actions CI/CD
