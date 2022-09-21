const mqtt = require('mqtt')
const spawn = require('child_process').spawn;
const createLoginMessage = require('./loginMessage')
const _db = require('../mirror_db')
const loading = require('./loading');
const options = {
    host: '192.168.0.8',
    port: 1883
  };
  
  const client = mqtt.connect(options);

  client.subscribe("loginCheck")
  client.subscribe('createAccount/check')
  client.subscribe('exist/check')
  client.subscribe('reTrain/check')

  client.on('message', (topic, message, packet) => {
    console.log("js 받은 topic is "+ topic);
    console.log("js 받은message is "+ message);

    
    if(topic == 'reTrain/check'){
      msg = String(message)
      console.log(msg + '폴더로 재학습 되었습니다.')
      createLoginMessage.createMessage(String(msg) + '폴더로 재학습 되었습니다.')
      loading.stopLoading();
    }

    if(topic == "exist/check"){
      user_id = String(message)
      if(user_id == 'NULL'){
        //회원가입 하게 만들기
        document.location.href='./sign_up.html'
      }
      else{
        _db.select('name', 'user', `id =${user_id}`)
        .then(values =>{
          if(values.length<= 0){
            //회원가입 하게 만들기
            document.location.href='./sign_up.html'
            return;
          }
          createLoginMessage.createMessage(String(values[0].name) +'님은 이미 가입된 유저입니다.')
          loading.stopLoading();
        })
      }

    }
    //서버에서 로그인을 하고 신호가 들어옴
    if(topic == "loginCheck"){
      console.log("topic == loginCheck")
      document.getElementById("loading").style.display="none";
      user_id = message
      console.log('loginCheck : 디비에서 이름 받아오기')
      if(user_id == 'NULL'){
        createLoginMessage.createMessage('등록된 유저가 아닙니다.')
        loading.stopLoading();
      }
      else{
      
        _db.select('name', 'user', `id =${user_id}`)
        .then(values =>{
          if(values.length <=0){
            print('등록된 유저가 아닙니다.')
            createLoginMessage.createLoginMessage(String('등록된 유저가 아닙니다.'))
          }
          loading.stopLoading();
          // 'oo님 환영합니다' 문구 
          createLoginMessage.createLoginMessage(String(values[0].name))
          // user 디비에 회원 추가
          _db.setMirror(user_id)
        })
      } 
    }

    //서버에서 계정을 추가하고 신호가 올 때
    if(topic == "createAccount/check"){
      console.log("topic == createAccount/check")
      var createMessageDiv = document.createElement("div")
      createMessageDiv.setAttribute("id", "createMessageDiv")
      createMessageDiv.setAttribute("width","500px")
      createMessageDiv.setAttribute("height","100px")
      createMessageDiv.setAttribute("style", "text-align=center;")
      client.publish('closeCamera','')
     // console.log(S(message))
      document.location.href='./home.html'
      
    }
  })



module.exports = client
