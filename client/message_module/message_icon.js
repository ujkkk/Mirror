const bar_message_button = document.querySelector("#bar_message_button");
const message_memo_container = document.querySelector("#message_memo_container");
const write_button = document.querySelector("#write_button");
const back_button = document.querySelector("#back_button");
const text_content = document.querySelector("#text_content");
const image_content = document.querySelector("#image_content");
const record_content = document.querySelector("#record_content");
const textArea = document.getElementById('textArea');
textArea.addEventListener('click', function (e) { showKeyboard(e) });

const text = document.querySelector("#text");
const image = document.querySelector("#image");
const record = document.querySelector("#record");
const shutter_button = document.querySelector("#shutter_button");
const send_button = document.querySelectorAll('.send_button');

const send_modal = document.querySelector('#send-modal');
const send_ul = document.querySelector('#otherUserList');
const inside = document.querySelector('#inside');
const outside = document.querySelector('#outside');
const inside_selected = document.querySelector('#inside-selected');
const outside_selected = document.querySelector('#outside-selected');


const sttRefusalContainer = document.getElementById('stt-refusal-container')
const sttAlert = document.getElementById('stt-alert')

// const axios = require('axios');
const { write } = require("fs");
const CMUsers = require("../CMUserInfo");

const client = require("../message_module/message_mqtt");
const socket = require('../message_module/message_socket');
let record_obj = require('../message_module/record/new_m_record');

const mqtt = require('mqtt');
const dbAccess = require("../mirror_db");

// stt 실행 =======================================================================================
let customOption = false
let friendName
let setCMuser
let setCMFriend
let customFriend = null

console.log('message icon')

/* mqtt 브로커 연결 및 topic subscribe */
const options = { // 브로커 정보(ip, port)
    host: '127.0.0.1',
    port: 1883
}

const mqttClient = mqtt.connect(options) // mqtt broker 연결
mqttClient.subscribe('message_request')
mqttClient.subscribe('audio_message_request')
mqttClient.subscribe('image_request')


mqttClient.on('message', function (topic, message) { // 메시지 받았을 때 callback
    customFriend = null
    if (message.friendName == null) {
        customOption = false
    }
    else {
        friendName = message.friendName
        customOption = true
        setCMFriend = CMUsers.setCustromFriendList(friendName)
        setCMuser = CMUsers.setCustromUserList(friendName)

        setCMuser.then(user => {
            setCMFriend.then(friend => {
                console.log(`user value len: ${user.length}, ${friend.length} = ${user.length + friend.length}`)
                if (user.length + friend.length == 0) {
                    sttAlert.innerText = `${friendName}이를 찾을 수 없습니다`
                    sttRefusalContainer.style = 'display: block'
                    customOption = false
                    return;
                }
                else if (user.length + friend.length == 1) {
                    if (message_memo_container.style.display == "none") {
                        message_memo_container.style.display = "block"
                    }
                    if (user.length == 1) {
                        friendName = user[0].name
                        customFriend = { name: user[0].name, id: user[0].id, send_option: 0 }
                    }
                    else {
                        friendName = friend[0].name
                        customFriend = { name: friend[0].name, id: friend[0].id, send_option: 1 }
                    }
                    console.log(`이름은 ${friendName}`)
                    sttAlert.innerText = `${friendName}님에게 보낼 메시지를 입력바랍니다`
                    sttRefusalContainer.style = 'display: block'
                }
                else {
                    if (message_memo_container.style.display == "none") {
                        message_memo_container.style.display = "block"
                    }
                    sttAlert.innerText = `보낼 메시지를 입력바랍니다`
                    sttRefusalContainer.style = 'display: block'
                }
            })
        })
    }

    if (topic.toString() == 'message_request') {
        write_button.click()
    }
    else if (topic.toString() == 'audio_message_request') {
        write_button.click()
        record.click()

    }
    else if (topic.toString() == 'image_request') {
        write_button.click()
        image.click()
    }
})


// stt 실행 ======================================================================================

// message display ON/OFF
bar_message_button.addEventListener('click', () => {
    console.log('bar_message_button click!');
    document.querySelector("#textArea").value = "";
    if (message_memo_container.style.display == "none") {
        message_memo_container.style.display = "block";
        // text.style.display = "none";
        // image.style.display = "none";
        // record.style.display = "none";
        // document.getElementById('radio_container').style.display = "none";
        //init
        write_button.style.display = "block";
        back_button.style.display = "none";
        text_content.style.display = "none";
        image_content.style.display = "none";
        record_content.style.display = "none";
        // camera on
        client.publish('camera/on', "start");
    }
    else {

        if (customOption) {
            customFriend = null
            customOption = false
        }

        message_memo_container.style.display = "none";
        // camera off
        client.publish('camera/close', 'ok')
    }
})

write_button.addEventListener('click', showWrite);
back_button.addEventListener('click', showStore);
for (let i = 0; i < send_button.length; i++) {
    send_button[i].addEventListener('click', showSendModal);
}
inside.addEventListener('change', showUserBook);
outside.addEventListener('change', showUserBook);

shutter_button.addEventListener('click', () => {
    client.publish('capture/camera', "start");
});


//CMUsers.setCustromFriendList


function showSendModal() {
    hideKeyboard();
    console.log("showSendModal");
    if (customFriend != null) {
        liClickEvent({ id: customFriend.id, name: customFriend.name }, customFriend.send_option)
    }
    else {
        send_modal.style.visibility = "visible";
        showUserBook();
    }
}

const userSelect = document.getElementById('user-select')

function showUserBook() {

    if(inside.checked == true) {

        console.log('inside.checked == true');
        send_ul.innerHTML = "";
        inside_selected.style.visibility = 'visible';
        outside_selected.style.visibility = 'hidden';

        if (!customOption) {
            setCMuser = CMUsers.setCMUserList()
        }
        setCMuser.then(value => {
            console.log(`CMUSERS[0] :${value[0].id} `)
            for (let k = 0; k < value.length; k++) {
                let li = document.createElement("li");

                li.style.border = "none";
                li.value = value[k].friend_id;
                const textNode = document.createTextNode(value[k].name);
                const userImg = document.createElement("img");
                userImg.setAttribute("src", "./image/index/user.png");

                li.appendChild(userImg);
                li.appendChild(textNode);

                // connect UI
                if (value[k].connect == 1) {
                    const isConnect = document.createElement("p");
                    const circle = document.createElement("div");

                    circle.style.backgroundColor = "green";
                    isConnect.innerHTML = "Online";


                    isConnect.appendChild(circle);
                    li.appendChild(isConnect);
                }
                else {
                    const isConnect = document.createElement("p");
                    const circle = document.createElement("div");

                    circle.style.backgroundColor = "gray";
                    isConnect.innerHTML = "Offline";

                    isConnect.appendChild(circle);

                    li.appendChild(isConnect);
                }
                li.addEventListener('click', () => {
                    liClickEvent(value[k], 0)
                }); // end of addEventListener ...
                send_ul.appendChild(li);
            }
        })
    }

    else if (outside.checked == true) { // outside.checked == true
        send_ul.innerHTML = "";

        inside_selected.style.visibility = 'hidden';
        outside_selected.style.visibility = 'visible';
        if (!customOption) {
            setCMFriend = CMUsers.setFriendList()
        }

        setCMFriend.then(value => {
            console.log(`CMUSERS[0] :${value[0].id} `)
            for (let k = 0; k < value.length; k++) {
                let li = document.createElement("li");

                li.style.border = "none";
                li.value = value[k].friend_id;
                const textNode = document.createTextNode(value[k].name);
                const userImg = document.createElement("img");
                userImg.setAttribute("src", "./image/index/user.png");

                li.appendChild(userImg);
                li.appendChild(textNode);

                // connect UI
                if (value[k].connect == 1) {
                    const isConnect = document.createElement("p");
                    const circle = document.createElement("div");

                    circle.style.backgroundColor = "green";
                    isConnect.innerHTML = "Online";
                    isConnect.appendChild(circle);

                    li.appendChild(isConnect);
                }
                else {
                    const isConnect = document.createElement("p");
                    const circle = document.createElement("div");

                    circle.style.backgroundColor = "gray";
                    isConnect.innerHTML = "Offline";

                    isConnect.appendChild(circle);
                    li.appendChild(isConnect);
                }

                li.addEventListener('click', () => {
                    liClickEvent(value[k], 1)
                }); // end of addEventListener ...
                send_ul.appendChild(li);

            }
        })
    }
}

const liClickEvent = (value, send_option) => new Promise((resolve, reject) => {
    send_modal.style.visibility = "hidden";

    let sender = dbAccess.getId(); // 내 id
    let receiver = value.id; // 받는 사람 id
    let connect = value.connect;

    // 현재 시간 가져오기
    var newDate = new Date();
    var send_time = moment(newDate).format('YYYY-MM-DD HH:mm:ss');

    // text, image, audio 3개 중 어떤 경우인지 확인
    let type_check = 'text';
    if (image.checked == true) type_check = "image";
    else if (record.checked == true) type_check = "audio";

    let content = document.querySelector("#textArea").value;

    const data = { // 인자로 보낼 데이터
        sender: sender,
        receiver: receiver,
        content: content,
        type: type_check,
        send_time: send_time
    }
    if (send_option == 0) { // 미러 내 사용자
        if (type_check == "text") { // text 전송일 때
            // text 내용 받아오기
            dbAccess.createColumns('message', data)
        }
        else if (type_check == "image") { // image 전송일 때
            //서버로 메시지를 보내는 이벤트 publish
            client.publish('send/image', 'send');
            console.log("image send success");

            dbAccess.createColumns('message', data)
        }
        else { // audio 전송일 때
            var reader = new FileReader();
            reader.readAsDataURL(blob);

            reader.onloadend = function () {
                var base64 = reader.result;
                var base64Audio = base64.split(',').reverse()[0];

                var bstr = atob(base64Audio); // base64String

                dbAccess.createColumns('message', data)
            } // end of reader.onloadend ...

        } // end of else ...
    }
    //외부 사용자
    else {

        switch (type_check) {
            case 'text':
                let content = document.querySelector("#textArea").value;
                //online user
                if (connect) {
                    socket.emit('realTime/message', {
                        sender: sender,
                        receiver: receiver,
                        content: content,
                        type: 'text',
                        send_time: send_time
                    });
                    //offline user 
                } else {
                    axios({
                        url: 'http://localhost:9000/send/text', // 통신할 웹문서
                        method: 'post', // 통신할 방식
                        data: { // 인자로 보낼 데이터
                            sender: sender,
                            receiver: receiver,
                            content: content,
                            type: type_check,
                            send_time: send_time
                        }
                    }); // end of axios ...
                }
                break;
            case 'image':
                let img = document.getElementById('message-image')
                let c = document.createElement('canvas');
                let ctx = c.getContext('2d');
                c.width = 600;
                c.height = 400;
                ctx.drawImage(img, 0, 0, c.width, c.height);
                let base64String = c.toDataURL();
                if (connect) {
                    socket.emit('realTime/message', {
                        sender: sender,
                        receiver: receiver,
                        content: base64String,
                        type: 'image',
                        send_time: send_time
                    });
                } else {
                    axios({
                        url: 'http://localhost:9000/send/image', // 통신할 웹문서
                        method: 'post', // 통신할 방식
                        data: { // 인자로 보낼 데이터
                            receiver: receiver,
                            sender: sender,
                            content: base64String,
                            type: type_check,
                            send_time: send_time
                        }
                    });
                }
                break;
            case 'audio':
                var reader = new FileReader();
                var blob = record_obj.getBlob();
                console.log(blob);
                reader.readAsDataURL(blob);
                reader.onloadend = function () {
                    var base64 = reader.result;
                    var base64Audio = base64.split(',').reverse()[0];
                    new Promise((resolve, reject) => {
                        var bstr = atob(base64Audio); // base64String  
                        resolve(bstr);
                    }).then((bstr) => {
                        console.log(bstr)
                        if (connect) {
                            socket.emit('realTime/message', {
                                sender: sender,
                                receiver: receiver,
                                content: bstr,
                                type: 'audio',
                                send_time: send_time
                            });
                        } else {
                            axios({
                                url: 'http://localhost:9000/send/audio', // 통신할 웹문서
                                method: 'post', // 통신할 방식
                                data: { // 인자로 보낼 데이터
                                    sender: sender,
                                    receiver: receiver,
                                    content: bstr,
                                    type: type_check,
                                    send_time: send_time
                                }
                            }); // end of axios ...
                        }
                    }).catch(() => "audio error")
                }
                break;
            
        }

    } // end of else ...

})

function showTextContent() {
    text_content.style.display = "block";
    image_content.style.display = "none";
    record_content.style.display = "none";
}

function showImageContent() {
    text_content.style.display = "none";
    image_content.style.display = "block";
    record_content.style.display = "none";
}

function showRecordContent() {
    text_content.style.display = "none";
    image_content.style.display = "none";
    record_content.style.display = "block";
}

// Write Mode
function showWrite() {

    write_button.style.display = "none";
    back_button.style.display = "block";
    document.getElementById('message_storage_view').style.display = "none";
    // 라디오 버튼 체크 확인
    let radio = document.querySelectorAll(".option_radio");
    // var radio = document.getElementsByName("option");
    var sel_type = null;
    for (var i = 0; i < radio.length; i++) {
        if (radio[i].checked == true) sel_type = radio[i].value;
    }

    if (sel_type == "text") {
        console.log("write mode : text");
        showTextContent();
    }
    else if (sel_type == "image") {
        console.log("write mode : image");
        showImageContent();
    }
    else { // sel_type == "record"
        console.log("write mode : record");
        showRecordContent();
    }
}

// Store Mode
function showStore() {
    write_button.style.display = "block";
    back_button.style.display = "none";
    document.getElementById('message_storage_view').style.display = "block";
    // 라디오 버튼 체크 확인
    let radio = document.querySelectorAll(".option_radio");
    var sel_type = null;
    for (var i = 0; i < radio.length; i++) {
        if (radio[i].checked == true) sel_type = radio[i].value;
    }

    if (sel_type == "text") {
        text_content.style.display = "none";
        image_content.style.display = "none";
        record_content.style.display = "none";
    }
    else if (sel_type == "image") {
        text_content.style.display = "none";
        image_content.style.display = "none";
        record_content.style.display = "none";
    }
    else { // sel_type == "record"
        text_content.style.display = "none";
        image_content.style.display = "none";
        record_content.style.display = "none";
    }
}

// radio button
text.addEventListener('change', () => {
    if (write_button.style.display == "none") showWrite(); // Writing Mode
    else showStore(); // Storage Mode
})
image.addEventListener('change', () => {
    if (write_button.style.display == "none") showWrite(); // Writing Mode
    else showStore(); // Storage Mode
})
record.addEventListener('change', () => {
    if (write_button.style.display == "none") showWrite(); // Writing Mode
    else showStore(); // Storage Mode
})

function showKeyboard(e) {
    keyboardTarget.setCurrentTarget(e.target.id);
    keyboardTarget.keyboard.style.display = "block";
}

function hideKeyboard() {
    keyboardTarget.setCurrentTarget(null);
    keyboardTarget.keyboard.style.display = "none";
}