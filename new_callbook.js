let callBookBtn = document.getElementById("bar_callbook_button");
callBookBtn.addEventListener("click",showUserMirrorBook);
let modal = document.getElementById('modal');
let friendList = document.getElementById("friend-list");
friendList.addEventListener("change",showUserMirrorBook);
let findFriend = document.getElementById("find-friend");
findFriend.addEventListener("change",showUserMirrorBook);
let serachFriendDiv = document.getElementById("search-friend-div");
let ul = document.getElementById('otherUserList');

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

    serachFriendDiv.innerHTML ="";
    while (serachFriendDiv.hasChildNodes()) { // UI 초기화
        serachFriendDiv.removeChild(serachFriendDiv.firstChild);
    } 

    if(friendList.checked == true){
        document.getElementById("inside-selected").style.visibility = "visible";
        document.getElementById("outside-selected").style.visibility = "hidden";
        
    }

    else {
        ul.style.display = "none";
        document.getElementById("inside-selected").style.visibility = "hidden";
        document.getElementById("outside-selected").style.visibility = "visible";

        let serachInput = document.createElement("input");
        serachInput.type = "text";
        serachInput.placeholder="친구 Mirror ID";
        serachInput.id = "serach-input"
        
        let serachBtn = document.createElement("input");
        serachBtn.type="button";
        serachBtn.value="검색";
        serachBtn.id = "search-btn"

        serachFriendDiv.appendChild(serachInput);
        serachFriendDiv.appendChild(serachBtn);
    }
}




