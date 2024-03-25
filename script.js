const apikey = "05ee2fa2f012b05e42b698786021cec2";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";

const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const weatherIcon = document.querySelector(".weather-icon");
const errorDiv = document.querySelector(".error");
const weatherDiv = document.querySelector(".weather");

async function checkWeather(city) {
    const response = await fetch(apiUrl + city + `&appid=${apikey}`);

    if (response.ok) {
        const data = await response.json();

        document.querySelector(".city").textContent = data.name;
        document.querySelector(".temp").textContent = data.main.temp + "°C";
        document.querySelector(".humidity").textContent = data.main.humidity + "%";
        document.querySelector(".wind").textContent = data.wind.speed + "km/hr";

        if (data.weather[0].main == "Clouds") {
            weatherIcon.src = "clouds.png";
        } else if (data.weather[0].main == "Clear") {
            weatherIcon.src = "clear.png";
        } else if (data.weather[0].main == "Rain") {
            weatherIcon.src = "rain.png";
        } else if (data.weather[0].main == "Drizzle") {
            weatherIcon.src = "drizzle.png";
        } else if (data.weather[0].main == "Mist") {
            weatherIcon.src = "mist.png";
        }

        errorDiv.style.display = "none";
        weatherDiv.style.display = "block";
    } else {
        errorDiv.style.display = "block";
        weatherDiv.style.display = "none";
    }
}

searchBtn.addEventListener("click", () => {
    checkWeather(searchBox.value);
});

// Typewriter animation for placeholder text
const placeholderText = "Enter City Name";
let index = 0;

function typePlaceholder() {
    const inputElement = document.getElementById("textInput");
    inputElement.placeholder = placeholderText.substring(0, index);
    index++;

    if (index <= placeholderText.length) {
        setTimeout(typePlaceholder, 150); // Reset index for continuous animation
    }
}

typePlaceholder(); // Start typing animation
