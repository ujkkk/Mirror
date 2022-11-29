//서버와 연결하는 MQTT
const mqtt = require('mqtt');
const { resolve } = require('path');
const message_obj = require('./message_module/message')
const message_storage = require('./message_module/message_storage')
var mirrorDB = require('./mirror_db')
const options = {
    host: '192.168.0.2',
    port: 1883
  };
// const options = {
//   host: '127.0.0.1',
//   port: 1883
// };
const client = mqtt.connect(options);
client.on('connect', function () {

  console.log("서버 mqtt와 연결");
  //real time message 받는 토픽
  client.subscribe(`${mirrorDB.getId()}/connect_msg`);
  //non real time message 받는 토픽 
  client.subscribe(`${mirrorDB.getId()}/get/message`)
  //연락처에서 서버 요청 - 친구 찾기(존재하는 사용자인지)
  client.subscribe(`${mirrorDB.getId()}/check/user/exist`)

  client.subscribe(`${mirrorDB.getId()}/get/connect/user`)

})

client.on('message', async (topic, message, packet) => {
  var contents = null;
  console.log(`message is ${message}`);
  console.log(`topic is ${topic}`);

  //로그인시 서버로부터 받은 메시지 저장 
  if (topic == `${mirrorDB.getId()}/get/message`) {
    data = JSON.parse(message);
    nonConnectMsg(data.contents)
  }

  //real time message 저장
  if (topic == `${mirrorDB.getId()}/connect_msg`) {
    console.log(`${mirrorDB.getId()}/connect_msg 처리`)
    contents = JSON.parse(message);
    connectMsg(contents)
  }

})

//client-client간 실시간 메시지
function connectMsg(contents) {

  switch (contents.type) {
    case "text":
      mirrorDB.createColumns('message', contents)
        .then(() => {
          message_obj.insertNewMessage();
          message_storage.showMessageStorage();
        })
      break;
    case "audio":
      break;

    case "image":
      new Promise((reslove, reject) => {
        var time = new Date().getTime();
        var folder = './message_module/image/message/'

        var filename = time;
        //base64(텍스트) 데이터
        var base64Url = contents.content;
        //base64 => bytes
        var byteData = atob(base64Url);
        var n = byteData.length;
        //byte배열 생성, Uint8Array 1개는 1바이트(8bit)
        var byteArray = new Uint8Array(n); //데이트 크기 만큼 

        while (n--) {
          //byte => unicode로 바꿔서 저장
          byteArray[n] = byteData.charCodeAt(n);
        }
        fs.writeFile(folder + filename + '.png', byteArray, 'utf-8', (error) => { });
        reslove(filename)
      }).then((filename) => {
        contents.content = filename
        mirrorDB.createColumns('message', contents)
          .then(() => {
            var message_storage = require('./message_module/message_storage')
            var message_obj = require('./message_module/message')
            message_obj.insertNewMessage();
            message_storage.showMessageStorage();
          })
      })

  }
}
/*로그인시 서버로부터 받은 메시지 저장 */
function nonConnectMsg(contents) {
  new Promise ((resolve, reject) => {
    switch (contents.type) {
      //text는 바로 DB에 저장
      case 'text':
        mirrorDB.createColumns('message', contents);
        break;
      //미디어는 base64데이터를 파일로 저장한 후 DB에 저장
      case 'image':
        //data.content에는 base64이므로 저장한 파일 이름을 다시 저장
        var file_name = new Date().getTime();
        //서버에서 받아온 base64 형식의 이미지 데이터
        var url = contents.content;
        // base64 인코딩을 바이트 코드로 변환
        var bstr = atob(url);
        var n = bstr.length;
        var u8arr = new Uint8Array(n);
        //var send_time = response.data.send_time;
        // mirrorDB.update("message",`send_time=${send_time}`,`receiver=${receiver}`)
        fs.writeFile('./image/message/' + file_name + ".png", u8arr, 'utf8', (error) => { });
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        contents.content = file_name
        mirrorDB.createColumns('message', contents);
        break;
      case 'audio':
        mirrorDB.createColumns('message', contents);
        break;
    }
  }).then(()=> {
    var message_storage = require('./message_module/message_storage')
    var message_obj = require('./message_module/message')
    message_obj.initMessages()
    message_storage.showMessageStorage();
  })
  
}

module.exports = client