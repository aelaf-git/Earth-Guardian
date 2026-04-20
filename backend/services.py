import requests
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
import os
from dotenv import load_dotenv

load_dotenv()
llm = ChatOpenAI(model="gpt-4o", openai_api_key=os.getenv("OPENAI_API_KEY"))

EONET_URL = "https://eonet.gsfc.nasa.gov/api/v3/events"

def get_eonet_events():
    response = requests.get(EONET_URL).json()
    return response['events']

async def get_eco_briefing(lat, lon, events):
    # Logic to find events within 500km
    relevant_events = events[:5] # Simplified for prototype
    prompt = ChatPromptTemplate.from_template(
        "User is at {lat}, {lon}. Here are nearby natural events: {events}. "
        "Provide a concise, friendly 2-sentence safety briefing."
    )
    chain = prompt | llm
    res = await chain.ainvoke({"lat": lat, "lon": lon, "events": str(relevant_events)})
    return res.content

async def analyze_trends(category):
    # In a real app, you'd fetch 'closed' events from EONET for historical data
    prompt = ChatPromptTemplate.from_template(
        "Analyze the historical significance of {category} events in the last decade. "
        "Provide a 3-point summary of trends."
    )
    chain = prompt | llm
    res = await chain.ainvoke({"category": category})
    return res.content

async def check_route_safety(start, end, events):
    # Simple logic: Is any event between start and end?
    # Real version would use PostGIS or a bounding box
    prompt = ChatPromptTemplate.from_template(
        "A traveler is going from {start} to {end}. Active events: {events}. "
        "Identify if any events block the path and suggest a safety tip."
    )
    chain = prompt | llm
    res = await chain.ainvoke({"start": start, "end": end, "events": str(events[:3])})
    return res.content