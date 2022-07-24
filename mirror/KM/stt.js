const mqtt = require('mqtt')
const mqttClient = mqtt.connect("mqtt://test.mosquitto.org")

const recorder = require('node-record-lpcm16');

// Imports the Google Cloud client library
const speech = require('@google-cloud/speech');

console.log("stt start");

  // Creates a client
const client = new speech.SpeechClient( {keyFilename: "stt.json"});

//const client = new speech.SpeechClient();

/**
 * TODO(developer): Uncomment the following lines before running the sample.
 */

const encoding='LINEAR16'; 
//flac필요없이 잘만 되더라.
const sampleRateHertz=16000; 
const languageCode='ko-KR';

const request = {
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
function stt(data){

  let value = data.results[0] && data.results[0].alternatives[0]
  ? `Transcription: ${data.results[0].alternatives[0].transcript}\n`
  : '\n\nReached transcription time limit, press Ctrl+C\n'
  if (value.includes("메모")) {
    mqttClient.publish('memo',value);
      return `받은 내용: ${value} -> 메모가 포함됨\n`;
  }

  mqttClient.publish('memo',value);
  return `받은 내용: ${value} -> 메모가 아닙니다\n`;
}
// Start recording and send the microphone input to the Speech API.
// Ensure SoX is installed, see https://www.npmjs.com/package/node-record-lpcm16#dependencies
recorder
  .record({
    sampleRateHertz: sampleRateHertz,
    threshold: 0,
    // Other options, see https://www.npmjs.com/package/node-record-lpcm16#options
    verbose: false,
    recordProgram: 'sox', // Try also "arecord" or "sox"
    silence: '3.0',
    sampleRate: 16000 ,
    thresholdEnd: 1,
    threshold: 0.5,
  })
  .stream()
  .on('error', console.error)
  .pipe(recognizeStream);

  console.log('Listening, press Ctrl+C to stop.');
