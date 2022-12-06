const client = require("./faceRecognition/mqtt");
const _db = require('./mirror_db');
const loading = require("./faceRecognition/loading");



 // face not found를 위한 토픽 : "error"
// client.on('message', (topic, message, packet) =>{
   
// })

// Login 버튼을 눌렀을 때
function login(){
    loading.loading();
    loginBtnFlag = true;
    client.publish(`${_db.getMirror_id()}/login/camera`,String(_db.getMirror_id())); // 로그인 시작
}

// Sign Up 버튼을 눌렀을 때
function signUp(){
   loading.loading(); // 로딩 시작
   signUpBtnFlag = true;
   document.location.href = './faceRecognition/sign_up.html'
//   document.getElementById("loginMessage").innerHTML = "등록된 사용자인지 확인하는 중입니다..."

   //카메라에게 사진을 찍으라고 토픽보냄
 //  client.publish('exist/camera', String(_db.getMirror_id())) // 이미 가입한 회원인지 확인
}

// Delete 버튼을 눌렀을 때
function deleteUser(){
   document.location.href = 'faceRecognition/delete.html'
}

//재학습 시키기
function model(){
   client.publish(`reTrain`, String(_db.getMirror_id()))
}


function createMessage(user){
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