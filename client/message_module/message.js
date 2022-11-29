const mirror_db = require('../mirror_db');
// const socket = require('./message_socket')
const moment = require('moment');
let fs = require('fs');
const { showMessageStorage } = require('./message_storage');
const { text } = require('express');
//slide-wrap
var slideWrapper = document.getElementById('msg-slider-wrap');
//current slideIndexition
var slideIndex = 0;
//items
var slides = document.querySelectorAll('#msg-slider-wrap ul li');
//number of slides
let totalSlides;
//get the slide width
var sliderWidth = slideWrapper.clientWidth;
var sliderHeight = slideWrapper.clientHeight
var slider = document.querySelector('#msg-slider-wrap ul#msg-slider');
var nextBtn = document.getElementById('message-next');
var prevBtn = document.getElementById('message-previous');
const CMUsers = require('../CMUserInfo');
const { rejects } = require('assert');
//const socket = require('./message_socket');
const client = require("../mqtt");
const { resolve } = require('path');


var reply_btn = document.getElementById('reply_btn');
reply_btn.onclick= () =>{reply_message();}

// var reply_text = document.getElementById('reply-text');
// reply_text.addEventListener('change', ()=>)
reply_btn.addEventListener('click', reply_message());

// 간편답장 input 태그에 가상 키보드 달기
document.getElementById("reply_text").addEventListener("click",function(e){showKeyboard(e)})
function showKeyboard(e){
    keyboardTarget.setCurrentTarget(e.target.id);
    keyboardTarget.keyboard.style.display="block";
}

function hideKeyboard(){
    keyboardTarget.setCurrentTarget(null);
    keyboardTarget.keyboard.style.display="none";
}

//선택한 메시지 디테일 메시지 창에 띄우기
function message_detail(msg_id) {
    var contents = document.getElementsByClassName('message-content')
    
    for (var i = 0; i < contents.length; i++) {
        // var content = contents.item(i)
        contents[i].style.backgroundColor = 'black';
        if (contents[i].getAttribute('value') == msg_id) {
            contents[i].style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            //new 떼기
            if(contents[i].hasChildNodes()){
                var children = contents[i].childNodes;
                if(children<2) continue;
                    contents[i].innerText = (String)(contents[i].innerText).replace('new','');                                 
                }
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
            console.log('44444');
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
    console.log('#####initMessages#####');
    message_list = Array()
    mirror_db.select('*', 'message', `receiver = ${mirror_db.getId()}`)
        .then(messages => { 
            if(messages.length <=0) return;
            insertMessageContent(messages, 'init') })

}


//message 객체를 message 목록(html)에 삽입
let lastClickedId; // 마지막으로 클릭된 msg li의 id
function insertMessageContent(messages, type) {
    var freinds_obj = {};
    var msg_list = new Array()
    //friend {id : name} 객체 생성
    mirror_db.select('*', 'friend', `id=${mirror_db.getId()}`)
        .then(friends => {
            if(friends.length <=0) resolve();
            friends.forEach(element => {
                freinds_obj[element.friend_id] = element.name;
            })
        })
        .then(() => {
            var i=0;

            let msg_slider = document.getElementById('msg-slider');
            msg_slider.textContent = '';
            for ( i; i < messages.length; i++) {    
                let message = messages[i];  
                let messageContent = document.createElement('div');
                messageContent.setAttribute('class', 'message-content');
                var sender_name = freinds_obj[messages[i].sender];
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
             //   console.log('sender_name.type',sender_name);
                if (sender_name == null) {
                    messageContent.innerHTML = `[${message.sender}] ${content}`
                }
                else
                    messageContent.innerHTML = `[${sender_name}] ${content}`

            
                
                msg_list[i] = messageContent;
                messageContent.addEventListener("click", function (e) {
                    //console.log("이 이벤트 리스너가 불리긴 함")
                  
                    let msg_id = e.target.getAttribute('value');
                    let currentTargetId = e.target.value; // 현재 클릭된 li
                    console.log('msg_id: ',msg_id);
                    if (currentTargetId != lastClickedId) {  // 현재 클릭된 아이디가 마지막으로 클릭된 아이디와 다를 때 -> message_detail함수 호출 + 마지막으로 클릭된 아이디 갱신
                        // console.log("현재 클릭된 value가 마지막으로 클릭된 아이디와 다를 때")
                        // console.log(`current:${currentTargetId}, last:${lastClickedId}`)
                        lastClickedId = currentTargetId;
                        message_detail(msg_id)
                    }
                    else {  // 현재 클릭된 아이디가 마지막으로 클릭된 아이디와 같을 때 -> detail 창 닫기
                        // console.log("현재 클릭된 value가 마지막으로 클릭된 아이디와 같을 때")
                        // console.log(`current:${currentTargetId}, last:${lastClickedId}`)
                        lastClickedId = "";
                        e.target.style.backgroundColor = "black"
                        document.getElementById('message-detail-container').style.visibility = 'hidden';
                    }
                })
                
                //홀수 일 때
                if( messages.length %2==1){
                    if(i==0) continue;
                    if (i % 2 == 0) {
                        var li = document.createElement('li');
                        li.setAttribute('class', 'msg-li');
                        li.appendChild(msg_list[i]);
                        li.appendChild(msg_list[i - 1]);
                        msg_slider.prepend(li);
                    }
                    
                //짝수일 때  
                }else{
                    if (i % 2 == 1) {
                        var li = document.createElement('li');
                        li.setAttribute('class', 'msg-li');
                        li.appendChild(msg_list[i]);
                        li.appendChild(msg_list[i - 1]);
                        msg_slider.prepend(li);
                    }

                    if(i== messages.length -1){
                        if(type =='new'){
                            var new_span = document.createElement('span');
                            new_span.setAttribute('id', 'new');
                            new_span.innerHTML = 'new'
                            msg_list[ messages.length -1].innerHTML +=  "  <sapn id='new'>new</sapn>"
                        }
                    }
                }


            }
            //홀수일 때 마지막 메시지만 li에 content 1개 삽입
            if(messages.length %2==1){
                var li = document.createElement('li');
                li.setAttribute('class', 'msg-li');
                li.appendChild(msg_list[0]);
                msg_slider.appendChild(li);
                 //새로온 메시지
                if(type =='new'){
                    var new_span = document.createElement('span');
                    new_span.setAttribute('id', 'new');
                    new_span.innerHTML = 'new'
                    msg_list[ messages.length -1].innerHTML += "  <sapn id='new'>new</sapn>"
                   // console.log('new_홀수', msg_list[0]);
                }
            }

        })
        //message에 value 지정
        .then(() => {
            for (var i = 0; i < msg_list.length; i++) {
                msg_list[i].setAttribute('value', messages[i].msg_id);
            }
            msg_addEvent(msg_list.length);
            if(msg_list.length%2==1)
                totalSlides = (msg_list.length/2)+0.5;
            else totalSlides = msg_list.length/2;
            document.getElementById('msg_index').innerHTML =`- ${1}/${totalSlides} -`;
        })
       
}


//메시지가 새로 와서 메시지함을 갱신하는 함수
function insertNewMessage() {
    mirror_db.select('*', 'message', `receiver = ${mirror_db.getId()}`)
        .then(messages => {
           if(messages.length <=0) return;
            insertMessageContent(messages, 'new');
        })
}

// detail-message 창에서 바로 답장
//소켓으로 통신

var reply_btn = document.getElementById('reply_btn');
reply_btn.onclick= () =>{reply_message();}

// detail-message 창에서 바로 답장
//소켓으로 통신
function reply_message() {
    console.log('reply_message 들어옴')
    console.log("replay text value: ",document.getElementById('reply_text').value)

    if(mirror_db.getId()==null) return;
    var receiver_id = document.getElementById('message-sender').getAttribute('value')
    if(receiver_id == 0) return;
    //reciever 이름 알아오기
    mirror_db.select('*', 'friend',`id=${mirror_db.getId()} and friend_id=${receiver_id}`)
    .then((value) => {
        if(value.length <=0) {
            console.log('reply_message : freind디비에 없는 유저');
            return;
        }
        //reciever의 접속 여부 알아내기
        console.log('답장 받을 유저의 이름 ',(value[0].name));
        axios({method:'post',url:'http://113.198.84.128:80/get/connect', data:{id:receiver_id}})
        .then((response) =>{
           // console.log(response);
           if(response.data.connect == 'fail'){
                console.log('reply_message : 서버에서 연결여부 불러오기 오류');
                return;
           }
            //답장 전달     
            var content = document.getElementById("reply_text").value; 
            console.log('content 객체',document.getElementById('reply-text'))
            console.log('response.connect',response.connect)

            // var content = document.getElementById('reply-text').getAttribute('value');
            // console.log('content',content)
            var time = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
            var buf = {
                sender: mirror_db.getId(),
                receiver: receiver_id,
                content: content,
                type: 'text',
                send_time: time
            }
            //상대가 접속 되어 있으면 mqtt로 전달
            if(response.data.connect){
               
                client.publish(`${receiver_id}/connect_msg`, buf)
               
            //그렇지 않다면 서버 DB에 해당 메시지를 저장
            }else{
                //서버에 메시지를 저장하는 방법으로 메시지를 보냄
                client.publish('server/send/msg', buf)
            }

        }).then(()=>{document.getElementById('reply_text').value = '';})
    })
}





function msg_addEvent(length) {
    console.log('msg_addEvent :', length);
    //slide-wrap
    slideWrapper = document.getElementById('msg-slider-wrap');
    //current slideIndexition
    slideIndex = 0;
    //items
    slides = document.querySelectorAll('#msg-slider-wrap ul li');
    if(length%2==1)
        totalSlides = (length/2)+0.5;
    else totalSlides = length/2;
    //number of slides
  
    //get the slide width
    sliderWidth = slideWrapper.clientWidth;
    sliderHeight = slideWrapper.clientHeight
    //set width of items
    slides.forEach(function (element) {
        element.style.width = sliderWidth + 'px';
        element.style.height = sliderHeight + 'px';
    })
    //set width to be 'x' times the number of slides
    var slider = document.querySelector('#msg-slider-wrap ul#msg-slider');
    slider.style.width = sliderWidth * totalSlides + 'px';

     // hover
     slideWrapper.addEventListener('mouseover', function () {
        this.classList.add('active');

    });
    slideWrapper.addEventListener('mouseleave', function () {
        this.classList.remove('active');

    });
}
// next, prev
nextBtn = document.getElementById('message-next');
prevBtn = document.getElementById('message-previous');
nextBtn.addEventListener('click', function () {
    plusSlides(1);
});
prevBtn.addEventListener('click', function () {
    plusSlides(-1);
});
function plusSlides(n) {
    showSlides(slideIndex += n);
}

function currentSlides(n) {
    showSlides(slideIndex = n);
}

function showSlides(n) {
    slideIndex = n;
    console.log('slideIndex: ',slideIndex);
    if (slideIndex == -1) {
        slideIndex = totalSlides - 1;
    } else if (slideIndex === totalSlides) {
        slideIndex = 0;
    }
    document.getElementById('msg_index').innerHTML =`-${slideIndex+1}/${totalSlides}-`;
    slider.style.top = -(sliderHeight * slideIndex) + 'px';
}

module.exports = { initMessages, insertNewMessage};