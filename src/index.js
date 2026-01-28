const searchbar = document.getElementById("weatherSearchbar");
const form = document.getElementById("weatherSearchFrom");

function loadTopBar(geoCodeApiJson) {
    const latitude = geoCodeApiJson[0].lat;
    const longitude = geoCodeApiJson[0].lon;
    const name = geoCodeApiJson[0].name;
    const now = new Date();

    let topBarDiv = `
    <div id="topBar">
        <div>
            <form id="hourOrDaily">
                <input type="radio" id="hourly" name="forecastLen" value="Hourly">
                <label for="hourly">Hourly</label><br>
                <input type="radio" id="daily" name="forecastLen" value="Daily">
                <label for="daily">Daily</label><br>

            </form>
        </div>

        <span>${name}</span>
        <span>${now.toLocaleTimeString()}</span>  
        
        <div>
            <span>Latitude: ${latitude}</span><br>
            <span>Longitude: ${longitude}</span>
        </div>
    </div>
    <h2>Hourly Forecast</h2>
    `;

    return topBarDiv;

}

function loadHourly(hourlyWeatherJson) {

    const hourlyForecast = hourlyWeatherJson.properties.periods;
    let hourlyWeatherDiv = `<div id="hoursForecasts">
    `;

    for (let i = 0; i < 12; i++) {

        const startTime = hourlyForecast[i].startTime;
        const startTimePosInString = startTime.search(/T/);
        const hour = `${startTime[startTimePosInString + 1]}${startTime[startTimePosInString + 2]}`;

        hourlyWeatherDiv += `<div class="hourForecast" id="hf${i}">
                <span class="time">${hour}:00</span>
                <span class="shortForecast">${getWeatherIcon((hourlyForecast[i].shortForecast).toLowerCase(), hourlyForecast[i].isDaytime)}</span>
                <span class="temperature">${hourlyForecast[i].temperature}&deg;F</span>
                <span class="probabilityOfPrecipitation">${hourlyForecast[i].probabilityOfPrecipitation.value}%</span>
                <span class="windSpeed">${hourlyForecast[i].windSpeed}</span>
                <span class="windDirection">${hourlyForecast[i].windDirection}</span>
            </div>
            `;

        if (i != 11) {
            hourlyWeatherDiv += `<hr>
                `
        }
    }

    hourlyWeatherDiv += `</div>
    `

    return hourlyWeatherDiv;

}

function loadDaily(dailyWeatherJson) {

    const dailyForecast = dailyWeatherJson.properties.periods;
    let dailyWeatherDiv = `<div id="daysForecasts">
    `;

    for (let i = 0; i < 14; i++) {
        if (i % 2 === 0) {
            dailyWeatherDiv += ` <div class="daysForecast">
                <img src="${dailyForecast[i].icon}" alt="${dailyForecast[i].shortForecast}">
                </div>    
            `;
        }
    }

    dailyWeatherDiv += `</div>
    `


    return dailyWeatherDiv;

}

function getWeatherIcon(shortForecast, day) {
    const shortForecastList = shortForecast.split(" ");

    if (day) {
        return `<i class="wi wi-day-${shortForecastList.at(-1)}"></i>`
    } else {
        return `<i class="wi wi-night-${shortForecastList.at(-1)}"></i>`
    }
}

async function formSubmit(e) {

    e.preventDefault();

    const geocodeApi = "https://nominatim.openstreetmap.org/search";
    const weatherApi = "https://api.weather.gov";

    const geocodePayload = `${geocodeApi}?q=${encodeURIComponent(searchbar.value)}&limit=1&format=json`;

    let geoCodeApiJson;

    try {
        const geocodeApiResponse = await fetch(geocodePayload, {
            headers: {
                "User-Agent": "weather-app"
            }
        });

        geoCodeApiJson = await geocodeApiResponse.json();

    } catch (error) {
        console.log("Error fetching coordinates: ", error);
    }


    const weatherPayload = `${weatherApi}/points/${geoCodeApiJson[0].lat},${geoCodeApiJson[0].lon}`
    let weatherForecastDiv = loadTopBar(geoCodeApiJson);

    try {
        const weatherApiResponse = await fetch(weatherPayload);
        const weatherApiJson = await weatherApiResponse.json();

        console.log(weatherApiJson);

        const hourlyWeatherResponse = await fetch(weatherApiJson.properties.forecastHourly);
        const dailyWeatherResponse = await fetch(weatherApiJson.properties.forecast);
        const hourlyWeatherJson = await hourlyWeatherResponse.json();
        const dailyWeatherJson = await dailyWeatherResponse.json()

        console.log(hourlyWeatherJson);
        console.log(dailyWeatherJson);

        weatherForecastDiv += loadHourly(hourlyWeatherJson);
        weatherForecastDiv += loadDaily(dailyWeatherJson);

        document.getElementById('weatherForecast').innerHTML = weatherForecastDiv;
        document.getElementById('daysForecasts').hidden = true;
        document.getElementById('hourly').checked = true;
        document.getElementById('weatherForecast').hidden = false;

        const hourOrDailyForm = document.getElementById("hourOrDaily");
        hourOrDailyForm.addEventListener("change", timeScale);

    } catch (error) {
        console.log("Error fetching weather data: ", error);

    }
}

function timeScale(e) {
    const selectedValue = document.querySelector('input[name="forecastLen"]:checked')?.value;
    if (selectedValue === "Hourly") {
        document.getElementById("hoursForecasts").hidden = false;
        document.getElementById("daysForecasts").hidden = true;

    } else if (selectedValue === "Daily") {
        document.getElementById("hoursForecasts").hidden = true;
        document.getElementById("daysForecasts").hidden = false;

    }
}

form.addEventListener("submit", formSubmit);

