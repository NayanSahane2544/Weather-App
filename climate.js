const weatherIcon = document.querySelector(".weatherIcon");
const tempEl = document.querySelector(".temperature");
const feelsLikeEl = document.querySelector(".feelslike");
const descEl = document.querySelector(".description");
const dateEl = document.querySelector(".date");
const cityEl = document.querySelector(".city");

const HValue = document.getElementById("HValue");
const WValue = document.getElementById("WValue");
const SRValue = document.getElementById("SRValue");
const SSValue = document.getElementById("SSValue");
const CValue = document.getElementById("CValue");
const UVValue = document.getElementById("UVValue");
const PValue = document.getElementById("PValue");

const forecastEl = document.querySelector(".forecast");
const converter = document.getElementById("converter");

let currentTempC = null;

async function findUserLocation() {
    let location = document.getElementById("userLocation").value.trim();
    if (!location) {
        alert("Please enter a city name");
        return;
    }

    try {
        // 1️⃣ Geocoding to get lat & lon
        let geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${location}&count=1`);
        let geoData = await geoRes.json();
        if (!geoData.results || geoData.results.length === 0) {
            alert("City not found!");
            return;
        }
        let { latitude, longitude, name, country } = geoData.results[0];

        // 2️⃣ Get Weather Data
        let weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,weather_code,relative_humidity_2m,cloud_cover,wind_speed_10m,surface_pressure,uv_index&daily=temperature_2m_max,temperature_2m_min,weather_code,sunrise,sunset,uv_index_max&timezone=auto`
        );
        let weatherData = await weatherRes.json();

        displayWeather(weatherData, name, country);
    } catch (err) {
        console.error("Error fetching weather:", err);
    }
}

function displayWeather(data, name, country) {
    let current = data.current;
    let daily = data.daily;

    // 🌡 Store temp in C for conversion
    currentTempC = current.temperature_2m;

    // 📅 Current Weather
    tempEl.innerHTML = `${current.temperature_2m}°C`;
    feelsLikeEl.innerHTML = `Feels like: ${current.apparent_temperature}°C`;
    descEl.innerHTML = getWeatherDescription(current.weather_code);
    dateEl.innerHTML = new Date().toLocaleString();
    cityEl.innerHTML = `${name}, ${country}`;

    // 🌦 Icon
    weatherIcon.style.backgroundImage = `url(${getWeatherIcon(current.weather_code)})`;

    // 📊 Highlights
    HValue.innerHTML = `${current.relative_humidity_2m}%`;
    WValue.innerHTML = `${current.wind_speed_10m} km/h`;
    CValue.innerHTML = `${current.cloud_cover}%`;
    PValue.innerHTML = `${current.surface_pressure} hPa`;
    UVValue.innerHTML = `${current.uv_index}`;

    SRValue.innerHTML = formatTime(daily.sunrise[0]);
    SSValue.innerHTML = formatTime(daily.sunset[0]);

    // 📅 Weekly Forecast
    displayForecast(daily);
}

// Convert Time
function formatTime(dateStr) {
    let date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Weekly Forecast Display
function displayForecast(daily) {
    forecastEl.innerHTML = "";
    for (let i = 0; i < daily.time.length; i++) {
        let day = new Date(daily.time[i]).toLocaleDateString('en-US', { weekday: 'short' });
        let max = daily.temperature_2m_max[i];
        let min = daily.temperature_2m_min[i];
        let icon = getWeatherIcon(daily.weather_code[i]);

        let card = `
            <div class="forecast-day">
                <p>${day}</p>
                <img src="${icon}" alt="">
                <p>${max}° / ${min}°</p>
            </div>
        `;
        forecastEl.innerHTML += card;
    }
}

// Weather Description
function getWeatherDescription(code) {
    const codes = {
        0: "Clear Sky",
        1: "Mainly Clear",
        2: "Partly Cloudy",
        3: "Overcast",
        45: "Fog",
        48: "Depositing Rime Fog",
        51: "Light Drizzle",
        61: "Slight Rain",
        71: "Slight Snowfall",
        80: "Rain Showers",
        95: "Thunderstorm"
    };
    return codes[code] || "Unknown";
}

// Weather Icon
function getWeatherIcon(code) {
    const iconMap = {
        0: "https://openweathermap.org/img/wn/01d@2x.png",
        1: "https://openweathermap.org/img/wn/02d@2x.png",
        2: "https://openweathermap.org/img/wn/03d@2x.png",
        3: "https://openweathermap.org/img/wn/04d@2x.png",
        45: "https://openweathermap.org/img/wn/50d@2x.png",
        48: "https://openweathermap.org/img/wn/50d@2x.png",
        51: "https://openweathermap.org/img/wn/09d@2x.png",
        61: "https://openweathermap.org/img/wn/10d@2x.png",
        71: "https://openweathermap.org/img/wn/13d@2x.png",
        80: "https://openweathermap.org/img/wn/09d@2x.png",
        95: "https://openweathermap.org/img/wn/11d@2x.png"
    };
    return iconMap[code] || iconMap[0];
}

// 🌡 Convert °C ↔ °F
converter.addEventListener("change", () => {
    if (currentTempC === null) return;
    if (converter.value === "°F") {
        tempEl.innerHTML = `${(currentTempC * 9/5 + 32).toFixed(1)}°F`;
    } else {
        tempEl.innerHTML = `${currentTempC}°C`;
    }
});
converter.addEventListener("change", () => {
    let forecastDays = document.querySelectorAll(".forecast-day p:last-child");
    forecastDays.forEach(card => {
        let [max, min] = card.textContent.replace(/°/g, "").split(" / ").map(Number);
        if (converter.value === "°F") {
            card.textContent = `${(max * 9/5 + 32).toFixed(1)}° / ${(min * 9/5 + 32).toFixed(1)}°`;
        } else {
            card.textContent = `${((max - 32) * 5/9).toFixed(1)}° / ${((min - 32) * 5/9).toFixed(1)}°`;
        }
    });
});
