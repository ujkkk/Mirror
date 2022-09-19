const mqtt = require('mqtt')
const dbAccess = require('./mirror_db')
const callAccess = require('./call_module/call')
const messageAccess = require('./message_module/message_icon')
const CMUsers = require("./CMUserInfo")
const e = require('express')

// 필요한 component 불러오기 ======================================================

// 전화 component
const phoneButton = document.getElementById('bar_phone_button')
const phoneContainer = document.getElementById('bar_phone_container')
const callRecordComponent = document.getElementById('call-record')
const addressBookComponent = document.getElementById('call-address-book')
const recordSetComponent = document.getElementById('record-set-component')

const sttRefusalContainer = document.getElementById('stt-refusal-container')
const sttAlert = document.getElementById('stt-alert')
const sttSendButton = document.getElementById('stt-sned-button')
const sttCloseArea = document.getElementById('stt-close-area')

// 메시지 component
const bar_message_button = document.querySelector("#bar_message_button");
const write_button = document.querySelector("#write_button");

const image = document.querySelector("#image");
const record = document.querySelector("#record");
const shutter_button = document.querySelector("#shutter_button");
const send_modal = document.querySelector('#send-modal');
const inside_label = document.querySelector('#inside-label')

let friendName
let setCMuser
let setCMFriend
let messageValue = null
let geumBiTime
let sttAlertTime

// stt 받기 ===========================================================

/* mqtt 브로커 연결 및 topic subscribe */
const options = { // 브로커 정보(ip, port)
    host: '127.0.0.1',
    port: 1883
}

let create_message = false
let call_option = 0
let call_geumBi = false

const mqttClient = mqtt.connect(options) // mqtt broker 연결

mqttClient.subscribe('geumBi')

mqttClient.subscribe('call_request')
mqttClient.subscribe('video_call_request')

mqttClient.subscribe('message_request')
mqttClient.subscribe('image_request')
mqttClient.subscribe('audio_message_request')

mqttClient.subscribe('message_content')

mqttClient.subscribe('memo_request')

mqttClient.on('message', function (topic, message) { // 메시지 받았을 때 callback

    if (create_message) {
        // 메시지 내용 입력 =======================================================================================================
        if (topic.toString() == 'message_content') {
            clearTimeout(messageWaiting)
            clearTimeout(sttAlertTime)
            setGeumBi()
            if (!messageAccess.getcustomOption()) {
                sttRefusalContainer.style.display = "none"
                sttSendButton.style.visibility = "hidden"
            }
            else {
                document.querySelector("#textArea").value = `${message}`
                sttAlert.innerText = `'${message}' \n 라고 보내시겠습니까?`
                sttRefusalContainer.style.display = 'block'
                sttSendButton.style.visibility = "visible"
            }
            create_message = false
        }
    }
    else {
        // 금비 호출 =======================================================================================================
        if (!call_geumBi) {
            if (topic.toString() == 'geumBi') {
                call_geumBi = true
                sttAlert.innerText = '무엇을 도와드릴까요?'
                sttRefusalContainer.style = 'display: block'
                geumBiTime = setTimeout(function () { // 5초 후 실행
                    sttAlertOff()
                    call_geumBi = false
                }, 15000)
            }
        }
        else {
            // 전화/영상통화 호출 =======================================================================================================
            if (topic.toString() == 'call_request' || topic.toString() == 'video_call_request') {
                if (topic.toString() == 'call_request') {
                    call_option = 0
                }

                else {
                    call_option = 1
                }

                if (message == null) {
                    phoneButton.click()
                }
                else {
                    getCallFriendName(message, call_option)
                }
                setGeumBi()
            }

            // 메시지 호출 =======================================================================================================
            else if (topic.toString() == 'message_request' || topic.toString() == 'audio_message_request' || topic.toString() == 'image_request') {
                let message_value = String(message).split('?')
                if (message_value[0] == 'null') {
                    messageAccess.setcustomOption(false)

                    if (topic.toString() == 'message_request') {
                        if (messageValue == null) {
                            sttAlert.innerText = `보낼 메시지를 말해주세요`
                            sttRefusalContainer.style = 'display: block'
                            create_message = true
                            clearTimeout(geumBiTime)
                            clearTimeout(sttAlertTime)
                        }
                        else {
                            //message_memo_container.style.display = "block"
                            sttAlert.innerText = `'${messageValue[0]}' \n 라고 보내시겠습니까?`
                            sttRefusalContainer.style = 'display: block'
                            sttSendButton.style.visibility = "visible"
                            document.querySelector("#textArea").value = `${messageValue[0]}`
                            clearTimeout(geumBiTime)
                            clearTimeout(sttAlertTime)
                        }
                    }
                }
                else {
                    friendName = message_value[0]
                    messageAccess.setcustomOption(true)

                    setCMFriend = CMUsers.setCustromFriendList(`%${friendName}%`)
                    setCMuser = CMUsers.setCustromUserList(`%${friendName}%`)

                    setCMuser.then(user => {
                        messageAccess.setCMuser(setCMuser)

                        setCMFriend.then(friend => {
                            messageAccess.setCMFriend(setCMFriend)

                            messageAccess.setCustomFriend(null)

                            if (message_value.length > 1) {
                                if (message_value[1].includes("라고") || message_value[1].includes("이라고")) {
                                    if (message_value[1].includes("이라고")) {
                                        messageValue = message_value[1].split('이라고')
                                    }
                                    else {
                                        messageValue = message_value[1].split('라고')
                                    }
                                }
                            }

                            if (user.length + friend.length == 0) {
                                sttAlert.innerText = `${friendName}이를 찾을 수 없습니다`
                                sttRefusalContainer.style = 'display: block'
                                messageAccess.setcustomOption(false)
                                setGeumBi()
                                return;
                            }
                            else if (user.length + friend.length == 1) {
                                if (user.length == 1) {
                                    friendName = user[0].name
                                    messageAccess.setCustomFriend({ name: user[0].name, id: user[0].id, send_option: 0 })
                                }
                                else {
                                    friendName = friend[0].name
                                    messageAccess.setCustomFriend({ name: friend[0].name, id: friend[0].id, send_option: 1 })
                                }
                            }
                            if (topic.toString() == 'message_request') {
                                MessageFriendCheck(user, friend)
                            }

                        })
                    })
                }

                if (topic.toString() == 'audio_message_request') {
                    sttAlert.innerText = `창이 나오면 \n 보낼 음성 메시지를 말해주세요`
                    sttRefusalContainer.style = 'display: block'
                    sttAlertTime = setTimeout(function () { // 5초 후 실행
                        sttAlertOff()
                        if (message_memo_container.style.display == "none") {
                            bar_message_button.click()
                        }
                        write_button.click()
                        record.click()
                        //document.getElementById('record_button').click()
                        setGeumBi()
                    }, 5000)
                }
                else if (topic.toString() == 'image_request') {
                    sttAlert.innerText = `이미지 전송창을 띄웁니다`
                    sttRefusalContainer.style = 'display: block'
                    sttAlertTime = setTimeout(function () { // 5초 후 실행
                        sttAlertOff()
                        if (message_memo_container.style.display == "none") {
                            bar_message_button.click()
                        }
                        write_button.click()
                        image.click()
                        //document.getElementById('shutter_button').click()
                        setGeumBi()
                    }, 5000)
                }
            }

            else if (topic.toString() == 'memo_request') {
                let memoValue
                if (message.includes("라고") || message.includes("이라고")) {
                    if (message.includes("이라고")) {
                        memoValue = String(message).split('이라고')
                    }
                    else {
                        memoValue = String(message).split('라고')
                    }
                    dbAccess.addMemo(dbAccess.getId(), memoValue[0], 0, 'text')
                    sttAlert.innerText = `'${memoValue[0]}' \n 메모가 저장되었습니다`
                    sttRefusalContainer.style = 'display: block'
                    sttAlertTime = setTimeout(function () { // 5초 후 실행
                        sttAlertOff()
                        setGeumBi()
                    }, 5000)
                }
                else {
                    //
                }
            }
        }
    }

})

sttSendButton.addEventListener('click', () => {
    sttAlertOff()
    messageAccess.MessageSenderView()
})

sttCloseArea.addEventListener('click', () => {
    sttAlertOff()
})

function setGeumBi() {
    clearTimeout(geumBiTime)
    clearTimeout(sttAlertTime)
    call_geumBi = false
    clearTimeout(geumBiTime)
}

function sttAlertOff() {
    sttSendButton.style.visibility = "hidden"
    sttRefusalContainer.style = 'display: none'
    clearTimeout(sttAlertTime)
}

function MessageFriendCheck(user, friend) {
    console.log(`user value len: ${user.length}, ${friend.length} = ${user.length + friend.length}`)

    if (user.length + friend.length == 1) {
        console.log(`이름은 ${friendName}`)

        if (messageValue == null) {
            sttAlert.innerText = `${friendName}님에게 \n 보낼 메시지를 말해주세요`
            clearTimeout(geumBiTime)
            clearTimeout(sttAlertTime)
        }
        else {
            //message_memo_container.style.display = "block"
            sttAlert.innerText = `${friendName}님에게 \n '${messageValue[0]}'라고 보내시겠습니까?`
            sttRefusalContainer.style = 'display: block'
            sttSendButton.style.visibility = "visible"
            document.querySelector("#textArea").value = `${messageValue[0]}`
            setGeumBi()
        }
    }
    else {
        if (messageValue == null) {
            sttAlert.innerText = `보낼 메시지를 말해주세요`
            clearTimeout(geumBiTime)
            clearTimeout(sttAlertTime)
        }
        else {
            //message_memo_container.style.display = "block"
            sttAlert.innerText = `${friendName}님에게 \n '${messageValue[0]}'라고 보내시겠습니까?`
            sttRefusalContainer.style = 'display: block'
            sttSendButton.style.visibility = "visible"
            document.querySelector("#textArea").value = `${messageValue[0]}`
            setGeumBi()
        }
    }
    sttRefusalContainer.style = 'display: block'
    create_message = true
    messageWaiting = setTimeout(function () { // 10초 후 일시정지
        create_message = false
        sttAlertOff()
        setGeumBi()
    }, 20000)

}


// 친구 이름 알아내기 ===============================================================================================
const getCallFriendName = function (name, call_option) {
    dbAccess.select(`name, friend_id`, 'friend', `id=${dbAccess.getId()} and name like '%${name}%'`)
        .then((value) => {
            if (value.length == 0) {
                console.log('이름이 존재하지 않습니다')
                sttAlert.innerText = `${name}이를 찾을 수 없습니다`
                sttRefusalContainer.style = 'display: block'
            }
            else if (value.length >= 2) {
                console.log('이름이 두개이상입니다')

                sttAlert.innerText = '이름이 두개이상입니다 \n 다음 창에서 상대방을 골라주세요'
                sttRefusalContainer.style = 'display: block'
                sttAlertTime = setTimeout(function () { // 5초 후 실행
                    sttAlertOff()
                    phoneContainer.style = 'display: block'
                    callRecordComponent.style = 'display: none'
                    addressBookComponent.style = 'display: block'
                    recordSetComponent.style = 'display: none'
                }, 5000)


                friend = []
                for (let i = 0; i < value.length; i++) {
                    friend[i] = { "id": value[i].friend_id, "name": value[i].name }
                }
                callAccess.setFriend(friend)
                callAccess.showCallAddress() // friend 목록 보여줌 
            }
            else {
                console.log(`이름은 ${value[0].name}`)
                if (call_option == 0) {
                    sttAlert.innerText = `${name}님에게 전화 걸겠습니다`
                }
                else {
                    sttAlert.innerText = `${name}님에게 영상통화 걸겠습니다`
                }
                sttRefusalContainer.style = 'display: block'
                sttAlertTime = setTimeout(function () { // 5초 후 실행
                    sttAlertOff()
                    callAccess.startCall({ 'id': value[0].friend_id, 'name': value[0].name }, call_option)
                }, 5000)
            }
        })
}

