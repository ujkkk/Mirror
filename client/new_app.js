//const moment = require('moment')
// 통화 모듈
const callAccess = require('./call_module/call')
var outerClient
// 날씨 모듈 불러오기
require('./weather_module/new_weather')

const fs = require('fs');
const receivedData = location.href.split('?')[1]
let mirrorDB = require('./mirror_db')
var socket;

var outterClient = require('./mqtt')
mirrorDB.setUser(receivedData)
    .then((user) => {          
        //const socket = require('./message_module/message_socket');
        // socket = require('./message_module/message_socket');
        // socket.sub();

        // const message = require('./message_module/message')
        // const message_storage = require('./message_module/message_storage')
        callAccess.setCall(user.id, user.name)
        require("./message_module/record/new_m_record")
        require("./message_module/message_mqtt")
        require('./message_module/message')
        require('./message_module/message_storage')
        require('./memo_module/memo')
        require('./new_callbook')
        require('./stt_module')
        outerClient = require('./mqtt')
        outerClient.publish("server/user/connect", mirrorDB.getId())
        
        const message = require('./message_module/message')
        message.initMessages()
        require('./message_module/message_socket')
        require('./memo_module/memo')
        require('./new_callbook')
        require('./message_module/message_icon')
        
        require('./setting')

        const message_storage = require('./message_module/message_storage')
        message_storage.showMessageStorage();
        const memo_stroage = require('./memo_module/memo_storage');
        memo_stroage.showMemoStorage();
    })
require('./weather_module/new_weather');

/* 여기서 서버에 접근 + DB에 받아오기 */
const { default: axios } = require('axios');
const dbAccess = require('./mirror_db');
const { contextIsolated } = require('process');
var datas = [];
//outterClient.publish("server/user/connect", mirrorDB.getId())

//axios.get(`http://113.198.84.128:80/check/${mirrorDB.getId()}`)



// axios.get(`http://113.198.84.128:80/check/${mirrorDB.getId()}`)
//     .then(response => {

//         for (let i = 0; i < response.data.contents.length; i++) {
//             datas[i] = response.data.contents[i];
//         }

//         for (let i = 0; i < response.data.contents.length; i++) {
//             let send_time = moment(datas[i].send_time).format('YYYY-MM-DD HH:mm:ss')

//             let data = {
//                 sender: datas[i].sender,
//                 receiver: mirrorDB.getId(),
//                 content: datas[i].content,
//                 type: '',
//                 send_time: send_time
//             };
//             //DB에 삽입
//             switch (datas[i].type) {
//                 case 'text':
//                     //mirrorDB.select
//                     data.type = 'text';
//                     mirrorDB.createColumns('message', data);
//                     break;
//                 case 'image':
//                     data.type = 'image';
//                     mirrorDB.createColumns('message', data);
//                     break;
//                 case 'audio':
//                     data.type = 'audio';
//                     mirrorDB.createColumns('message', data);
//                     break;
//             }
//         }

//         // memo 제작
//         // require('./memo_module/create_memo');
//         // memo ui 설정
//         // require('./memo_module/sticker');   
//     }).then(() => {
//         for (let i = 0; i < datas.length; i++) {
//             let data = datas[i];
//             if (data.type == 'image') {
//                 axios({
//                     url: 'http://113.198.84.128:80/get/image', // 통신할 웹문서
//                     method: 'post', // 통신할 방식
//                     data: { fileName: data.content }
//                 })//받아온 파일 저장
//                     .then(response => {
//                         var file_name = data.content + '.jpg';
//                         //서버에서 받아온 base64 형식의 이미지 데이터
//                         var url = response.data.file;
//                         // base64 인코딩을 바이트 코드로 변환
//                         var bstr = atob(url);
//                         var n = bstr.length;
//                         var u8arr = new Uint8Array(n);
//                         var send_time = response.data.send_time;
//                         // mirrorDB.update("message",`send_time=${send_time}`,`receiver=${receiver}`)
//                         fs.writeFile('./image/message/' + file_name, u8arr, 'utf8', (error) => { });
//                         while (n--) {
//                             u8arr[n] = bstr.charCodeAt(n);
//                         }
//                     })

//             } else if (data.type == 'audio') {
//                 axios({
//                     url: 'http://113.198.84.128:80/get/audio', // 통신할 웹문서
//                     method: 'post', // 통신할 방식
//                     data: { fileName: data.content }
//                 })//받아온 파일 저장
//                     .then(response => {
//                         // 클라이언트에s 저장되는 파일명
//                         var file_name = './message_module/record/audio/client/' + data.content + '.wav';
//                         console.log('오디오 겟:',file_name);
//                         // 서버에서 받아온 파일의 base64String
//                        // var bstr = atob(response.data.file_bstr);
//                         //console.log(bstr);
//                         var n = (response.data.file_bstr).length;
//                         var u8arr = new Uint8Array(n);

//                         // 클라이언트에 파일 저장하기
//                         fs.writeFile(file_name, u8arr, 'utf8', function (error) {
//                         });
//                         while (n--) {
//                             u8arr[n] =  (response.data.file_bstr).charCodeAt(n);
//                         }



// axios.get(`http://113.198.84.128:80/check/${mirrorDB.getId()}`)
//     .then(response => {

//         for (let i = 0; i < response.data.contents.length; i++) {
//             datas[i] = response.data.contents[i];
//         }

//         for (let i = 0; i < response.data.contents.length; i++) {
//             let send_time = moment(datas[i].send_time).format('YYYY-MM-DD HH:mm:ss')

//             let data = {
//                 sender: datas[i].sender,
//                 receiver: mirrorDB.getId(),
//                 content: datas[i].content,
//                 type: '',
//                 send_time: send_time
//             };
//             //DB에 삽입
//             switch (datas[i].type) {
//                 case 'text':
//                     //mirrorDB.select
//                     data.type = 'text';
//                     mirrorDB.createColumns('message', data);
//                     break;
//                 case 'image':
//                     data.type = 'image';
//                     mirrorDB.createColumns('message', data);
//                     break;
//                 case 'audio':
//                     data.type = 'audio';
//                     mirrorDB.createColumns('message', data);
//                     break;
//             }
//         }

//         // memo 제작
//         // require('./memo_module/create_memo');
//         // memo ui 설정
//         // require('./memo_module/sticker');   
//     }).then(() => {
//         for (let i = 0; i < datas.length; i++) {
//             let data = datas[i];
//             if (data.type == 'image') {
//                 axios({
//                     url: 'http://113.198.84.128:80/get/image', // 통신할 웹문서
//                     method: 'post', // 통신할 방식
//                     data: { fileName: data.content }
//                 })//받아온 파일 저장
//                     .then(response => {
//                         var file_name = data.content + '.jpg';
//                         //서버에서 받아온 base64 형식의 이미지 데이터
//                         var url = response.data.file;
//                         // base64 인코딩을 바이트 코드로 변환
//                         var bstr = atob(url);
//                         var n = bstr.length;
//                         var u8arr = new Uint8Array(n);
//                         var send_time = response.data.send_time;
//                         // mirrorDB.update("message",`send_time=${send_time}`,`receiver=${receiver}`)
//                         fs.writeFile('./image/message/' + file_name, u8arr, 'utf8', (error) => { });
//                         while (n--) {
//                             u8arr[n] = bstr.charCodeAt(n);
//                         }
//                     })

//             } else if (data.type == 'audio') {
//                 axios({
//                     url: 'http://113.198.84.128:80/get/audio', // 통신할 웹문서
//                     method: 'post', // 통신할 방식
//                     data: { fileName: data.content }
//                 })//받아온 파일 저장
//                     .then(response => {
//                         // 클라이언트에s 저장되는 파일명
//                         var file_name = './message_module/record/audio/client/' + data.content + '.wav';
//                         console.log('오디오 겟:',file_name);
//                         // 서버에서 받아온 파일의 base64String
//                        // var bstr = atob(response.data.file_bstr);
//                         //console.log(bstr);
//                         var n = (response.data.file_bstr).length;
//                         var u8arr = new Uint8Array(n);

//                         // 클라이언트에 파일 저장하기
//                         fs.writeFile(file_name, u8arr, 'utf8', function (error) {
//                         });
//                         while (n--) {
//                             u8arr[n] =  (response.data.file_bstr).charCodeAt(n);
//                         }

//                     })
//             }
//         }
//     }).then(() => {
//         const message = require('./message_module/message')
//         message.initMessages()
//         const message_storage = require('./message_module/message_storage')
//         message_storage.showMessageStorage();
//         const memo_stroage = require('./memo_module/memo_storage');
//         memo_stroage.showMemoStorage();
//     }).then(() => {
//         //서버에게 메시지 잘 받았다고 보내기
//         axios({
//             url: 'http://113.198.84.128:80/set/userState', // 통신할 웹문서
//             method: 'post', // 통신할 방식
//             data: { id: mirrorDB.getId() }
//         }).then(()=>{
//             message.initMessages()
//             const message_storage = require('./message_module/message_storage')
//             message_storage.showMessageStorage();
//             const memo_stroage = require('./memo_module/memo_storage');
//             memo_stroage.showMemoStorage();
//         })
//     })

   
