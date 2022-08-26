// 엘리먼트 알아내기
const time_ui = document.querySelector('#time');
const date_ui = document.querySelector('#date');

// 시간
function getTime(){
    const time = new Date();
    var month = time.getMonth();
    var date = time.getDate();
    var day = time.getDay();
    var mon = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    var week = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];

    const hour = time.getHours();
    const minutes = time.getMinutes();
    time_ui.innerHTML = `${hour<10 ? `0${hour}`:hour}:${minutes<10 ? `0${minutes}`:minutes}`;
    date_ui.innerHTML = `${week[day]}, ${date} ${mon[month+1]} `;
}

// refresh
function init(){
    setInterval(getTime, 1000);
}

init();