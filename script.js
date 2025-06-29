// Load API key from config
const API_KEY = config.OPENWEATHER_API_KEY;
const API_URL = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";

// DOM Elements
const searchBox = document.querySelector("#cityInput");
const searchBtn = document.querySelector("#searchBtn");
const weatherIcon = document.querySelector(".weather-icon");
const errorDiv = document.querySelector(".error");
const weatherDiv = document.querySelector(".weather");

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

// Show loading state
function showLoading() {
    if (isLoading) return;
    isLoading = true;
    
    const originalContent = searchBtn.innerHTML;
    searchBtn.innerHTML = '<div class="loading"></div>';
    searchBtn.disabled = true;
    searchBox.disabled = true;
    
    // Store original content for restoration
    searchBtn.dataset.originalContent = originalContent;
}

// Hide loading state
function hideLoading() {
    if (!isLoading) return;
    isLoading = false;
    
    searchBtn.innerHTML = searchBtn.dataset.originalContent || '<img src="assets/search.png" alt="Search icon">';
    searchBtn.disabled = false;
    searchBox.disabled = false;
}

// Show error message
function showError(message) {
    errorDiv.querySelector('p').textContent = message;
    errorDiv.style.display = "block";
    weatherDiv.style.display = "none";
    
    // Auto-hide error after 5 seconds
    setTimeout(() => {
        errorDiv.style.display = "none";
    }, 5000);
}

// Hide error message
function hideError() {
    errorDiv.style.display = "none";
}

// Show weather data
function showWeather(data) {
    hideError();
    
    // Update weather information
    document.querySelector(".city").textContent = data.name;
    document.querySelector(".temp").textContent = Math.round(data.main.temp) + "°C";
    document.querySelector(".humidity").textContent = data.main.humidity + "%";
    document.querySelector(".wind").textContent = Math.round(data.wind.speed) + " km/h";
    
    // Update weather icon
    const weatherMain = data.weather[0].main;
    const iconFile = weatherConditions[weatherMain] || "assets/clear.png";
    weatherIcon.src = iconFile;
    weatherIcon.alt = data.weather[0].description;
    
    // Show weather section with animation
    weatherDiv.style.display = "block";
    
    // Add entrance animation
    weatherDiv.style.animation = "none";
    weatherDiv.offsetHeight; // Trigger reflow
    weatherDiv.style.animation = "fadeInUp 0.6s ease";
}

// Main weather checking function
async function checkWeather(city) {
    if (!city.trim()) {
        showError("Please enter a city name");
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch(API_URL + encodeURIComponent(city) + `&appid=${API_KEY}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("City not found. Please check the spelling and try again.");
            } else if (response.status === 401) {
                throw new Error("API key error. Please contact support.");
            } else {
                throw new Error("Failed to fetch weather data. Please try again.");
            }
        }
        
        const data = await response.json();
        showWeather(data);
        
    } catch (error) {
        console.error("Weather fetch error:", error);
        showError(error.message || "An error occurred while fetching weather data");
    } finally {
        hideLoading();
    }
}

// Event Listeners
searchBtn.addEventListener("click", () => {
    const city = searchBox.value.trim();
    checkWeather(city);
});

// Enter key support
searchBox.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        const city = searchBox.value.trim();
        checkWeather(city);
    }
});

// Focus management for better UX
searchBox.addEventListener("focus", () => {
    searchBox.select();
});

// Auto-search on input change (debounced)
let searchTimeout;
searchBox.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    const city = e.target.value.trim();
    
    if (city.length > 2) {
        searchTimeout = setTimeout(() => {
            checkWeather(city);
        }, 1000); // 1 second delay
    }
});

// Initialize with a default city (optional)
document.addEventListener("DOMContentLoaded", () => {
    // You can set a default city here if desired
    // checkWeather("London");
    
    // Focus the input for better UX
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