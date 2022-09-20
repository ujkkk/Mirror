let blob;
let file_path;

// 엘리먼트 취득
const memo_player = document.getElementById("memo_player");
const memo_record_button = document.getElementById("memo_record_button");
const memo_recordbars_div = document.getElementById("memo_recordbars_div");
const save_record_button = document.getElementById("save_record_button");

const { memo } = require("react");
const mirror_db = require("../mirror_db")

// 녹음 중 상태 변수
let isRecording = false;

// MediaRecorder = null;
let mediaRecorder = null;

// 녹음 데이터 저장 배열
const audioArray = [];

memo_record_button.onclick = async function(event){
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

            memo_player.setAttribute("src", blobURL);
            memo_player.play();
        }

        //녹음 시작
        console.log("record start");
        mediaRecorder.start();
        isRecording = true;

        memo_recordbars_div.style.display = "block";
        save_record_button.style.display = "none";
        memo_player.style.display = "none";
    }
    else{
        console.log("record stop()");
        mediaRecorder.stop();
        isRecording = false;

        memo_recordbars_div.style.display = "none";
        save_record_button.style.display = "block";
        memo_player.style.display = "block";
    }
    
}

save_record_button.onclick = function (event){ // 여기서 메모 DB에 저장
    
    var reader = new FileReader();
   
    reader.readAsDataURL(blob);
    console.log(`save blob : ${blob}`);

    reader.onloadend = async function () {
        var base64 = reader.result;
        console.log(`base64 : ${base64}`);
        var base64Audio = base64.split(',').reverse()[0];

        var bstr = atob(base64Audio); // base64String
        console.log(`memo bstr : ${bstr}`);

        var n = bstr.length;
        console.log("bstr.length : " + n);

        var save_time = new Date().getTime();
        file_path = "./memo_module/record/" + save_time + '.wav';

        var u8arr = new Uint8Array(n);
        fs.writeFile(file_path, u8arr, 'utf8', function (error) {
            console.log("u8arr : " + u8arr);
        });
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        console.log("The file was saved!");
       
        var newDate = new Date();
        var time = moment(newDate).format('YYYY-MM-DD HH:mm:ss');
        
        let data = {
            id:mirror_db.getId(),
            content:save_time,
            store:1,
            time:time,
            delete_time:"2026-04-04 4:44:44",
            type:"audio"
        }
        console.log(`data  = === == ${data.content}`)
    
        mirror_db.addMemo(mirror_db.getId(), save_time , 0, "audio")

        memo_player.style.display = "none";
        save_record_button.style.display = "none";
    } // end of reader.onloadend ...
    
    
}

function getBlob(){
    return blob;
}
module.exports = {getBlob};