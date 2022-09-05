function changeCursor(event){
    console.log("pageX: ",event.pageX, 
    "pageY: ", event.pageY, 
    "clientX: ", event.clientX, 
    "clientY:", event.clientY)

    console.log("ScreenX: ",screen.width,
    "ScreeY: ", screen.height)

}

//window.addEventListener('mousemove', mousemove);

let mouseCursor = document.querySelector(".cursor");
  //window 객체에 scroll & mouse 이벤트를 추가하고 cursor함수 실행되도록 함
//window.addEventListener("scroll", cursor);
window.addEventListener("click", cursor, true);
//mouseCursor.addEventListener('mousemove',changeCursor )
  //커스텀 커서의 left값과 top값을 커서의 XY좌표값과 일치시킴
function cursor(e) {
    var ratio = screen.width/screen.height;
    mouseCursor.style.top = e.clientX *(1/ratio)+ "px";
    mouseCursor.style.left = screen.width - e.clientY*(ratio) + "px";

    console.log(" 1. e.clientX: ",  e.clientX)
    e.clientX= e.clientX *(1/ratio)
    e.clientY= screen.width - e.clientY*(ratio) 

     
    console.log(" 2. e.clientX: ",  e.clientX)
    console.log("top: ", mouseCursor.style.top ,
    "left : ", mouseCursor.style.left);

    console.log("ScreenX: ",screen.width,
    "ScreeYX: ", screen.height);

}