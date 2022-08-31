
let mirror_db = require('./mirror_db');

let callBookBtn = document.getElementById("bar_callbook_button");
callBookBtn.addEventListener("click",showUserMirrorBook);
let modal = document.getElementById('modal');
let friendList = document.getElementById("friend-list");
friendList.addEventListener("change",showUserMirrorBook);
let findFriend = document.getElementById("find-friend");
findFriend.addEventListener("change",showUserMirrorBook);
let serachFriendDiv = document.getElementById("search-friend-div");
let ul = document.getElementById('otherUserList');
let searchBtn = document.getElementById('search-btn');
searchBtn.addEventListener('click',userCheck);


let add_name = null;
let add_id = null;
let delete_id =null;
let delete_name = null;
let id =null;

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

function showUserMirrorBook(){

    modal.style.display="flex";
    modal.style.visibility = "visible";
    document.getElementById('serach-input').value = "";
    document.getElementById('find-result').innerHTML = "";
    document.getElementById('user-img').style.display = "none";
    document.getElementById('add-friend-btn').style.display = "none";

    if(friendList.checked == true){
        serachFriendDiv.style.visibility = "hidden";
        document.getElementById("inside-selected").style.visibility = "visible";
        document.getElementById("outside-selected").style.visibility = "hidden";
        
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
            url : 'http://223.194.159.229:9000/get/name',
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


