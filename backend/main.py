from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
import uvicorn
import requests
from uuid import uuid4


app = FastAPI(title="Weather Data System", version="1.0.0")

#WEATHERSTACK_API_KEY = "7acb248061875325a6c2726a1c8783f6"
WEATHERSTACK_BASE_URL = "http://api.weatherstack.com/current"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for weather data
weather_storage: Dict[str, Dict[str, Any]] = {}

class WeatherRequest(BaseModel):
    date: str
    location: str
    notes: Optional[str] = ""

class WeatherResponse(BaseModel):
    id: str

@app.post("/weather", response_model=WeatherResponse)
async def create_weather_request(request: WeatherRequest):
    params = {
        "access_key": "7acb248061875325a6c2726a1c8783f6",
        "query": request.location,
    }
    response = requests.get(WEATHERSTACK_BASE_URL, params=params)
    weather_data = response.json()
    print(weather_data)

    if "error" in weather_data:
        raise HTTPException(status_code=400, detail="Error fetching weather data")
    
    weather_id = str(uuid4())
    weather_storage[weather_id] = {
        "id": weather_id,
        "date": request.date,
        "location": request.location,
        "notes": request.notes,
        "current": {
            "observation_time": weather_data["current"]["observation_time"],
            "temperature": weather_data["current"]["temperature"],
            "weather_descriptions": weather_data["current"]["weather_descriptions"],
            "humidity": weather_data["current"]["humidity"],
            "wind_speed": weather_data["current"]["wind_speed"],
        },
    }

    return {"id": weather_id}

@app.get("/weather/{weather_id}")
async def get_weather_data(weather_id: str):
    """
    Retrieve stored weather data by ID.
    This endpoint is already implemented for the assessment.
    """
    if weather_id not in weather_storage:
        raise HTTPException(status_code=404, detail="Weather data not found")
    
    return weather_storage[weather_id]


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)