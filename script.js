const apikey = "05ee2fa2f012b05e42b698786021cec2";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";

const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const weatherIcon = document.querySelector(".weather-icon");


async function checkWeather(city){
    const respone = await fetch(apiUrl + city + `&appid=${apikey}`);
    if(respone.status == 404){
        document.querySelector(".error").style.display = "block";
        document.querySelector(".weather").style.display = "none";
    }
    else {
        var data = await respone.json();

    

document.querySelector(".city").innerHTML = data.name;
document.querySelector(".temp").innerHTML = data.main.temp+"°C";
document.querySelector(".humidity").innerHTML = data.main.humidity +"%";
document.querySelector(".wind").innerHTML = data.wind.speed + "km/hr";

if(data.weather[0].main == "Clouds") {
    weatherIcon.src = "clouds.png";
    
}
if(data.weather[0].main == "Clear") {
    weatherIcon.src = "clear.png";
}
if(data.weather[0].main == "Rain") {
    weatherIcon.src = "rain.png";
}
if(data.weather[0].main == "Drizzle") {
    weatherIcon.src = "drizzle.png";
}
if(data.weather[0].main == "Mist") {
    weatherIcon.src = "mist.png";
}
document.querySelector(".weather").style.display = "block";
document.querySelector(".error").style.display = "none";
}

    }
    
searchBtn.addEventListener("click", ()=> {
    checkWeather(searchBox.value);
})