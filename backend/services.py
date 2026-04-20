import os
import requests
import json
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate

load_dotenv()

# Initialize Gemini 1.5 Flash (Still available for briefing/analysis features)
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
NASA_API_KEY = os.getenv("NASA_API_KEY")

llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    google_api_key=GOOGLE_API_KEY,
    temperature=0.2
)

# NASA EONET v2.1 Endpoints
EONET_BASE_URL = "https://eonet.gsfc.nasa.gov/api/v2.1"

def get_eonet_events(category_id=None):
    try:
        # v2.1 endpoint for events
        url = f"{EONET_BASE_URL}/categories/{category_id}" if category_id else f"{EONET_BASE_URL}/events"
        params = {}
        if NASA_API_KEY:
            params['api_key'] = NASA_API_KEY
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        # Return the list of events from the v2.1 response
        return data.get('events', [])
    except Exception as e:
        print(f"Error fetching EONET v2.1 data: {e}")
        return []

def get_eonet_categories():
    try:
        url = f"{EONET_BASE_URL}/categories"
        params = {}
        if NASA_API_KEY:
            params['api_key'] = NASA_API_KEY
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        return response.json().get('categories', [])
    except Exception as e:
        print(f"Error fetching EONET Categories: {e}")
        return []

async def get_eco_briefing(lat, lon, events):
    # Context filtered for Gemini
    context_events = events[:15] 
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", (
            "You are Earth Guardian, an advanced environmental safety AI. "
            "Analyze geospatial data from NASA EONET v2.1 and provide actionable safety intelligence."
        )),
        ("user", (
            "Coordinates: Lat {lat}, Lon {lon}. "
            "NASA EONET v2.1 Active Events: {events}. "
            "\n\nTask: Provide a concise status and one safety tip."
        ))
    ])
    
    chain = prompt | llm
    try:
        res = await chain.ainvoke({"lat": lat, "lon": lon, "events": json.dumps(context_events)})
        return res.content
    except Exception as e:
        return f"Briefing system currently offline: {str(e)}"

# We can add more v2.1 specific functions here (Categories, Layers, etc.) if needed.