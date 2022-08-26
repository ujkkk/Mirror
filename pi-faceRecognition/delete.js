client = require('./mqtt')
_db = require('./mirror_db')
let id
//삭제 버튼 누르면 login 실행
//login 토픽에 'delete' 메시지 보내기
//도착한 id가 지역변수 id랑 같은지 체크
function deleteClick(user_id){
    //테스트 위한 지정 값
    console.log('deleteClick id :' + user_id)
    //user_id = 5
    id = String(user_id)
    console.log('delete.js | id : ' + id)
    client.publish('delete/camera', 'delete')
}
client.subscribe("delete/login/check") 

client.subscribe('delete/folder/check')

client.on('message', (topic, message, packet) => {
    console.log("message is "+ message);
    console.log("topic is "+ topic);
    
    if(topic == 'delete/login/check'){
      getId = String(message)
      console.log('delete/login/check | id : '+ getId)
      if(id  == getId){
        console.log('삭제할 수 있습니다.')
        //서버에게 해당 아이디의 폴더를 삭제하라고 보내기
        console.log('publish(delete/folder, id : ' + id)
        client.publish('delete/folder', String(id))
        textDiv = document.getElementById('text')
        if(textDiv != null)
         textDiv.innerHTML="<h3>삭제 중 입니다...</h3>";
        
      }
      else{
        console.log('삭제할 수 없습니다.')
        textDiv = document.getElementById('text')
        if(textDiv != null)
            textDiv.innerHTML="<h3>삭제할 수 없습니다...</h3>";

      }
    }

    if(topic == 'delete/folder/check'){
        user_id = String(message)
        console.log('delete/folder/check | check : '+ user_id)

        console.log('서버에서 폴더 삭제 성공')
        _db.select('user_id', 'user', `user_id =${user_id}`)
        .then(user =>{
            console.log(user.length);
          if( user.length > 0) {
            // delete
            console.log(user[0].user_id)
            _db.delete('user', `user_id =${user[0].user_id}` )
            console.log('디비에서 삭제 되었습니다. id : ' + user[0].user_id)
             //모델 재학습
            client.publish('reTrain', '')
          }
     
        })
    }
 }
)


module.exports =  {deleteClick}