/* Section1. mqtt 모듈 require 및 broker 연동 */
const mqtt = require('mqtt')
const options = {  //broker 연동 위한 옵션(브로커 IP 및 포트번호)
  host: '127.0.0.1',
  port: 1883
};
mqttClient = mqtt.connect(options);


/* Section2. stt client 및 stt에 사용될 recorder 준비 */
const recorder = require('node-record-lpcm16'); // recoder 사용 위한 모듈 import

// Imports the Google Cloud client library
const speech = require('@google-cloud/speech'); // google-cloud client library

console.log("stt start");

// Creates a client
const client = new speech.SpeechClient({ keyFilename: "mirror.json" }); // stt client 생성 (stt.json : api key 파일)


/* Section3. 녹음 파일 저장 설정 */
const encoding = 'LINEAR16';
//flac필요없이 잘만 되더라.
const sampleRateHertz = 16000;
const languageCode = 'ko-KR';

const request = { // stt client 옵션으로 넣어줄 request
  config: {
    encoding: encoding,
    sampleRateHertz: sampleRateHertz,
    languageCode: languageCode,
  },
  interimResults: false, // If you want interim results, set this to true
};

// Create a recognize stream

console.log(request.config);

const recognizeStream = client
  .streamingRecognize(request)
  .on('error', console.error)
  .on('data', data =>
    process.stdout.write(
      stt(data)
    )
  );

var create_memo = 0
let geumBi = true
let create_message = false

const getFriendName = function (value, keyword) {
  let callValue = value.split(keyword)
  let callName = callValue[0].split(" ")
  return callName[callName.length - 1]
}

const setGeumbi = () => {
  //geumBi = false
  mqttClient.publish('geumBi', 'geumBi_off')
}

function stt(data) {
  let value = data.results[0] && data.results[0].alternatives[0]
    ? `${data.results[0].alternatives[0].transcript}\n`
    : '\n\nReached transcription time limit, press Ctrl+C\n'

  if (!geumBi) {
    if (value.includes("금비")) {
      mqttClient.publish('geumBi', 'geumBi_on')
      geumBi = true
      return `받은 내용: ${value} -> 금비 호출\n`
    }
    return `받은 내용: ${value} -> 금비 호출 X\n`
  }
  else {
    let friendName = null
    if (value.includes("이한테")) {
      friendName = getFriendName(value, "이한테")
    }
    else if (value.includes("이에게")) {
      friendName = getFriendName(value, "이에게")
    }
    else if (value.includes("한테")) {
      friendName = getFriendName(value, "한테")
    }
    else if (value.includes("에게")) {
      friendName = getFriendName(value, "에게")
    }

    if (!create_message) {
      if (value.includes("전화")) {
        mqttClient.publish('call_request', friendName)
        setGeumbi()
        return `받은 내용: ${value} -> 전화 호출\n`
      }
      else if (value.includes("영상 통화") || value.includes("영상통화")) {
        mqttClient.publish('video_call_request', friendName)
        setGeumbi()
        return `받은 내용: ${value} -> 영상통화 호출\n`
      }

      else if (value.includes("음성 메시지") || value.includes("음성 메세지") || value.includes("음성메시지") || value.includes("음성메세지")) {
        mqttClient.publish('audio_message_request',  {friendName: friendName, value: value})
        return `받은 내용: ${value} -> 음성 메시지 호출\n`
      }

      else if (value.includes("메시지") || value.includes("메세지")) {
        mqttClient.publish('message_request', {friendName: friendName, value: value})
        return `받은 내용: ${value} -> 메시지 호출\n`
      }

      else if (value.includes("사진")) {
        mqttClient.publish('image_request',  {friendName: friendName, value: value})
        return `받은 내용: ${value} -> 사진 호출\n`
      }

      else if (value.includes("메모")) {
        create_memo = 1;
        //publish('create_memo',"create");
        mqttClient.publish('create_memo', friendName);
        setGeumbi()
        return `받은 내용: ${value} -> 메모 호출\n`;
      }

      else if (value.includes("연락처")) {
        mqttClient.publish('callbook_request', friendName)
        setGeumbi()
        return `받은 내용: ${value} ->  호출\n`
      }

      setGeumbi()
      return `받은 내용: ${value}\n`;
    }
    else if (create_message) {
      setGeumbi()
      mqttClient.publish('message_content', value);
      return `메시지 전달 내용: ${value}\n`;
    }
  }
  if (create_memo == 1) {
    create_memo = 0;
    //publish('memo_content',value);
    mqttClient.publish('memo_content', value);
    return `메모 전달 내용: ${value}\n`;
  }
}

// Start recording and send the microphone input to the Speech API.
// Ensure SoX is installed, see https://www.npmjs.com/package/node-record-lpcm16#dependencies
let recording = recorder
  .record({
    sampleRateHertz: sampleRateHertz,
    threshold: 0,
    // Other options, see https://www.npmjs.com/package/node-record-lpcm16#options
    verbose: false,
    recordProgram: 'sox', // Try also "arecord" or "sox"
    silence: '3.0',
    sampleRate: 16000,
    thresholdEnd: 1,
    threshold: 0.5,
  });

recording.stream().on('error', console.error)
  .pipe(recognizeStream);

console.log('Listening, press Ctrl+C to stop.');


