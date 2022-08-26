const time_ui = document.querySelector('#time');
const second_ui = document.querySelector('#second');

function getTime(){
    const time = new Date();
    const hour = time.getHours();
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();
    time_ui.innerHTML = `${hour<10 ? `0${hour}`:hour}:${minutes<10 ? `0${minutes}`:minutes}`;
    second_ui.innerHTML = `${seconds<10 ? `0${seconds}`:seconds}`;
}


function init(){
    setInterval(getTime, 1000);
}

init();