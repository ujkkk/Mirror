// 필요한 모듈 require =========================================================
const dbAccess = require('../mirror_db')
const callFunction = require('./client')
const mqtt = require('mqtt')

// 필요한 component 불러오기 ======================================================
const callRecord = document.getElementById('call-record')
const phoneButton = document.getElementById('bar_phone_button')
const phoneContainer = document.getElementById('bar_phone_container')
const recordButton = document.getElementById('record-button')
const callAddressButton = document.getElementById('call-address-button')

const callRecordComponent = document.getElementById('call-record')
const addressBookComponent = document.getElementById('call-address-book')

const recordSetComponent = document.getElementById('record-set-component')
const allRecordButton = document.getElementById('all-record-button')
const absensceButton = document.getElementById('absensce-button')

const input = document.getElementById('room-input')
const connectButton = document.getElementById('connect-button')
const callerConponent = document.getElementsByClassName('caller')

// 변수 설정 ====================================================================

let phoneIconTouch = 0
let callAccess = {} // 모듈 제작을 위한 변수
let friend = [{}] // 다른 사용자 DB (friend Table) 정보([{id, name}])
let recordArray = [{}]

// MQTT 이용 =====================================================================

/* mqtt 브로커 연결 및 topic subscribe */
const options = { // 브로커 정보(ip, port)
    host: '127.0.0.1',
    port: 1883
}

const mqttClient = mqtt.connect(options) // mqtt broker 연결
mqttClient.subscribe('call_request')

mqttClient.on('message', function (topic, message) { // 메시지 받았을 때 callback
    if (topic.toString() == 'call_request') { // 전화 호출
        phoneContainer.style = 'display: block'
        callAddressButton.click()
    }
})

// BUTTON LISTENER ============================================================

if (phoneButton != null) {

    // 전화 아이콘 클릭시 이벤트
    phoneButton.addEventListener('click', () => {
        if (phoneIconTouch % 2 == 0) {
            phoneContainer.style = 'display: block'
            allRecordButton.click()
        }
        else
            phoneContainer.style = 'display: none'
        phoneIconTouch++
    })

    // 주소록 아이콘 클릭시 이벤트
    callAddressButton.addEventListener('click', () => {
        callRecordComponent.style = 'display: none'
        addressBookComponent.style = 'display: block'
        recordSetComponent.style = 'display: none'
        setCallAddress()
    })

    // 전화 기록 아이콘 클릭시 이벤트
    recordButton.addEventListener('click', () => {
        callRecordComponent.style = 'display: block'
        addressBookComponent.style = 'display: none'
        recordSetComponent.style = 'display: block'
        allRecordButton.click()
    })

    // 전화 기록 중 전체 전화 기록 클릭시 이벤트
    allRecordButton.addEventListener('click', () => {
        absensceButton.style = 'background-color: rgba(255, 255, 255, 0.092)'
        allRecordButton.style = 'background-color: rgba(255, 255, 255, 0.29)'
        setCallRecord()
    })

    // 전화 기록 중 부재중 전화 기록 클릭시 이벤트
    absensceButton.addEventListener('click', () => {
        allRecordButton.style = 'background-color: rgba(255, 255, 255, 0.092)'
        absensceButton.style = 'background-color: rgba(255, 255, 255, 0.29)'
        setAbsensce()
    })
}

// 전화 기록 ui 설정 ========================================================================

/* 모든 전화기록이 보이는 ui 만들기 */
const setCallRecord = async function () {
    callRecord.innerHTML = ""
    dbAccess.select('state, friend_id, call_time, call_option', 'call_record', `id=${dbAccess.getId()}`) // 현재 call_record정보 불러오기
        .then((value) => {
            recordArray = [{}]
            for (let i = 0; i < value.length; i++) {
                recordArray[i] = { "state": value[i].state, "friend_id": value[i].friend_id, 'call_time': value[i].call_time, 'call_option': value[i].call_option }
            }
            showRecord()
        })
}

/* 부재중 전화기록만 보이는 ui 만들기 */
const setAbsensce = async function () {
    callRecord.innerHTML = ""
    dbAccess.select('friend_id, call_time, call_option', 'call_record', `id=${dbAccess.getId()} and state=2`) // 현재 call_record정보 불러오기
        .then((value) => {
            recordArray = [{}]
            for (let i = 0; i < value.length; i++) {
                recordArray[i] = { "state": 2, "friend_id": value[i].friend_id, 'call_time': value[i].call_time, 'call_option':value[i].call_option }
            }
            showRecord()
        })
}

function showRecord() {
    console.log('|| showRecord')
    var newDate = new Date()
    // time 형식 지정
    var date = newDate.toFormat('MM-DD')
    for (let i = 0; i < recordArray.length; i++) {
        const recordDiv = document.createElement('div')

        const callerName = document.createElement('div')
        callerName.className = 'call-record-caller'

        const callIcon = document.createElement('img');
        callIcon.className = "call-sender-icon";
        if (recordArray[i].state == 1){
            if(recordArray[i].call_option == 0)
                callIcon.src = './image/index/call_sender_icon.png';
            else
                callIcon.src = './image/index/video_sender_icon.png';
        }
            
        else
            callIcon.src = './image/index/call_reciver_icon.png';
        if (recordArray[i].state == 2)
            callerName.style.color = 'red'

        call_date = recordArray[i].call_time.toFormat('MM-DD')
        call_time = recordArray[i].call_time.toFormat('HH24:MI')

        const timeSpan = document.createElement('span')
        if (date == call_date)
            timeSpan.innerText = call_time
        else
            timeSpan.innerText = call_date

        recordDiv.append(callIcon)
        recordDiv.append(callerName)
        recordDiv.append(timeSpan)
        callRecord.prepend(recordDiv)

        dbAccess.select('name', 'friend', `id=${dbAccess.getId()} and friend_id=${recordArray[i].friend_id}`)
            .then((friend) => {
                if (friend.length != 0) {
                    callerName.innerText = friend[0].name
                    callerName.addEventListener("click", function () {
                        callAccess.startCall({ 'id': recordArray[i].friend_id, 'name': friend[0].name }, recordArray[i].call_option)
                    }) // 각각의 li에 add onclick listener
                }
                else {
                    callerName.innerText = recordArray[i].friend_id
                    callerName.addEventListener("click", function () {
                        callAccess.startCall({ 'id': recordArray[i].friend_id, 'name': null }, recordArray[i].call_option)
                    }) // 각각의 li에 add onclick listener
                }
            })
    }
}

/* DB 접근해서 friend 불러오기 및 주소록 ui 만들기 */
function setCallAddress() {
    dbAccess.select('friend_id, name', 'friend', `id=${dbAccess.getId()}`) // 현재 friend DB 정보 불러오기
        .then(value => { // mirror에 값 넣기
            for (let i = 0; i < value.length; i++) {
                friend[i] = { "id": value[i].friend_id, "name": value[i].name }
            }
            showCallAddress() // friend 목록 보여줌 
        })
}

// 주소록 목록 보여주기
function showCallAddress() {
    addressBookComponent.innerHTML = ""
    for (let i = 0; i < friend.length; i++) {
        let div = document.createElement("div")

        const friendIcon = document.createElement('img')
        friendIcon.className = "call-sender-icon"
        friendIcon.src = './image/index/user.png'
        div.append(friendIcon)

        const friendName = document.createElement('div')
        friendName.className = 'call-record-caller'
        friendName.innerText = friend[i].name
        div.append(friendName)

        const callingIcon = document.createElement('img')
        callingIcon.className = "calling-icon"
        callingIcon.src = './image/index/audio-calling-icon.png'
        callingIcon.addEventListener("click", function () { callAccess.startCall(friend[i], 0) })
        div.append(callingIcon)

        const videoCallingIcon = document.createElement('img')
        videoCallingIcon.className = "calling-icon"
        videoCallingIcon.src = './image/index/video-calling-icon.png'
        videoCallingIcon.addEventListener("click", function () { callAccess.startCall(friend[i], 1) })
        div.append(videoCallingIcon)

        //div.addEventListener("click", function () { callAccess.startCall(friend[i]) }) // 각각의 li에 add onclick listener
        addressBookComponent.append(div)
    }
}

/* 선택한 mirror에 전화 걸기 -> 해당 미러 socket room 입장 */
callAccess.startCall = function (mirror, callOption) {
    input.value = mirror.id+'?'+callOption
    while (true) {
        console.log('while문 실행')
        if (callFunction.check_event == 1) {
            connectButton.click()
            console.log('click event: ' + input.value)
            break
        }
    }
    if(callerConponent[2] != null)
        callerConponent[2].innerText = `Calling [ ${mirror.name} ]`
    callerConponent[callOption].innerText = `Calling [ ${mirror.name} ]`
}

/* user의 기본 방 설정 및 방 들어가기 */
callAccess.setCall = function (userId, userName) {
    callFunction.setMyRoomId(userId)
        .then(() => {
            callAccess.startCall({ "id": userId, 'name': userName }, 0)
        })
}

module.exports = callAccess