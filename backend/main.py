import sys
import os
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests

# Add current directory to path to allow direct imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services import (
    get_eonet_events, get_eco_briefing, analyze_trends, 
    check_route_safety, get_eonet_categories, sync_nasa_data, 
    get_latest_events_from_db, get_all_snapshots_timeline, get_events_for_snapshot
)
from database import create_db_and_tables
import asyncio

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

async def background_sync():
    """Background task to sync NASA data every 60 seconds."""
    while True:
        try:
            # Offload sync function to a separate thread to avoid blocking the event loop
            await asyncio.to_thread(sync_nasa_data)
        except Exception as e:
            print(f"Error in background sync: {e}")
        await asyncio.sleep(60)

@app.on_event("startup")
async def on_startup():
    create_db_and_tables()
    # Start background task
    asyncio.create_task(background_sync())

@app.get("/api/events")
async def events(category_id: str = Query(None), snapshot_id: int = Query(None)):
    # If snapshot_id is provided, fetch that specific moment
    if snapshot_id:
        return await asyncio.to_thread(get_events_for_snapshot, snapshot_id)
    
    # Otherwise fetch the latest from DB
    events = await asyncio.to_thread(get_latest_events_from_db)
    if not events:
        # This only happens if the database has ZERO snapshots
        print("Database is empty. Performing initial live fetch...")
        return await asyncio.to_thread(get_eonet_events, category_id)
    
    return events

@app.get("/api/timeline")
async def timeline():
    return await asyncio.to_thread(get_all_snapshots_timeline)

@app.get("/api/categories")
async def categories():
    return await asyncio.to_thread(get_eonet_categories)

@app.get("/api/eco-briefing")
async def eco_briefing(lat: float, lon: float):
    events = await asyncio.to_thread(get_latest_events_from_db)
    if not events:
        events = await asyncio.to_thread(get_eonet_events) # Fallback if DB is empty
    return await get_eco_briefing(lat, lon, events)

@app.get("/api/climate-pulse")
async def climate_pulse(category: str):
    # EONET historical query
    return await analyze_trends(category)

@app.post("/api/safe-route")
async def safe_route(data: dict):
    # data contains {start: [lat, lon], end: [lat, lon]}
    events = await asyncio.to_thread(get_latest_events_from_db)
    if not events:
        events = await asyncio.to_thread(get_eonet_events)
    return await check_route_safety(data['start'], data['end'], events)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)