const mirror_db = require('../mirror_db');
const message_storage = require('./message_storage');
const message = require('./message');
const { io } = require("socket.io-client");
const fs = require('fs');
//const { resolve } = require('path');
const moment = require('moment');
//const mirror_db = require('./mirror_db');
//npm install @types/socket.io-client --save

var socket = io('http://113.198.84.128:80/', { transports : ['websocket'] });

socket.on("connect", () => {
    console.log("connection socket server", mirror_db.getId());
});

function sub(){

    //나에게 서버로부터 메시지가 올 때
    socket.on(`${mirror_db.getId()}`, req => {

        console.log('소켓메시지 도착', req);
        var send_time = moment(req.send_time).format('YYYY-MM-DD HH:mm:ss');
        switch (req.type){
            case 'text':
                let data = {
                    sender : req.sender,
                    receiver : mirror_db.getId(),
                    content : req.content,
                    type : 'text',
                    send_time : send_time
                };
                mirror_db.createColumns('message', data)
                .then(() => {
                    //메시지함에 새로 추가
                    message_storage.showMessageStorage();
                    //메인 ui 메시지 창에 추가
                    message.insertNewMessage();
                })
                break;

            case 'image':
                new Promise((resolve, reject) =>{
                    var time = new Date().getTime();
                    var folder = './image/message/'
                    var filename = time ;
                    var url = req.content.split(',')[1];
                    var bstr = atob(url);
                    var n = bstr.length;
                    // base64 인코딩을 바이트 코드로 변환
                    var u8arr = new Uint8Array(n);
                    console.log(u8arr);
                    fs.open(folder + filename+'.jpg', 'w+', (err, fd)=>{
                    if(err)
                        console.log('open() 실패!');
                    else{
                        fs.writeFile(folder + filename+'.jpg', u8arr, 'utf8', (err)=>{
                            if(err)
                                console.log('퍄일 쓰기 실패');
                        });
                    }      
                    })    
                    while(n--) {
                        u8arr[n] = bstr.charCodeAt(n);
                    }
                    resolve(filename);
                    //mesaage DB에 저장
                }).then(filename =>{

                    //본인의 id는 어떻게 알아낼지
                        let data = {
                            sender : req.sender,
                            receiver : mirrorDB.getId(),
                            content : filename,
                            type : 'image',
                            send_time : send_time
                        };
                        mirror_db.createColumns('message', data)
                        .then(()=> {
                            message.insertNewMessage();
                            message_storage.showMessageStorage();
                        })
                })
                break;
            case 'audio':
                new Promise((resolve, reject) =>{
                    var time = new Date().getTime();
                    var folder = './message_module/record/audio/client/';
                    var filename = time;
                    //var url = req.content.split(',')[1];;
                    var bstr = atob(req.content);
                    var n = bstr.length;
                    // base64 인코딩을 바이트 코드로 변환
                    var u8arr = new Uint8Array(n);

                    fs.open(folder + filename+ '.wav', 'w+', (err, fd)=>{
                    if(err)
                        console.log('open() 실패!');
                    else{
                        fs.writeFile(folder + filename+ '.wav', u8arr, 'utf8', (err)=>{
                            if(err)
                                console.log('퍄일 쓰기 실패');
                        });
                    }      
                    })    
                    while(n--) {
                        u8arr[n] = bstr.charCodeAt(n);
                    }
                    resolve(filename);
                    //mesaage DB에 저장
                }).then(filename =>{
                    //본인의 id는 어떻게 알아낼지
                        let data = {
                            sender : req.sender,
                            receiver : mirrorDB.getId(),
                            content : filename,
                            type : 'audio',
                            send_time : send_time
                        };
                        mirror_db.createColumns('message', data)
                        .then(()=> {
                            message.insertNewMessage();
                            message_storage.showMessageStorage();
                        })
                })
            
        
        }

    });
}
socket.sub = sub;
module.exports = socket;