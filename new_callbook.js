
/* Section1. 변수 및 모달 관련 */

/* HTML UI */
// let mirror_db = require('./mirror_db');
let callBookBtn = document.getElementById("bar_callbook_button");
let modal = document.getElementById('modal');
let friendList = document.getElementById("friend-list");
let findFriend = document.getElementById("find-friend");
let serachFriendDiv = document.getElementById("search-friend-div");
let ul = document.getElementById('otherUserList');
let searchBtn = document.getElementById('search-btn');
let addFriendBtn =  document.getElementById('add-friend-btn');

/* ADD Event Listener */
callBookBtn.addEventListener("click",showUserMirrorBook);
friendList.addEventListener("change",showUserMirrorBook);
findFriend.addEventListener("change",showUserMirrorBook);
searchBtn.addEventListener('click',userCheck);
addFriendBtn.addEventListener("click",addFriendDB);

/* 친구 추가 관련 Variable */
let add_name = null;
let add_id = null;
let delete_id =null;
let delete_name = null;
let id =null;

/* 모달 동작 함수 */
function modalOn() {
    modal.style.display = "flex"
}
function isModalOn() {
    return modal.style.display === "flex"
}
function modalOff() {
    modal.style.display = "none"
    isClicked = false;
    friendList.checked = true;
}

const closeBtn = modal.querySelector(".close-area")
closeBtn.addEventListener("click", e => {
    modalOff();
})


/* Section2. 연락처 관련 동작 */
function showUserMirrorBook(){

    modal.style.display="flex";
    modal.style.visibility = "visible";
    ul.innerHTML = "";
    document.getElementById('serach-input').value = "";
    document.getElementById('find-result').innerHTML = "";
    document.getElementById('user-img').style.display = "none";
    document.getElementById('add-friend-btn').style.display = "none";

    if(friendList.checked == true){
        ul.style.display = "block";
        serachFriendDiv.style.visibility = "hidden";
        document.getElementById("inside-selected").style.visibility = "visible";
        document.getElementById("outside-selected").style.visibility = "hidden";
        mirror_db.select('id, name','friend',`id=${mirror_db.getId()}`)
        .then(value => { // users에 값 넣기
                for (let k = 0; k < value.length; k++) {
                    let li = document.createElement("li");
                    li.style.width = "85%";
                    li.style.margin = "0 auto";
                    li.style.color="white";
                    li.style.border="none";
                    li.style.borderRadius="5px";
                    li.style.marginBottom = "5px";
                    li.style.fontWeight="bold";
                    li.style.fontSize="20px";
                    let deleteBtn = document.createElement("input");
                    deleteBtn.style.float="right";
                    deleteBtn.value ="✕";
                    deleteBtn.style.marginRight = "20px";
                    deleteBtn.type = "button";
                    deleteBtn.addEventListener("click",deleteUser);
                    li.appendChild(deleteBtn);
                    const textNode = document.createTextNode(value[k].name);
                    const userImg = document.createElement("img");
                    userImg.setAttribute("src","./image/index/user.png");
                    userImg.setAttribute("width","30px");
                    userImg.setAttribute("height","30px");
                    userImg.style.marginLeft = "35px";
                    userImg.style.marginRight = "40px";
                    userImg.style.verticalAlign="middle";
                    li.appendChild(userImg);
                    li.appendChild(textNode);
                    ul.appendChild(li);
                }   
            }
        )
        
    }

    else {
        serachFriendDiv.style.visibility = "visible";
        ul.style.display = "none";
        document.getElementById("inside-selected").style.visibility = "hidden";
        document.getElementById("outside-selected").style.visibility = "visible";

    }
}

function userCheck(){
    document.getElementById('user-img').style.display = "none";
    document.getElementById('add-friend-btn').style.display = "none";
    let friend_id = document.getElementById('serach-input').value;
    if(friend_id == null || friend_id=='')
        return;

    if(friend_id  == mirror_db.getId()){
        console.log('본인이 본인 검색');
        document.getElementById('find-result').innerHTML = `<h3>본인 입니다.</h3>`;
        return;
    }

    //친구 목록에 있는지 확인
    mirror_db.select('*', 'friend', `friend_id=${friend_id}`)
    .then(values =>{
        //친구목록에 이미 추가된 유저이면 추가 안함
        if(values.length>0){
            document.getElementById('find-result').innerHTML = "이미 등록된 유저입니다.";
            id = null
            add_id = null;
            add_name = null;
            console.log("이미 있는 유저임!!!!");
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
                document.getElementById('user-img').style.display = "block";
                document.getElementById('add-friend-btn').style.display = "inline-block";
                document.getElementById('find-result').innerHTML = `${res.data}`
                add_id = friend_id;
                add_name = res.data;
                console.log("여기 들어옴!!!!"+add_name);
            }
            else{
                document.getElementById('find-result').innerHTML = "존재하지 않는 사용자입니다."
                add_id = null;
                add_name = null;
                console.log("친구가 존재하지 않음!!");
            }
        })
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

                document.getElementById('find-result').innerHTML = "추가 되었습니다."
                getUserInfo();
                add_id = null;
                add_name =null;
            }
            else {
                reject(null);
                document.getElementById('find-result').innerHTML = "추가 하지 못헀습니다."
            }
        });
        
    }
    else{
        document.getElementById('find-result').innerHTML = "추가할 수 없습니다.";
    }
}

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

