let mirrorDB = require('../mirror_db');
require('date-utils');
mirrorDB.userId = mirrorDB.getId();//receivedData;

console.log('message call')

const axios = require('axios');

let sender = 2002;
let contents = '1660631179465.jpg';

const fs = require('fs');
mirror_db = require('../mirror_db');

//받은 메시지가 이미지이면 서버에 해당 파일을 요청하여
//해당 미러에 파일 저장
axios({
  url: 'http://223.194.159.229:9000/get/image', // 통신할 웹문서
  method: 'get', // 통신할 방식
  data: { // 인자로 보낼 데이터
    fileName: '1661236908222',
    ok: 'ok'
  }
})
  //받아온 파일 저장
  .then(response => new Promise((resolve, reject) => {

    var file_name = new Date().getTime() + '.jpg';

    //서버에서 받아온 base64 형식의 이미지 데이터
    var url = response.data.file;
    var send_time = response.data.send_time;
   
    // base64 인코딩을 바이트 코드로 변환
    var bstr = atob(url);
    var n = bstr.length;
    var u8arr = new Uint8Array(n);

    fs.writeFile('../image/message/' + file_name, u8arr, 'utf8', (error) =>{});
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    resolve(file_name);

    //mesaage DB에 저장
  }).then(file_name => {

    //본인의 id는 어떻게 알아낼지
    let data = {
      sender: sender,
      receiver: mirrorDB.getId(),
      content: file_name,
      type: 'image',
      time: send_time
    };
    mirror_db.createColumns('message', data);

  })

  )


