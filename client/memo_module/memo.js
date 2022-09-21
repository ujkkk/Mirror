const mirror_db = require('../mirror_db');
const moment = require('moment')
//slide-wrap
var slideWrapper = document.getElementById('memo-slider-wrap');
//current slideIndexition
var slideIndex = 0;
//items
var memo_slides = document.querySelectorAll('#memo-slider-wrap ul li');
//number of slides
var totalSlides ;
//get the slide width
var sliderWidth = slideWrapper.clientWidth;
var slider = document.querySelector('#memo-slider-wrap ul#memo-slider');
var nextBtn = document.getElementById('memo_next');
var prevBtn = document.getElementById('memo_previous');

function addEvent(length){
   
    if(length%2==1)
        totalSlides = (length/2)+0.5;
    else totalSlides = length/2;
    console.log('memo_addEvent :', totalSlides);
    //slide-wrap
    slideWrapper = document.getElementById('memo-slider-wrap');
    //current slideIndexition
    slideIndex = 0;
    //items
    memo_slides = document.querySelectorAll('#memo-slider-wrap ul li');
    //number of slides
    //totalSlides = memo_slides.length;
    //get the slide width
    sliderWidth = slideWrapper.clientWidth;
    //set width of items
    memo_slides.forEach(function (element) {
        element.style.width = sliderWidth + 'px';
    })
    //set width to be 'x' times the number of slides
    slider = document.querySelector('#memo-slider-wrap ul#memo-slider');
    slider.style.width = sliderWidth * totalSlides + 'px';

    // next, prev
    nextBtn = document.getElementById('memo_next');
    prevBtn = document.getElementById('memo_previous');
    nextBtn.addEventListener('click', function () {
        plusSlides(1);
    });
    prevBtn.addEventListener('click', function () {
        plusSlides(-1);
    });

    // hover
    slideWrapper.addEventListener('mouseover', function () {
        this.classList.add('active');

    });
    slideWrapper.addEventListener('mouseleave', function () {
        this.classList.remove('active');

    });

}
function plusSlides(n) {
    showSlides(slideIndex += n);
}

function currentSlides(n) {
    showSlides(slideIndex = n);
}

function showSlides(n) {
    slideIndex = n;
    if (slideIndex == -1) {
        slideIndex = totalSlides - 1;
    } else if (slideIndex === totalSlides) {
        slideIndex = 0;
    }

    slider.style.left = -(sliderWidth * slideIndex) + 'px';
    //pagination();
}

//pagination
//memo_slides.forEach(function () {
   // var li = document.createElement('li');
    //document.querySelector('#slider-pagination-wrap ul').appendChild(li);
//})


// function pagination() {
//     var dots = document.querySelectorAll('#slider-pagination-wrap ul li');
//     dots.forEach(function (element) {
//         element.classList.remove('active');
//     });
//     dots[slideIndex].classList.add('active');
// }


//pagination();

//해당 함수 호출시 미러 내 message DB에서 메시지를 가져와 나에게 온 메세지를 띄움
function initMemo() {
    mirror_db.select('*', 'memo', `id = ${mirror_db.getId()}`)
    .then(memos => { 
            create_memo_div(memos);
    })
   // message_list.forEach(message => { })
}

function create_memo_div(memos){
    var memo_list = new Array()
    if(memos.length%2==1)
        totalSlides = (memos.length/2)+0.5;
    else totalSlides = memos.length/2;

    let memo_slider = document.getElementById('memo-slider');
    memo_slider.textContent = '';
    console.log('<memos.lengt',memos.length);

    for(var i=0; i<memos.length; i++){
        var memo = memos[i];
        console.log(i,memo, memos[i])
        const memo_div = document.createElement('div');
        memo_div.setAttribute('class','memo');
        memo_div.id = memos[i].seq;

        const memo_store = document.createElement('div');
        memo_store.setAttribute('class','memo_store');

        if (memo.store == 1)
            memo_store.style.visibility = 'visible';
        else
            memo_store.style.visibility = 'hidden';

        const store_image = document.createElement('img');
        store_image.src = "./image/index/star_icon.png";
        memo_store.prepend(store_image)
        memo_div.prepend(memo_store)

        const memo_content = document.createElement('div');
        memo_content.setAttribute('class','memo-content');
        const memo_time = document.createElement('div');
        memo_time.setAttribute('class','memo-time')

        memo_time.addEventListener("click", function () { setStore(memo_div.id) });
        //time
        time= moment(memo.time).format('MM/DD')
        // time = (String(memo.time)).substring(5,memo_time.length);
        // time = time.split(':')
        memo_time.innerHTML = time
        console.log(memo_time.innerHTML);

        //content
        switch(memo.type) {
            case 'text':
                memo_content.innerHTML = memo.content;
                break;
            case 'image':
                image_forlder = './memo_module/image/'
                memo_content.innerHTML = '';
                let img = document.createElement('img')
                
                img.src = image_forlder + memo.content + '.jpg';
                console.log('img.src :' + img.src)

                memo_content.appendChild(img);
                break;
            case 'audio':
                record_forlder = './memo_module/record/'
                let audio_img = document.createElement('img')
                audio_img.src = "./image/index/play.png"
                audio_img.value = "0"
                audio_img.id = "audio-img"

                let audio_player = document.createElement('audio')
                audio_player.style = "visibility:hidden"
                audio_player.id = "slide_memo_player"
                audio_player.controls="controls"
                audio_player.src = record_forlder+memo.content+".wav"
                memo_content.appendChild(audio_player);

                audio_img.addEventListener("click",function(e){
                    console.log("audio_img clicked 됨")

                    if (e.target.value == "0"){
                        e.target.value = "1"
                        audio_player.play();
                    }
                    else {
                        e.target.value = "0"
                        audio_player.pause();
                    }
                })
                audio_player.addEventListener('play',()=>{audio_img.src = "./image/index/pause.png"})
                audio_player.addEventListener('pause',()=>{ audio_img.src = "./image/index/play.png"})
                audio_player.addEventListener('ended',function(){
                    audio_img.src = "./image/index/play.png"
                    audio_img.value = "0"
                })
                memo_content.appendChild(audio_img);
                memo_content.appendChild(audio_player)
                break;
        }    

        memo_div.appendChild(memo_content);
        memo_div.appendChild(memo_time);
        memo_list[i] = memo_div;


        //홀수 일 때
        if( memos.length %2==1){
            if(i==0) continue;
            if (i % 2 == 0) {
                var li = document.createElement('li');
                li.setAttribute('class', 'memo-li');
                li.appendChild(memo_list[i]);
                li.appendChild(memo_list[i - 1]);

                document.getElementById('memo-slider').prepend(li);
            }
            
        //짝수일 때  
        }else{
            if (i % 2 == 1) {
                var li = document.createElement('li');
                li.setAttribute('class', 'memo-li');
                li.appendChild(memo_list[i]);
                li.appendChild(memo_list[i - 1]);
               
                document.getElementById('memo-slider').prepend(li);
            }
        }
    }

      //홀수일 때 마지막 메시지만 li에 content 1개 삽입
      if(memos.length %2==1){
        var li = document.createElement('li');
        li.setAttribute('class', 'memo-li');
        li.appendChild(memo_list[0]);
        document.getElementById('memo-slider').appendChild(li);
        
    }
    addEvent(memos.length);
}

//메모를 2개씩 묶어서 하나의 li로 만들기
function create_list(memo_list){

    if(memo_list == null){
        return;
    }
    console.log('li 만들기 함수');
    console.log(memo_list);
    for(var i=0; i<memo_list.length; i= i*2){
        var li = document.createElement('li');
        li.appendChild(memo_list[i]);
        li.appendChild(memo_list[i+1]);
        document.getElementById('memo-slider').append(li);
    }
    //홓수인 경우 하나만 따로 추가
    if((memo_list.length)%2 !=0){
        var li = document.createElement('li');
        li.appendChild(memo_list[memo_list.length-1]);
        document.getElementById('memo-slider').append(li);
    }
}

/* store을 변경하는 함수 */
// seq 번호를 변수로 받아 그 seq의 store 값을 알아내 값에 1을 더해 2로 나누어 store값을 변경
const setStore = function (seq) {
    console.log('setStore call: ' + seq);
    dbAccess.select('store', 'memo', `id=${dbAccess.getId()} and seq=${seq}`)
        .then(value => {
            // store가 0일 경우 1로, 1일 경우 0으로
            const store = (value[0].store + 1) % 2;
            /* delete time 설정 */
            // 현재 시간 가져오기
            var newDate = new Date();
            // delecte_time 형식 지정
            var time = moment(newDate).format('YYYY-MM-DD HH:mm:ss');
            // 변화에 따른 db 업데이트
            dbAccess.update('memo', `store = ${store}`, `id=${dbAccess.getId()} and seq=${seq}`);
            // store가 1이 될 경우 고정 아이콘 띄우기

            console.log(value[0].store);
            if (store == 1){
                document.getElementById(seq).firstChild.style.visibility = 'visible';
            }
            else {
                document.getElementById(seq).firstChild.style.visibility = 'hidden';
                dbAccess.update('memo', `delete_time = '${time}'`, `id=${dbAccess.getId()} and seq=${seq}`);
            }
        });
}


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
        initMemo();
    },
    'Active'
);


initMemo();
