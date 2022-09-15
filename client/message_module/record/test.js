const axios = require('axios');
const fs = require('fs');
const { resolve } = require('path');
const mirror_db = require('./mirror_db');

// sender 임시 지정
let sender = mirror_db.getId();
// let sender = data[i].sender;

// 받을 파일 임시 지정
let get_file_name = "1661230800614";

//서버에 저장되어 있는 파일명을 받아오기
// let fileName = datas[i].content

axios({
    url: 'http://localhost:9000/get/audio', // 통신할 웹문서
    method: 'get', // 통신할 방식
    data: { // 인자로 보낼 데이터
        fileName: get_file_name
    }
})
    .then(response => {
        // 클라이언트에 저장되는 시간
        var save_time = new Date().getTime();

        // 클라이언트에 저장되는 파일명
        var file_name = './audio/client/' + save_time + '.wav';

        // 서버에서 받아온 파일의 base64String
        var bstr = response.data.file_bstr;

        // 파일을 보낸 사람이 보낸 시간
        var send_time = response.data.send_time;

        var n = bstr.length;
        var u8arr = new Uint8Array(n);

        // 클라이언트에 파일 저장하기
        fs.writeFile(file_name, u8arr, 'utf8', function (error) {
        });
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }

        // 클라이언트 mirror DB에 저장하기
        let data = {
            sender: sender,
            receiver: '2002',
            content: save_time,
            type: 'audio',
            send_time: send_time
        };
        mirror_db.createColumns('message', data);
    })