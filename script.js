// Load API key from config
if (typeof config === 'undefined') {
    console.error('Config not loaded. Please check config.js file.');
    throw new Error('Configuration not loaded');
}

const API_KEY = config.OPENWEATHER_API_KEY;
const API_URL = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const FORECAST_API_URL = "https://api.openweathermap.org/data/2.5/forecast?units=metric&q=";

// DOM Elements
const searchBox = document.querySelector("#cityInput");
const searchBtn = document.querySelector("#searchBtn");
const weatherIcon = document.querySelector(".weather-icon");
const errorDiv = document.querySelector(".error");
const weatherDiv = document.querySelector(".weather");

// Check if all DOM elements are found
if (!searchBox || !searchBtn || !weatherIcon || !errorDiv || !weatherDiv) {
    console.error('Some DOM elements not found. Please check HTML structure.');
    throw new Error('DOM elements not found');
}

// Weather condition mappings
const weatherConditions = {
    "Clear": "assets/clear.png",
    "Clouds": "assets/clouds.png",
    "Rain": "assets/rain.png",
    "Drizzle": "assets/drizzle.png",
    "Mist": "assets/mist.png",
    "Fog": "assets/mist.png",
    "Haze": "assets/mist.png",
    "Smoke": "assets/mist.png",
    "Dust": "assets/mist.png",
    "Sand": "assets/mist.png",
    "Ash": "assets/mist.png",
    "Squall": "assets/wind1.png.png",
    "Tornado": "assets/wind1.png.png",
    "Snow": "assets/snow.png",
    "Thunderstorm": "assets/rain.png"
};

// Loading state management
let isLoading = false;

// Show weather data
function showWeather(data) {
    // Hide error message
    if (errorDiv) {
        errorDiv.style.display = "none";
    }
    
    // Update weather information
    const cityElement = document.querySelector(".city");
    const tempElement = document.querySelector(".temp");
    const humidityElement = document.querySelector(".humidity");
    const windElement = document.querySelector(".wind");
    
    if (cityElement) cityElement.textContent = data.name;
    if (tempElement) tempElement.textContent = Math.round(data.main.temp) + "°C";
    if (humidityElement) humidityElement.textContent = data.main.humidity + "%";
    if (windElement) windElement.textContent = Math.round(data.wind.speed) + " km/h";
    
    // Update weather icon
    const weatherMain = data.weather[0].main;
    const iconFile = weatherConditions[weatherMain] || "assets/clear.png";
    if (weatherIcon) {
        weatherIcon.src = iconFile;
        weatherIcon.alt = data.weather[0].description;
    }
    
    // Show weather section with animation
    if (weatherDiv) {
        weatherDiv.style.display = "block";
        
        // Add entrance animation
        weatherDiv.style.animation = "none";
        weatherDiv.offsetHeight; // Trigger reflow
        weatherDiv.style.animation = "fadeInUp 0.6s ease";
    }
}

// Fetch current weather
async function getWeather(city) {
    try {
        const response = await fetch(API_URL + encodeURIComponent(city) + `&appid=${API_KEY}`);
        
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("API key error. Please contact support.");
            } else if (response.status === 404) {
                throw new Error("City not found. Please check the spelling.");
            } else {
                throw new Error("Failed to fetch weather data.");
            }
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        throw error;
    }
}

// Main weather checking function
async function checkWeather(city) {
    if (isLoading) return;
    
    isLoading = true;
    searchBtn.innerHTML = '<div class="loading-spinner"></div>';
    searchBtn.disabled = true;
    searchBox.disabled = true;
    
    try {
        // Fetch both current weather and forecast
        const [weatherData, forecastData] = await Promise.all([
            getWeather(city),
            getForecast(city)
        ]);
        
        showWeather(weatherData);
        displayForecast(forecastData);
        
        // Hide error message if it was showing
        if (errorDiv) {
            errorDiv.style.display = "none";
        }
        
    } catch (error) {
        console.error("Error:", error);
        if (errorDiv) {
            errorDiv.style.display = "block";
            const errorParagraph = errorDiv.querySelector("p");
            if (errorParagraph) {
                errorParagraph.textContent = error.message;
            }
        }
        
        // Hide weather and forecast on error
        if (weatherDiv) {
            weatherDiv.style.display = "none";
        }
        const forecastContainer = document.querySelector('.forecast');
        if (forecastContainer) {
            forecastContainer.style.display = "none";
        }
    } finally {
        isLoading = false;
        searchBtn.innerHTML = searchBtn.dataset.originalContent || '<img src="assets/search.png" alt="Search icon">';
        searchBtn.disabled = false;
        searchBox.disabled = false;
    }
}

// Fetch 5-day weather forecast
async function getForecast(city) {
    try {
        const response = await fetch(FORECAST_API_URL + encodeURIComponent(city) + `&appid=${API_KEY}`);
        
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("API key error. Please contact support.");
            } else if (response.status === 404) {
                throw new Error("City not found. Please check the spelling.");
            } else {
                throw new Error("Failed to fetch forecast data.");
            }
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        throw error;
    }
}

// Display 5-day forecast
function displayForecast(forecastData) {
    const forecastContainer = document.querySelector('.forecast');
    if (!forecastContainer) return;
    
    // Group forecast data by day
    const dailyForecasts = {};
    forecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        if (!dailyForecasts[day]) {
            dailyForecasts[day] = {
                temp: item.main.temp,
                weather: item.weather[0].main,
                icon: item.weather[0].main,
                humidity: item.main.humidity,
                wind: item.wind.speed
            };
        }
    });
    
    // Create forecast HTML
    let forecastHTML = '<h3>5-Day Forecast</h3><div class="forecast-items">';
    
    Object.entries(dailyForecasts).forEach(([day, data]) => {
        const iconFile = weatherConditions[data.icon] || "assets/clear.png";
        forecastHTML += `
            <div class="forecast-item">
                <h4>${day}</h4>
                <img src="${iconFile}" alt="${data.weather}" class="forecast-icon">
                <p class="forecast-temp">${Math.round(data.temp)}°C</p>
                <p class="forecast-weather">${data.weather}</p>
            </div>
        `;
    });
    
    forecastHTML += '</div>';
    forecastContainer.innerHTML = forecastHTML;
    forecastContainer.style.display = 'block';
}

// Event Listeners
searchBtn.addEventListener("click", () => {
    const city = searchBox.value.trim();
    if (city) {
        checkWeather(city);
    }
});

// Enter key support
searchBox.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        const city = searchBox.value.trim();
        if (city) {
            checkWeather(city);
        }
    }
});

// Focus management for better UX
searchBox.addEventListener("focus", () => {
    searchBox.select();
});

// Initialize with focus on input
document.addEventListener("DOMContentLoaded", () => {
    searchBox.focus();
});

// Add some visual feedback for better UX
searchBox.addEventListener("input", () => {
    if (searchBox.value.trim()) {
        searchBox.style.borderColor = "#667eea";
    } else {
        searchBox.style.borderColor = "transparent";
    }
});