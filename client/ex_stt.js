const mqtt = require('mqtt')
const options = {  //broker 연동 위한 옵션(브로커 IP 및 포트번호)
  host: '127.0.0.1',
  port: 1883
};
mqttClient = mqtt.connect(options);


console.log("stt start");

mqttClient.publish('message_request', ['채원', ' 밥먹자라고 메시지 보내줘'])