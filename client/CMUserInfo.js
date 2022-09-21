
let CMUsers = {};

let nextIndex = 0;
let users = [];
let friendUsers = [];
let startOtherIndex;
let checkConnectedUser = [];
const { resolve } = require('path');
let dbAccess = require('./mirror_db');


CMUsers.setCMUserList = () => new Promise((resolve, reject) => {
    console.log("거울 내 사용자 목록 불러오기");
    users = [];
    console.log(`setCMUserList my id : ${dbAccess.getId()}`);
    dbAccess.select('id, name', 'user', `id <> ${dbAccess.getId()}`) // 현재 사용자가 아닌 다른 사용자 User DB 정보 불러오기
        .then(value => { // users에 값 넣기
            let i = 0;
            for (i = 0; i < value.length; i++) { // 미러내 유저
                users[i] = { "id": value[i].id, "name": value[i].name, "connect": 0 };
            }
            resolve(users);
        }
        );
})

CMUsers.setFriendList = () => new Promise((resolve, reject) => {
    console.log("거울 외부 사용자 목록 불러오기");
    dbAccess.select('friend_id, name', 'friend', `id = ${dbAccess.getId()}`)
        .then(value => { // users에 값 넣기
            for (let k = 0; k < value.length; k++) {
                friendUsers[k] = { "id": value[k].friend_id, "name": value[k].name, "connect": 0 };
                checkConnectedUser[k] = friendUsers[k].id; //서버로 보내서 connect 확인할 친구 목록
            }
        }
        )
        .then(() => {
            console.log("여기가 먼저 불려야함");
            axios({
                method: 'post',
                url: 'http://113.198.84.128:80/connect/user',
                data: {
                    userData: checkConnectedUser
                }
            })
                .then(response => {
                    let results = response.data.result;

                    for (let i = 0; i < results.length; i++) {
                        if (friendUsers[i].id == results[i].user) {
                            friendUsers[i].connect = results[i].connect;
                        }
                    }
                    resolve(friendUsers);
                })

        })
        .catch(
            () => {
                console.log("server state 테이블에서 정보를 가져오지 못함");
            }
        );
})

CMUsers.setCustromUserList = (name) => new Promise((resolve, reject) => {

    console.log("거울 내 사용자 목록 불러오기");
    users = [];
    console.log(`setCMUserList my id : ${dbAccess.getId()}`);
    dbAccess.select('id, name', 'user', `id <> ${dbAccess.getId()} and name like '${name}'`) // 현재 사용자가 아닌 다른 사용자 User DB 정보 불러오기
        .then(value => { // users에 값 넣기
            let i = 0;
            for (i = 0; i < value.length; i++) { // 미러내 유저
                users[i] = { "id": value[i].id, "name": value[i].name, "connect": 0 };
            }
            console.log(`user value len: ${value.length}`)
            resolve(users);
        })
})


CMUsers.setCustromFriendList = (name) => new Promise((resolve, reject) => {
    console.log("거울 외부 사용자 목록 불러오기");
    friendUsers = []
    dbAccess.select('friend_id, name', 'friend', `id = ${dbAccess.getId()} and name like '${name}'`)
        .then(value => { // users에 값 넣기
            for (let k = 0; k < value.length; k++) {
                friendUsers[k] = { "id": value[k].friend_id, "name": value[k].name, "connect": 0 };
                checkConnectedUser[k] = friendUsers[k].id; //서버로 보내서 connect 확인할 친구 목록
            }
            console.log(`friend value len: ${value.length}`)
        })
        .then(() => {
            console.log("여기가 먼저 불려야함");
            axios({
                method: 'post',
                url: 'http://113.198.84.128:80/connect/user',
                data: {
                    userData: checkConnectedUser
                }
            })
                .then(response => {

                    if (response.data != null) {
                        let results = response.data.result;
                        for (let i = 0; i < results.length; i++) {
                            if (friendUsers[i].id == results[i].user) {
                                friendUsers[i].connect = results[i].connect;
                            }
                        }
                    }

                    resolve(friendUsers);
                })

        })
        .catch(
            () => {
                console.log("server state 테이블에서 정보를 가져오지 못함");
            }
        );

    dbAccess.select('friend_id, name', 'friend', `id = ${dbAccess.getId()} and name like '${name}'`)
        .then(value => { // users에 값 넣기
            friendUsers = [];
            for (let k = 0; k < value.length; k++) {
                friendUsers[k] = { "id": value[k].friend_id, "name": value[k].name, "connect": 0 };
                checkConnectedUser[k] = friendUsers[k].id; //서버로 보내서 connect 확인할 친구 목록
            }
        }
        )
        .then(() => {
            console.log("여기가 먼저 불려야함");
            axios({
                method: 'post',
                url: 'http://113.198.84.128:80/connect/user',
                data: {
                    userData: checkConnectedUser
                }
            })
                .then(response => {
                    if (response.data == null) {
                        resolve(friendUsers)
                        return;
                    }
                    else {
                        let results = response.data.result;

                        for (let i = 0; i < results.length; i++) {
                            if (friendUsers[i].id == results[i].user) {
                                friendUsers[i].connect = results[i].connect;
                            }
                        }
                        resolve(friendUsers);
                    }
                })

        })
        .catch(
            () => {
                console.log("server state 테이블에서 정보를 가져오지 못함");
            }
        );
})

module.exports = CMUsers;