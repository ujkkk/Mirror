const _db = require('../mirror_db')
const moment = require('moment')
var freinds_obj={};
var freinds_obj_rep = {};
var currunt_sender = '';

//message storage 생성
function showMessageStorage() {
    _db.select('*', 'message', `receiver =${_db.getId()}`)
        .then(messages => {
            create_storage(messages);
        })
}

function create_storage(messages) {

    document.getElementById('message_storage_contents').replaceChildren();
    _db.select('*', 'friend', `id=${_db.getId()}`)
        //freinds_obj[sender] = name 객체 생성
        .then(friends => { 
            if(friends.length <=0) return;        
            friends.forEach(element => {
                freinds_obj[element.friend_id] = element.name;
                freinds_obj_rep[element.friend_id] = element.name;
            })
        }).then(() => {
            for (var i =  messages.length-1; i >=0; i--) {
                var message = messages[i];
                var sender = freinds_obj[message.sender];
                if (sender == 2) continue;

                //message_storage_content(context, date, sender)
                var message_div = document.createElement('div');
                message_div.setAttribute('class', 'message_storage_content');
                message_div.setAttribute('value', message.sender);

                //내용
                var message_content = document.createElement('div');
                message_content.setAttribute('class', 'message_storage_content_context');
                message_content.setAttribute('value', message.sender);
                //Date
                var message_date = document.createElement('div');
                message_date.setAttribute('class', 'message_storage_content_date');
                message_date.setAttribute('value', message.sender);
                message_date.innerHTML = moment(message.send_time).format('MM-DD HH:mm');
                //sender
                var message_send = document.createElement('div');
                message_send.setAttribute('class', 'message_storage_content_sender');
                message_send.setAttribute('value', message.sender);
                message_send.innerHTML = sender;
                if (message_send.innerHTML == 'undefined')
                    message_send.innerHTML = '알 수 없음';
                
                //content
                switch (message.type) {
                    case 'text':
                        message_content.innerHTML = message.content;
                        break;
                    case 'image':
                        message_content.innerHTML = '(사진)';
                        break;
                    case 'audio':
                        message_content.innerHTML = '(음성 메시지)';
                }

                message_div.appendChild(message_send);
                message_div.appendChild(message_date);
                message_div.appendChild(message_content);


                message_content.addEventListener("click", (e) => { message_storage_detail(e.target) });
                document.getElementById('message_storage_contents').appendChild(message_div);
                freinds_obj[message.sender] = 2;

            }
        })
}

const message_send_watch = document.getElementById('message_send_watch')
const progressbar = document.getElementById("progressbar-container")
let progressbar_time
// -------------------------------------------------------- message watch로 알림 보내기 ----------------------------------------------------------
function messageSendWatch(sender_id, content ) {
    clearTimeout(progressbar_time);
    
    _db.select('*', 'friend', `id=${_db.getId()} and friend_id=${sender_id}`)
    //freinds_obj[sender] = name 객체 생성
    .then(friends => { 
        progressbar.style.display = "none"
        const registrationToken = 'd9ntU96TQVeEFHThOjb3M_:APA91bEh-ZT8YfBY3uFdqHAV_xquKmEA--mKtkniMXQa18dFEDAuNDg95ggozekhAC0Qu8E-x3JbTkHR0Fel3JLcdJSbDqXTjF0aJnwldC_g985d5q-dlXN6giprYKA4ET-cQIkIUvDG';
        const message = {
            notification: {
                title: friends[0].name,
                body: content
            },
            token: registrationToken
        };
            // Send a message to the device corresponding to the provided
        // registration token.
        fcm_admin.messaging().send(message)
            .then((response) => {
                // Response is a message ID string.
                console.log('Successfully sent message:', response);
            })
            .catch((error) => {
                console.log('Error sending message:', error);
            });
            progressbar.style.display = "block"
            progressbar_time = setTimeout(()=>{
                progressbar.style.display = "none"
            }, 3000)
    })
    
}


//메시지 함에서 오른쪽 메시지 클릭시 과거의 메시지 모두 출력
function message_storage_detail(e) {

    //message_send_watch.style.visibility = "visible"
    progressbar.style.display = "none"

    var sender_id = e.getAttribute('value');
    var contents = document.getElementById('message_storage_detail_contents');
    contents.replaceChildren();

    if (currunt_sender == sender_id) return;
    currunt_sender = sender_id;
    
    _db.select('*', 'message', `sender=${sender_id} and receiver=${_db.getId()}`)
        .then((messages) => {
            if(messages.length <=0) return;
            messages.forEach(message => {
                let content = document.createElement('div');
                let context = document.createElement('div');
                let date = document.createElement('div');

                content.setAttribute('class', 'message_storage_detail_content');
                context.setAttribute('class', 'message_storage_detail_context');
                date.setAttribute('class', 'message_storage_detail_date');

                /* <button id="message_send_watch"><img class="bar_icon"
                            src="./image/index/watch_send_icon.png"></button> */
                
                let send_watch = document.createElement("button");
                let send_img = document.createElement("img");
                send_img.src ="./image/index/watch_send_icon.png";
                send_watch.appendChild(send_img)
                send_watch.setAttribute('id', 'message_send_watch');

                content.appendChild(send_watch);

                send_watch.addEventListener("click", (e) => { messageSendWatch(sender_id, message.content) });

                //date, time
                date.innerHTML = moment(message.send_time).format('MM-DD HH:mm');

                //context
                switch (message.type) {
                    case 'text':
                        context.innerHTML = message.content;
                        break;
                    case 'image':
                        let img = document.createElement('img');
                        img.src = './image/message/' + message.content + '.png';
                        context.appendChild(img);
                        break;
                    case 'audio':
                        var audio_folder = './message_module/record/audio/client/';
                        var audio = document.createElement('audio');
                        audio.setAttribute('id', 'storage-audio');
                        audio.controls = 'controls';
                        audio.src = audio_folder + message.content + '.wav';
                        context.appendChild(audio);
                        break;

                }
                content.appendChild(context);
                content.appendChild(date);
                contents.prepend(content);
            })

        })
    }
module.exports = { showMessageStorage }