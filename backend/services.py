import os
import requests
import json
import time
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()

# Initialize Gemini 1.5 Flash (Still available for briefing/analysis features)
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
NASA_API_KEY = os.getenv("NASA_API_KEY")

llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    google_api_key=GOOGLE_API_KEY,
    temperature=0.2
)

# NASA EONET v3 Endpoints
EONET_BASE_URL = "https://eonet.gsfc.nasa.gov/api/v3"

# Simple In-Memory Cache
_cache = {
    "events": {"data": None, "timestamp": 0},
    "categories": {"data": None, "timestamp": 0},
    "category_events": {} 
}
CACHE_TTL = 60 # Seconds

def get_eonet_events(category_id=None, retries=3):
    now = time.time()
    
    # Check Cache
    if not category_id:
        if _cache["events"]["data"] and (now - _cache["events"]["timestamp"] < CACHE_TTL):
            print("Returning events from cache")
            return _cache["events"]["data"]
    elif category_id in _cache["category_events"]:
        cache_entry = _cache["category_events"][category_id]
        if now - cache_entry["timestamp"] < CACHE_TTL:
            print(f"Returning events for category {category_id} from cache")
            return cache_entry["data"]

    url = f"{EONET_BASE_URL}/events"
    params = {"status": "open"} 
    if category_id:
        params['category'] = category_id
    if NASA_API_KEY:
        params['api_key'] = NASA_API_KEY
        
    for attempt in range(retries):
        try:
            print(f"Fetching events from: {url} (Attempt {attempt + 1})")
            response = requests.get(url, params=params, timeout=12)
            response.raise_for_status()
            data = response.json()
            
            # Check for NASA throttling/high demand message
            if "message" in data and "high demand" in data["message"].lower():
                retry_after = data.get("retry_after", 2 ** attempt)
                print(f"NASA API Throttled: {data['message']}. Waiting {retry_after}s...")
                if attempt < retries - 1:
                    time.sleep(retry_after) 
                    continue
            
            events = data.get('events', [])
            print(f"Successfully fetched {len(events)} events")
            
            # Update Cache only if we got data
            if events:
                if not category_id:
                    _cache["events"] = {"data": events, "timestamp": time.time()}
                else:
                    _cache["category_events"][category_id] = {"data": events, "timestamp": time.time()}
                
            return events
        except Exception as e:
            print(f"Error fetching EONET v3 data on attempt {attempt + 1}: {e}")
            if attempt < retries - 1:
                time.sleep(2)
            else:
                return []
    return []

def get_eonet_categories(retries=3):
    now = time.time()
    if _cache["categories"]["data"] and (now - _cache["categories"]["timestamp"] < CACHE_TTL):
        print("Returning categories from cache")
        return _cache["categories"]["data"]

    url = f"{EONET_BASE_URL}/categories"
    params = {}
    if NASA_API_KEY:
        params['api_key'] = NASA_API_KEY
        
    for attempt in range(retries):
        try:
            print(f"Fetching categories from: {url} (Attempt {attempt + 1})")
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            if "message" in data and "high demand" in data["message"].lower():
                retry_after = data.get("retry_after", 2)
                print(f"NASA API Throttled (Categories). Waiting {retry_after}s...")
                if attempt < retries - 1:
                    time.sleep(retry_after)
                    continue
            
            categories = data.get('categories', [])
            print(f"Successfully fetched {len(categories)} categories")
            
            # Update Cache only if we got data
            if categories:
                _cache["categories"] = {"data": categories, "timestamp": time.time()}
            return categories
        except Exception as e:
            print(f"Error fetching EONET Categories on attempt {attempt + 1}: {e}")
            if attempt < retries - 1:
                time.sleep(2)
            else:
                return []
    return []

async def get_eco_briefing(lat, lon, events):
    # Context filtered for Gemini
    context_events = events[:15] 
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", (
            "You are Earth Guardian, an advanced environmental safety AI. "
            "Analyze geospatial data from NASA EONET v3 and provide actionable safety intelligence."
        )),
        ("user", (
            "Coordinates: Lat {lat}, Lon {lon}. "
            "NASA EONET v3 Active Events: {events}. "
            "\n\nTask: Provide a concise status and one safety tip."
        ))
    ])
    
    chain = prompt | llm
    try:
        res = await chain.ainvoke({"lat": lat, "lon": lon, "events": json.dumps(context_events)})
        return res.content
    except Exception as e:
        return f"Briefing system currently offline: {str(e)}"

async def analyze_trends(category):
    # Historical analysis placeholder
    events = get_eonet_events(category)
    if not events:
        return f"No recent trend data available for {category}."
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a climate data scientist. Analyze the recent frequency of these events."),
        ("user", "Analyze these {category} events: {events}")
    ])
    chain = prompt | llm
    try:
        res = await chain.ainvoke({"category": category, "events": json.dumps(events[:10])})
        return res.content
    except Exception as e:
        return f"Trend analysis node offline: {str(e)}"

async def check_route_safety(start, end, events):
    # Safety evaluation placeholder
    # In a real app, this would check event proximity to the line between start and end
    active_threats = events[:5]
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a geospatial safety expert."),
        ("user", "Evaluate route from {start} to {end} against these active events: {events}")
    ])
    chain = prompt | llm
    try:
        res = await chain.ainvoke({
            "start": start, 
            "end": end, 
            "events": json.dumps(active_threats)
        })
        return res.content
    except Exception as e:
        return f"Safety system recalibrating: {str(e)}"