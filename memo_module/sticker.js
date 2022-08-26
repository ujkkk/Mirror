/* sticker.js */
const dbAccess = require('../mirror_db.js')
require('date-utils');

console.log('sticker.js || call');

// memo ui를 자식 요소로 삽입할 class
const myMemo = document.getElementById('myMemo');
const sendMemo = document.getElementById('sendMemo');

/* mysql의 행의 변화(삭제, 삽입, 수정)가 생겼을 때 이벤트 처리 기능 */
var MySQLEvents = require('mysql-events');
// 데이터베이스 연결
var dsn = {
    host: 'localhost',
    user: 'root',
    password: '1234',
};

var mysqlEventWatcher = MySQLEvents(dsn);

// watcher 은 감시자
var watcher = mysqlEventWatcher.add(
    // mirror_db라는 DB에서 memo라는 테이블의 변화가 생겼을 때를 감지하게 설정
    'mirror_db.memo',

    function (oldRow, newRow, event) {
        // 행이 삽입됬을 때 호출
        console.log('sticker.js: start');
        setUI();
    },
    'Active'
);

/* 메모 ui를 형성 */

// 전체 memo ui 설정
const setUI = function () {
    // memo전체를 select 문으로 가져와 contents를 ui로 띄우기
    dbAccess.select('*', 'memo', `user_id=${dbAccess.userId}`)
        .then(value => {
            // 기존에 memo_ui 모두 삭제
            myMemo.innerHTML = "";
            sendMemo.innerHTML = "";
            if (value != null) {
                for (let i = 0; i < value.length; i++) {
                    add_memo_ui(value[i]);
                }
            }
            // html에서 id memo_ui을 새로운 페이지로 변경(reload 비슷한 개념)
            // replace = 기존페이지를 새로운 페이지로 변경
            location.replace(location.href + '#memo_ui');
        })

}

/* store가 1일때 (고정 메모일때) 나타나게 하는 아이콘 띄우기 */
const addStoreIcon = function (memo) {

}

/* */
// const addDeleteIcon = function (memo) {
//     const delteIcon = document.createElement('p');
//     delteIcon.id = "deleteIcon";
//     memo.append(delteIcon);
// }

/* store을 변경하는 함수 */
// seq 번호를 변수로 받아 그 seq의 store 값을 알아내 값에 1을 더해 2로 나누어 store값을 변경
const setStore = function (seq) {
    console.log('setStore call: ' + seq);
    dbAccess.select('store', 'memo', `user_id=${dbAccess.userId} and seq=${seq}`)
        .then(value => {
            // store가 0일 경우 1로, 1일 경우 0으로
            const store = (value[0].store + 1) % 2;
            /* delete time 설정 */
            // 현재 시간 가져오기
            var newDate = new Date();
            // delecte_time 형식 지정
            var time = newDate.toFormat('YYYY-MM-DD HH24:MI:SS');
            // 변화에 따른 db 업데이트
            dbAccess.update('memo', `store = ${store}`, `user_id=${dbAccess.userId} and seq=${seq}`);

            // store가 1이 될 경우 고정 아이콘 띄우기

            console.log(value[0].store);

            if (value[0].store == 1)
                document.getElementById(seq).firstChild.style.visibility = 'visible';
            else {
                document.getElementById(seq).firstChild.style.visibility = 'hidden';
                dbAccess.update('memo', `delete_time = '${time}'`, `user_id=${dbAccess.userId} and seq=${seq}`);
            }
        });

}

/* 메모테이블 한 행을 받아 memo ui 생성 함수 */
const add_memo_ui = function (value) {
    const memo = document.createElement('div');
    const contentSpan = document.createElement('span');
    contentSpan.innerHTML = value.contents;
    memo.appendChild(contentSpan);
    memo.id = value.seq;
    const cancleBtn = document.createElement('div');
    cancleBtn.innerHTML = "✕";
    cancleBtn.className = "memoDeleteBtn";
    cancleBtn.style.visibility = "hidden";
    cancleBtn.addEventListener("click",  function(){
        dbAccess.delete('memo', `user_id=${value.user_id} and seq=${value.seq}`);
    });
    memo.append(cancleBtn);

    const storediv = document.createElement('p');
    const storeIcon = document.createElement('img');
    storeIcon.id = "storeIcon";
    storeIcon.src = './memo_module/img/pin2.png';
    storediv.prepend(storeIcon);
    memo.prepend(storediv);

    // store가 1일 경우 고정 아이콘 띄우기
    if (value.store == 1)
        storediv.style.visibility = 'visible';
    else
        storediv.style.visibility = 'hidden';

    // click 이벤트로 store를 변경을 도와줌 (클릭시 store변경)
    memo.addEventListener("click", function () { setStore(memo.id) });

    //addDeleteIcon(memo);

    // 만약 from이 null일 경우 내가 남긴 메모로 왼쪽에 배치
    if (value.from == null)
        myMemo.prepend(memo);
    // null이 아닐 경우 다른이가 남긴 메모로 오른쪽에 배치
    else {
        sendMemo.prepend(memo);
        const memoFrom = document.createElement('span');
        memoFrom.innerText = `[  ` + value.from + ` ]`;
        sendMemo.prepend(memoFrom);
    }
}

setUI();