from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database import get_db, create_tables
from models import Transaction
from openai import OpenAI
import os
import json
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="SmartLedger API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

CATEGORIES = [
    "Food & Dining", "Transport", "Shopping", "Utilities",
    "Entertainment", "Healthcare", "Travel", "Education", "Other"
]

RULES = {
    "Food & Dining": ["restaurant", "cafe", "coffee", "mcdonald", "starbucks", "pizza",
                      "food", "dining", "burger", "sushi", "chipotle", "doordash", "grubhub"],
    "Transport": ["uber", "lyft", "gas", "fuel", "parking", "transit", "metro", "taxi", "shell", "chevron"],
    "Shopping": ["amazon", "amzn", "walmart", "target", "store", "shop", "costco", "ebay"],
    "Utilities": ["electric", "water", "internet", "phone", "at&t", "verizon", "t-mobile", "comcast", "xfinity"],
    "Entertainment": ["netflix", "spotify", "hulu", "disney", "movie", "game", "theater", "ticketmaster"],
    "Healthcare": ["pharmacy", "hospital", "clinic", "doctor", "cvs", "walgreens", "rite aid"],
    "Travel": ["hotel", "airbnb", "airline", "flight", "delta", "united", "southwest", "marriott"],
    "Education": ["tuition", "coursera", "udemy", "book", "textbook", "university"],
}

def rule_categorize(description: str) -> str:
    desc = description.lower()
    for category, keywords in RULES.items():
        for keyword in keywords:
            if keyword in desc:
                return category
    return "Other"

def ai_categorize(description: str, amount: float) -> dict:
    categories_list = ", ".join(CATEGORIES)
    prompt = f"""You are a financial transaction categorizer for a personal finance app.

Transaction: "{description}"
Amount: ${amount:.2f}

Categorize this into exactly one of: {categories_list}

Return only valid JSON, no markdown, no extra text:
{{"category": "category name", "confidence": 0.95, "reasoning": "one sentence reason"}}"""

    response = client.chat.completions.create(
        model="gpt-4.1-nano",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
        max_tokens=150
    )

    text = response.choices[0].message.content.strip()
    result = json.loads(text)

    if result["category"] not in CATEGORIES:
        result["category"] = "Other"

    return result


class TransactionInput(BaseModel):
    description: str
    amount: float


@app.on_event("startup")
def startup():
    create_tables()


@app.get("/")
def root():
    return {"message": "SmartLedger API is running"}


@app.post("/transactions")
def create_transaction(data: TransactionInput):
    if not data.description.strip():
        raise HTTPException(status_code=400, detail="Description cannot be empty")
    if data.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")

    rule_cat = rule_categorize(data.description)

    try:
        ai_result = ai_categorize(data.description, data.amount)
    except Exception:
        ai_result = {"category": rule_cat, "confidence": 0.5, "reasoning": "AI unavailable, using rule-based fallback"}

    db = get_db()
    tx = Transaction(
        description=data.description,
        amount=data.amount,
        rule_category=rule_cat,
        ai_category=ai_result["category"],
        confidence=ai_result["confidence"],
        reasoning=ai_result["reasoning"],
        created_at=datetime.now()
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)

    result = {
        "id": tx.id,
        "description": tx.description,
        "amount": tx.amount,
        "rule_category": tx.rule_category,
        "ai_category": tx.ai_category,
        "confidence": tx.confidence,
        "reasoning": tx.reasoning,
        "created_at": tx.created_at.isoformat()
    }
    db.close()
    return result


@app.get("/transactions")
def get_transactions():
    db = get_db()
    txs = db.query(Transaction).order_by(Transaction.created_at.desc()).limit(50).all()
    result = [
        {
            "id": t.id,
            "description": t.description,
            "amount": t.amount,
            "rule_category": t.rule_category,
            "ai_category": t.ai_category,
            "confidence": t.confidence,
            "reasoning": t.reasoning,
            "created_at": t.created_at.isoformat()
        }
        for t in txs
    ]
    db.close()
    return result


@app.get("/stats")
def get_stats():
    db = get_db()
    txs = db.query(Transaction).all()
    db.close()

    if not txs:
        return {
            "total_transactions": 0,
            "total_spend": 0,
            "ai_by_category": [],
            "rule_by_category": [],
            "agreement_rate": 0,
            "avg_confidence": 0
        }

    ai_spend = {}
    rule_spend = {}
    matches = 0

    for t in txs:
        ai_spend[t.ai_category] = round(ai_spend.get(t.ai_category, 0) + t.amount, 2)
        rule_spend[t.rule_category] = round(rule_spend.get(t.rule_category, 0) + t.amount, 2)
        if t.ai_category == t.rule_category:
            matches += 1

    return {
        "total_transactions": len(txs),
        "total_spend": round(sum(t.amount for t in txs), 2),
        "ai_by_category": [{"category": k, "amount": v} for k, v in ai_spend.items()],
        "rule_by_category": [{"category": k, "amount": v} for k, v in rule_spend.items()],
        "agreement_rate": round(matches / len(txs) * 100, 1),
        "avg_confidence": round(sum(t.confidence for t in txs) / len(txs) * 100, 1)
    }


@app.delete("/transactions/{tx_id}")
def delete_transaction(tx_id: int):
    db = get_db()
    tx = db.query(Transaction).filter(Transaction.id == tx_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    db.delete(tx)
    db.commit()
    db.close()
    return {"message": "Deleted"}
