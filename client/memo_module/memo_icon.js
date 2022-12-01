const mirror_db = require('./mirror_db')
const moment = require('moment');
const mqtt = require('mqtt')

const bar_memo_button = document.querySelector("#bar_memo_button");
const memo_container = document.querySelector("#memo_container");
const memo_write_button = document.querySelector("#memo_write_button");
const memo_back_button = document.querySelector("#memo_back_button");
const memo_text_content = document.querySelector("#memo_text_content");
const memo_image_content = document.querySelector("#memo_image_content");
const memo_record_content = document.querySelector("#memo_record_content");
const memo_textArea = document.getElementById('memo_textArea');
let memo_player = document.getElementById("memo_player");

console.log("memo_icon 여기 들어옴");

memo_textArea.addEventListener('click', function (e) { showKeyboard(e) });

const client = require('./message_module/message_mqtt');
const memo_text = document.querySelector("#memo_text");
const memo_image = document.querySelector("#memo_image");
const memo_record = document.querySelector("#memo_record");
const memo_text_label = document.querySelector("#memo_text_label");
const memo_image_label = document.querySelector("#memo_image_label");
const memo_record_label = document.querySelector("#memo_record_label");
const shutter_button = document.querySelector("#memo_shutter_button");
const save_button = document.querySelectorAll('.save_button');

const sttRefusalContainer = document.getElementById('stt-refusal-container')
const sttAlert = document.getElementById('stt-alert')
const memoText = document.getElementById("memo_storage_detail_context")

// const axios = require('axios');
const { write } = require("fs");
const CMUsers = require("./CMUserInfo");

let record_obj = require('./memo_module/memo_record');
const { Store } = require('mqtt');


// const mqtt = require('mqtt');
// const dbAccess = require("../mirror_db");

// stt 실행 =======================================================================================
let customOption = false
let friendName
let setCMuser
let setCMFriend
let customFriend = null

const memo_storage = require('./memo_module/memo_storage');
/* mqtt 브로커 연결 및 topic subscribe */
const options = { // 브로커 정보(ip, port)
    host: '127.0.0.1',
    port: 1883
}


/* mqtt 브로커 연결 및 topic subscribe */
const mqttOptions = { // 브로커 정보(ip, port)
    host: '192.168.0.2',
    port: 1883
}

const mqttClient = mqtt.connect(mqttOptions) // mqtt broker 연결



/////////////////////////////pushAlarm/////////////////
const memo_send_watch = document.getElementById('memo_send_watch')
const progressbar = document.getElementById("memo-progressbar-container")
let progressbar_time

const admin = require("firebase-admin");

let serviceAccount = require("./comirror-watch-firebase.json");

const fcm_admin = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

memo_send_watch.addEventListener('click', () => {

    clearTimeout(progressbar_time);

    progressbar.style.display = "none"

     // ======================= mqtt 보내기 =======================
     let testData = JSON.parse(JSON.stringify({ senderName: "메모", content: memoText.innerText})); // json
     let string = JSON.stringify(testData); // json -> string으로 변환
     const toBytes = (string) => Array.from(Buffer.from(string, 'utf8')); // byte array로 변환하는 함수

     const bytes = toBytes(string); // string -> bytearray로 변환
    //mqttClient.publish(`watch/4004`, bytes) // byte보내고 싶으면 이코드 하지만.. 에러남
    mqttClient.publish(`watch/4004`, string)

    const registrationToken = 'eoseBGH-RUKEMbCZXoeC9u:APA91bHOgMlPnHy8LzH8Uv1hOGFo2Gz-egtFwz4HpSPZut-mYkFt2CWG0V60PkzEnCNUvg48oYlMpCcUIJ38n5H-qEQ5pMIUQy_2mEuyd_FSv8oCAZh3Na4mD-GDay360UHM-pZKIGHJ';
    const message = {
        notification: {
            title: '메모 전송',
            body: memoText.innerText
        },
        token: registrationToken
    };
    //////////////////////////////pushAlarm//////////////////

    // Send a message to the device corresponding to the provided
    // registration token.
    fcm_admin.messaging().send(message)
        .then((response) => {
            // Response is a message ID string.
            console.log('Successfully sent message:', response);
        })
        .catch((error) => {
            console.log('Error sending message:', error);
        });
        progressbar.style.display = "block"
        progressbar_time = setTimeout(()=>{
            progressbar.style.display = "none"
        },3000)
})


// const mqttClient = mqtt.connect(options) // mqtt broker 연결
// mqttClient.subscribe('message_request')
// mqttClient.subscribe('audio_message_request')
// mqttClient.subscribe('image_request')


// mqttClient.on('message', function (topic, message) { // 메시지 받았을 때 callback
//     customFriend = null
//     if (message == null) {
//         customOption = false
//     }
//     else {
//         friendName = message
//         customOption = true
//         setCMFriend = CMUsers.setCustromFriendList(friendName)
//         setCMuser = CMUsers.setCustromUserList(friendName)

//         setCMuser.then(user => {
//             setCMFriend.then(friend => {
//                 console.log(`user value len: ${user.length}, ${friend.length} = ${user.length + friend.length}`)
//                 if (user.length + friend.length == 0) {
//                     sttAlert.innerText = `${friendName}이를 찾을 수 없습니다`
//                     sttRefusalContainer.style = 'display: block'
//                     customOption = false
//                     return;
//                 }
//                 else if (user.length + friend.length == 1) {
//                     if (memo_container.style.display == "none") {
//                         memo_container.style.display = "block"
//                     }
//                     if (user.length == 1) {
//                         friendName = user[0].name
//                         customFriend = { name: user[0].name, id: user[0].id, send_option: 0 }
//                     }
//                     else {
//                         friendName = friend[0].name
//                         customFriend = { name: friend[0].name, id: friend[0].id, send_option: 1 }
//                     }
//                     console.log(`이름은 ${friendName}`)
//                     sttAlert.innerText = `${friendName}님에게 보낼 메시지를 입력바랍니다`
//                     sttRefusalContainer.style = 'display: block'
//                 }
//                 else {


//                     if (memo_container.style.display == "none") {
//                         memo_container.style.display = "block"
//                     }
//                     sttAlert.innerText = `보낼 메시지를 입력바랍니다`
//                     sttRefusalContainer.style = 'display: block'
//                 }
//             })
//         })
//     }

//     if (topic.toString() == 'message_request') {
//         if(value.includes("라고")) {
//             let callValue = value.split('라고')
//             let callName = callValue[0].split("에게")
//             console.log(`메시지 내용: ${callName[callName.length - 1]}`)
//             document.querySelector("#textArea").value = `${callName[callName.length - 1]}`
//         }
//         memo_write_button.click()
//     }
//     else if (topic.toString() == 'audio_message_request') {
//         memo_write_button.click()
//         record.click()

//     }
//     else if (topic.toString() == 'image_request') {
//         memo_write_button.click()
//         image.click()
//     }
// })


// stt 실행 ======================================================================================

// message display ON/OFF
bar_memo_button.addEventListener('click', () => {
    console.log('bar_memo_button click!');
    
    progressbar.style.display = "none"
    memo_send_watch.style.visibility = "hidden"

    document.querySelector("#memo_textArea").value = "";
    if (memo_container.style.display == "none") {
        memo_container.style.display = "block";
        console.log("container의 style이 blovck으로 변경됨")
        // text.style.display = "none";
        // image.style.display = "none";
        // record.style.display = "none";
        // document.getElementById('radio_container').style.display = "none";
        //init
        memo_write_button.style.display = "block";
        memo_back_button.style.display = "none";
        memo_text_content.style.display = "none";
        memo_image_content.style.display = "none";
        memo_record_content.style.display = "none";
        // camera on
        client.publish('camera/on', "start");
    }
    else {
        if (customOption) {
            customFriend = null
            customOption = false
        }
        memo_container.style.display = "none";
        document.getElementById('memo_img').src = ''

        // camera off
        client.publish('camera/close', 'ok')
    }
})

memo_write_button.addEventListener('click', showWrite);
memo_back_button.addEventListener('click', showStore);
for (let i = 0; i < save_button.length; i++) {
    save_button[i].addEventListener('click', function (e) { saveMemoContent(e) });
}

shutter_button.addEventListener('click', () => {
    console.log('셔터 버튼 클릭')
    client.publish('capture/camera', "memo");
});


function saveMemoContent(e) {

    var newDate = new Date();
    var time = moment(newDate).format('YYYY-MM-DD HH:mm:ss');

    if (e.target.id == "save_text_button") {
        hideKeyboard()
        /*
        let data = {
            id:mirror_db.getId(),
            content:memo_textArea.value,
            store:0,
            delete_time:"2026-04-04 4:44:44",
            time: time,
            type:"text"
        }
 
        mirror_db.createColumns('memo',data)
        */


        mirror_db.addMemo(mirror_db.getId(), memo_textArea.value, 0, "text")
            .then(() => {
                memo_storage.showMemoStorage();
                memo_textArea.value = "";
            })
    }
    else if (e.target.id == "save_image_button") {
        let img = document.getElementById('memo_img')
        let file_name = img.getAttribute('value');
        console.log('file_name:', file_name)

        data = { // 인자로 보낼 데이터
            id: mirror_db.getId(),
            type: 'image',
            store: 1,
            delete_time: "2026-04-04 4:44:44",
            content: file_name,
            time: time
        }
        mirror_db.createColumns('memo', data)
            .then(() => {
                memo_storage.showMemoStorage();
                memo_textArea.value = "";
            })
    }


}

function showTextContent() {
    memo_text_content.style.display = "block";
    memo_image_content.style.display = "none";
    memo_record_content.style.display = "none";
}

function showImageContent() {
    memo_text_content.style.display = "none";
    memo_image_content.style.display = "block";
    memo_record_content.style.display = "none";
}

function showRecordContent() {
    memo_text_content.style.display = "none";
    memo_image_content.style.display = "none";
    memo_record_content.style.display = "block";
}

// Write Mode
function showWrite() {

    // 처음 메모 창을 띄울 때 text content 부터 보여주기
    if (memo_back_button.style.display == "none") {
        memo_text_label.style.display = "block";
        memo_image_label.style.display = "block";
        memo_record_label.style.display = "block";
        memo_write_button.style.display = "none";
        memo_back_button.style.display = "block";
        memo_text.checked = true;
    }


    memo_write_button.style.display = "none";
    memo_back_button.style.display = "block";
    memo_player.style.display = "none";
    document.getElementById('memo_storage_view').style.display = "none";
    // 라디오 버튼 체크 확인
    let radio = document.querySelectorAll(".memo_option_radio");
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
    hideKeyboard();
    memo_text_label.style.display = "none";
    memo_image_label.style.display = "none";
    memo_record_label.style.display = "none";
    memo_textArea.value = "";
    memo_player.style.display = "none";
    memo_write_button.style.display = "block";
    memo_back_button.style.display = "none";
    document.getElementById('memo_storage_view').style.display = "block";
    // 라디오 버튼 체크 확인
    let radio = document.querySelectorAll(".memo_option_radio");
    var sel_type = null;
    for (var i = 0; i < radio.length; i++) {
        if (radio[i].checked == true) sel_type = radio[i].value;
    }

    if (sel_type == "text") {
        memo_text_content.style.display = "none";
        memo_image_content.style.display = "none";
        memo_record_content.style.display = "none";
    }
    else if (sel_type == "image") {
        memo_text_content.style.display = "none";
        memo_image_content.style.display = "none";
        memo_record_content.style.display = "none";
    }
    else { // sel_type == "record"
        memo_text_content.style.display = "none";
        memo_image_content.style.display = "none";
        memo_record_content.style.display = "none";
    }
}

// radio button
memo_text.addEventListener('change', () => {
    if (memo_write_button.style.display == "none") showWrite(); // Writing Mode
    else showStore(); // Storage Mode
})
memo_image.addEventListener('change', () => {
    if (memo_write_button.style.display == "none") showWrite(); // Writing Mode
    else showStore(); // Storage Mode
})
memo_record.addEventListener('change', () => {
    console.log("memo record click!!")
    if (memo_write_button.style.display == "none") showWrite(); // Writing Mode
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