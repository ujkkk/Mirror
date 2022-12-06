const client = require("./faceRecognition/mqtt");
const _db = require('./mirror_db');
const loading = require("./faceRecognition/loading");

let loginBtnFlag = false;
let signUpBtnFlag = false;

let btn; // 눌린 버튼 정보 저장
let btnText="";

client.subscribe(`${mirrorDB.getId()}/error`); // face not found를 위한 토픽 : "error"
client.on('message', (topic, message, packet) =>{
   if(topic == `${mirrorDB.getId()}/error`){
       var msg = String(message);
       const warningText = "Face Not Found";
        console.log("error 도착")
       if(loginBtnFlag){ // Login 버튼을 눌렀는데 얼굴이 안 보일 경우
           btn = document.getElementById("loginBtn");
           btnText = "Login";
           loginBtnFlag = false;
           console.log("1도착")
       }
       else if(signUpBtnFlag){ // Sign Up 버튼을 눌렀는데 얼굴이 안 보일 경우
           btn = document.getElementById("signUpBtn");
           btnText = "Sign Up";
           signUpBtnFlag = false;
           console.log("2 도착")
       }

       if(msg == "notFound"){ // 그 버튼에 Error 문구 띄우기
           btn.textContent  = warningText;
           console.log("3 도착")
           btn.setAttribute("style", "color: red; border: solid 3px red; box-shadow: 0 0 25px red;");
       }
       else { // 얼굴을 찾았을 경우 버튼 복구
           btn.textContent = btnText;
           console.log("4 도착")
           btn.setAttribute("style", "color: white; border: solid 2px white;");
       }
   }
})

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