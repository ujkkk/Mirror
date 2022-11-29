//서버와 연결하는 MQTT
const mqtt = require('mqtt');

const options = {
    host: '127.0.0.1',
    port: 1883
};

const client = mqtt.connect(options);
client.on('connect', function () {

    console.log("서버 mqtt와 연결");
    //real time message 받는 토픽
    client.subscribe(`watch/4004`);
})

client.on('message', async (topic, message, packet) => {
    var contents = null;
    console.log(`message is ${message}`);
    console.log(`topic is ${topic}`);

    //로그인시 서버로부터 받은 메시지 저장 
    if (topic == `watch/4004`) {
        const bytesString = String.fromCharCode(...message) // byte -> string으로 변환

        console.log("type: string - ");
        console.log(bytesString)

        let testData1 = JSON.parse(message); // string -> json으로 변환

        console.log("type: json - ");
        console.log(testData1);
    }

})
