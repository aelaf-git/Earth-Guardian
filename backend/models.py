from sqlmodel import SQLModel, Field, Relationship
from typing import List, Optional
from datetime import datetime

class Snapshot(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    events: List["EventRecord"] = Relationship(back_populates="snapshot")

class EventRecord(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nasa_id: str
    title: str
    category: str
    latitude: float
    longitude: float
    description: Optional[str] = None
    
    snapshot_id: Optional[int] = Field(default=None, foreign_key="snapshot.id")
    snapshot: Optional[Snapshot] = Relationship(back_populates="events")
