
const tomorrowApiKey = "qAg8voa0NWqXQr54SKArAb4c1nZ7NXZA";
const openCageApiKey = "b6463fbcdcd84ce3985609060e236cca";

// Getting Elements from the Webpage
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const geoBtn = document.getElementById("geoBtn");
const weatherDisplay = document.getElementById("weatherDisplay");
const message = document.getElementById("message");

// Tomorrow.io weather codes to emojis, descriptions, and gradients
const weatherCodeMap = {
  1000: { emoji: "☀️", desc: "Clear, Sunny", gradient: "gradient-clear" },
  1100: { emoji: "🌤️", desc: "Mostly Clear", gradient: "gradient-clear" },
  1101: { emoji: "⛅", desc: "Partly Cloudy", gradient: "gradient-clear" },
  1102: { emoji: "🌥️", desc: "Mostly Cloudy", gradient: "gradient-cloudy" },
  1001: { emoji: "☁️", desc: "Cloudy", gradient: "gradient-cloudy" },
  2000: { emoji: "🌫️", desc: "Fog", gradient: "gradient-cloudy" },
  2100: { emoji: "🌫️", desc: "Light Fog", gradient: "gradient-cloudy" },
  4000: { emoji: "🌦️", desc: "Drizzle", gradient: "gradient-rain" },
  4001: { emoji: "🌧️", desc: "Rain", gradient: "gradient-rain" },
  4200: { emoji: "🌦️", desc: "Light Rain", gradient: "gradient-rain" },
  4201: { emoji: "🌧️", desc: "Heavy Rain", gradient: "gradient-rain" },
  5000: { emoji: "❄️", desc: "Snow", gradient: "gradient-snow" },
  5001: { emoji: "🌨️", desc: "Flurries", gradient: "gradient-snow" },
  5100: { emoji: "🌨️", desc: "Light Snow", gradient: "gradient-snow" },
  5101: { emoji: "❄️", desc: "Heavy Snow", gradient: "gradient-snow" },
  6000: { emoji: "🌧️❄️", desc: "Freezing Drizzle", gradient: "gradient-snow" },
  6001: { emoji: "🌧️❄️", desc: "Freezing Rain", gradient: "gradient-snow" },
  6200: { emoji: "🌧️❄️", desc: "Light Freezing Rain", gradient: "gradient-snow" },
  6201: { emoji: "🌧️❄️", desc: "Heavy Freezing Rain", gradient: "gradient-snow" },
  7000: { emoji: "🧊", desc: "Ice Pellets", gradient: "gradient-snow" },
  7101: { emoji: "🧊", desc: "Heavy Ice Pellets", gradient: "gradient-snow" },
  7102: { emoji: "🧊", desc: "Light Ice Pellets", gradient: "gradient-snow" },
  8000: { emoji: "⛈️", desc: "Thunderstorm", gradient: "gradient-rain" }
};
// displays status message to users 
function setMessage(msg, isError = false, loading = false) {
  if (loading) {
    message.innerHTML = `${msg} <span class="loader"></span>`;
  } else {
    message.textContent = msg;
  }
  message.style.color = isError ? "#ff3b30" : "#333";
}
// Get Coordinates from a City Name
async function getCoordsFromCity(city) {
  setMessage("Getting coordinates...", false, true);
  try {
    const res = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(city)}&key=${openCageApiKey}&limit=1`);
    const data = await res.json(); //Converts the API response into a usable JavaScript object 
    if (!data.results || data.results.length === 0) {
      setMessage("City not found.", true);
      return null;
    }
    setMessage("");

    const result = data.results[0]; //Gets the first result from the API (data.results[0]).
    const { lat, lng } = result.geometry;

    const components = result.components; //This line extracts the components object from the result of the OpenCage API response.
    const cityName =
      components.city ||
      components.town ||
      components.village ||
      components.county ||
      components.state ||
      "";
    const country = components.country || "";

    const simpleLocation = [cityName,country].filter(Boolean).join(", ");

    return { lat, lon: lng, cityName: simpleLocation };
  } catch (error) { //Shows an error message and logs the error to the console.
    setMessage("Error fetching location data.", true);
    console.error(error);
    return null;
  }
}
// Converts coordinates back to a human-readable city name. 
async function reverseGeocode(lat, lon) {
  try {
    const res = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${openCageApiKey}&limit=1`);
    const data = await res.json();
    if (!data.results || data.results.length === 0) return null;

    const components = data.results[0].components;
    const cityName =
      components.city ||
      components.town ||
      components.village ||
      components.county ||
      components.state ||
      "";
    const country = components.country || "";

    return [cityName, country].filter(Boolean).join(", ");
  } catch {
    return null;
  }
}
// Uses Tomorrow.io API to fetch weather
async function getWeather(lat, lon) {
  setMessage("Fetching weather...", false, true);
  try {
    const url = `https://api.tomorrow.io/v4/timelines?location=${lat},${lon}&fields=temperature,temperatureApparent,weatherCode,precipitationProbability&units=metric&timesteps=current,1d&timestepsCount=5&apikey=${tomorrowApiKey}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.errors) {
      setMessage("Error fetching weather data: " + data.errors[0].message, true);
      return null;
    }
    setMessage("");
    return data;
  } catch (error) {
    setMessage("Error fetching weather data.", true);
    console.error(error);
    return null;
  }
}
// Uses Tomorrow.io API to fetch weather
function renderWeather(data, cityName = "Current Location") {
  if (!data) {
    weatherDisplay.innerHTML = "";
    return;
  }

  const currentTimeline = data.data.timelines.find(t => t.timestep === "current");// Finds the timeline object in data.data.timelines where the timestep property equals "current".
  if (!currentTimeline) {
    setMessage("Current weather data not available.", true);
    return;
  }

  const values = currentTimeline.intervals[0].values;
  const weatherInfo = weatherCodeMap[values.weatherCode] || { emoji: "❓", desc: "Unknown", gradient: "gradient-clear" };

  weatherDisplay.className = `weather-card ${weatherInfo.gradient}`;

  weatherDisplay.innerHTML = `
    <h2>${cityName}</h2>
    <div class="weather-icon" title="${weatherInfo.desc}">${weatherInfo.emoji}</div>
    <div class="weather-row">
      <div>Temperature:</div>
      <div>${values.temperature.toFixed(1)} °C</div>
    </div>
    <div class="weather-row">
      <div>Feels Like:</div>
      <div>${values.temperatureApparent.toFixed(1)} °C</div>
    </div>
    <div class="weather-row">
      <div>Conditions:</div>
      <div>${weatherInfo.desc}</div>
    </div>
  `;

  renderForecast(data); // Show forecast after current weather
}
// Renders 4 days weather Forecast
function renderForecast(data) {
  const dailyTimeline = data.data.timelines.find(t => t.timestep === "1d");
  if (!dailyTimeline) return;

  const forecastContainerId = "forecastDisplay";
  let forecastDiv = document.getElementById(forecastContainerId);

  if (!forecastDiv) {
    forecastDiv = document.createElement("div");
    forecastDiv.id = forecastContainerId;
    forecastDiv.className = "forecast-container";
    weatherDisplay.insertAdjacentElement("afterend", forecastDiv);
  }

  forecastDiv.innerHTML = `<h3 class="forecast-title">4-Day Forecast</h3>`;
  const forecastGrid = document.createElement("div");
  forecastGrid.className = "forecast-grid";
  forecastDiv.appendChild(forecastGrid);

  const dailyIntervals = dailyTimeline.intervals.slice(1, 5); // Next 4 days

  dailyIntervals.forEach(day => {
    const date = new Date(day.startTime);
    const dayName = date.toLocaleDateString(undefined, { weekday: "short" });
    const dateNum = date.getDate();
    const values = day.values;

    const temp = Math.round(values.temperature);
    const precipProb = values.precipitationProbability ? Math.round(values.precipitationProbability) : 0;
    const weatherCode = values.weatherCode;

    const weatherInfo = weatherCodeMap[weatherCode] || { emoji: "❓", desc: "Unknown", gradient: "gradient-clear" };

    const dayCard = document.createElement("div");
    dayCard.className = "forecast-card";
    dayCard.classList.add(weatherInfo.gradient); 

    dayCard.innerHTML = `
      <div class="forecast-day">${dayName} ${dateNum}</div>
      <div class="forecast-icon" title="${weatherInfo.desc}">${weatherInfo.emoji}</div>
      <div class="forecast-desc">${weatherInfo.desc}</div>
      <div class="forecast-temp"><strong>${temp}°C</strong></div>
      <div class="forecast-precip">💧 ${precipProb}%</div>
    `;

    forecastGrid.appendChild(dayCard);
  });
}



// Disable buttons while loading
function setLoading(isLoading) {
  searchBtn.disabled = isLoading;
  geoBtn.disabled = isLoading;
}
// Search by City Button
searchBtn.addEventListener("click", async () => {
  const city = cityInput.value.trim();
  if (!city) {
    setMessage("Please enter a city name.", true);
    return;
  }
  setLoading(true);
  const coords = await getCoordsFromCity(city);
  if (coords) {
    const weather = await getWeather(coords.lat, coords.lon);
    if (weather) {
      renderWeather(weather, coords.cityName);
    } else {
      weatherDisplay.innerHTML = "";
    }
  } else {
    weatherDisplay.innerHTML = "";
  }
  setLoading(false);
});
// Uses browser’s navigator.geolocation
geoBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    setMessage("Geolocation not supported by your browser.", true);
    return;
  }
  setLoading(true);
  setMessage("Getting your location...", false, true);
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords; //Extracts latitude and longitude from the user's devic
      const cityName = await reverseGeocode(latitude, longitude) || "Current Location";
      const weather = await getWeather(latitude, longitude);
      if (weather) {
        renderWeather(weather, cityName);
      } else {
        weatherDisplay.innerHTML = "";
      }
      setLoading(false);
    },
    () => {
      setMessage("Unable to retrieve your location.", true);
      setLoading(false);
    }
  );
});

