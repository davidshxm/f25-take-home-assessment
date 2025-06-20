"use client";
import { WeatherForm } from "@/components/weather-form";
import { useState } from "react";

export default function Home() {

  const [lookupId, setLookupId] = useState("");
  const [lookupResult, setLookupResult] = useState<any | null>(null);
  const [lookupError, setLookupError] = useState("");

  const fetchWeatherById = async (weatherId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/weather/${weatherId}`);

      if (!response.ok) {
        // If backend returns 404 or error
        throw new Error("Weather data not found or error occurred");
      }
      const data = await response.json();
      console.log("Fetched data:", data);
      return data;
    } catch (error) {
      console.error("Error fetching weather data:", error);
      throw error;  // or handle error gracefully in UI
    }
  };

  const handleLookup = async () => {
    if (!lookupId.trim()) {
      setLookupError("Please enter a weather ID.");
      setLookupResult(null);
      return;
    }

    setLookupError("");
    setLookupResult(null);

    try {
      const data = await fetchWeatherById(lookupId);
      setLookupResult(data);
    } catch (err: any) {
      setLookupError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Weather System
          </h1>
          <p className="text-muted-foreground text-lg">
            Submit weather requests and retrieve stored results
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Weather Form Section */}
          <div className="flex flex-col items-center justify-start">
            <h2 className="text-2xl font-semibold mb-4">
              Submit Weather Request
            </h2>
            <WeatherForm />
          </div>

          {/* Data Lookup Section Placeholder */}
          <div className="flex flex-col items-center justify-start w-full max-w-md">
            <h2 className="text-2xl font-semibold mb-4">Lookup Weather Data</h2>
            <input
              type="text"
              placeholder="Enter Weather ID"
              value={lookupId}
              onChange={(e) => setLookupId(e.target.value)}
              className="w-full p-2 mb-4 border rounded-md"
            />
            <button
              onClick={handleLookup}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
              Fetch Weather
            </button>

            {lookupError && (
              <p className="text-red-500 mt-4 text-sm">{lookupError}</p>
            )}

            {lookupResult && (
            <div className="mt-6 bg-white p-4 rounded shadow overflow-auto max-h-96 w-full text-black">
              <h3 className="text-lg font-semibold mb-2">Weather Data</h3>
              <p><strong>Date:</strong> {lookupResult.date}</p>
              <p><strong>Location:</strong> {lookupResult.location}</p>
              <p><strong>Notes:</strong> {lookupResult.notes || "No notes"}</p>

              {lookupResult.weather_data?.current && (
                <div className="mt-4">
                  <p><strong>Temperature:</strong> {lookupResult.weather_data.current.temperature} °C</p>
                  <p><strong>Observation Time:</strong> {lookupResult.weather_data.current.observation_time}</p>
                  <p><strong>Weather Description:</strong> {lookupResult.weather_data.current.weather_descriptions?.[0]}</p>
                  <p><strong>Humidity:</strong> {lookupResult.weather_data.current.humidity} %</p>
                </div>
              )}
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
