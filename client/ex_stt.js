const mqtt = require('mqtt')
const options = {  //broker 연동 위한 옵션(브로커 IP 및 포트번호)
  host: '127.0.0.1',
  port: 1883
};
mqttClient = mqtt.connect(options);


console.log("stt start");

setTimeout(function () { // 5초 후 실행
  console.log("geumBi call");
  mqttClient.publish('geumBi', 'geumBi_on')
}, 1000)


// // 메모
// setTimeout(function () { // 5초 후 실행
//   console.log("memo call");
//   mqttClient.publish('memo_request', '배고파 죽겠어라고 메모 남겨줘')
// }, 2000)


// // 메시지 1
// setTimeout(function () { // 5초 후 실행
//   console.log("message call");
//   mqttClient.publish('message_request', '채원?배고프다라고 메시지 보내줘')
// }, 3000)

// 메시지 2
setTimeout(function () { // 5초 후 실행
  console.log("message call");
  mqttClient.publish('message_request', '유진?메시지 보내줘')
  setTimeout(function () { // 5초 후 실행
    console.log("content call");
  mqttClient.publish('message_content', '딸기라떼 먹고싶어')
  }, 3000)  
}, 5000)


// // 사진
// setTimeout(function () { // 5초 후 실행
//   console.log("memo call");
//   mqttClient.publish('image_request', '채원')
// }, 2000)

// // 오디오
// setTimeout(function () { // 5초 후 실행
//   console.log("memo call");
//   mqttClient.publish('audio_message_request', '채원')
// }, 2000)