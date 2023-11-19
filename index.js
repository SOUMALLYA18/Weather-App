
function getCurrentDateTime() {
  const now = new Date();

  const optionsDate = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  const optionsTime = {
    hour: "numeric",
    minute: "numeric",
  };

  const formattedDate = now.toLocaleDateString("en-US", optionsDate);
  const formattedTime = now.toLocaleTimeString("en-US", optionsTime);

  return [formattedDate, formattedTime];
}

// Function to update date and time every second
function updateDateTime() {
  const dateElement = document.getElementById("currentDate");
  const timeElement = document.getElementById("currentTime");

  if (dateElement && timeElement) {
    const [formattedDate, formattedTime] = getCurrentDateTime();

    dateElement.textContent = formattedDate;
    timeElement.textContent = formattedTime;
  } else {
    console.error("Date or time element not found.");
  }
}

setInterval(updateDateTime, 1000);

// OpenWeatherMap API key
const apikey = "3b10eee01d5cb91e46625d268eb5eb82";

// Event listener for search button click
document.getElementById("search-btn").addEventListener("click", function () {
  const searchField = document.getElementById("search-field");
  const cityName = searchField.value.trim();

  if (cityName !== "") {
    fetchWeatherData(cityName);
  }
});

// Event listener for current location button click
document
  .getElementById("current-location-btn")
  .addEventListener("click", getCurrentLocationWeather);

// Function to fetch current weather and forecast data
async function fetchWeatherData(city) {
  try {
    const currentWeatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apikey}`
    );

    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apikey}`
    );

    if (!currentWeatherResponse.ok || !forecastResponse.ok) {
      throw new Error("Network response was not ok");
    }

    const currentWeatherData = await currentWeatherResponse.json();
    const forecastData = await forecastResponse.json();

    updateCurrentWeatherUI(currentWeatherData);
    updateForecastUI(forecastData);
  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
}

// Function to fetch weather data based on current location
// Function to fetch weather data based on current location
function getCurrentLocationWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        try {
          const currentWeatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apikey}`
          );

          if (!currentWeatherResponse.ok) {
            throw new Error("Network response was not ok");
          }

          const currentWeatherData = await currentWeatherResponse.json();

          updateCurrentWeatherUI(currentWeatherData);

          // Fetch forecast data for the current location
          const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${apikey}`
          );

          if (!forecastResponse.ok) {
            throw new Error("Network response was not ok");
          }

          const forecastData = await forecastResponse.json();

          // Update the forecast UI
          updateForecastUI(forecastData);
        } catch (error) {
          console.error("Error fetching current location weather data:", error);
        }
      },
      (error) => {
        console.error("Error getting geolocation:", error);
      }
    );
  } else {
    console.error("Geolocation is not supported by this browser.");
  }
}

// Function to update the UI with current weather data
function updateCurrentWeatherUI(data) {
  const cityElement = document.querySelector(".city");
  const temperatureElement = document.getElementById("heading");
  const sunriseElement = document.querySelector(".sun-rise p");
  const sunsetElement = document.querySelector(".sun-set p");
  const humidityElement = document.getElementById("humidity-value");
  const windSpeedElement = document.getElementById("wind-speed-value");
  const feelsLikeElement = document.getElementById("feels-like-value");
  const visibilityElement = document.getElementById("visibility-value");
  const weatherIconElement = document.getElementById("weatherIcon");
  const weatherBehaviorElement = document.getElementById("weatherBehavior");

  if (cityElement) {
    cityElement.textContent = data.name;
  } else {
    console.error("City element not found.");
  }

  if (temperatureElement) {
    temperatureElement.textContent = Math.round(data.main.temp) + "°C";
  } else {
    console.error("Temperature element not found.");
  }

  if (sunriseElement && sunsetElement) {
    const sunriseTime = new Date(data.sys.sunrise * 1000);
    const sunsetTime = new Date(data.sys.sunset * 1000);

    sunriseElement.textContent = sunriseTime.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
    });

    sunsetElement.textContent = sunsetTime.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
    });
  } else {
    console.error("Sunrise or sunset element not found.");
  }

  if (humidityElement) {
    humidityElement.textContent = data.main.humidity + "%";
  } else {
    console.error("Humidity element not found.");
  }

  if (windSpeedElement) {
    windSpeedElement.textContent = data.wind.speed + " km/s";
  } else {
    console.error("Wind speed element not found.");
  }

  if (feelsLikeElement) {
    feelsLikeElement.textContent = Math.round(data.main.feels_like) + "°C";
  } else {
    console.error("Feels like element not found.");
  }

  if (visibilityElement) {
    visibilityElement.textContent = data.visibility + " meters";
  } else {
    console.error("Visibility element not found.");
  }

  if (weatherIconElement) {
    // Set the source of the weather icon based on the weather behavior
    const weatherIcon = data.weather[0].icon;
    weatherIconElement.src = `./assets/images/weather_icons/${weatherIcon}.png`;
  } else {
    console.error("Weather icon element not found.");
  }

  if (weatherBehaviorElement) {
    const weatherBehavior = data.weather[0].description;
    weatherBehaviorElement.textContent = weatherBehavior;
  } else {
    console.error("Weather behavior element not found.");
  }
}

// Function to update the UI with forecast data
function updateForecastUI(data) {
  const weeklyUpdatesContainer = document.querySelector(".weekly-updates");

  if (!weeklyUpdatesContainer) {
    console.error("Weekly updates container not found.");
    return;
  }

  // Clear existing forecast content
  weeklyUpdatesContainer.innerHTML = "";

  // Extract relevant forecast data (e.g., temperature, icon, description) and update the UI
  const dailyForecasts = groupForecastByDay(data.list);

  dailyForecasts.forEach((forecast) => {
    const date = new Date(forecast[0].dt * 1000);
    const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "short" });

    const averageTemperature =
      forecast.reduce((sum, entry) => sum + entry.main.temp, 0) /
      forecast.length;

    // Move weatherDescription definition outside the loop
    let weatherDescription;

    // Check if the weather array is present before accessing the description
    if (forecast[0].weather && forecast[0].weather.length > 0) {
      weatherDescription = forecast[0].weather[0].description;
    } else {
      weatherDescription = "N/A";
    }

    const weatherIcon = forecast[0].weather[0].icon;

    const forecastElement = document.createElement("div");
    forecastElement.classList.add("weekdays");
    forecastElement.innerHTML = `
      <h3>${dayOfWeek}</h3>
      <div id="temp-behaviour">
        <span class="wekkly-temp">
          <p>${Math.round(averageTemperature)}°C</p>
          <img src="./assets/images/weather_icons/${weatherIcon}.png" width="40" height="40" />
        </span>
        <p>${weatherDescription}</p>
      </div>
    `;

    weeklyUpdatesContainer.appendChild(forecastElement);
  });
}

// Helper function to group forecast entries by day
function groupForecastByDay(forecastList) {
  const dailyForecasts = [];
  const groupedForecasts = {};

  forecastList.forEach((entry) => {
    const date = new Date(entry.dt * 1000);
    const day = date.toISOString().split("T")[0];

    if (!groupedForecasts[day]) {
      groupedForecasts[day] = [];
    }

    groupedForecasts[day].push(entry);
  });

  // Convert grouped forecasts to an array
  for (const day in groupedForecasts) {
    if (Object.hasOwnProperty.call(groupedForecasts, day)) {
      dailyForecasts.push(groupedForecasts[day]);
    }
  }

  return dailyForecasts;
}

// Function to check default weather
async function checkWeather() {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=YOUR_DEFAULT_CITY&units=metric&appid=${apikey}`
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();

    const cityElement = document.querySelector(".city");

    if (cityElement) {
      cityElement.textContent = data.name;
    } else {
      console.error("City element not found.");
    }

    const temperatureElement = document.getElementById("heading");
    const sunriseElement = document.querySelector(".sun-rise p");
    const sunsetElement = document.querySelector(".sun-set p");
    const windSpeedElement = document.getElementById("wind-speed-value");

    if (
      temperatureElement &&
      sunriseElement &&
      sunsetElement &&
      windSpeedElement
    ) {
      temperatureElement.textContent = Math.round(data.main.temp) + "°C";

      const sunriseTime = new Date(data.sys.sunrise * 1000);
      const sunsetTime = new Date(data.sys.sunset * 1000);

      sunriseElement.textContent = sunriseTime.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
      });

      sunsetElement.textContent = sunsetTime.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
      });

      windSpeedElement.textContent = data.wind.speed + " m/s";
    } else {
      console.error(
        "Temperature, sunrise, sunset, or wind speed element not found."
      );
    }
  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
}

checkWeather();
