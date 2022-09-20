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

let create_message = false
let message_content = null

const getFriendName = function (value) {
  let keyword = ""
  if (value.includes("이한테")) {
    keyword = "이한테"
  }
  else if (value.includes("한테")) {
    keyword = "한테"
  }
  else if (value.includes("이에게")) {
    keyword = "이에게"
  }
  else if (value.includes("에게")) {
    keyword = "에게"
  }

  let callValue = value.split(keyword)
  message_content = callValue[1]
  let callName = callValue[0].split(" ")
  return callName[callName.length - 1]
}

function stt(data) {
  let value = data.results[0] && data.results[0].alternatives[0]
    ? `${data.results[0].alternatives[0].transcript}\n`
    : '\n\nReached transcription time limit, press Ctrl+C\n'

    let friendName = null

    if (value.includes("한테") || value.includes("에게")) {
      friendName = getFriendName(value)
    }

    if (value.includes("전화")) {
      mqttClient.publish('call_request', friendName)
      console.log( `받은 내용: ${value} -> 전화 호출\n`)
    }
    else if (value.includes("영상 통화") || value.includes("영상통화")) {
      mqttClient.publish('video_call_request', friendName)
      console.log( `받은 내용: ${value} -> 영상통화 호출\n`)
    }

    else if (value.includes("음성 메시지") || value.includes("음성 메세지") || value.includes("음성메시지") || value.includes("음성메세지")) {
      mqttClient.publish('audio_message_request', friendName)
      console.log( `받은 내용: ${value} -> 음성 메시지 호출\n`)
    }

    else if (value.includes("메시지") || value.includes("메세지")) {
      mqttClient.publish('message_request', `${friendName}? ${message_content}`)
      if (!value.includes("라고") && !value.includes("이라고")) {
        create_message = true
        return `받은 내용: ${value} -> 메시지 호출\n`
      }
      console.log( `받은 내용: ${value} -> 메시지 호출\n`)
    }

    else if (value.includes("사진")) {
      mqttClient.publish('image_request', friendName)
      console.log( `받은 내용: ${value} -> 사진 호출\n`)
    }

    else if (value.includes("메모")) {
      mqttClient.publish('memo_request', value);
      console.log( `받은 내용: ${value} -> 메모 호출\n`)
    }

    else if (value.includes("연락처")) {
      mqttClient.publish('callbook_request', friendName)
      console.log( `받은 내용: ${value} ->  호출\n`)
    }

    if (create_message) {
      mqttClient.publish('message_content', value);
      create_message = false
      console.log(`message_content -> ${value}`)
    }

    if (value.includes("금비") || value.includes("은비")) {
      mqttClient.publish('geumBi', 'geumBi_on')
      console.log( `받은 내용: ${value} -> 금비 호출\n`)
    }

    return `${value}`;
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


