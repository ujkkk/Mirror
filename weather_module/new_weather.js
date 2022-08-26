/* weather.js */

// openweathermap API key
const key = 'c4210b6e0e1aba39c98584f4f2a64f0d'

// 위치(도시) 설정
let city = 'seoul'

// weather icon을 다른 icon(erikflowers icon)으로 변경하기 위한 icon 배열
let weatherIcon = {
    '01': 'wi wi-day-sunny',
    '02': 'wi wi-day-cloudy',
    '03': 'wi wi-cloud',
    '04': 'wi wi-cloudy',
    '09': 'wi wi-showers',
    '10': 'wi wi-day-rain',
    '11': 'wi wi-thunderstorm',
    '13': 'wi wi-snow',
    '50': 'wi wi-fog',
};

// 날씨 api json 파일 읽어와서 json 파일을 통해 날씨 정보 알아내기
const setWeather = function (err, data) {
    if (err !== null) {
        alert('예상치 못한 오류 발생.' + err);
    } else {
        var iconValue = (data.weather[0].icon).substr(0, 2);
        let icon = document.createElement('i');
        icon.className = weatherIcon[iconValue];

        document.getElementById("weather_icon").append(icon);
        document.getElementById("temp").innerText = `${Math.round(data.main.temp)}°`;
    }
}

// api url에서 json을 받아오는 코드
const getJSON = function (url) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function () {
        const status = xhr.status;
        if (status === 200) {
            setWeather(null, xhr.response);
        } else {
            setWeather(status, xhr.response);
        }
    };
    xhr.send();
};

// openweathermap api 설정 
const getWeather = function () {
    console.log('getWeather');
    getJSON('http://api.openweathermap.org/data/2.5/weather?q=' + city + '&appid=' + key + '&units=metric&lang=kr');
}

/*
//좌표를 물어보는 함수 
function askForCoords() {
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError);
    console.log('ok');
}

//좌표를 얻는데 성공했을 때 쓰이는 함수 
function handleSuccess(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const coordsObj = {
        latitude,
        longitude
    };
    getWeather(latitude, longitude); //얻은 좌표값을 바탕으로 날씨정보를 불러온다.
    console.log(latitude+": "+longitude);
}

//좌표를 얻는데 실패했을 때 쓰이는 함수 
function handleError() {
    console.log("can't not access to location");
}

askForCoords();
*/

module.exports = getWeather();