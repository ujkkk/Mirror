/* Section1. 필요한 모듈 require */

const dbAccess = require('../mirror_db.js')
const mqtt = require('mqtt');
const { default: axios } = require('axios');


/* Section2. 변수 초기화 및 이벤트 리스너 추가 */

let currentMsg = ""; // 현재(전송할) 메시지
let users = [{}]; // 다른 사용자 DB (User Table) 정보([{user_id, name}])
let isAddableDB = true; // 메모를 DB에 추가할 수 있는지 여부
let ul = document.getElementById('otherUserList'); // 전송할 사용자 목록
let modal = document.getElementById('modal');
let blurEffectObjs = document.getElementsByClassName("blur_effect");
document.getElementById("apply").addEventListener("click",submitMemo); // 전송 버튼
document.getElementById("cancle").addEventListener("click",setIsAddableDB); // 닫기 버튼
let inside = document.getElementById("inside");
inside.addEventListener("change",showOtherUsers);
let outside = document.getElementById("outside");
outside.addEventListener("change",showOtherUsers);
/* Section3. mqtt 브로커 연결 및 topic subscribe */

const options = { // 브로커 정보(ip, port)
    host: '127.0.0.1',
    port: 1883
};

let isClicked = false; // 전송버튼 누름

const client = mqtt.connect(options); // mqtt broker 연결
client.subscribe('create_memo'); //토픽 구독(처음 메모 생성)
client.subscribe('memo_content'); // 토픽 구독(남길 메모 내용)

client.on('message', function (topic, message) { // 메시지 받았을 때 callback
    if (topic.toString() == 'create_memo') { // 메모 생성 직후
        
        document.getElementById("memo").style.visibility = "visible";
        document.getElementById('callImg').style.visibility = "visible";
        
        document.getElementsByClassName("blur_effect")[0].style.filter =  "blur(5px)";     
        document.getElementsByClassName("blur_effect")[1].style.filter =  "blur(5px)";    

        document.getElementById("memoDiv").style.visibility = "hidden";
        document.getElementById("memo").innerHTML = '남길 메모를 말해주세요';
        isAddableDB = true;
    }
    else if (topic.toString() == 'memo_content') { // 사용자가 남길 메모 말했을 때
        if (isAddableDB == true){ // DB에 넣을 수 있는지 여부 확인
           /* UI 설정 */
            document.getElementById('callImg').style.visibility = "hidden";
            document.getElementById('memoDiv').style.visibility = "visible";
            document.getElementById("memo").style.visibility = "visible";
            document.getElementById("memo").innerHTML = `메모 내용: \"${message.toString()}\"`;
            
            /* 현재 user DB에 insert */
            const contents = message.toString();
            currentMsg = message.toString(); //..필요할까 고민...
            const store = 0; 
            dbAccess.addMemo(dbAccess.userId, null, contents, store);
            isAddableDB = false; // 전송이나 취소 버튼을 누를 때까지 db insert 못함
        }
    }
});


/* Section4. 전송 버튼 및 닫기 버튼 공통 기능 */

function setIsAddableDB(){ // 메모를 DB에 추가할 수 있는지 여부 설정
    isAddableDB = true;
    document.getElementsByClassName("blur_effect")[0].style.filter =  "blur(0px)";       
    document.getElementsByClassName("blur_effect")[1].style.filter =  "blur(0px)";    
    document.getElementById("memoDiv").style.visibility = "hidden";
    document.getElementById("memo").innerHTML = "";
    document.getElementById("memo").style.visibility = "hidden";
    isClicked = false;
    modalOff();
}


/* Section5. 전송 버튼 클릭 시 기능 */

let index;
// User DB 접근 및 users 초기화
function submitMemo(){ 
    
    let startOtherIndex;
    let checkConnectedUser = [];

    if(isClicked == false){
        isClicked = true;
        dbAccess.select('user_id, name', 'user', `user_id <> ${dbAccess.userId}`) // 현재 사용자가 아닌 다른 사용자 User DB 정보 불러오기
            .then(value => { // users에 값 넣기
                    let i=0;
                    for (i = 0; i < value.length; i++) { // 미러내 유저
                        users[i] = { "user_id":value[i].user_id, "name":value[i].name, "connect":0};
                    } 
                    
                    startOtherIndex = i;
                    index = i;

                    dbAccess.select('id, name','friend','id <> 22')
                    .then(value => { // users에 값 넣기
                            for (let k = 0; k < value.length; k++,i++) {
                                users[i] = { "id":value[k].id, "name":value[k].name,"connect":0};
                                checkConnectedUser[k] = users[i].id;
                            }   
                        }
                    )
                    .then(()=>{
                        axios({
                            method:'post',
                            url:'http://localhost:9000/connect/user',
                            data: {
                                userData:checkConnectedUser
                            }
                        })
                        .then(response=>{
                            let results = response.data.result;
                            for(let i=0;i<results.length;i++,startOtherIndex++){
                                if (users[startOtherIndex].id == results[i].user)
                                    users[startOtherIndex].connect = results[i].connect;
                            }
                            showOtherUsers();
                        })
                    })
                    .catch(
                        ()=>{
                            showOtherUsers();
                        }
                    ); 
                }
            );
    }
}


// 메모 전송 가능한 user 목록 보여주기
function showOtherUsers(){ 
    modal.style.visibility = "visible";
    console.log("showOtherUsers 호출됨");
    while (ul.hasChildNodes()) { // UI 초기화
        ul.removeChild(ul.firstChild);
    } 
    // 만약 checked 된게 inside 면 -> user index 0 부터, startIndex 전까지
    if(inside.checked == true){
        console.log("hello");
        document.getElementById("inside-selected").style.visibility = "visible";
        document.getElementById("outside-selected").style.visibility = "hidden";
        for(let i=0;i<index;i++){
            let li = document.createElement("li");
            const textNode = document.createTextNode(users[i].name);
            const userImg = document.createElement("img");
            userImg.setAttribute("src","./image/index/user.png");
            userImg.setAttribute("width","25px");
            userImg.setAttribute("height","25px");
            userImg.style.marginLeft = "35px";
            userImg.style.marginRight = "40px";
            userImg.style.verticalAlign="middle";
            li.appendChild(userImg);
            li.appendChild(textNode);
            li.addEventListener("click",  function(){insertOtherUserDB(users[i])}); // 각각의 li에 add onclick listener
            ul.appendChild(li);

            const isConnect = document.createElement("p");
            const circle = document.createElement("div");
            
            circle.style.display="inline-block";
            circle.style.marginLeft = "10px";
            circle.style.borderRadius = "50%";
            circle.style.width = "10px";
            circle.style.height = "10px";
            circle.style.backgroundColor = "gray";

            isConnect.style.display = "inline-block";
            isConnect.style.fontSize = "15px";
            isConnect.innerHTML = "Offline";
            isConnect.style.float = "right"
            isConnect.style.marginTop = "3px";
            isConnect.style.marginRight = "100px";
            isConnect.appendChild(circle);

            li.appendChild(isConnect);
        }
    }
    else {
        console.log("startOtherIndex : "+index);
        document.getElementById("inside-selected").style.visibility = "hidden";
        document.getElementById("outside-selected").style.visibility = "visible";
        for(let i=index;i<users.length;i++){
            let li = document.createElement("li");
         
            const textNode = document.createTextNode(users[i].name);
            const userImg = document.createElement("img");
            userImg.setAttribute("src","./image/index/user.png");
            userImg.setAttribute("width","25px");
            userImg.setAttribute("height","25px");
            userImg.style.marginLeft = "35px";
            userImg.style.marginRight = "40px";
            userImg.style.verticalAlign="middle";
            
            li.appendChild(userImg);
            li.appendChild(textNode);
            if (users[i].connect == 1){
                const isConnect = document.createElement("p");
                const circle = document.createElement("div");
                
                circle.style.display="inline-block";
                circle.style.marginLeft = "10px";
                circle.style.borderRadius = "50%";
                circle.style.width = "10px";
                circle.style.height = "10px";
                circle.style.backgroundColor = "green";

                isConnect.style.display = "inline-block";
                isConnect.style.fontSize = "15px";
                isConnect.innerHTML = "Online";
                isConnect.style.float = "right"
                isConnect.style.marginTop = "3px";
                isConnect.style.marginRight = "100px";
                isConnect.appendChild(circle);

                li.appendChild(isConnect);
            }
            else {
                const isConnect = document.createElement("p");
                const circle = document.createElement("div");
                
                circle.style.display="inline-block";
                circle.style.marginLeft = "10px";
                circle.style.borderRadius = "50%";
                circle.style.width = "10px";
                circle.style.height = "10px";
                circle.style.backgroundColor = "gray";

                isConnect.style.display = "inline-block";
                isConnect.style.fontSize = "15px";
                isConnect.innerHTML = "Offline";
                isConnect.style.float = "right"
                isConnect.style.marginTop = "3px";
                isConnect.style.marginRight = "100px";
                isConnect.appendChild(circle);

                li.appendChild(isConnect);
            }
            li.addEventListener("click",  function(){insertOtherUserDB(users[i])}); // 각각의 li에 add onclick listener
            ul.appendChild(li);
        }
    }
}

// 선택한 사용자 DB에 메모 insert
function insertOtherUserDB(user){ 
    let contents = currentMsg;
    
    /* 다른 미러 내 사용자 */
    axios({
        method:'post',
        url:'http://localhost:9000/send/text',
        data: {
            sender: 1001,
            receiver: user.id,
            content: contents
        }
    });

    while (ul.hasChildNodes()) { // UI 초기화
        ul.removeChild(ul.firstChild);
    } 
    setIsAddableDB();
}



//modal 관련 js
function modalOn() {
    modal.style.display = "flex"
}
function isModalOn() {
    return modal.style.display === "flex"
}
function modalOff() {
    modal.style.display = "none"
}

const closeBtn = modal.querySelector(".close-area")
closeBtn.addEventListener("click", e => {
    modalOff();
})

