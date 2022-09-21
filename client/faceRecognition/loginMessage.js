
function createLoginMessage(user){
    var loginMessageDiv = document.getElementById("loginMessage");
    loginMessageDiv.innerHTML=""
    //이미지 생성
    if(user != 0){
        loginMessageDiv.innerHTML="<h3><span style='color:#789fa3;'>" + user + "</span>님 환영합니다.</h3>";
    }
    else{
        loginMessageDiv.innerHTML="<h3>등록된 사용자가 아닙니다.</h3>";
        loginMessageDiv.setAttribute("style","color: red;");
    }
}

function createMessage(msg){

    // var loginMessageDiv = document.getElementById("loginMessage");
    // loginMessageDiv.innerHTML=  '<h3>' + msg + '</h3>'  
}


module.exports = {createLoginMessage, createMessage}
