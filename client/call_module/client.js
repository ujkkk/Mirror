const dbAccess = require('../mirror_db.js')
const moment = require('moment')

// DOM elements.
const callerAlert = document.getElementById('caller-alert')
const accept = document.getElementById('accept')
const dontAccept = document.getElementById('dont-accept')
const roomInput = document.getElementById('room-input')
const connectButton = document.getElementById('connect-button')
const disconnectIcon = document.getElementsByClassName('disconnect-icon')

const phoneButton = document.getElementById('bar_phone_button')
const callerContainer = document.getElementById('caller-accept-container')
const videoChatContainer = document.getElementById('video-chat-container')
const audioChatContainer = document.getElementById('audio-chat-container')
const localVideoComponent = document.getElementById('local-video')
const remoteVideoComponent = document.getElementById('remote-video')
const callerConponent = document.getElementsByClassName('caller')
const callRefusalContainer = document.getElementById('call-refusal-container')

// Variables.
const socket = io.connect('ws://192.168.0.6:9000/') // socket 서버 연결
let mediaConstraints = { // 미디어 설정
  audio: false,
  video: false,
}

let connectingSound = new Audio('./call_module/connecting_sound.mp3')
connectingSound.loop = true// audio를 반복 재생함
connectingSound.autoplay = true// audio가 load 될 때 자동재생 됨
connectingSound.pause()

let localStream // 내 스트리밍
let remoteStream // 상대 스트리밍
let isRoomJoin // 내가 방 들어갔는지  확인
let isRoomCloser = false // 내가 전화 끊었는지 확인
let isConnect = false // 지금 connect 됬는지 확인
let rtcPeerConnection // 로컬 장치와 원격 피어 간의 연결
let myId
let callMyId
let otherId
let callState = 0
let callWaiting
let callOption // 0이면 음성통화 1이면 영상통화
let roomInformation = { // 나의 room 정보
  oldRoomId: null,
  newRoomId: null,
  myRoomId: null,
}
var isConnected = false;


// module로 다른 js에서 사용할 수 있는 변수
let callFunction = {}
callFunction.setMyRoomId = (my_id) => new Promise((resolve, reject) => {
  roomInformation.myRoomId = String(my_id).substring(0, 3)
  myId = my_id
  resolve()
})
callFunction.check_event = 0

// Free public STUN servers provided by Google.
const iceServers = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ],
}

const client = require('../message_module/message_mqtt');

// BUTTON LISTENER ============================================================

new Promise(() => {
  // connect 버튼 클릭시 통화 방 입장함수(joinRoom) 호출
  connectButton.addEventListener('click', () => {
    inputValue = String(roomInput.value).split('?')
    otherId = inputValue[0]
    callOption = inputValue[1]
    joinRoom(inputValue[0].substring(0, 3))
  })
  callFunction.check_event = 1  // 지금 버튼 설정이 다 됬는지 확인
})

/* callFunction 객체를 모듈화 */
module.exports = callFunction

// disconnect 버튼 클릭시 통화 방 나가는함수(exitRoom) 호출
disconnectIcon[0].addEventListener('click', () => {
  isRoomCloser = true
  socket.emit('exit', roomInformation.newRoomId)
  exitRoom()
})

// disconnect 버튼 클릭시 통화 방 나가는함수(exitRoom) 호출
disconnectIcon[1].addEventListener('click', () => {
  isRoomCloser = true
  socket.emit('exit', roomInformation.newRoomId)
  exitRoom()
})

// 전화 수락 버튼
accept.addEventListener('click', () => {
  callAgree(true)
})

// 전화 거절 버튼
dontAccept.addEventListener('click', () => {
  callAgree(false)
})


// SOCKET EVENT CALLBACKS: socket서버로부터 메시지 수신  =====================================================

/* 통화 요청 && 수락 */

// room에 join 했을 때 돌아오는 callback (내 전화)
socket.on('room_created', async () => {
  console.log('Socket event callback: room_created')

})

// room에 join 했을 때 돌아오는 callback (친구한테 전화 걸기)
socket.on('room_joined', async () => {
  isConnected = false
  isRoomCloser = false
  console.log('Socket event callback: room_joined')

  showVideoConference()
  await setLocalStream(false, true)

  const roomId = roomInformation.newRoomId

  // 전화 걸기
  socket.emit('start_call', { roomId, myId, otherId, callOption }) // socket서버로 메시지(newRoomId) 송신 
  connectingSoundPlay()
})

// room이 꽉 찼을 때(전화를 하고 있을 때)
socket.on('full_room', (roomId) => {
  console.log('Socket event callback: full_room')
  //isRoomJoin = false
  isRoomCloser = false
  exitRoom()
})

// room에 들어와 전화 요청을 받았을 때
socket.on('start_call', async (other) => {
  isRoomCloser = false
  isConnect = false
  isConnected = false
  console.log('Socket event callback: start_call')
  if (roomInformation.newRoomId == roomInformation.myRoomId) { // 내가 방을 만든 주인(전화를 받음)
    let senderName

    otherId = other.myId
    callMyId = other.otherId
    callOption = other.callOption

    // 전화번호를 주소록에서 확인해보기
    dbAccess.select('name', 'friend', `friend_id=${otherId} and id=${callMyId}`)
      .then(value => {
        if (value.length == 0)
          senderName = otherId
        else
          senderName = value[0].name

        callWaiting = setTimeout(function () { // 10초 후 일시정지
          socket.emit('exit', roomInformation.newRoomId)
          exitRoom()
        }, 10000)
        connectingSoundPlay()
        showcallerContainer()

        callerConponent[callOption].innerText = `Calling [ ${senderName} ]`
        if (callOption == 0)
          callerAlert.innerText = senderName + '님의 음성통화'
        else
          callerAlert.innerText = senderName + '님의 영상통화'

      })
  }
})
/* 통화 연결 */

// 먼저 연결하고자 하는 Peer(상대)의 SDP 받기 (내가 전화를 걺 -> 그쪽에서 수락 후 SDP 제공) 
socket.on('webrtc_offer', async (event) => {
  console.log('Socket event callback: webrtc_offer')
  
  //otherId = event.myId

  if (roomInformation.newRoomId != roomInformation.myRoomId) { // 내가 방을 참가함(전화를 걺)
    isRoomJoin = true
    connectingSoundPause()

    rtcPeerConnection = new RTCPeerConnection(iceServers)
    await setLocalStream(true, true)

    rtcPeerConnection.ontrack = setRemoteStream
    rtcPeerConnection.onicecandidate = sendIceCandidate
    rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event.sdp))
    await createAnswer(rtcPeerConnection)
  }
})

// 응답하는 Peer(상대)의 SDP 받기 (내가 전화를 받고 수락 후 SDP 제공 -> 상대도 응답으로 SDP 제공) 
socket.on('webrtc_answer', (event) => {
  console.log('Socket event callback: webrtc_answer')
  isRoomJoin = true
  isConnected = true
  rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event))
})

// 웹 브라우저 간에 직접적인 P2P를 할 수 있도록 해주는 프레임워크 ICE 제공 -> Signaling
socket.on('webrtc_ice_candidate', (event) => {
  console.log('Socket event callback: webrtc_ice_candidate')

  // ICE candidate configuration.
  var candidate = new RTCIceCandidate({
    sdpMLineIndex: event.label,
    candidate: event.candidate,
  })
  rtcPeerConnection.addIceCandidate(candidate)
})

/* 통화 종료 */

// 전화 통화 종료 
socket.on('exit', () => {
  exitRoom()
})


// ui FUNCTIONS ==================================================================

// 나타난 통화 UI 숨기기
function hiddenVideoConference() {
  if (callOption == 0)
    audioChatContainer.style = 'display: none'
  else
    videoChatContainer.style = 'display: none'
}

// 숨겨진 통화 UI 보이기
function showVideoConference() {
  if (phoneButton != null && roomInformation.myRoomId != roomInformation.newRoomId)
    phoneButton.click()
  if (callOption == 0)
    audioChatContainer.style = 'display: block'
  else
    videoChatContainer.style = 'display: block'
}

// 나타난 callerContainer UI 숨기기
function hiddencallerContainer() {
  callerContainer.style = 'display: none'
}

// 숨겨진 callerContainer UI 보이기
function showcallerContainer() {
  callerContainer.style = 'display: block'
}

// 숨겨진 거절당한 창 UI 보이기
function callRefusalContainerShow() {
  callRefusalContainer.style = 'display: block'
}

// 전화 연결음 내기
const connectingSoundPlay = function () {
  connectingSound.load()
}

// 전화 연결음 끊기
const connectingSoundPause = function () {
  connectingSound.pause()
}

// call FUNCTIONS ==================================================================

/* Server에 메시지 송신해서 지금 방에서 leave하고 해당 방에 join */
const joinRoom = function (room) {
  //isRoomCreator = false
  isConnect = false
  roomInformation.oldRoomId = roomInformation.newRoomId
  roomInformation.newRoomId = room
  socket.emit('join', roomInformation)
}

/* Server에 메시지 송신해서 지금 방에서 leave하고 원래 내 방(내 전화번호) join */
const exitRoom = async function () {
  console.log("exitRoom")

  await setLocalStream(false, false)
  hiddenVideoConference()
  hiddencallerContainer()
  connectingSoundPause()

  if (roomInformation.newRoomId != roomInformation.myRoomId) { // 방의 주인이 아닐 경우
    if (!isRoomJoin && !isRoomCloser) {
      callRefusalContainerShow()
    }
    callState = 1 // (발신 전화)
    joinRoom(roomInformation.myRoomId)
    callRecord(myId, otherId, callState)
  }
  else {
    if (isRoomJoin) // 전화를 받은 경우(수신 통화)
      callState = 0
    else // 전화를 못받은 경우(부재중 ← 거절도 부재중으로 표시)
      callState = 2
    callRecord(callMyId, otherId, callState)
  }

  isRoomJoin = false
}

/* 전화가 와서 상대 전화를 받을 지 안받을 지 정하기 */
async function callAgree(callAccept) {
  clearTimeout(callWaiting) //setTimeOut
  hiddencallerContainer()
  connectingSoundPause()
  if (callAccept) { // 전화를 받았을 때
    showVideoConference()
    rtcPeerConnection = new RTCPeerConnection(iceServers)
    await setLocalStream(true, true)

    rtcPeerConnection.ontrack = setRemoteStream
    rtcPeerConnection.onicecandidate = sendIceCandidate

    await createOffer(rtcPeerConnection)  // offer SDP 상대에게 제공
  }
  else { // 전화를 거절했을 때
    isRoomCloser = true
    socket.emit('exit', roomInformation.newRoomId)
  }
}


/* 내 비디오 실행 및 오디오 실행(스트리밍) */
const setLocalStream = async function (audioValue, videoValue) {
  mediaConstraints.audio = audioValue

  if (videoValue == true) {
    // ****************************************
    if (localStream != undefined) {
      localStream.getTracks().forEach(function (track) {
        track.stop();
      });
    }
    // ****************************************
    mediaConstraints.video = { width: 1800, height: 1200 }
  }

  else
    mediaConstraints.video = false

  let stream = null
  if (mediaConstraints.audio != false || mediaConstraints.video != false) {
    try {
      // 해당 기기에 연결된 장치(카메라, 마이크)를 불러온다
      stream = await navigator.mediaDevices.getUserMedia(mediaConstraints)
      localStream = stream
      localVideoComponent.srcObject = stream

      if (mediaConstraints.audio != false && mediaConstraints.video != false) {
        // MidiaStreamTrack을 받아와 rtcPeerConnection에 트랙 추가 
        localStream.getTracks().forEach((track) => {
          rtcPeerConnection.addTrack(track, localStream)
        })
      }
    } catch (error) {
      console.error('Could not get user media', error)
    }
  }
  else {
    localVideoComponent.pause();
    localVideoComponent.src = "";
    if (localStream != undefined) {
      if (rtcPeerConnection != undefined || rtcPeerConnection != null) {
        rtcPeerConnection.ontrack = null
        rtcPeerConnection.close() // 통화 종료
        console.log(`track: ${rtcPeerConnection.ontrack}`)
      }
      localStream.getTracks().forEach(function (track) {
        track.stop();
      });
    }
  }
}

/* 상대에게 연결하자고 SDP 만들어 보내기 (내가 전화를 받음)  */
async function createOffer(rtcPeerConnection) {

  let sessionDescription
  try {
    sessionDescription = await rtcPeerConnection.createOffer()
    rtcPeerConnection.setLocalDescription(sessionDescription)
  } catch (error) {
    console.error(error)
  }

  roomId = roomInformation.newRoomId

  // socket서버로 메시지 송신 
  socket.emit('webrtc_offer', {
    type: 'webrtc_offer',
    sdp: sessionDescription,
    roomId,
    myId,
  })
}

/* 상대에게 연결 수락하고자 SDP 만들어 보내기 (내가 전화를 걺)  */
async function createAnswer(rtcPeerConnection) {
  let sessionDescription
  try {
    sessionDescription = await rtcPeerConnection.createAnswer()
    rtcPeerConnection.setLocalDescription(sessionDescription)
  } catch (error) {
    console.error(error)
  }

  roomId = roomInformation.newRoomId

  // socket서버로 메시지 송신 
  socket.emit('webrtc_answer', {
    type: 'webrtc_answer',
    sdp: sessionDescription,
    roomId,
  })
}

/* 원격 스트림을 위한 설정, 다른이의 비디오 받아오기 */
function setRemoteStream(event) {
  remoteVideoComponent.srcObject = event.streams[0]
  remoteStream = event.stream
}




/* 원격 스트림을 위한 설정, 다른이에게 내 비디오 condidate 주기 */
function sendIceCandidate(event) {
  const ice = setInterval(function () { // 10초 후 일시정지
    if (isConnected) {
      clearTimeout(ice);
      if (event.candidate) {
        roomId = roomInformation.newRoomId
        socket.emit('webrtc_ice_candidate', {
          roomId,
          label: event.candidate.sdpMLineIndex,
          candidate: event.candidate.candidate,
          myId,
        })
      }
      if (!isConnect) {
        setLocalStream(false, true)
        isConnect = true
      }
    }
  }, 500)

}



/* 전화 기록 남기기 */
const callRecord = function (id, friendId, state) {
  /* delete time 설정 */
  // 현재 시간 가져오기
  var newDate = new Date()
  // delecte_time 형식 지정
  var time = moment(newDate).format('YYYY-MM-DD HH:mm:ss')

  var data = { id: parseInt(id), friend_id: parseInt(friendId), state: state, call_option: callOption, call_time: time }
  dbAccess.createColumns('call_record', data)
}
