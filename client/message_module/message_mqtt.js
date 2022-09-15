const mqtt = require('mqtt');
const axios= require('axios');
const mirror_db = require('../mirror_db');
const moment = require('moment');
const fs = require('fs')
const socket = require('./message_socket')
const options = {
    host: '127.0.0.1',
    port: 1883
  };

  console.log('message call')

const client = mqtt.connect(options);

let options2 ={
  encoding: 'utf-8',  // utf-8 인코딩 방식으로
  flag: 'r' // 읽기
}
const getDataFromFilePromise = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, options2, (err, data) => {
      if (err) {
        reject(err);
      } else {  // 에러가 나지 않은 경우 resolve 메소드 실행 -> 파일 정보 읽어옴
        resolve(data);
      }
    });
  });
}

client.subscribe("send/image");
client.subscribe("capture/camera_done");

client.on('message', async (topic, message, packet) => {
    console.log("message is "+ message);
    console.log("topic is "+ topic);
    let data1

  
    if(topic == 'capture/camera_done'){

      console.log("capture/camera_done 토픽 받음")
      var saved_filePath = message
      
      // document.location.href = './imageSend2.html'
      var c = document.createElement('canvas');
      // var c = document.getElementById("canvas");
      var img = document.getElementById('msg-img');
      // img.setAttribute("style", "position: absolute; left: 50%; top: 250px; transform: translate(-50%, -50%); width:550px;");

      var time = new Date().getTime();
      // img.src = saved_filePath +'?time='+ time;
      const wdr = __dirname;
      console.log(`work directory: ${wdr}`);

      img.src ="message_module/image/"+saved_filePath+'?time='+ time;
      console.log(img);
      console.log(' img.src : ' + img.src)
      //c.height = img.naturalHeight;
      //c.width = img.naturalWidth;
      var ctx = c.getContext('2d');

      ctx.drawImage(img, 0, 0, c.width, c.height);
      var base64String = c.toDataURL();
      console.log(base64String)
      
      // img.style.display = "block";
    }
    //전송하기 누르면 호출되는 이벤트
    if(topic == 'send/image'){
      
      receiver = document.getElementById('message-receiver').value;
      sender = document.getElementById('message-sender').value;
      img = document.getElementById('message-img')

      var c = document.createElement('canvas');
      var ctx = c.getContext('2d');
      c.width = 600;
      c.height = 480;
      ctx.drawImage(img, 0, 0, c.width, c.height);
      var base64String = c.toDataURL();
     // console.log(base64String);

      // var date = new Date().getDate
      // var filename =   new Date().getTime() +'.jpg';

      var newDate = new Date();
      var time = moment(newDate).format('YYYY-MM-DD HH24:MI:SS');
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
        var time = moment(newDate).format('YYYY-MM-DD HH24:MI:SS');
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
      
     // document.getElementById('content').value = byteFile   
    } // end of (topic == 'send/image') ...
})

module.exports = client