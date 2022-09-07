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
const send_button = document.querySelector('.send_button');

const send_modal = document.querySelector('#send-modal');
const ul = document.querySelector('#otherUserList');
const inside = document.querySelector('#inside');
const outside = document.querySelector('#outside');
const inside_selected = document.querySelector('#inside-selected');
const outside_selected = document.querySelector('#outside-selected');

const { write } = require("fs");
const CMUsers = require("./CMUserInfo");
const client = require("./message_module/message_mqtt");
const mirror_db = require('./mirror_db');

// message display ON/OFF
bar_message_button.addEventListener('click', ()=> {
    console.log('bar_message_button click!');
    if(message_memo_container.style.display == "none"){
        message_memo_container.style.display = "block";
        //init
        write_button.style.display = "block";
        back_button.style.display = "none";
        text_content.style.display = "none";
        image_content.style.display = "none";
        record_content.style.display="none";
        // camera on
        client.publish('camera/on',"start");
    }
    else{
        message_memo_container.style.display = "none";
    }
})

write_button.addEventListener('click', showWrite);
back_button.addEventListener('click', showStore);
send_button.addEventListener('click', showSendModal);
inside.addEventListener('change', showUserBook);
outside.addEventListener('change', showUserBook);

shutter_button.addEventListener('click', () => {
    client.publish('capture/camera',"start");
});

function showSendModal(){
    console.log("showSendModal");
    send_modal.style.visibility = "visible";
}

function showUserBook() {
    
    if(inside.checked == true){
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
                li.style.color="white";
                li.style.border="none";
                li.style.borderRadius="5px";
                li.style.marginBottom = "5px";
                li.style.fontWeight="bold";
                li.style.fontSize="20px";
                li.value=value[k].friend_id;
                let deleteBtn = document.createElement("input");
                deleteBtn.style.float="right";
                deleteBtn.value ="✕";
                deleteBtn.style.marginRight = "20px";
                deleteBtn.type = "button";
                deleteBtn.addEventListener("click",e=>{deleteUser(e)});
                const textNode = document.createTextNode(value[k].name);
                const userImg = document.createElement("img");
                userImg.setAttribute("src","./image/index/user.png");
                userImg.setAttribute("width","30px");
                userImg.setAttribute("height","30px");
                userImg.style.marginLeft = "35px";
                userImg.style.marginRight = "40px";
                userImg.style.verticalAlign="middle";
                li.appendChild(userImg);
                li.appendChild(textNode);
                li.appendChild(deleteBtn);
                ul.appendChild(li);
            }   
        })
    }

    else{ // outside.checked == true
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
                li.style.color="white";
                li.style.border="none";
                li.style.borderRadius="5px";
                li.style.marginBottom = "5px";
                li.style.fontWeight="bold";
                li.style.fontSize="20px";
                li.value=value[k].friend_id;
                let deleteBtn = document.createElement("input");
                deleteBtn.style.float="right";
                deleteBtn.value ="✕";
                deleteBtn.style.marginRight = "20px";
                deleteBtn.type = "button";
                deleteBtn.addEventListener("click",e=>{deleteUser(e)});
                const textNode = document.createTextNode(value[k].name);
                const userImg = document.createElement("img");
                userImg.setAttribute("src","./image/index/user.png");
                userImg.setAttribute("width","30px");
                userImg.setAttribute("height","30px");
                userImg.style.marginLeft = "35px";
                userImg.style.marginRight = "40px";
                userImg.style.verticalAlign="middle";
                li.appendChild(userImg);
                li.appendChild(textNode);
                li.appendChild(deleteBtn);
                ul.appendChild(li);
            }   
        })
    }

}

function showTextContent(){
    text_content.style.display = "block";
    image_content.style.display = "none";
    record_content.style.display="none";
}

function showImageContent(){
    text_content.style.display = "none";
    image_content.style.display = "block";
    record_content.style.display="none";
}

function showRecordContent(){
    text_content.style.display = "none";
    image_content.style.display = "none";
    record_content.style.display = "block";
}


// Write Mode
function showWrite(){
    write_button.style.display = "none";
    back_button.style.display = "block";

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
function showStore(){
    write_button.style.display = "block";
    back_button.style.display = "none";

    // 라디오 버튼 체크 확인
    let radio = document.querySelectorAll(".option_radio");
    var sel_type = null;
    for(var i=0;i<radio.length;i++){
        if(radio[i].checked == true) sel_type = radio[i].value;
    }

    if(sel_type == "text"){
        text_content.style.display = "none";
        image_content.style.display = "none";
        record_content.style.display="none";
    }
    else if(sel_type == "image"){
        text_content.style.display = "none";
        image_content.style.display = "none";
        record_content.style.display="none";
    }
    else { // sel_type == "record"
        text_content.style.display = "none";
        image_content.style.display = "none";
        record_content.style.display="none";
    }
}

// radio button
text.addEventListener('change', () => {
    if(write_button.style.display == "none") showWrite(); // Writing Mode
    else showStore(); // Storage Mode
})
image.addEventListener('change', () => {
    if(write_button.style.display == "none") showWrite(); // Writing Mode
    else showStore(); // Storage Mode
})
record.addEventListener('change', () => {
    if(write_button.style.display == "none") showWrite(); // Writing Mode
    else showStore(); // Storage Mode
})