// Your API key for OpenWeatherMap
let api_key = '3cb1e3bc09d345e92039e64c76ec688d';
// Add event listener to the search button to fetch weather by city name
document.getElementById('search').addEventListener('click', getWeather);
// Add event listener to the current location button to fetch weather by current location
document.getElementById('current-location').addEventListener('click', getWeatherByLocation);
// Add event listener to the recent cities dropdown to fetch weather for the selected city
document.getElementById('recent-cities').addEventListener('change', function () {
    const city = this.value;
    if (city) {
        let GEOCODING_API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${api_key}`;
        fetch(GEOCODING_API_URL).then(res => res.json()).then(data => weatherDetails(data));
    }
    else{
        alert("Enter City Name")
    }

});
// Fetches weather data for the entered city name
function getWeather() {
    const cityName = document.getElementById('city').value;
    if (cityName) {
        let GEOCODING_API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${api_key}`;
        fetch(GEOCODING_API_URL).then(res => res.json()).then(data => weatherDetails(data));
    }
    else{
        alert("Enter City Name")
    }
}

// Handles the weather data response and updates the UI
function weatherDetails(info) {
    if (info.cod == "404") {
        alert('No such city');
    }
    
    const { lon, lat } = info.coord;
    const name = info.name;
    fetchWeatherData(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely&units=metric&appid=${api_key}`, name);
    fetchForecastData(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely&units=metric&appid=${api_key}`);
}

// Fetches weather data based on the current location
function getWeatherByLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const long = position.coords.longitude;
            const GEOCODING_API_URL = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${long}&zoom=10&addressdetails=1`;
            fetch(GEOCODING_API_URL)
            .then(response => response.json())
            .then(data => {
                if (data && data.address && data.address.city) {
                    fetchWeatherData(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${long}&exclude=minutely&units=metric&appid=${api_key}`, data.address.city);
                    fetchForecastData(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${long}&exclude=minutely&units=metric&appid=${api_key}`);
                } else {
                    fetchWeatherData(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${long}&exclude=minutely&units=metric&appid=${api_key}`, "N/A");
                    fetchForecastData(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${long}&exclude=minutely&units=metric&appid=${api_key}`);
                }
            })
            .catch(error => {
                console.error('Error fetching city from location:', error);
                throw error;
            });
        });
    }
}
// Fetches weather data and updates the UI
function fetchWeatherData(url,cityName) {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            saveToRecentSearches(cityName);
            document.getElementById('city-name').textContent = `${cityName} (${new Date().toLocaleDateString()})`;
            document.getElementById('temperature').textContent = data.current.temp;
            document.getElementById('wind').textContent = data.current.wind_speed;
            document.getElementById('humidity').textContent = data.current.humidity;
            document.getElementById('icon').innerHTML = `<img src="https://openweathermap.org/img/wn/${data.current.weather[0].icon}@2x.png" alt="${data.current.weather[0].description}">`;
            document.getElementById('description').innerHTML = data.current.weather[0].description;
        });
}
// Fetches forecast data and updates the UI
function fetchForecastData(url) {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const forecastContainer = document.getElementById('forecast-cards');
            forecastContainer.innerHTML = '';
            for (let i = 1; i < data.daily.length && i <= 5; i++) {
                const card = document.createElement('div');
                card.classList.add('bg-gray-200', 'p-4', 'rounded-lg', 'shadow');
                card.innerHTML = `
                    <h4>${new Date(data.daily[i].dt*1000).toLocaleDateString()}</h4>
                    <img src="https://openweathermap.org/img/wn/${data.daily[i].weather[0].icon}@2x.png" alt="${data.daily[i].weather[0].description}">
                    <p>Temp: ${data.daily[i].temp.day}°C</p>
                    <p>Wind: ${data.daily[i].wind_speed} M/S</p>
                    <p>Humidity: ${data.daily[i].humidity}%</p>
                `;
                forecastContainer.appendChild(card);
            }
        });
}

// Saves the searched city to recent searches in local storage
function saveToRecentSearches(city) {
    let recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];
    if (!recentSearches.includes(city)) {
        recentSearches.push(city);
        localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
        updateRecentSearchesDropdown(recentSearches);
    }
}

// Updates the recent searches dropdown menu
function updateRecentSearchesDropdown(recentSearches) {
    const recentSearchesDiv = document.getElementById('recent-searches');
    const recentCitiesSelect = document.getElementById('recent-cities');

    if (recentSearches.length > 0) {
        recentSearchesDiv.classList.remove('hidden');
        recentCitiesSelect.innerHTML = recentSearches.map(city => `<option value="${city}">${city}</option>`).join('');
    } else {
        recentSearchesDiv.classList.add('hidden');
        recentCitiesSelect.innerHTML = '';
    }
}

// Initial load of recent searches from local storage when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];
    updateRecentSearchesDropdown(recentSearches);
});