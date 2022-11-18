
const axios= require('axios');
const mirror_db = require('../mirror_db');
const moment = require('moment');
const socket = require('./message_socket')
const mqtt = require('mqtt');
const options = {
    host: '127.0.0.1',
    port: 1883
  };
const innerClient = mqtt.connect(options);

innerClient.publish('camera/close', 'ok')
innerClient.publish('closeCamera', String(mirror_db.getMirror_id()))
innerClient.subscribe("send/image");
innerClient.subscribe("message/capture/done");
innerClient.subscribe("memo/capture/done");

innerClient.on('message', async (topic, message, packet) => {
    console.log("message is "+ message);
    console.log("topic is "+ topic);

    //찍은 이미지로 캔버스 갱신
    if(topic == 'memo/capture/done'){
      console.log("memo/capture/done'토픽 받음")
      var time = new Date().getTime();
      var saved_filePath = message
      var c = document.createElement('canvas');
      var img = document.getElementById('memo_img');
      if(img != null){
        img.setAttribute('value', saved_filePath);
        img.src ="memo_module/image/"+saved_filePath+'.jpg?time='+ time;
      }
    }

    //메시지 사진
    if(topic == 'message/capture/done'){
      var saved_filePath = message
      var c = document.createElement('canvas');
      var img = document.getElementById('msg-img');
      var time = new Date().getTime();

      img.src ="message_module/image/media/test.jpg?time="+ time;
      var ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0, c.width, c.height);
      var base64String = c.toDataURL();
    }

    //전송하기 누르면 호출되는 이벤트
    if(topic == 'send/image'){   
      var c = document.createElement('canvas');
      var ctx = c.getContext('2d');

      receiver = document.getElementById('message-receiver').value;
      sender = document.getElementById('message-sender').value;
      img = document.getElementById('message-img')

     
      c.width = 600;
      c.height = 480;
      ctx.drawImage(img, 0, 0, c.width, c.height);
      var base64String = c.toDataURL();

      var newDate = new Date();
      var time = moment(newDate).format('YYYY-MM-DD HH:mm:ss');
      var sender_connent = false;
      //접속되어 있는 유저에게 보낼 때, 소켓 이용
      if(sender_connent){
        socket.emit('realTime/message', {
            sender : sender,
            receiver :  receiver,
            content : base64String,
            type : 'image',
            time : time
        });   
      }
      else{
        var newDate = new Date();
        var time = moment(newDate).format('YYYY-MM-DD HH:mm:ss');
        
        axios({
          url: 'http://223.194.159.229:80/send/image', // 통신할 웹문서
          method: 'post', // 통신할 방식
          data: { // 인자로 보낼 데이터
            receiver : receiver,
            sender : sender,
            content: base64String,
            type :'image',
            send_time : time

          }
        });
      } 
    } // end of (topic == 'send/image') ...
})

module.exports = innerClient