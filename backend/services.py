import os
import requests
import json
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate

load_dotenv()

# Initialize Gemini 1.5 Flash (Fast and efficient for real-time briefings)
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if not GOOGLE_API_KEY:
    # Minimal fallback or warning could be added here
    pass

llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    google_api_key=GOOGLE_API_KEY,
    temperature=0.2 # Lower temperature for more factual/reliable safety data
)

EONET_URL = "https://eonet.gsfc.nasa.gov/api/v3/events"

def get_eonet_events():
    try:
        # Fetching active events with a 10s timeout
        response = requests.get(EONET_URL, timeout=10)
        response.raise_for_status()
        data = response.json()
        return data.get('events', [])
    except Exception as e:
        print(f"Error fetching EONET data: {e}")
        return []

async def get_eco_briefing(lat, lon, events):
    # Select events within a reasonable range or just top recent ones
    # For now, we'll pass the top 15 events to give Gemini enough context
    context_events = events[:15] 
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", (
            "You are Earth Guardian, an advanced environmental safety AI. "
            "Your persona is calm, highly technical, and urgent when necessary. "
            "Analyze geospatial data and provide actionable safety intelligence."
        )),
        ("user", (
            "User Coordinates: Lat {lat}, Lon {lon}. "
            "NASA EONET Active Events: {events}. "
            "\n\nTask: "
            "1. Identify if any events are within 500km of the user. "
            "2. Provide a 'Status' (Green/Yellow/Red). "
            "3. Give a concise 'Actionable Tip' for the user."
            "Format the response in a clean, punchy way."
        ))
    ])
    
    chain = prompt | llm
    try:
        res = await chain.ainvoke({"lat": lat, "lon": lon, "events": json.dumps(context_events)})
        return res.content
    except Exception as e:
        return f"Briefing system currently offline: {str(e)}"

async def analyze_trends(category):
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a senior climate researcher specializing in planetary patterns."),
        ("user", (
            "Topic: {category} events. "
            "Based on your training data and recent NASA observations, analyze the 20-year trend for this category. "
            "Provide: "
            "1. Frequency delta (%) "
            "2. Severity shifting "
            "3. Critical human impact observation."
        ))
    ])
    
    chain = prompt | llm
    try:
        res = await chain.ainvoke({"category": category})
        return res.content
    except Exception as e:
        return f"Analytics engine error: {str(e)}"

async def check_route_safety(start, end, events):
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a Geospatial Hazards Navigator."),
        ("user", (
            "Route: From {start} to {end}. "
            "Active Hazard Data: {events}. "
            "\n\nTask: Evaluate the path for environmental obstacles (wildfires, floods, etc.). "
            "If a hazard intersects the likely path, mark it as 'BLOCKED' and explain. "
            "Otherwise, mark as 'CLEAR'."
        ))
    ])
    
    chain = prompt | llm
    try:
        res = await chain.ainvoke({"start": start, "end": end, "events": json.dumps(events[:10])})
        return res.content
    except Exception as e:
        return f"Route safety check failed: {str(e)}"