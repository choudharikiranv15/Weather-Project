// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function() {
    // Load API key from config
    if (typeof config === 'undefined') {
        console.error('Config not loaded. Please check config.js file.');
        return;
    }

    const API_KEY = config.OPENWEATHER_API_KEY;
    const API_URL = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
    const FORECAST_API_URL = "https://api.openweathermap.org/data/2.5/forecast?units=metric&q=";

    // DOM Elements
    const searchBox = document.querySelector("#cityInput");
    const searchBtn = document.querySelector("#searchBtn");
    const weatherIcon = document.querySelector(".weather-icon");
    const weatherDiv = document.querySelector(".weather");
    const card = document.querySelector('.card');
    const recentSearchesContainer = document.querySelector('.recent-searches');
    const locationBtn = document.getElementById('locationBtn');
    const errorModal = document.getElementById('errorModal');
    const errorModalMsg = errorModal ? errorModal.querySelector('.error-modal-message') : null;
    const errorModalClose = errorModal ? errorModal.querySelector('.error-modal-close') : null;

    // Check if all DOM elements are found
    const requiredElements = [
        ['#cityInput', searchBox],
        ['#searchBtn', searchBtn],
        ['.weather-icon', weatherIcon],
        ['.weather', weatherDiv],
        ['.card', card],
        ['.recent-searches', recentSearchesContainer],
        ['#locationBtn', locationBtn],
        ['#errorModal', errorModal],
        ['.error-modal-message', errorModalMsg],
        ['.error-modal-close', errorModalClose]
    ];
    let missing = requiredElements.filter(([selector, el]) => !el).map(([selector]) => selector);
    if (missing.length > 0) {
        console.error('Missing DOM elements:', missing.join(', '));
        return;
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

    const RECENT_KEY = 'weather_recent_cities';
    const MAX_RECENT = 5;

    let currentUnit = 'metric'; // 'metric' for Celsius, 'imperial' for Fahrenheit
    const unitToggle = document.getElementById('unitToggle');
    let lastSearchedCity = '';

    function getUnitSymbol() {
        return currentUnit === 'metric' ? '°C' : '°F';
    }
    function getSpeedUnit() {
        return currentUnit === 'metric' ? 'km/h' : 'mph';
    }

    if (unitToggle) {
        unitToggle.addEventListener('change', () => {
            currentUnit = unitToggle.checked ? 'imperial' : 'metric';
            if (lastSearchedCity) {
                checkWeather(lastSearchedCity);
            }
        });
    }

    // Update API URLs to use currentUnit
    function getWeatherUrl(city) {
        return `${API_URL}${encodeURIComponent(city)}&units=${currentUnit}&appid=${API_KEY}`;
    }
    function getForecastUrl(city) {
        return `${FORECAST_API_URL}${encodeURIComponent(city)}&units=${currentUnit}&appid=${API_KEY}`;
    }

    function saveRecentCity(city) {
        let recent = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
        city = city.trim();
        if (!city) return;
        recent = recent.filter(c => c.toLowerCase() !== city.toLowerCase());
        recent.unshift(city);
        if (recent.length > MAX_RECENT) recent = recent.slice(0, MAX_RECENT);
        localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
        renderRecentSearches();
    }

    function renderRecentSearches() {
        let recent = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
        if (!recentSearchesContainer) return;
        if (recent.length === 0) {
            recentSearchesContainer.innerHTML = '';
            return;
        }
        recentSearchesContainer.innerHTML = recent.map(city => `<span class="recent-search" tabindex="0">${city}</span>`).join('');
        // Add click event
        recentSearchesContainer.querySelectorAll('.recent-search').forEach(el => {
            el.addEventListener('click', () => {
                searchBox.value = el.textContent;
                checkWeather(el.textContent);
            });
            el.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    searchBox.value = el.textContent;
                    checkWeather(el.textContent);
                }
            });
        });
    }

    // Call this after a successful search
    function onSuccessfulSearch(city) {
        saveRecentCity(city);
    }

    // Show weather data
    function showWeather(data) {
        // Hide error modal
        if (errorModal) {
            errorModal.style.display = "none";
        }
        
        // Update weather information
        const cityElement = document.querySelector(".city");
        const tempElement = document.querySelector(".temp");
        const humidityElement = document.querySelector(".humidity");
        const windElement = document.querySelector(".wind");
        
        if (cityElement) cityElement.textContent = data.name;
        if (tempElement) tempElement.textContent = Math.round(data.main.temp) + getUnitSymbol();
        if (humidityElement) humidityElement.textContent = data.main.humidity + "%";
        if (windElement) windElement.textContent = Math.round(data.wind.speed) + " " + getSpeedUnit();
        
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
            weatherDiv.style.animation = "none";
            weatherDiv.offsetHeight; // Trigger reflow
            weatherDiv.style.animation = "fadeInUp 0.6s cubic-bezier(0.4,0,0.2,1)";
        }
        if (card) card.classList.add('expanded');
        // Show forecast section if available
        const forecastContainer = document.querySelector('.forecast');
        if (forecastContainer) {
            forecastContainer.style.display = 'block';
            forecastContainer.style.animation = 'none';
            forecastContainer.offsetHeight;
            forecastContainer.style.animation = 'fadeInUp 0.6s cubic-bezier(0.4,0,0.2,1)';
        }
    }

    // Fetch current weather
    async function getWeather(city) {
        try {
            const response = await fetch(getWeatherUrl(city));
            
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

    // Show error modal
    function showErrorModal(message) {
        if (!errorModal || !errorModalMsg) return;
        errorModalMsg.textContent = message;
        errorModal.style.display = 'flex';
        setTimeout(() => {
            errorModal.style.display = 'none';
        }, 3500);
    }
    if (errorModalClose) {
        errorModalClose.onclick = () => errorModal.style.display = 'none';
    }
    if (errorModal) {
        errorModal.onclick = (e) => {
            if (e.target === errorModal) errorModal.style.display = 'none';
        };
    }

    // Location detection
    if (locationBtn) {
        locationBtn.addEventListener('click', () => {
            if (!navigator.geolocation) {
                showErrorModal('Geolocation is not supported by your browser.');
                return;
            }
            locationBtn.disabled = true;
            locationBtn.style.opacity = 0.6;
            navigator.geolocation.getCurrentPosition(async (pos) => {
                const lat = pos.coords.latitude;
                const lon = pos.coords.longitude;
                try {
                    // Reverse geocode to get city name
                    const resp = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`);
                    const data = await resp.json();
                    if (data && data[0] && data[0].name) {
                        searchBox.value = data[0].name;
                        checkWeather(data[0].name);
                    } else {
                        showErrorModal('Could not detect your city.');
                    }
                } catch {
                    showErrorModal('Could not detect your city.');
                }
                locationBtn.disabled = false;
                locationBtn.style.opacity = 1;
            }, (err) => {
                showErrorModal('Location access denied.');
                locationBtn.disabled = false;
                locationBtn.style.opacity = 1;
            });
        });
    }

    // Main weather checking function
    async function checkWeather(city) {
        if (isLoading) return;
        
        isLoading = true;
        searchBtn.innerHTML = '<div class="loading-spinner"></div>';
        searchBtn.disabled = true;
        searchBox.disabled = true;
        
        try {
            const [weatherData, forecastData] = await Promise.all([
                getWeather(city),
                getForecast(city)
            ]);
            
            showWeather(weatherData);
            displayForecast(forecastData);
            if (card) card.classList.add('expanded');
            if (errorModal) errorModal.style.display = "none";
            
            onSuccessfulSearch(city);
            lastSearchedCity = city;
        } catch (error) {
            if (error.message && (error.message.includes('City not found') || error.message.includes('city'))) {
                showErrorModal('City not found. Please check the spelling.');
            } else {
                showErrorModal(error.message || 'An error occurred.');
            }
            // Hide weather and forecast on error
            if (weatherDiv) weatherDiv.style.display = "none";
            const forecastContainer = document.querySelector('.forecast');
            if (forecastContainer) forecastContainer.style.display = "none";
            if (card) card.classList.remove('expanded');
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
            const response = await fetch(getForecastUrl(city));
            
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
                    <p class="forecast-temp">${Math.round(data.temp)}${getUnitSymbol()}</p>
                    <p class="forecast-weather">${data.weather}</p>
                </div>
            `;
        });
        
        forecastHTML += '</div>';
        forecastContainer.innerHTML = forecastHTML;
        forecastContainer.style.display = 'block';
        if (card) card.classList.add('expanded');
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
    searchBox.focus();

    // Add some visual feedback for better UX
    searchBox.addEventListener("input", () => {
        if (searchBox.value.trim()) {
            searchBox.style.borderColor = "#667eea";
        } else {
            searchBox.style.borderColor = "transparent";
        }
    });

    // Render on load
    renderRecentSearches();
});