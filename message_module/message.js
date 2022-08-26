const mirror_db = require('../mirror_db');


//선택한 메시지 디테일 메시지 창에 띄우기
function message_detail(msg_id) {
    document.getElementById('message-detail-box').style.visibility = 'visible';
    //선택된 메시지를 message DB에서 찾음
    mirror_db.select('*', 'message', `msg_id=${msg_id}`)
        .then(selected_msg => {
            //해당 메시지가 디비에 없으면 아무일도 안일어남
            if (selected_msg.length <= 0) {
                console.log('message_detail : 선택된 메시지 디비에 없음');
                return;
            }
            selected_msg = selected_msg[0];
            console.log(selected_msg)
            //선택한 메시지 

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
                }
                )
            //알맞은 content 찾기

            if (document.getElementById('image')) {
                detail_content_div.removeChild(document.getElementById('image'));
                console.log('삭제됨');
            }
            switch (selected_msg.type) {
                case 'text':
                    detail_content_div.innerHTML = `${selected_msg.content}`;
                    break;
                case 'image':
                    image_forlder = '../image/message/'
                    detail_content_div.innerHTML = '';
                    let img = document.createElement('img');
                    img.setAttribute('id', 'image');
                    img.setAttribute('width', '70px');
                    img.setAttribute('height', '70px');
                    img.src = image_forlder + selected_msg.content;
                    detail_content_div.appendChild(img);

            }
            detail_time_div.innerHTML = `${selected_msg.time}`

        })
}

//해당 함수 호출시 미러 내 message DB에서 메시지를 가져와 나에게 온 메세지를 띄움
function initMessages() {

    mirror_db.select('*', 'message', `receiver = ${mirror_db.getId()}`)
        .then(messages => {
            messages.forEach(message => { insertMessageContent(message, 'init'); })
        })
}

//message 객체를 message 목록(html)에 삽입
function insertMessageContent(message, type) {

    let message_contents = document.getElementById('message-contents');
    let messageContent = document.createElement('div');
    messageContent.setAttribute('class', 'message-content');
    messageContent.setAttribute('value', message.msg_id);
    messageContent.setAttribute('onclick', `message_detail(${message.msg_id})`);
    //보낸 사람이 누군지 friend DB에서 이름을 찾음
    mirror_db.select('name', 'friend', `friend_id =${message.sender}`)
        .then(sender => {
            let content;
            //message 미리보기 내용
            switch (message.type){
                case 'text':
                    content = message.content;
                    break;
                case 'image':
                    content = '(이미지)';
                    break;
                case 'record':
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
            message_contents.prepend(messageContent);
        })
}

//해당 함수 호출시 미러 내 message DB에서 메시지를 가져와 나에게 온 메세지를 띄움
function initMessages() {

    mirror_db.select('*', 'message', `receiver = ${mirror_db.getId()}`)
        .then(messages => {
            messages.forEach(message => { insertMessageContent(message, 'init'); })
        })
}


                
//메시지가 새로 와서 메시지함을 갱신하는 함수
//메시지 하나만 새로 추가
function insertNewMessage() {
    mirror_db.select('*', 'message', `receiver = ${mirror_db.getId()}`)
        .then(messages => {
            //가장 마지막에 추가된 메시지 가져오기
            message = messages[messages.length - 1];
            console.log('insertNewMessage : ');
            console.log(message);
            insertMessageContent(message, 'new');
        })
}
module.exports = { initMessages, insertNewMessage };