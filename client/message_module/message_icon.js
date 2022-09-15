const bar_message_button = document.querySelector("#bar_message_button");
const message_memo_container = document.querySelector("#message_memo_container");
const write_button = document.querySelector("#write_button");
const back_button = document.querySelector("#back_button");
const text_content = document.querySelector("#text_content");
const image_content = document.querySelector("#image_content");
const record_content = document.querySelector("#record_content");

const text = document.querySelector("#text");
const image = document.querySelector("#image");
const record = document.querySelector("#record");
const shutter_button = document.querySelector("#shutter_button");
const send_button = document.querySelectorAll('.send_button');

const send_modal = document.querySelector('#send-modal');
const ul = document.querySelector('#otherUserList');
const inside = document.querySelector('#inside');
const outside = document.querySelector('#outside');
const inside_selected = document.querySelector('#inside-selected');
const outside_selected = document.querySelector('#outside-selected');

// const axios = require('axios');
const { write } = require("fs");
const CMUsers = require("../CMUserInfo");
const client = require("../message_module/message_mqtt");
const socket = require('../message_module/message_socket');
let record_obj = require('../message_module/record/new_m_record');

// message display ON/OFF
bar_message_button.addEventListener('click', () => {
    console.log('bar_message_button click!');
    if (message_memo_container.style.display == "none") {
        message_memo_container.style.display = "block";
        // text.style.display = "none";
        // image.style.display = "none";
        // record.style.display = "none";
        // document.getElementById('radio_container').style.display = "none";
        //init
        write_button.style.display = "block";
        back_button.style.display = "none";
        text_content.style.display = "none";
        image_content.style.display = "none";
        record_content.style.display = "none";
        // camera on
        client.publish('camera/on', "start");
    }
    else {
        message_memo_container.style.display = "none";
        // camera off
        client.publish('camera/close', 'ok')
    }
})

write_button.addEventListener('click', showWrite);
back_button.addEventListener('click', showStore);
for (let i = 0; i < send_button.length; i++) {
    send_button[i].addEventListener('click', showSendModal);
}
inside.addEventListener('change', showUserBook);
outside.addEventListener('change', showUserBook);

shutter_button.addEventListener('click', () => {
    client.publish('capture/camera', "start");
});

function showSendModal() {
    console.log("showSendModal");
    //send_modal.style.display = "block";
    send_modal.style.visibility = "visible";
    showUserBook();
}

function showUserBook() {
    if (inside.checked == true) {
        console.log('inside.checked == true');
        ul.innerHTML = "";
        inside_selected.style.visibility = 'visible';
        outside_selected.style.visibility = 'hidden';
        CMUsers.setCMUserList()
            .then(value => {
                console.log(`CMUSERS[0] :${value[0].id} `)
                for (let k = 0; k < value.length; k++) {
                    let li = document.createElement("li");
                    li.style.width = "85%";
                    li.style.margin = "0 auto";
                    li.style.color = "white";
                    li.style.border = "none";
                    li.style.borderRadius = "5px";
                    li.style.marginBottom = "5px";
                    li.style.fontWeight = "bold";
                    li.style.fontSize = "20px";
                    li.value = value[k].friend_id;
                    const textNode = document.createTextNode(value[k].name);
                    const userImg = document.createElement("img");
                    userImg.setAttribute("src", "./image/index/user.png");
                    userImg.setAttribute("width", "30px");
                    userImg.setAttribute("height", "30px");
                    userImg.style.marginLeft = "35px";
                    userImg.style.marginRight = "40px";
                    userImg.style.verticalAlign = "middle";
                    li.appendChild(userImg);
                    li.appendChild(textNode);

                    // connect UI
                    if (value[k].connect == 1) {
                        const isConnect = document.createElement("p");
                        const circle = document.createElement("div");

                        circle.style.display = "inline-block";
                        circle.style.marginLeft = "10px";
                        circle.style.borderRadius = "50%";
                        circle.style.width = "10px";
                        circle.style.height = "10px";
                        circle.style.backgroundColor = "green";

                        isConnect.style.display = "inline-block";
                        isConnect.style.fontSize = "15px";
                        isConnect.innerHTML = "Online";
                        isConnect.style.float = "right"
                        isConnect.style.marginTop = "2px";
                        isConnect.style.marginRight = "100px";
                        isConnect.appendChild(circle);

                        li.appendChild(isConnect);
                    }
                    else {
                        const isConnect = document.createElement("p");
                        const circle = document.createElement("div");

                        circle.style.display = "inline-block";
                        circle.style.marginLeft = "10px";
                        circle.style.borderRadius = "50%";
                        circle.style.width = "10px";
                        circle.style.height = "10px";
                        circle.style.backgroundColor = "gray";

                        isConnect.style.display = "inline-block";
                        isConnect.style.fontSize = "15px";
                        isConnect.innerHTML = "Offline";
                        isConnect.style.float = "right"
                        isConnect.style.marginTop = "2px";
                        isConnect.style.marginRight = "100px";
                        isConnect.appendChild(circle);

                        li.appendChild(isConnect);
                    }
                    li.addEventListener('click', () => {
                        send_modal.style.visibility = "hidden";

                        let sender = dbAccess.getId(); // 내 id
                        let receiver = value[k].id; // 받는 사람 id

                        // 현재 시간 가져오기
                        var newDate = new Date();
                        var send_time = newDate.toFormat('YYYY-MM-DD HH24:MI:SS');

                        // text, image, audio 3개 중 어떤 경우인지 확인
                        let type_check = 'text';
                        if (image.checked == true) type_check = "image";
                        else if (record.checked == true) type_check = "audio";

                        if (type_check == "text") { // text 전송일 때
                            // text 내용 받아오기
                            let content = document.querySelector("#textArea").innerText;
                            axios({
                                url: 'http://113.198.84.128:80/send/text', // 통신할 웹문서
                                method: 'post', // 통신할 방식
                                data: { // 인자로 보낼 데이터
                                    sender: sender,
                                    receiver: receiver,
                                    content: content,
                                    type: type_check,
                                    send_time: send_time
                                }
                            }); // end of axios ...
                        }
                        else if (type_check == "image") { // image 전송일 때

                        }
                        else { // audio 전송일 때
                            var reader = new FileReader();
                            console.log(record_obj);
                            reader.readAsDataURL(record_obj);

                            reader.onloadend = function () {
                                var base64 = reader.result;
                                var base64Audio = base64.split(',').reverse()[0];

                                var bstr = atob(base64Audio); // base64String

                                axios({
                                    url: 'http://113.198.84.128:80/send/audio', // 통신할 웹문서
                                    method: 'post', // 통신할 방식
                                    data: { // 인자로 보낼 데이터
                                        sender: sender,
                                        receiver: receiver,
                                        content: bstr,
                                        type: type_check,
                                        send_time: send_time
                                    }
                                }); // end of axios ...

                            } // end of reader.onloadend ...

                        } // end of else ...
                    }); // end of addEventListener ...
                    ul.appendChild(li);
                }
            })
    }
    //미러 외부 사용자
    else if (outside.checked == true) { // outside.checked == true
        ul.innerHTML = "";
        inside_selected.style.visibility = 'hidden';
        outside_selected.style.visibility = 'visible';
        CMUsers.setFriendList()
            .then(value => {
                console.log(`CMUSERS[0] :${value[0].id} `)
                for (let k = 0; k < value.length; k++) {
                    let li = document.createElement("li");
                    li.style.width = "85%";
                    li.style.margin = "0 auto";
                    li.style.color = "white";
                    li.style.border = "none";
                    li.style.borderRadius = "5px";
                    li.style.marginBottom = "5px";
                    li.style.fontWeight = "bold";
                    li.style.fontSize = "20px";
                    li.value = value[k].id;
                    const textNode = document.createTextNode(value[k].name);
                    const userImg = document.createElement("img");
                    userImg.setAttribute("src", "./image/index/user.png");
                    userImg.setAttribute("width", "30px");
                    userImg.setAttribute("height", "30px");
                    userImg.style.marginLeft = "35px";
                    userImg.style.marginRight = "40px";
                    userImg.style.verticalAlign = "middle";
                    li.appendChild(userImg);
                    li.appendChild(textNode);

                    // connect UI
                    if (value[k].connect == 1) {
                        const isConnect = document.createElement("p");
                        const circle = document.createElement("div");

                        circle.style.display = "inline-block";
                        circle.style.marginLeft = "10px";
                        circle.style.borderRadius = "50%";
                        circle.style.width = "10px";
                        circle.style.height = "10px";
                        circle.style.backgroundColor = "green";

                        isConnect.style.display = "inline-block";
                        isConnect.style.fontSize = "15px";
                        isConnect.innerHTML = "Online";
                        isConnect.style.float = "right"
                        isConnect.style.marginTop = "2px";
                        isConnect.style.marginRight = "100px";
                        isConnect.setAttribute('value', 'Online');
                        isConnect.appendChild(circle);

                        li.appendChild(isConnect);
                    }
                    else {
                        const isConnect = document.createElement("p");
                        const circle = document.createElement("div");

                        circle.style.display = "inline-block";
                        circle.style.marginLeft = "10px";
                        circle.style.borderRadius = "50%";
                        circle.style.width = "10px";
                        circle.style.height = "10px";
                        circle.style.backgroundColor = "gray";

                        isConnect.style.display = "inline-block";
                        isConnect.style.fontSize = "15px";
                        isConnect.innerHTML = "Offline";
                        isConnect.style.float = "right"
                        isConnect.style.marginTop = "2px";
                        isConnect.style.marginRight = "100px";
                        isConnect.setAttribute('value', 'Offline');
                        isConnect.appendChild(circle);

                        li.appendChild(isConnect);
                    }
                    li.addEventListener('click', () => {
                        send_modal.style.visibility = "hidden";

                        let sender = dbAccess.getId(); // 내 id
                        let receiver = value[k].id; // 받는 사람 id
                        let connect = value[k].connect;
                        console.log(connect);
                        // 현재 시간 가져오기
                        let newDate = new Date();
                        let send_time = newDate.toFormat('YYYY-MM-DD HH24:MI:SS');

                        // text, image, audio 3개 중 어떤 경우인지 확인
                        let type_check = 'text';
                        if (image.checked == true) type_check = "image";
                        else if (record.checked == true) type_check = "audio";

                        switch (type_check) {
                            case 'text':
                                let content = document.querySelector("#textArea").value;
                                //online user
                                if (connect) {
                                    socket.emit('realTime/message', {
                                        sender: sender,
                                        receiver: receiver,
                                        content: content,
                                        type: 'text',
                                        send_time: send_time
                                    });
                                    //offline user 
                                } else {
                                    axios({
                                        url: 'http://113.198.84.128:80/send/text', // 통신할 웹문서
                                        method: 'post', // 통신할 방식
                                        data: { // 인자로 보낼 데이터
                                            sender: sender,
                                            receiver: receiver,
                                            content: content,
                                            type: type_check,
                                            send_time: send_time
                                        }
                                    }); // end of axios ...
                                }
                                break;
                            case 'image':
                                let img = document.getElementById('message_icon')
                                let c = document.createElement('canvas');
                                let ctx = c.getContext('2d');
                                c.width = 600;
                                c.height = 400;
                                ctx.drawImage(img, 0, 0, c.width, c.height);
                                let base64String = c.toDataURL();
                                if (connect) {
                                    socket.emit('realTime/message', {
                                        sender: sender,
                                        receiver: receiver,
                                        content: base64String,
                                        type: 'image',
                                        send_time: send_time
                                    });
                                } else {
                                    axios({
                                        url: 'http://113.198.84.128:80/send/image', // 통신할 웹문서
                                        method: 'post', // 통신할 방식
                                        data: { // 인자로 보낼 데이터
                                            receiver: receiver,
                                            sender: sender,
                                            content: base64String,
                                            type: type_check,
                                            send_time: send_time
                                        }
                                    });
                                }
                                break;
                            case 'audio':
                                var reader = new FileReader();
                                var blob = record_obj.getBlob();
                                console.log(blob);
                                reader.readAsDataURL(blob);
                                reader.onloadend = function () {
                                    var base64 = reader.result;
                                    var base64Audio = base64.split(',').reverse()[0];
                                    new Promise((resolve, reject) => {
                                        var bstr = atob(base64Audio); // base64String  
                                        resolve(bstr);
                                    }).then((bstr) => {
                                        console.log(bstr)
                                        if (connect) {
                                            socket.emit('realTime/message', {
                                                sender: sender,
                                                receiver: receiver,
                                                content: bstr,
                                                type: 'audio',
                                                send_time: send_time
                                            });
                                        } else {
                                            axios({
                                                url: 'http://113.198.84.128:80/send/audio', // 통신할 웹문서
                                                method: 'post', // 통신할 방식
                                                data: { // 인자로 보낼 데이터
                                                    sender: sender,
                                                    receiver: receiver,
                                                    content: bstr,
                                                    type: type_check,
                                                    send_time: send_time
                                                }
                                            }); // end of axios ...
                                        }
                                    }).catch(()=> "audio error")
                                }
                                break;

                                }
                   
                            // //접속되 유저에게 보낼 때 socket이용
                            // if(connect == 1){
                            //     switch(type_check){
                            //         case 'text':
                            //             let content = document.querySelector("#textArea").value;
                            //             socket.emit('realTime/message', {
                            //                 sender : sender,
                            //                 receiver :  receiver,
                            //                 content : content,
                            //                 type : 'text',
                            //                 send_time : send_time
                            //             });
                            //             break;
                            //         case 'image':
                            //             socket.emit('realTime/message', {
                            //                 sender : sender,
                            //                 receiver :  receiver,
                            //                 content : content,
                            //                 type : 'image',
                            //                 send_time : send_time
                            //             });

                            //     }
                            // //접속 안되어 있는 유저한테 보낼 때 DB이용
                            // }else{
                            //     if(type_check == "text") { // text 전송일 때
                            //         // text 내용 받아오기
                            //         let content = document.querySelector("#textArea").value;

                            //     }
                            //     else if(type_check == "image"){ // image 전송일 때
                            //         //서버로 메시지를 보내는 이벤트 publish
                            //         //client.publish('send/image', 'send');
                            //         //console.log("image send success");
                            //         img = document.getElementById('message_icon')
                            //         console.log('img',img);
                            //         var c = document.createElement('canvas');
                            //         var ctx = c.getContext('2d');
                            //         c.width = 600;
                            //         c.height = 480;
                            //         ctx.drawImage(img, 0, 0, c.width, c.height);
                            //         var base64String = c.toDataURL();                     

                            //         axios({
                            //             url: 'http://localhost:9000/send/image', // 통신할 웹문서
                            //             method: 'post', // 통신할 방식
                            //             data: { // 인자로 보낼 데이터
                            //                 receiver: receiver,
                            //                 sender: sender,
                            //                 content: base64String,
                            //                 type: type_check,
                            //                 send_time: send_time
                            //             }
                            //         });
                            //     }
                            //     else{ // audio 전송일 때
                            //         var reader = new FileReader();
                            //         reader.readAsDataURL(blob);

                            //         reader.onloadend = function() {
                            //             var base64 = reader.result;
                            //             var base64Audio = base64.split(',').reverse()[0];

                            //             var bstr = atob(base64Audio); // base64String

                            //             axios({
                            //                 url: 'http://localhost:9000/send/audio', // 통신할 웹문서
                            //                 method: 'post', // 통신할 방식
                            //                 data: { // 인자로 보낼 데이터
                            //                     sender: sender,
                            //                     receiver: receiver,
                            //                     content: bstr,
                            //                     type: type_check,
                            //                     send_time: send_time
                            //                 }
                            //             }); // end of axios ...

                            //         } // end of reader.onloadend ...

                            //     } // end of else ...
                            // }

                        }); // end of addEventListener ...
                    ul.appendChild(li);
                }
            })
    }
}

function showTextContent() {
    text_content.style.display = "block";
    image_content.style.display = "none";
    record_content.style.display = "none";
}

function showImageContent() {
    text_content.style.display = "none";
    image_content.style.display = "block";
    record_content.style.display = "none";
}

function showRecordContent() {
    text_content.style.display = "none";
    image_content.style.display = "none";
    record_content.style.display = "block";
}


// Write Mode
function showWrite() {
    // document.querySelector("#message_storage_view").style.display = "none";
    write_button.style.display = "none";
    back_button.style.display = "block";
    document.getElementById('message_storage_view').style.display = "none";
    // 라디오 버튼 체크 확인
    let radio = document.querySelectorAll(".option_radio");
    // var radio = document.getElementsByName("option");
    var sel_type = null;
    for (var i = 0; i < radio.length; i++) {
        if (radio[i].checked == true) sel_type = radio[i].value;
    }

    if (sel_type == "text") {
        console.log("write mode : text");
        showTextContent();
    }
    else if (sel_type == "image") {
        console.log("write mode : image");
        showImageContent();
    }
    else { // sel_type == "record"
        console.log("write mode : record");
        showRecordContent();
    }
}

// Store Mode
function showStore() {
    write_button.style.display = "block";
    back_button.style.display = "none";
    document.getElementById('message_storage_view').style.display = "block";
    // 라디오 버튼 체크 확인
    let radio = document.querySelectorAll(".option_radio");
    var sel_type = null;
    for (var i = 0; i < radio.length; i++) {
        if (radio[i].checked == true) sel_type = radio[i].value;
    }

    if (sel_type == "text") {
        text_content.style.display = "none";
        image_content.style.display = "none";
        record_content.style.display = "none";
    }
    else if (sel_type == "image") {
        text_content.style.display = "none";
        image_content.style.display = "none";
        record_content.style.display = "none";
    }
    else { // sel_type == "record"
        text_content.style.display = "none";
        image_content.style.display = "none";
        record_content.style.display = "none";
    }
}

// radio button
text.addEventListener('change', () => {
    if (write_button.style.display == "none") showWrite(); // Writing Mode
    else showStore(); // Storage Mode
})
image.addEventListener('change', () => {
    if (write_button.style.display == "none") showWrite(); // Writing Mode
    else showStore(); // Storage Mode
})
record.addEventListener('change', () => {
    if (write_button.style.display == "none") showWrite(); // Writing Mode
    else showStore(); // Storage Mode
})