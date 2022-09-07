const mqtt = require('mqtt')
const spawn = require('child_process').spawn;
const createLoginMessage = require('./loginMessage')
const _db = require('../mirror_db')
const options = {
    host: '127.0.0.1',
    port: 1883
  };
  
  const client = mqtt.connect(options);

  client.subscribe("loginCheck")
  client.subscribe('createAccount/check')
  client.subscribe('exist/check')
  client.subscribe('reTrain/check')

  client.on('message', (topic, message, packet) => {
    console.log("message is "+ message);
    console.log("topic is "+ topic);
    
    if(topic == 'reTrain/check'){
      msg = String(message)
      console.log(msg + '폴더로 재학습 되었습니다.')
      createLoginMessage.createMessage(msg + '폴더로 재학습 되었습니다.')
    }

    if(topic == "exist/check"){
      user_id = String(message)
      if(user_id == 'NULL'){
        //회원가입 하게 만들기
        document.location.href='signUp.html'
      }
      else{
        _db.select('name', 'user', `id =${user_id}`)
        .then(user_name =>{
          createLoginMessage.createMessage(String(user_name[0].name) +'님은 이미 가입된 유저입니다.')
        })
      }

    }
    //서버에서 로그인을 하고 신호가 들어옴
    if(topic == "loginCheck"){
      console.log("topic == loginCheck")
      document.getElementById("loading").style.display="none";
      user_id = String(message)
      console.log('loginCheck : 디비에서 이름 받아오기')
      if(user_id == 'NULL'){
        createLoginMessage.createMessage('등록된 유저가 아닙니다.')
      }
      else{

        _db.select('name', 'user', `id =${user_id}`)
        .then(user_name =>{
          // 'oo님 환영합니다' 문구 
          createLoginMessage.createLoginMessage(String(user_name[0].name))
          // user 디비에 회원 추가
          _db.setUser(user_id)
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
      //이미지 생성

      createMessageDiv.innerHTML= '등록되었습니다.'
        // remote.getCurrentWindow().loadFile('index.html');

      var div = document.getElementById("createAccountMessage")
      div.appendChild(createMessageDiv)
      console.log('등록되었습니다.')
      console.log(str(message))
      if(message == true)
        console.log('2222등록되었습니다.')
        //createLoginMessage('등록되었습니다.')
    }
  })



module.exports = client
