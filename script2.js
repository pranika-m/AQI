const errorLabel = document.querySelector("label[for='error-msg']");
const cityInp = document.querySelector("#city");
const airQuality = document.querySelector(".air-quality");
const airQualityStat = document.querySelector(".air-quality-status");
const srchBtn = document.querySelector(".search-btn");
const componentsEle = document.querySelectorAll(".component-val");

const appId = "e32907dd8471ce90dac3f1e227b5a55a"; // Use your actual API Key
const geoLink = "https://api.openweathermap.org/geo/1.0/direct";
const airLink = "https://api.openweathermap.org/data/2.5/air_pollution";

const getCityCoordinates = async (city) => {
    const country = "IND"; // Hardcoded country code for India
    const url = `${geoLink}?q=${city},${country}&appid=${appId}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.length === 0) {
            throw new Error("City not found");
        }
        return { lat: data[0].lat, lon: data[0].lon };
    } catch (error) {
        onPositionGatherError({ message: "Failed to fetch location data." });
        console.error(error);
    }
};

const getAirQuality = async (lat, lon) => {
    try {
        const url = `${airLink}?lat=${lat}&lon=${lon}&appid=${appId}`;
        const response = await fetch(url);
        const data = await response.json();
        if (!data || !data.list) {
            throw new Error("Air quality data not available");
        }
        setValuesOfAir(data);
        setComponentsOfAir(data);
    } catch (error) {
        onPositionGatherError({ message: "Something went wrong. Check your internet connection." });
        console.error(error);
    }
};

const searchAirQuality = async () => {
    const city = cityInp.value.trim();
    if (city === "") {
        onPositionGatherError({ message: "Please enter a city name." });
        return;
    }
    const coords = await getCityCoordinates(city);
    if (coords) {
        await getAirQuality(coords.lat, coords.lon);
    }
};

srchBtn.addEventListener("click", searchAirQuality);

const onPositionGatherError = (error) => {
    errorLabel.innerText = error.message;
    errorLabel.style.display = "block"; // Make sure to show the error label if it's hidden
};

const setValuesOfAir = (airData) => {
    const aqi = airData.list[0].main.aqi;
    airQuality.innerText = aqi;
    let airStat = "", color = "";

    switch (aqi) {
        case 1:
            airStat = "Good";
            color = "green";
            break;
        case 2:
            airStat = "Fair";
            color = "yellow";
            break;
        case 3:
            airStat = "Moderate";
            color = "orange";
            break;
        case 4:
            airStat = "Poor";
            color = "red";
            break;
        case 5:
            airStat = "Very Poor";
            color = "maroon";
            break;
        default:
            airStat = "Unknown";
            color = "gray";
            break;
    }

    airQualityStat.innerText = airStat;
    airQualityStat.style.color = color;
};


const setComponentsOfAir = (airData) => {
    const components = airData.list[0].components;
    componentsEle.forEach(ele => {
        const attr = ele.getAttribute('data-comp');
        const pollutantNameMap = {
            co: "Carbon Monoxide",
            no: "Nitrogen Monoxide",
            no2: "Nitrogen Dioxide",
            o3: "Ozone",
            so2: "Sulphur Dioxide",
            pm2_5: "Fine Particles Matter",
            pm10: "Coarse Particulate Matter"
        };
        const pollutant = pollutantNameMap[attr] || "Unknown Pollutant";
        const value = components[attr] ? `${components[attr]} μg/m³` : "Data unavailable";
        ele.innerText = `${pollutant}: ${value}`;
    });
};

