let blob;
let file_path;

// 엘리먼트 취득
const player = document.getElementById("player");
const record_button = document.getElementById("record_button");
const recordbars_div = document.getElementById("recordbars_div");
const send_record_button = document.getElementById("send_record_button");



// 녹음 중 상태 변수
let isRecording = false;

// MediaRecorder = null;
let mediaRecorder = null;

// 녹음 데이터 저장 배열
const audioArray = [];

record_button.onclick = async function(event){
    console.log("record_btn onclick");
    console.log(`blob : ${blob}`)
    if(!isRecording){
        console.log("mediaStream 가보자고");
        // 마이크 mediaStream 생성: Promise를 반환하므로 async/await 사용
        const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

        //MediaRecorder 생성
        mediaRecorder = new MediaRecorder(mediaStream);

        // 이벤트 핸들러: 녹음 데이터 취득 처리
        mediaRecorder.ondataavailable = (event) => {
            audioArray.push(event.data); // 오디오 데이터가 취득될 때마다 배열에 담아둔다.
            console.log("event.data : " + event.data); // object Blob
        }

        // 이벤트 핸들러: 녹음 종료 처리 & 재생하기
        mediaRecorder.onstop = (event) => {
            // 녹음이 종료되면, 배열에 담긴 오디오 데이터(Blob)들을 합친다: 코덱도 설정해준다.
            blob = new Blob(audioArray, {"type" : "audio/ogg codecs=opus"});
            audioArray.splice(0); // 기존 오디오 데이터들은 모두 비워 초기화한다.

            // Blob 데이터에 접근할 수 있는 주소를 생성한다.
            const blobURL = window.URL.createObjectURL(blob);

            player.setAttribute("src", blobURL);
            player.play();
        }

        //녹음 시작
        console.log("record start");
        mediaRecorder.start();
        isRecording = true;

        recordbars_div.style.display = "block";
        send_record_button.style.display = "none";
        player.style.display = "none";
    }
    else{
        console.log("record stop()");
        mediaRecorder.stop();
        isRecording = false;

        recordbars_div.style.display = "none";
        send_record_button.style.display = "block";
        player.style.display = "block";
    }
    
}

send_record_button.onclick = async function (event){
    
}

function getBlob(){
    return blob;
}
module.exports = {getBlob};