const mqtt = require('mqtt')
const client = mqtt.connect('mqtt://test.mosquitto.org')

client.subscribe('memo');


client.on('message', function(topic, message){
    document.getElementById("messages").innerHTML = `토픽:${topic.toString()}, 메세지: ${message.toString()}`;
});

