const mirror_db = require('../mirror_db');
const {insertNewMessage } = require('./message');
const { io } = require("socket.io-client");
const fs = require('fs');
//const mirror_db = require('./mirror_db');
//npm install @types/socket.io-client --save

var socket = io('http://113.198.84.128:9000/', { transports : ['websocket'] });


socket.on("connect", () => {
    console.log("connection socket server");
});

console.log('message call')

//나에게 서버로부터 메시지가 올 때
socket.on(`${mirror_db.getId()}`, req => {
    console.log('소켓메시지 도착', req);
    // console.log(req);

    switch (req.type){
        case 'text':
            let data = {
                sender : req.sender,
                receiver : mirror_db.getId(),
                content : req.content,
                type : 'text'
            };
            mirror_db.createColumns('message', data)
            .then(() => insertNewMessage())
            break;

        case 'image':
            new Promise((resolve, reject) =>{
                var time = new Date().getTime();
                var folder = '../image/message/'
                var filename = time + '.jpg';
                url = req.content.split(',')[1];;
                var bstr = atob(url);
                var n = bstr.length;
                // base64 인코딩을 바이트 코드로 변환
                var u8arr = new Uint8Array(n);
                fs.open(folder + filename, 'w+', (err, fd)=>{
                  if(err)
                      console.log('open() 실패!');
                  else{
                      fs.writeFile(folder + filename, u8arr, 'utf8', (err)=>{
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
                          type : 'image'
                      };
                      mirror_db.createColumns('message', data)
                      .then(()=> insertNewMessage())
              })
              break;
       
    }

  });



module.exports = socket;