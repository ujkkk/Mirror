//서버와 연결하는 MQTT
const mqtt = require('mqtt');
var mirrorDB = require('./mirror_db')
const options = {
    host: '192.168.0.2',
    port: 1883
  };
const client = mqtt.connect(options);
client.on('connect', function(){
  //실시간 메시지 받는 토픽
    client.subscribe(`${mirrorDB.getId()}/connect_msg`);
})



module.exports = client