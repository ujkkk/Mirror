/* Section1. 필요 모듈 require */
var express = require('express');
const logger = require('morgan'); // 서버 접속 연결 확인 도와주는 모듈
const path = require('path');
const fs = require('fs');
const File = require('File')
const server_db = require('./server_db');

const { format } = require('date-fns');
const { id } = require('date-fns/locale');
const mqtt = require('mqtt')

const option = {
    host : '127.0.0.1',
    port :1883
}
const client = mqtt.connect(option)

client.on('connect', function () {
    console.log("mqtt 연결됨")
    client.subscribe('3002/connect_msg');
});

client.on('message', function (topic, message) {
    console.log("mqtt data 도착");

    data = JSON.parse(message);
    console.log(data.sender);
    // fs.writeFile(file, url, 'utf8', function (error) {
    // });
    fs.writeFile('test.jpg',(data.file),'utf8', function (error) {
         });

});

var app = express() // express 는 함수이므로, 반환값을 변수에 저장한다.
var server = require('http').createServer(app);
// http server를 socket.io server로 upgrade한다
var io = require('socket.io')(server)
app.set('port', process.env.PORT || 9000);
app.use(logger('dev'));
/* req.body에 접근하기 위해 필요한 미들웨어 - 파싱도 해줌 */


app.use(express.json({
    limit: '5mb'
}))
app.use(express.urlencoded({
    limit: '5mb',
    extended: false
})) 
 


// 3000 포트로 서버 오픈
server.listen(app.get('port'), function () { //포트 연결 및 서버 실행
    console.log(app.get('port'), '번 포트에서 대기 중');

});

// connection event handler
// connection이 수립되면 event handler function의 인자로 socket이 들어온다
io.on('connection', function (socket) {

    //송신자 클라이언트에서 받아온 message를 바로 수신자 클라이언트로 보냄
    console.log('서버 소켓 연결 완료');
    socket.on('realTime/message', function (data) {
        console.log('socket :');    
        console.log(data);
        reciever = data.receiver;
        // 특정 소켓 클라이언트에게 전달 
        socket.emit(`${reciever}`, data);
        io.emit(`${reciever}`, data);

    });

    // 클라이언트가 전송한 메시지 수신 (socket.on) =========================================================

    // exit 메시지 수신 -> 통화 종료
    socket.on('exit', (roomId) => {
        console.log("exit: " + roomId)
        socket.broadcast.to(roomId).emit('exit')
    })

    // join 메시지 수신 -> 사용자가 해당 방에 들어가고자 함
    socket.on('join', (room) => {
        new Promise(() => {
            // 지금 어딘가에 방에 참가하고 있다면 방에서 나오기
            if (room.oldRoomId != null && room.oldRoomId != room.myRoomId) {
                socket.leave(String(room.oldRoomId))
                socket.broadcast.to(room.oldRoomId).emit('exit')
            }

            // 사용자가 요청한 방이 만들어졌는지 만들어졌으면 그 방에 몇명이 들어가 있는지 확인하는 변수
            const roomClients = socket.adapter.rooms.get(room.newRoomId) || { size: 0 }
            const numberOfClients = roomClients.size


            // 송신자에게만 전달 ==============================================================================

            console.log(room.oldRoomId + " : " + room.newRoomId + ' : ' + room.myRoomId)
            if (room.myRoomId == room.newRoomId) {

                if (numberOfClients != 0) {
                    socket.broadcast.to(room.oldRoomId).emit('exit')
                }
                // 방이 안만들어 져서 만들어서 방 참가(join) --> 해당 방이 자신의 mirror id여야만 가능하게 변경!
                console.log(`Creating room ${room.newRoomId} and emitting room_created socket event`)
                socket.join(room.newRoomId)
                socket.emit('room_created', room.newRoomId)

            } else if (numberOfClients == 1) {
                // 방이 있고 한명만 존재하므로 방 참가(join)
                console.log(`Joining room ${room.newRoomId} and emitting room_joined socket event`)
                socket.join(room.newRoomId)
                socket.emit('room_joined', room.newRoomId)

            } else {
                // 방에 2명이상이라 참가할 수 없다(full)
                console.log(`Can't join room ${room.newRoomId}, emitting full_room socket event`)
                socket.emit('full_room', room.newRoomId)
            }

        })
    })

    // 송신자를 제외한 동일한 방에 연결된 모든 소켓으로 전송 ===================================================

    // 사용자가 전화를 요청해서 같은 방의 다른 사용자에게 전화 요청 전달
    socket.on('start_call', (event) => {
        console.log(`Broadcasting start_call event to peers in room ${event.roomId} : id - ${event.myId}`)
        socket.broadcast.to(event.roomId).emit('start_call', event)
    })

    socket.on('absensce', (event) => {
        console.log(`Broadcasting absensce event to peers in room ${event.roomId} : id - ${event.myId}`)
        socket.broadcast.to(event.roomId).emit('absensce', event.myId)
    })

    // 사용자가 전화를 요청받고 SDP를 전달해서 같은 방의 다른 사용자에게 이를 전달
    socket.on('webrtc_offer', (event) => {
        console.log(`Broadcasting webrtc_offer event to peers in room ${event.roomId}`)
        socket.broadcast.to(event.roomId).emit('webrtc_offer', event)
    })

    // 사용자가 다른 사용자의 SDP를 받고 자신의 SDP를 전달해서 같은 방의 다른 사용자에게 이를 전달
    socket.on('webrtc_answer', (event) => {
        console.log(`Broadcasting webrtc_answer event to peers in room ${event.roomId}`)
        socket.broadcast.to(event.roomId).emit('webrtc_answer', event.sdp)
    })

    // 서로에게 SDP가 전달되고 나서 서로에게 P2P 통신을 위한 ICE 전달 실행 (Signaling)
    socket.on('webrtc_ice_candidate', (event) => {
        console.log(`Broadcasting webrtc_ice_candidate event to peers in room ${event.roomId} id = ${event.myId}`)
        //console.log('||| '+event.candidate)
        socket.broadcast.to(event.roomId).emit('webrtc_ice_candidate', event)
    })

});


/* ----------------- client가 로그인 후, 본인의 메시지 업데이트와 확인 상태 요청 ----------------- */
const userConnectUpdate = (req,res,next) => { // 유저 접속시, 접속중으로 상태 변경
    server_db.update("user", "connect=1", `id=${req.params.id}`)
    .then(()=>{next()})
}
const checkUpdate = (req, res, next) => {
    console.log("func checkUpdate: Request Get Success");
    let id = req.params.id
    console.log(id)
    server_db.select("msg_update, msg_confirm", "state", `receiver = ${id}`)
        .then(value => {
            if (value[0].msg_update == 1 && value[0].msg_confirm == 0) {
                console.log(`user ${id} 확인하지 않은 새로운 변경사항이 있음`);
                next(); //client에게 새로 도착한 메시지들 보내줌
            }
            else {

                let resData = {
                    "status": 0,
                    "contents": [{}]
                }

                res.json(resData)
            }
        }
        )
        .catch( // select 문에 아무것도 찾아지지 않을 때
            () => {

                let resData = {
                    "status": 0,
                    "contents": [{}]
                }

                res.json(resData) //status code를 보내주어야 할 듯(json 형태로)
            }
        )
}

const sendClientToMsg = (req, res, next) => {

    // server msg db 접근해서 해당 receiver에 대한 메시지 다 받아옴(json 배열 형식이 될 듯) -> 이 구조 짜야함
    server_db.select("*", "message", `receiver = ${req.params.id}`)
        .then(value => {
            let msgData = [];
            for (let i = 0; i < value.length; i++) {
                msgData[i] = { "sender": value[i].sender, "content": value[i].content, "type": value[i].type, "send_time":value[i].send_time}
                console.log(msgData[i]);
            }

            let resData = {
                "status": 1,
                "contents": msgData
            }

            res.json(resData); // client 에게 보내기
            next();// DB 삭제 - receiver에 대한+ state table 변경..
        });
}

const setStateTable = (req, res) => {
    console.log(req.body);
    //해당 user에대한 msg 테이블 record 삭제
    server_db.delete('message', `receiver = ${req.body.id}`)
    //State Table 상태 변경 -> msg_update: 0, msg_confirm: 1
    server_db.update("state", "msg_update=0,msg_confirm=1", `receiver=${req.body.id}`)
}


/* -----------------     client가 text msg 보내왔을 때     ----------------- */
const realTimeMsg = (req, res, next) => {

    server_db.select("id, connect", "user", `id = ${req.body.receiver}`)
        .then(value => {
            if (value.length != 0) {
                if (value[0].connect == 1) {
                    let receiver = value[0].id;
                    let data = { "sender": req.body.sender, "content": req.body.content }
                    //mqttClient.publish(`${receiver}`, JSON.stringify(data));
                    res.json(req.body);
                }
                else {
                    next();
                }
            }
        })
}

const msgInsertDB = (req, res, next) => {

    console.log("func msgInserDB: Request Post Success");

    // json 파싱 과정
    let reqBody = req.body;
    const sender = reqBody.sender;
    var data = { "sender": reqBody.sender, 
                "receiver": reqBody.receiver, 
                "content": reqBody.content, 
                "type":"text",
                "send_time":reqBody.send_time }
    

    //db insert
    server_db.createColumns('message', data).then(() => { next() })
}

const updateCheckTable = (req, res) => {

    server_db.select("*", "state", `receiver = ${req.body.receiver}`)
        .then(value => {
            if (value[0]) {
                let receiver = value[0].receiver;
                server_db.update("state", "msg_update=1,msg_confirm=0", `receiver=${receiver}`)
                // .then( () =>{
                //     mqttClient.publish(`${receiver}`, req.body.content);
                // })
            }
            else {
                let data = { "receiver": req.body.receiver, "msg_update": 1, "msg_confirm": 0 }
                server_db.createColumns('state', data);
            }
        })
    res.json(req.body); //response 보냄(echo)
}

/* client가 현재 접속해있는 친구 목록 알고 싶을 때 */
const getConnectedUserList = (req, res) => {
    console.log('getConnectedUserList', req.body)
    let userState = [];
    let checkList = req.body.userData;
    let resData = {};

    setConnectUserList(checkList, 0, userState, resData, res);
}

function setConnectUserList(checkList, index, userState, resData, res) {
    if(checkList.length == 0){
        console.log('return 0')
        res.json(null);
        return;
    }
    server_db.select("id, connect", "user", `id = ${checkList[index]}`)
        .then(value => {
            
            console.log("then 함수 들어옴 i값 : " + index);
            console.log("then 함수 들어옴 value id값 : " + value[0].id);
            let user = value[0].id;
            let isConnect = value[0].connect;
            userState[index] = { "user": user, "connect": isConnect };
            if (index == checkList.length - 1) {
                resData = {
                    "result": userState
                }
                res.json(resData);
                return;
            }
            index = index + 1;
            setConnectUserList(checkList, index, userState, resData, res);
        })
        .catch(() => {
            console.log("catch 함수 들어옴");
            let user = checkList[index];
            let isConnect = 0;
            userState[index] = { "user": user, "connect": isConnect };
            if (index == checkList.length - 1) {
                resData = {
                    "result": userState
                }
                res.json(resData);
                return;
            }
            index = index + 1;
            setConnectUserList(checkList, index, userState, resData, res);
        })
}


// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'imageSend.html'))
// });

app.post('/get/name', (req, res) => {
    var id = req.body.id;
    if (id == null)
        res.send(null);
    server_db.select('*', 'user', `id=${id}`)
        .then(data => {
            if (data.length <= 0)
                res.send(null);
            else {
                console.log(data[0].name);
                res.send(data[0].name);
            }

        })
})
//이미지를 요청했을 때

app.post('/get/image', (req, res) => {
    console.log(req.body);
    let fileName = req.body.fileName;
    server_db.select('*', 'message', `content=${fileName}`)
        .then(datas => {
            if(datas<=0) {
                res.json('imgae load fail');
                return;
            }
            send_time = datas[0].send_time;
            console.log(send_time);
            file = fs.readFileSync('./message/' + req.body.fileName + '.txt', { encoding: 'utf-8', flag: 'r' });

            data = {
                send_time: send_time,
                file: fileName
            }
            res.json(data);
        })

})
//오디오를 요청했을 때
app.post('/get/audio', (req, res) => {
    // 전달할 파일
    let file_name = req.body.fileName;

    // server DB 에서 전달할 파일들 select
    server_db.select('*', 'message', `content=${file_name}`)
        .then(datas => {
            if(datas<=0) {
                res.json('imgae load fail');
                return;
            }
            // 파일을 전송했던 시간
            var send_time = datas[0].send_time;
            // 파일 base64String
            var file_bstr = fs.readFileSync('./message/' + file_name + '.wav', { encoding: 'utf-8' });

            data = {
                send_time: send_time,
                file_bstr: file_bstr
            }
            console.log(data);
            res.json(data);
        })
})
function getConnect(req, res){
    user_id = req.body.id;
    server_db.select('*', 'user', `id=${user_id}`)
    .then(value =>{
        if(value.length<=0){
            let data={connect :'fail' }
            res.json(data);
            return;
        }
        let data={connect :value[0].connect }
        res.json(data);
        
    })
}


function msgInserDBImage(req, res, next){
    console.log(req.body)
    //서버에 저장되는 시간
    var time = new Date().getTime();
    var file_name = time;
    var file = './message/' + file_name + '.txt';
    sender = req.body.sender;
    receiver = req.body.receiver;
    send_time = req.body.send_time;
    var data = {
        sender: sender,
        receiver: receiver,
        content: file_name,
        type: 'image',
        send_time: send_time
    }
    server_db.createColumns('message', data);
    //base64
    url = req.body.content;

    fs.writeFile(file, url, 'utf8', function (error) {
    });
    // while(n--) {
    //     u8arr[n] = bstr.charCodeAt(n);
    // }
    next();
}
function inserSignUp(req, res){
    console.log(req.body);
    id_ = req.body.id;
    name_ = req.body.name;
    

    data ={id:id_, name:name_, connect:1}
    server_db.createColumns('user', data);
    res.send('ok')
}

function msgInserDBAudio(req, res, next){
// 서버에 저장되는 시간
    var save_time = new Date().getTime(); 
    //서버에 저장되는 파일명m
    var file_name = './message/' + save_time + '.wav';
    //서버의 message DB에 남길 순수 파일명(확장자 제외)
    var pure_file_name = String(save_time);

    var bstr = req.body.content; // base64String
    var n = bstr.length;
    var u8arr = new Uint8Array(n);

    // 서버에 파일 저장하기
    fs.writeFile(file_name, u8arr, 'utf8', function (error) {
        console.log(u8arr)
    });
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    sender = req.body.sender;
    receiver = req.body.receiver;
    send_time = req.body.send_time;

    var data = {
        sender: sender,
        receiver: receiver,
        content: pure_file_name,
        type: 'audio',
        send_time: send_time
    }

    // server DB에 저장
    server_db.createColumns('message', data);
    console.log("The file was saved!"); 
    next();
}


// app.post('/send/audio', (req, res, next) => {
//     // 서버에 저장되는 시간
//     var save_time = new Date().getTime(); 
//     //서버에 저장되는 파일명
//     var file_name = './message/' + save_time + '.wav';
//     //서버의 message DB에 남길 순수 파일명(확장자 제외)
//     var pure_file_name = String(save_time);


//     var bstr = req.body.content; // base64String
//     var n = bstr.length;
//     var u8arr = new Uint8Array(n);

//     // 서버에 파일 저장하기
//     fs.writeFile(file_name, u8arr, 'utf8', function (error) {
//         console.log(u8arr)
//     });
//     while (n--) {
//         u8arr[n] = bstr.charCodeAt(n);
//     }

//     sender = req.body.sender;
//     receiver = req.body.receiver;
//     send_time = req.body.send_time;

//     var data = {
//         sender: sender,
//         receiver: receiver,
//         content: pure_file_name,
//         type: 'audio',
//         send_time: send_time
//     }

//     // server DB에 저장
//     server_db.createColumns('message', data);
//     console.log("The file was saved!");
// })


app.get('/check/:id',userConnectUpdate,checkUpdate,sendClientToMsg);
//app.get('/check/:id',userConnectUpdate,checkUpdate,sendClientToMsg,setStateTable);
app.post('/send/text', msgInsertDB, updateCheckTable);
app.post('/send/image', msgInserDBImage, updateCheckTable);
app.post('/send/audio', msgInserDBAudio, updateCheckTable);
app.post('/connect/user',getConnectedUserList);

app.post('/set/userState', setStateTable)
app.post('/get/connect', getConnect)
app.post('/signUp', inserSignUp)