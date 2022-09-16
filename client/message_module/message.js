const mirror_db = require('../mirror_db');
const socket = require('./message_socket')
const moment = require('moment');
let fs = require('fs');

console.log('message call')

const slides = document.querySelector('.message-slides'); //전체 슬라이드 컨테이너
const slideImg = document.querySelectorAll('.message-slides li'); //모든 슬라이드들
let currentIdx = 0; //현재 슬라이드 index
const slideCount = 2; // 슬라이드 개수
const prev = document.querySelector('#message-prev'); //이전 버튼
const next = document.querySelector('#message-next'); //다음 버튼
const slideWidth = 36.8; //한개의 슬라이드 넓이
const slideMargin = 2; //슬라이드간의 margin 값
const messageSendButton = document.getElementById('reply-btn')

messageSendButton.addEventListener('click', () => {
    reply_message()
})

//전체 슬라이드 컨테이너 넓이 설정
slides.style.width = (slideWidth + slideMargin) * slideCount + 'vh';

function moveSlide(num) {

    currentIdx = num;
    slides.style.left = -  num * (slideWidth - 0.8) + 'vh';
    if (num % 2) {
        document.getElementById('point-imag').src = './image/index/point2.png'
        document.getElementById('message-prev').style.visibility = 'visible'
        document.getElementById('message-next').style.visibility = 'hidden'
    } else {
        document.getElementById('point-imag').src = './image/index/point1.png'
        document.getElementById('message-prev').style.visibility = 'hidden'
        document.getElementById('message-next').style.visibility = 'visible'
    }
    
    //   if( currentIdx %2==0){
    //     console.log('currentIdx : '+currentIdx);
    //     //slides.style.top =  -parseInt(num/2) *50 + 'px';
    //     slides.style.left =0 + 'px';
    // }
    //   else{

    //     slides.style.top =  parseInt((num/2)) *50 + 'px';
    //     slides.style.left = -num * 285 + 'px';
    //   }
}

prev.addEventListener('click', () => {
    /*첫 번째 슬라이드로 표시 됐을때는 
    이전 버튼 눌러도 아무런 반응 없게 하기 위해 
    currentIdx !==0일때만 moveSlide 함수 불러옴 */

    if (currentIdx !== 0) moveSlide(currentIdx - 1);
});

next.addEventListener('click', () => {
    /* 마지막 슬라이드로 표시 됐을때는 
    다음 버튼 눌러도 아무런 반응 없게 하기 위해
    currentIdx !==slideCount - 1 일때만 
    moveSlide 함수 불러옴 */
    if (currentIdx !== slideCount - 1) {
        moveSlide(currentIdx + 1);
    }
});


//선택한 메시지 디테일 메시지 창에 띄우기
function message_detail(msg_id) {
    var contents = document.getElementsByClassName('message-content')
    for (var i = 0; i < contents.length; i++) {
        // var content = contents.item(i)
        contents[i].style.backgroundColor = 'black';
        if (contents[i].getAttribute('value') == msg_id) {
            contents[i].style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        }

    }
    document.getElementById('message-detail-container').style.visibility = 'visible';
    //선택된 메시지를 message DB에서 찾음
    mirror_db.select('*', 'message', `msg_id=${msg_id}`)
        .then(selected_msg => {
            //해당 메시지가 디비에 없으면 아무일도 안일어남
            if (selected_msg.length <= 0) {
                console.log('message_detail : 선택된 메시지 디비에 없음');
                return;
            }
            selected_msg = selected_msg[0];
            //선택한 메시지 
            let message_detail_div = document.getElementById('message-detail-div')
            message_detail_div.setAttribute('value', msg_id)
            let detail_sender_div = document.getElementById('message-sender');
            let detail_content_div = document.getElementById('message-content');
            let detail_time_div = document.getElementById('message-time');
            //semder 칮기
            //보낸사람의 이름을 찾기위해 frienDB에 접근
            mirror_db.select('name', 'friend', `friend_id=${selected_msg.sender}`)
                .then(sender => {
                    //없으면 알 수 없음으로 표시, 메시지는 띄움
                    if (sender.length <= 0) {
                        console.log('message_detail : 메시지를 보낸 sender가 friend 디비에 없음')
                        detail_sender_div.innerHTML = '알 수 없음'
                    }
                    else
                        detail_sender_div.innerHTML = `[${sender[0].name}]`;
                    detail_sender_div.setAttribute('value', selected_msg.sender)
                })
            //알맞은 content 찾기

            if (document.getElementById('message-image')) {
                document.getElementById('message-content').removeChild(document.getElementById('message-image'));
                //document.getElementById('image').style.display = 'none';
            }
            if (document.getElementById('message-audio')) {
                document.getElementById('message-content').removeChild(document.getElementById('message-audio'));
                //document.getElementById('image').style.display = 'none';
            }
            switch (selected_msg.type) {
                case 'text':
                    detail_content_div.innerHTML = `${selected_msg.content}`;
                    break;
                case 'image':
                    image_folder = './image/message/'
                    detail_content_div.innerHTML = '';
                    let img = document.createElement('img')
                    img.setAttribute('id', 'message-image')
                    img.src = image_folder + selected_msg.content + '.jpg';
                    detail_content_div.appendChild(img);
                    break;
                case 'audio':
                    var audio_folder = './message_module/record/audio/client/';
                    var audio = document.createElement('audio');
                    detail_content_div.innerHTML = '';
                    audio.setAttribute('id', 'message-audio');
                    audio.src = audio_folder + selected_msg.content + '.wav';
                    audio.controls = 'controls';
                    // audio.play();
                    detail_content_div.appendChild(audio);
                    break;

            }
            detail_time_div.innerHTML = moment(selected_msg.time).format('MM/DD HH:mm')
        })
}

//해당 함수 호출시 미러 내 message DB에서 메시지를 가져와 나에게 온 메세지를 띄움
function initMessages() {
    message_list = Array()
    mirror_db.select('*', 'message', `receiver = ${mirror_db.getId()}`)
        .then(messages => {
            messages.forEach(message => { message_list.unshift(message); })
            for (var i = 0; i < 4; i++) {
                insertMessageContent(message_list[i], 'init');
            }

            // insertMessageContent(message_list[2], 'init');
            // insertMessageContent(message_list[1], 'init');
            // insertMessageContent(message_list[3], 'init');
            // while(message_list.length>0){
            //     //리스트에서 가장 앞 원소를 꺼냄
            //     message = message_list.shift();
            //     console.log(message)
            //     insertMessageContent(message, 'init');
            // }

        })

    // message_list.forEach(message => { })
}


//message 객체를 message 목록(html)에 삽입
let lastClickedId; // 마지막으로 클릭된 msg li의 id
function insertMessageContent(message, type) {

    let message_contents_ui = document.getElementById('message-contents-ui');
    let messageContent = document.createElement('li');
    messageContent.setAttribute('class', 'message-content');
    messageContent.setAttribute('value', message.msg_id);
    //messageContent.setAttribute('onclick', `message_detail(${message.msg_id})`);
    //보낸 사람이 누군지 friend DB에서 이름을 찾음
    mirror_db.select('name', 'friend', `friend_id =${message.sender}`)
        .then(sender => {
            let content;
            //message 미리보기 내용
            switch (message.type) {
                case 'text':
                    content = message.content;
                    if (content.length > 12)
                        content = content.substring(0, 12) + ' ...'
                    break;
                case 'image':
                    content = '(이미지)';
                    break;
                case 'audio':
                    content = '(음성 메시지)';
                    break;
            }

            //보낸이
            if (sender.length <= 0) {
                messageContent.innerHTML = `[알 수 없음] ${content}`
            }
            else
                messageContent.innerHTML = `[${sender[0].name}] ${content}`

            switch (type) {
                case 'init':
                    break;
                case 'new':
                    messageContent.style.color = 'blue';
                    break;
            }
            message_contents_ui.prepend(messageContent);
            messageContent.addEventListener("click", function (e) { 
                console.log("이 이벤트 리스너가 불리긴 함")
                let currentTargetId = e.target.value; // 현재 클릭된 li
               
                if(currentTargetId != lastClickedId){  // 현재 클릭된 아이디가 마지막으로 클릭된 아이디와 다를 때 -> message_detail함수 호출 + 마지막으로 클릭된 아이디 갱신
                    console.log("현재 클릭된 value가 마지막으로 클릭된 아이디와 다를 때")
                    console.log(`current:${currentTargetId}, last:${lastClickedId}`)
                    message_detail(message.msg_id) 
                    lastClickedId = currentTargetId;
                }
                else {  // 현재 클릭된 아이디가 마지막으로 클릭된 아이디와 같을 때 -> detail 창 닫기
                    console.log("현재 클릭된 value가 마지막으로 클릭된 아이디와 같을 때")
                    console.log(`current:${currentTargetId}, last:${lastClickedId}`)
                    lastClickedId = "";
                    e.target.style.backgroundColor = "black"
                    document.getElementById('message-detail-container').style.visibility = 'hidden';
                }
            })
        })
}


//메시지가 새로 와서 메시지함을 갱신하는 함수
//메시지 하나만 새로 추가
function insertNewMessage() {
    mirror_db.select('*', 'message', `receiver = ${mirror_db.getId()}`)
        .then(messages => {
            //가장 마지막에 추가된 메시지 가져오기
            message = messages[messages.length - 1];
            insertMessageContent(message, 'new');
        })
}

// detail-message 창에서 바로 답장
//소켓으로 통신
function reply_message(element) {
    var receiver_id = document.getElementById('message-sender').getAttribute('value')
    var content = document.getElementById('reply-text').value;
    var time = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    socket.emit('realTime/message', {
        sender: mirror_db.getId(),
        receiver: receiver_id,
        content: content,
        type: 'text',
        time: time
    });
    document.getElementById('reply-text').value = '';

}
module.exports = { initMessages, insertNewMessage };