const key = 'c4210b6e0e1aba39c98584f4f2a64f0d'
let city = 'seoul'
let description, icon;

const getJSON = function(url, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
        const status = xhr.status;
        if(status === 200) {
        callback(null, xhr.response);
        } else {
        callback(status, xhr.response);
        }
    };
    xhr.send();
};

// //좌표를 물어보는 함수 
// function askForCoords() {
//     navigator.geolocation.getCurrentPosition(handleSuccess, handleError);
//     console.log('ok');
// }

// //좌표를 얻는데 성공했을 때 쓰이는 함수 
// function handleSuccess(position) {
//     const latitude = position.coords.latitude;
//     const longitude = position.coords.longitude;
//     const coordsObj = {
//         latitude,
//         longitude
//     };
//     getWeather(latitude, longitude); //얻은 좌표값을 바탕으로 날씨정보를 불러온다.
//     console.log(latitude+": "+longitude);
// }

// //좌표를 얻는데 실패했을 때 쓰이는 함수 
// function handleError() {
//     console.log("can't not access to location");
// }

// askForCoords();

const getWeather = function() {
    getJSON('http://api.openweathermap.org/data/2.5/weather?q='+city+'&appid='+key+'&units=metric',
function(err, data) {
    if(err !== null) {
    alert('예상치 못한 오류 발생.' + err);
    } else {
        let temperature = data.main.temp;
        let feels_temp = data.main.feels_temp;
        let humidity = data.main.humidity;
        let temp_min = data.main.temp_min;
        let temp_max = data.main.temp_max;

        let wind_speed = data.wind.wind_speed;
        let clouds = data.clouds.all;

        var currentIcon = document.getElementById("icon");
        icon = data.weather[0].icon;
        var iconImg = `http://openweathermap.org/img/wn/${icon}@2x.png`;

        var currentDiv = document.getElementById("weather");
        
        currentDiv.innerText = `${temperature} °C / ${humidity}% / ${data.weather[0].description}`;
        currentIcon.setAttribute('src', iconImg);

    }
});
}
getWeather();

module.exports = function() {
    //var selectBox = document.getElementById("city");
    //city = selectBox.options[selectBox.selectedIndex].value;
    getWeather();
};