const mqtt = require('mqtt')
const serverMqttClient = require('./mqtt')
const keyboardTarget = require('./new_keyboard_module/keyboard')

/* Section1. 변수 및 모달 관련 */
console.log("new_callbook에 들어옴")
/* HTML UI */
let mirror_db = require('./mirror_db');
let callBookBtn = document.getElementById("bar_callbook_button");
let modal = document.getElementById('callbook-modal');
let friendList = document.getElementById("friend-list");
let findFriend = document.getElementById("find-friend");
let serachFriendDiv = document.getElementById("search-friend-div");
let ul = document.getElementById('callbook-otherUserList');
let searchBtn = document.getElementById('search-btn');
let addFriendBtn =  document.getElementById('add-friend-btn');
let userImg = document.getElementById("user-img");
let searchInput = document.getElementById("serach-input");
let isCallBtnClicked = false; // 연락처 바 아이콘 클릭 확인

/* ADD Event Listener */
callBookBtn.addEventListener("click",function(e){showUserMirrorBook(e)});
friendList.addEventListener("change",function(e){showUserMirrorBook(e)});
findFriend.addEventListener("change",function(e){showUserMirrorBook(e)});
searchBtn.addEventListener('click',userCheck);
addFriendBtn.addEventListener("click",addFriendDB);
searchInput.addEventListener('click', function(e){showKeyboard(e)});

/* 친구 추가 관련 Variable */
let add_name = null;
let add_id = null;
let delete_id =null;
let delete_name = null;
let id =null;

/* 모달 동작 함수 */
function modalOn() {
    modal.style.display = "flex"
}
function isModalOn() {
    return modal.style.display === "flex"
}
function modalOff() {
    hideKeyboard();
    modal.style.display = "none"
    isClicked = false;
    isCallBtnClicked = false;
    friendList.checked = true;
}

const closeBtn = modal.querySelector(".close-area")
closeBtn.addEventListener("click", e => {
    modalOff();
})

/* Section2. stt 위한 MQTT 사용 */

/* mqtt 브로커 연결 및 topic subscribe */
const options = { // 브로커 정보(ip, port)
    host: '127.0.0.1',
    port: 1883
}

const mqttClient = mqtt.connect(options) // mqtt broker 연결
mqttClient.subscribe('callbook_request')

mqttClient.on('message', function (topic, message) { // 메시지 받았을 때 callback
    console.log("메시지 받았을 때 - 연락처")
    if (topic.toString() == 'callbook_request') { // 전화 호출
        modal.style = 'display: flex'
        callBookBtn.click()
    }
})

/* Section3. 연락처 관련 동작 */

serverMqttClient.on('message', async (topic, message, packet) => {
    var contents = null;
    // console.log(`message is ${message}`);
    // console.log(`topic is ${topic}`);
  
    //서버로 요청한 값 subscribe - 검색한 사용자 정보
    if (topic == `${mirrorDB.getId()}/check/user/exist`) {
     
        // FIXME - 데이터 파싱 : 
        data = JSON.parse(message); 
        
        // TODO : 있는 사용자일 때 -> 사용자 정보 연결해줘야함
        console.log("사용자 검색 결과( 1:있음, 2:없음 ) : "+data.status)

        if(data.status == 1){
            userImg.style.visibility="visible";
            addFriendBtn.style.visibility = "visible";
            document.getElementById('user-img').style.display = "block";
            document.getElementById('add-friend-btn').style.display = "inline-block";
            document.getElementById('find-result').innerHTML = `${data.result.name}`
            document.getElementById('find-result').style.marginTop = "10px";
            add_id =  data.result.id;
            add_name = data.result.name;
            console.log("여기 들어옴!!!!"+add_name);
        }
        else{ // TODO : 없는 사용자일 때
            document.getElementById('find-result').style.marginTop = "50px";
            document.getElementById('find-result').innerHTML = "존재하지 않는 사용자입니다."
            add_id = null;
            add_name = null;
            console.log("친구가 존재하지 않음!!");
        }
     
    }
  
  })
  


function showUserMirrorBook(e){
    console.log("연락처 클릭됨 :"+ e.target)
    if (e.type == "click"){
        if (isCallBtnClicked == false){
            isCallBtnClicked = true;
        }
        else {
            modalOff();
            return;
        }
    }
    modal.style.display="flex";
    modal.style.visibility = "visible";
    ul.innerHTML = "";
    document.getElementById('serach-input').value = "";
    document.getElementById('find-result').innerHTML = "";
    document.getElementById('user-img').style.display = "none";
    document.getElementById('add-friend-btn').style.display = "none";
   
    if(friendList.checked == true){
        ul.style.display = "block";                                                                                             
        serachFriendDiv.style.visibility = "hidden";
        document.getElementById("callbook-inside-selected").style.visibility = "visible";
        document.getElementById("callbook-outside-selected").style.visibility = "hidden";
        mirror_db.select('friend_id, name','friend',`id=${mirror_db.getId()}`)
        .then(value => { // users에 값 넣기
                for (let k = 0; k < value.length; k++) {
                    let li = document.createElement("li");
                    li.style.width = "85%";
                    li.style.margin = "0 auto";
                    li.style.color="white";
                    li.style.border="none";
                    li.style.borderRadius="5px";
                    li.style.marginBottom = "5px";
                    li.style.fontWeight="bold";
                    li.style.fontSize="20px";
                    li.value=value[k].friend_id;
                    let deleteBtn = document.createElement("input");
                    deleteBtn.style.float="right";
                    deleteBtn.value ="✕";
                    deleteBtn.style.marginRight = "20px";
                    deleteBtn.type = "button";
                    deleteBtn.addEventListener("click",e=>{deleteUser(e)});
                    const textNode = document.createTextNode(value[k].name);
                    const userImg = document.createElement("img");
                    userImg.setAttribute("src","./image/index/user.png");
                    userImg.setAttribute("width","30px");
                    userImg.setAttribute("height","30px");
                    userImg.style.marginLeft = "35px";
                    userImg.style.marginRight = "40px";
                    userImg.style.verticalAlign="middle";
                    li.appendChild(userImg);
                    li.appendChild(textNode);
                    li.appendChild(deleteBtn);
                    ul.appendChild(li);
                }   
            }
        )
        
    }

    else {
        serachFriendDiv.style.visibility = "visible";
        ul.style.display = "none";
        document.getElementById("callbook-inside-selected").style.visibility = "hidden";
        document.getElementById("callbook-outside-selected").style.visibility = "visible";

    }
}

function userCheck(){
    hideKeyboard();
    document.getElementById('user-img').style.display = "none";
    document.getElementById('add-friend-btn').style.display = "none";
   
    let friend_id = document.getElementById('serach-input').value;
    if(friend_id == null || friend_id=='')
        return;

    if(friend_id  == mirror_db.getId()){
        console.log('본인이 본인 검색');
        document.getElementById('find-result').innerHTML = `<h3>본인 입니다.</h3>`;
        return;
    }

    //친구 목록에 있는지 확인
    mirror_db.select('*', 'friend', `friend_id=${friend_id} and id = ${mirror_db.getId()}`)
    .then(values =>{
        //친구목록에 이미 추가된 유저이면 추가 안함
        if(values.length>0){
            document.getElementById('find-result').innerHTML = "이미 등록된 유저입니다.";
            document.getElementById('find-result').style.marginTop = "50px";
            id = null
            add_id = null;
            add_name = null;
            console.log("이미 있는 유저임!!!!");
            return;
        }

        data = {
            sender:mirrorDB.getId(),
            id : friend_id               
        }
        
        // TODO: 친구목록에 없는 유저를 추가할 때 -> client publish
        serverMqttClient.publish("server/check/user/exist",JSON.stringify(data))

    })
}

//추가 버튼을 클릭하면 on
function addFriendDB(){
    console.log('add_id : ' +add_id +  ', add_name: ' +add_name);
    if(add_id != null && add_name != null){
        var data = {id: mirror_db.getId(), name: add_name, friend_id : add_id};
        mirror_db.createColumns('friend', data)
        .then(result => {
            userImg.style.visibility="hidden";
            addFriendBtn.style.visibility = "hidden";
            if (result) {
                // userImg.style.visibility="hidden";
                // addFriendBtn.style.visibility = "hidden";
                document.getElementById('find-result').innerHTML = "추가 되었습니다."
                document.getElementById('find-result').style.marginTop = "-50px";
                // getUserInfo();
                add_id = null;
                add_name =null;
            }
            else {
                reject(null);
                document.getElementById('find-result').innerHTML = "추가 하지 못헀습니다."
                document.getElementById('find-result').style.marginTop = "-50px";
            }
        });
        
    }
    else{
        userImg.style.visibility="hidden";
        addFriendBtn.style.visibility = "hidden";
        document.getElementById('find-result').innerHTML = "추가할 수 없습니다.";
        document.getElementById('find-result').style.marginTop = "-50px";
    }
}

function deleteUser(e){
    delete_id = e.target.parentNode.value;
    delete_name =e.target.previousSibling.nodeValue;
    console.log(`delete_id = ${delete_id}`);
    console.log(`delete_name = ${delete_name}`);
    if(delete_id != null){
        if (confirm(`'${delete_name}'님을 삭제 하시겠습니까?`)) {
            mirror_db.delete('friend', `id = ${mirror_db.getId()} && friend_id = ${delete_id}`)
            .then(value =>{
                //테이블 갱신
                isCallBtnClicked = false;
                callBookBtn.click();
                // showUserMirrorBook();
                delete_id = null;
                delete_name = null;
            })
            return;
        } else {
            return;
        }
    }
    delete_id = null;
    delete_name = null;
}

function showKeyboard(e){
    keyboardTarget.setCurrentTarget(e.target.id);
    keyboardTarget.keyboard.style.display="block";
}

function hideKeyboard(){
    keyboardTarget.setCurrentTarget(null);
    keyboardTarget.keyboard.style.display="none";
}