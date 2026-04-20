import sys
import os
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests

# Add current directory to path to allow direct imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services import get_eonet_events, get_eco_briefing, analyze_trends, check_route_safety

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/events")
async def events():
    return get_eonet_events()

@app.get("/api/eco-briefing")
async def eco_briefing(lat: float, lon: float):
    events = get_eonet_events()
    return await get_eco_briefing(lat, lon, events)

@app.get("/api/climate-pulse")
async def climate_pulse(category: str):
    # EONET historical query
    return await analyze_trends(category)

@app.post("/api/safe-route")
async def safe_route(data: dict):
    # data contains {start: [lat, lon], end: [lat, lon]}
    events = get_eonet_events()
    return await check_route_safety(data['start'], data['end'], events)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)