server_db = require('../server_db');
mirror_db = require('../mirror_db');
const axios= require('axios');
let add_name = null;
let add_id = null;
let delete_id =null;
let delete_name = null;
let id =null;
const myid = '1001'
function getUserInfo(){
    let ids = new Array();
    let names = new Array();
    //
    mirror_db.get
    mirror_db.select('*', 'friend', `id is not null && id=${myid}`)
   .then(users =>{
       users.forEach(user => {
           console.log('id : ' + user.id)
           ids.push(user.friend_id)
           names.push(user.friend_id_name)
           
       });
       createTable(ids, names)
   })
}
//해당 행을 선택하면 색상이 바뀌는 이벤트 함수
function HighLightTR(target) {
    console.log('하이라이트 호출')
        //var tbody = document.getElementById('')
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
    hTbody.innerHTML =''
    count =0;
    names.forEach(name =>{
        id = ids[count++];
        let tr = document.createElement("tr")
        let td = document.createElement("td")
        td.innerHTML = name
        tr.appendChild(td)

        let td2 = document.createElement("td")
        td2.innerHTML = id
        tr.appendChild(td2)
        tr.setAttribute('onClick', "HighLightTR(this)")
        hTbody.appendChild(tr)

        console.log(hTbody)
        //hTbody.innerHTML += '<tr>' + newCell0 + '</tr>'
    }); 
    rowEvent();
    
}

function userCheck(){
    friend_id = document.getElementById('id_content').value;
    if(friend_id == null || friend_id=='')
        return;

    if(friend_id  == mirror_db.getId()){
        console.log('본인이 본인 검색');
        document.getElementById('text').innerHTML = `<h3>본인 입니다.</h3>`;
        return;
    }

    //친구 목록에 있는지 확인
    mirror_db.select('*', 'friend', `friend_id=${friend_id}`)
    .then(values =>{
        //친구목록에 이미 추가된 유저이면 추가 안함
        if(values.length>0){
            document.getElementById('text').innerHTML = `<h3>이미 등록된 유저입니다.</h3>`
            id = null
            add_id = null;
            add_name = null;
            return;
        }

        //친구목록에 없는 유저를 추가할 때
        axios({
            url : 'http://localhost:9000/get/name',
            method : 'post',
            data : {
                id : friend_id,
            }
        })
        .then(res =>{
            if(res.data != ""){
                document.getElementById('text').innerHTML = `<h3>'${res.data}'</h3>`

                add_id = friend_id;
                add_name = res.data;
            }
            else{
                document.getElementById('text').innerHTML = `<h3>존재하지 않습니다.</h3>`
                add_id = null;
                add_name = null;
            }
        })
        //server_db.select('name','user',`friend_id=${friend_id}`)
        // .then(user =>{
        //     //서버 디비에 등록된 유저일 때 
        //     if( user.length > 0){
        //         name = String(user[0].name);
        //         document.getElementById('text').innerHTML = `<h3>'${name}'</h3>`

        //         add_id = id;
        //         add_name = name;
        //     } else{
        //         document.getElementById('text').innerHTML = `<h3>존재하지 않습니다.</h3>`
        //         add_id = null;
        //         add_name = null;
        //     }
        // })

    })


}

//추가 버튼을 클릭하면 on
function addFriendDB(){
    console.log('add_id : ' +add_id +  ', add_name: ' +add_name);
    if(add_id != null && add_name != null){
        var data = {id: mirror_db.getId(), name: add_name, friend_id : add_id};
        mirror_db.createColumns('friend', data)
        .then(result => {
            if (result) {
                document.getElementById('text').innerHTML = `<h3>추가 되었습니다.</h3>`
                getUserInfo();
                add_id = null;
                add_name =null;
            }
            else {
                reject(null);
                document.getElementById('text').innerHTML = `<h3>추가 하지 못헀습니다.</h3>`
            }
        });
        
    }
    else{
        document.getElementById('text').innerHTML = `<h3>추가할 수 없습니다.</h3>`;
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
    delete_id =  td.eq(1).text();
    delete_name = td.eq(0).text();
    console.log('change deleteName : '+ id)

});

}
//삭제버튼을 누르면 freind db에서 삭제
function deleteUser(){
    if(delete_id != null){
        if (confirm(`'${delete_name}'님을 삭제 하시겠습니까?`)) {
            mirror_db.delete('friend', `id = ${mirror_db.getId()} && friend_id = ${delete_id}`)
            .then(value =>{
                //테이블 갱신
                $('#table-1 > tbody').empty();
                delete_id = null;
                delete_name = null;
                getUserInfo();
            })
            return;
        } else {
            return;
        }
       
   
    }
}