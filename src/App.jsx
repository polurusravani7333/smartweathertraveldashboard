import { useState } from "react";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchWeather = async () => {
    if (!city.trim()) {
      setError("Please enter a city name");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Find city coordinates
      const locationResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          city
        )}&count=1&language=en&format=json`
      );

      const locationData = await locationResponse.json();

      if (!locationData.results) {
        throw new Error("City not found");
      }

      const location = locationData.results[0];

      // Get weather
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=5`
      );

      const weatherData = await weatherResponse.json();

      setWeather({
        city: location.name,
        country: location.country,
        temperature: weatherData.current.temperature_2m,
        humidity: weatherData.current.relative_humidity_2m,
        feelsLike: weatherData.current.apparent_temperature,
        wind: weatherData.current.wind_speed_10m,
        code: weatherData.current.weather_code,
        dates: weatherData.daily.time,
        maxTemp: weatherData.daily.temperature_2m_max,
        minTemp: weatherData.daily.temperature_2m_min,
        dailyCodes: weatherData.daily.weather_code,
      });
    } catch (err) {
      setError("Unable to find weather data. Please try another city.");
      setWeather(null);
    }

    setLoading(false);
  };

  const getWeatherIcon = (code) => {
    if (code === 0) return "☀️";
    if (code <= 3) return "⛅";
    if (code <= 48) return "🌫️";
    if (code <= 67) return "🌧️";
    if (code <= 77) return "❄️";
    if (code <= 82) return "🌦️";
    return "⛈️";
  };

  const getWeatherText = (code) => {
    if (code === 0) return "Clear Sky";
    if (code <= 3) return "Partly Cloudy";
    if (code <= 48) return "Foggy";
    if (code <= 67) return "Rainy";
    if (code <= 77) return "Snowy";
    if (code <= 82) return "Rain Showers";
    return "Thunderstorm";
  };

  return (
    <div className="bg-light min-vh-100">

      {/* Navbar */}
      <nav className="navbar navbar-dark bg-primary">
        <div className="container">
          <span className="navbar-brand fw-bold">
            🌤️ Smart Weather Travel Dashboard
          </span>
        </div>
      </nav>

      <div className="container py-5">

        {/* Heading */}
        <div className="text-center mb-4">
          <h1 className="fw-bold">
            Smart Weather Travel Dashboard
          </h1>

          <p className="text-muted">
            Check real-time weather before planning your journey
          </p>
        </div>

        {/* Search */}
        <div className="row justify-content-center mb-4">
          <div className="col-md-8">

            <div className="input-group">

              <input
                type="text"
                className="form-control"
                placeholder="Enter city name"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    searchWeather();
                  }
                }}
              />

              <button
                className="btn btn-primary"
                onClick={searchWeather}
              >
                Search
              </button>

            </div>

          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center">
            <div className="spinner-border text-primary"></div>
            <p className="mt-2">Loading weather...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="alert alert-danger text-center">
            {error}
          </div>
        )}

        {/* Weather */}
        {weather && !loading && (
          <>
            <div className="row justify-content-center">

              <div className="col-md-8">

                <div className="card shadow border-0">

                  <div className="card-body text-center p-5">

                    <h2 className="fw-bold">
                      📍 {weather.city}, {weather.country}
                    </h2>

                    <div className="display-1 my-3">
                      {getWeatherIcon(weather.code)}
                    </div>

                    <h1 className="display-3 fw-bold">
                      {Math.round(weather.temperature)}°C
                    </h1>

                    <h4 className="text-primary">
                      {getWeatherText(weather.code)}
                    </h4>

                    <div className="row mt-4">

                      <div className="col-4">
                        <h3>💧</h3>
                        <p className="mb-1">Humidity</p>
                        <strong>{weather.humidity}%</strong>
                      </div>

                      <div className="col-4">
                        <h3>💨</h3>
                        <p className="mb-1">Wind</p>
                        <strong>{weather.wind} km/h</strong>
                      </div>

                      <div className="col-4">
                        <h3>🌡️</h3>
                        <p className="mb-1">Feels Like</p>
                        <strong>{Math.round(weather.feelsLike)}°C</strong>
                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* Travel Recommendation */}
            <div className="row mt-4">

              <div className="col-md-6 mb-3">

                <div className="card shadow-sm border-0 h-100">

                  <div className="card-body">

                    <h4>✈️ Travel Recommendation</h4>

                    <p>
                      {weather.code <= 3
                        ? "The weather looks suitable for sightseeing and outdoor activities."
                        : "Consider checking the weather conditions before planning outdoor activities."}
                    </p>

                    <span
                      className={`badge ${
                        weather.code <= 3
                          ? "bg-success"
                          : "bg-warning text-dark"
                      }`}
                    >
                      {weather.code <= 3
                        ? "Good for Travel"
                        : "Check Weather"}
                    </span>

                  </div>

                </div>

              </div>

              <div className="col-md-6 mb-3">

                <div className="card shadow-sm border-0 h-100">

                  <div className="card-body">

                    <h4>🎒 Travel Tips</h4>

                    <ul>
                      <li>Check the forecast before travelling</li>
                      <li>Carry water and stay hydrated</li>
                      <li>Carry an umbrella during rainy weather</li>
                      <li>Choose suitable clothing for the weather</li>
                    </ul>

                  </div>

                </div>

              </div>

            </div>

            {/* 5 Day Forecast */}
            <div className="mt-4">

              <h3 className="fw-bold mb-3">
                📅 5-Day Forecast
              </h3>

              <div className="row">

                {weather.dates.map((date, index) => (

                  <div className="col-md" key={date}>

                    <div className="card shadow-sm border-0 mb-3">

                      <div className="card-body text-center">

                        <h6>
                          {new Date(date).toLocaleDateString(
                            "en-US",
                            { weekday: "short" }
                          )}
                        </h6>

                        <div className="fs-1">
                          {getWeatherIcon(weather.dailyCodes[index])}
                        </div>

                        <p className="mb-1">
                          {Math.round(weather.maxTemp[index])}°C
                        </p>

                        <small className="text-muted">
                          {Math.round(weather.minTemp[index])}°C
                        </small>

                      </div>

                    </div>

                  </div>

                ))}

              </div>

            </div>
          </>
        )}

      </div>

      <footer className="bg-dark text-white text-center py-3">
        Smart Weather Travel Dashboard © 2026
      </footer>

    </div>
  );
}

export default App;