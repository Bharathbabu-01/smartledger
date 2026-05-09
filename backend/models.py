from sqlalchemy import Column, Integer, String, Float, DateTime
from database import Base
from datetime import datetime

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    rule_category = Column(String)
    ai_category = Column(String)
    confidence = Column(Float)
    reasoning = Column(String)
    created_at = Column(DateTime, default=datetime.now)
