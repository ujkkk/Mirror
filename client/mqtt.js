const mqtt = require('mqtt');
const options = {
    host: '192.168.0.2',
    port: 1883
  };
const client = mqtt.connect(options);

module.exports = client