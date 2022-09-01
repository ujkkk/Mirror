const file = require('File');
// const fs = require('fs');
// const axios = require('axios');
require('date-utils'); // new Date().toFormat 을 위한 require

let blob;
let file_path; // 저장된 파일 경로

// 엘리먼트 취득
const $audioEl = document.querySelector("audio");
const $startBtn = document.querySelector("#startBtn");
const $stopBtn = document.querySelector("#stopBtn");
// const $saveBtn = document.querySelector("#saveBtn");
// const $sendBtn = document.querySelector("#sendBtn");

// 녹음중 상태 변수
let isRecording = false;

// MediaRecorder 변수 생성
let mediaRecorder = null;

// 녹음 데이터 저장 배열
const audioArray = [];

$startBtn.onclick = async function (event) {

    // 마이크 mediaStream 생성: Promise를 반환하므로 async/await 사용
    const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // MediaRecorder 생성
    mediaRecorder = new MediaRecorder(mediaStream);

    // 이벤트핸들러: 녹음 데이터 취득 처리
    mediaRecorder.ondataavailable = (event) => {
        audioArray.push(event.data); // 오디오 데이터가 취득될 때마다 배열에 담아둔다.
        console.log("event.data : " + event.data); // object Blob
    }

    // 이벤트핸들러: 녹음 종료 처리 & 재생하기
    mediaRecorder.onstop = (event) => {
        console.log("audioArray: ", audioArray);
        console.log("audioArray Type: ", typeof (audioArray)); // object

        // 녹음이 종료되면, 배열에 담긴 오디오 데이터(Blob)들을 합친다: 코덱도 설정해준다.
        blob = new Blob(audioArray, { "type": "audio/ogg codecs=opus" });
        console.log("blob : " + blob);
        console.log("audioArray type : " + typeof (audioArray));
        audioArray.splice(0); // 기존 오디오 데이터들은 모두 비워 초기화한다.

        // Blob 데이터에 접근할 수 있는 주소를 생성한다.
        const blobURL = window.URL.createObjectURL(blob);
        console.log("blobURL : " + blobURL);


        // audio엘리먼트로 재생한다.
        $audioEl.src = blobURL;
        $audioEl.play();

    }

    // 녹음 시작
    mediaRecorder.start();
    isRecording = true;
    document.querySelector(".blur_effect").style.filter = "blur(5px)";
    document.querySelector("#recordingContainer").style.display = "flex";
    $startBtn.disabled = true;
}

// 녹음 종료
$stopBtn.onclick = async function (event) {
    mediaRecorder.stop();
    isRecording = false;
    document.querySelector(".blur_effect").style.filter = "blur(0px)";
    document.querySelector("#recordingContainer").style.display = "none";
    $startBtn.disabled = false;
}


// 녹음 파일 저장하기
$saveBtn.onclick = async function (event) {
    var reader = new FileReader();
    reader.readAsDataURL(blob);

    reader.onloadend = function () {
        var base64 = reader.result;
        var base64Audio = base64.split(',').reverse()[0];

        var bstr = atob(base64Audio); // base64String

        var n = bstr.length;
        console.log("bstr.length : " + n);

        var save_time = new Date().getTime();
        file_path = './audio/' + save_time + '.wav';

        var u8arr = new Uint8Array(n);
        fs.writeFile(file_path, u8arr, 'utf8', function (error) {
            console.log("u8arr : " + u8arr);
        });
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }

        console.log("The file was saved!");
    } // end of reader.onloadend ...

} // end of $saveBtn.onclick ...


//녹음 파일 전송하기
$sendBtn.onclick = async function (event) {
    // 수신인 id 가져오기
    let receiver_id = parseInt(document.getElementById("receiver_id").value);

    // 현재 시간 가져오기
    var newDate = new Date();
    var send_time = newDate.toFormat('YYYY-MM-DD HH24:MI:SS');
    console.log("time type: " + typeof (time));

    var reader = new FileReader();
    reader.readAsDataURL(blob);

    reader.onloadend = function () {
        var base64 = reader.result;
        var base64Audio = base64.split(',').reverse()[0];

        var bstr = atob(base64Audio); // base64String

        axios({
            url: 'http://localhost:9000/send/audio', // 통신할 웹문서
            method: 'post', // 통신할 방식
            data: { // 인자로 보낼 데이터
                sender: 1001,
                receiver: receiver_id,
                content: bstr,
                type: "audio",
                send_time: send_time
            }
        }); // end of axios ...

    } // end of reader.onloadend ...

} // end of $sendBtn.onclick ...