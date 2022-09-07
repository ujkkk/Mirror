
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
const client = new speech.SpeechClient({ keyFilename: "stt.json" }); // stt client 생성 (stt.json : api key 파일)


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

var create_memo = 0;

function stt(data) {
  let value = data.results[0] && data.results[0].alternatives[0]
    ? `${data.results[0].alternatives[0].transcript}\n`
    : '\n\nReached transcription time limit, press Ctrl+C\n'
  if (create_memo == 0) {
    if (value.includes("전화")) {
      mqttClient.publish('call_request', "call")
      return `받은 내용: ${value} -> 전화 호출\n`
    }
    if (value.includes("메모")) {
      create_memo = 1;
      //publish('create_memo',"create");
      mqttClient.publish('create_memo', "create");
      return `받은 내용: ${value} -> 메모 호출\n`;
    }

    return `받은 내용: ${value} -> 메모를 호출하지 않음\n`;
  }
  else {
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

// mqttClient.subscribe('stt_stop');

// let exist = true;

// mqttClient.on('message', function(topic, message){
//     if(topic.toString() == 'stt_stop'){
//       if(exist==true){
//         exist=false;
//         console.log(recording+'\n');
//         recording.stop();
//         console.log(recording+'\n');
//         console.log("stop");
//       }
//       else if(exist==false){
//         exist=true;
//         recording.stream().on('error', console.error)
//         .pipe(recognizeStream);
//         console.log('start');
//       }

//     }
// });
