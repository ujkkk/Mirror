const bar_message_button = document.querySelector("#bar_message_button");
const message_memo_container = document.querySelector("#message_memo_container");
const write_button = document.querySelector("#write_button");
const back_button = document.querySelector("#back_button");
const text_content = document.querySelector("#text_content");
const image_content = document.querySelector("#image_content");
const record_content = document.querySelector("#record_content");
const textArea = document.getElementById('textArea');
textArea.addEventListener('click', function (e) { showKeyboard(e) });

const text = document.querySelector("#text");
const image = document.querySelector("#image");
const record = document.querySelector("#record");
const text_label = document.querySelector("#text_label");
const image_label = document.querySelector("#image_label");
const record_label = document.querySelector("#record_label");
const shutter_button = document.querySelector("#shutter_button");
const send_button = document.querySelectorAll('.send_button');

const send_modal = document.querySelector('#send-modal');
const send_ul = document.querySelector('#otherUserList');
const inside = document.querySelector('#inside');
const outside = document.querySelector('#outside');
const inside_selected = document.querySelector('#inside-selected');
const outside_selected = document.querySelector('#outside-selected');
const inside_label = document.querySelector('#inside-label')
const outside_label = document.querySelector('#outside-label')

const sttRefusalContainer = document.getElementById('stt-refusal-container')
const sttAlert = document.getElementById('stt-alert')
const sttSendButton = document.getElementById('stt-sned-button')

// const axios = require('axios');
const { write } = require("fs");
const CMUsers = require("../CMUserInfo");

const client = require("../message_module/message_mqtt");
const socket = require('../message_module/message_socket');
let record_obj = require('../message_module/record/new_m_record');
const dbAccess = require("../mirror_db");

let messageAccess = {} // 모듈 제작을 위한 변수

let setCMuser
let setCMFriend
let customOption = false
let customFriend = null

messageAccess.setCustomFriend = (new_customFriend) => {
    customFriend = new_customFriend
}

messageAccess.getCustomFriend = () => {
    return customFriend
}

messageAccess.setCMuser = (new_CMuser) => {
    setCMuser = new_CMuser
}

messageAccess.setCMFriend = (new_CMFriend) => {
    setCMFriend = new_CMFriend
}

messageAccess.setcustomOption = (new_customOption) => {
    customOption = new_customOption
}

messageAccess.getcustomOption = () => {
    return customOption
}
document.querySelector('#send-modal-close').addEventListener('click', () => {
    friendAlertOff()
})
