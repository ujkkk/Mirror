client = require('./mqtt')
_db = require('../mirror_db')
const dbAccess = require('../mirror_db');
const loading = require('./loading')
var id
var ids =[];
var names=[];   
function getUserInfo(){
  ids =[];
  names=[];   
  _db.select('*', 'user', 'id is not null')
  .then(users =>{
      users.forEach(user => {
          console.log('id : ' + user.id)

          ids.push(user.id)
          names.push(user.name)
          
      });
      createTable(ids, names)
  })
}

function HighLightTR(target) {
      var trs = document.getElementsByTagName('tr')
      for ( var i = 0; i < trs.length; i++ ) {
          if ( trs[i] != target ) {
          trs[i].style.backgroundColor = '#000000';
          trs[i].style.color = '#ffffff';
          } else {
      trs[i].style.backgroundColor = '#ffffff';
      trs[i].style.color = '#000000';
      }
  } // endfor i
}
function createTable(ids, names){
  const hTbody = document.getElementById('htmlTbody');
  hTbody.textContent =''
  names.forEach(name =>{
      let tr = document.createElement("tr")
      let td = document.createElement("td")
      td.innerHTML = name
      tr.setAttribute('onClick', "HighLightTR(this)")
      tr.appendChild(td)
      hTbody.appendChild(tr)
      console.log(hTbody)
      //hTbody.innerHTML += '<tr>' + newCell0 + '</tr>'
  }); 
  rowEvent()
  
}
function deleteUser(){
  if(deleteName != null){
      index = names.indexOf(deleteName, 0)
      id = ids[index]
      //삭제하기
      deleteClick(id)
  }
}
function rowEvent(){
// 테이블의 Row 클릭시 값 가져오기
$("#table-1 tr").mousedown(function(){ 	

  // 현재 클릭된 Row(<tr>)
  var tr = $(this);
  var td = tr.children();

  // tr.text()는 클릭된 Row 즉 tr에 있는 모든 값을 가져온다.
  console.log("클릭한 Row의 모든 데이터 : "+tr.text());

  // td.eq(index)를 통해 값을 가져올 수도 있다.
  var name = td.eq(0).text();
  deleteName = name
  console.log('change deleteName : '+ deleteName)

});


}
// Home으로 돌아가기
function returnToHome(){
  window.history.back();
}
//삭제 버튼 누르면 login 실행
//login 토픽에 'delete' 메시지 보내기
//도착한 id가 지역변수 id랑 같은지 체크
function deleteClick(user_id){
    //테스트 위한 지정 값
    console.log('deleteClick id :' + user_id)
    //user_id = 5
    id = String(user_id)
    console.log('delete.js | id : ' + id)
    client.publish(`${_db.getMirror_id()}/delete/camera`, String(_db.getMirror_id()))
}
client.subscribe(`${_db.getMirror_id()}/delete/login/check`) 

client.subscribe(`${_db.getMirror_id()}/delete/folder/check`)

client.on('message', (topic, message, packet) => {

    
    if(topic ==`${_db.getMirror_id()}/delete/login/check`){
      getId = String(message)
      console.log('delete/login/check | id : '+ id)
      console.log('delete/login/check | getId : '+ getId)
      if(id  == getId){
        loading.loading();
        //얼굴 인식 서버에게 해당 아이디의 폴더를 삭제하라고 보내기
        console.log('publish(delete/folder, id : ' + id)
        mirror_id = _db.getMirror_id()
        client.publish('delete/folder',String(mirror_id) + String(id))
        textDiv = document.getElementById('delete_msg')
        del_msg('삭제 중 입니다...')
        
      }
      else{
        loading.stopLoading();
        console.log('삭제할 수 없습니다.')
          del_msg('삭제할 수 없습니다...')
            
      }
    }

    if(topic ==`${_db.getMirror_id()}/delete/folder/check`){
        id = String(message)
        loading.loading();
        console.log('delete/folder/check | check : '+ id)

        console.log('서버에서 폴더 삭제 성공')
        _db.select('id', 'user', `id =${id}`)
        .then(user =>{
            console.log(user.length);
          if( user.length > 0) {
            del_msg('삭제 됐습니다.')
            loading.stopLoading();
            // delete
            console.log(user[0].user_id)
            _db.delete('user', `id =${user[0].id}` )
            //테이블 다시 생성
            getUserInfo();
          //  console.log('디비에서 삭제 되었습니다. id : ' + user[0].id)
             //모델 재학습
            client.publish('reTrain', String(_db.getMirror_id()))
          }else{
            //del_msg('삭제 할 수 없습니다.')
          }
     
        })
    }
 }
)

function del_msg(msg){
  let delete_msg = document.getElementById('delete_msg');
  if(delete_msg != null){
    delete_msg.innerHTML = `<h3>${msg}</h3>`
  }
}
module.exports =  {deleteUser}