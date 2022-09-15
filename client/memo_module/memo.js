const mirror_db = require('../mirror_db');
const moment = require('moment')
//slide-wrap
var slideWrapper = document.getElementById('memo-slider-wrap');
//current slideIndexition
var slideIndex = 0;
//items
var memo_slides = document.querySelectorAll('#memo-slider-wrap ul li');
//number of slides
var totalSlides = memo_slides.length;
//get the slide width
var sliderWidth = slideWrapper.clientWidth;
var slider = document.querySelector('#memo-slider-wrap ul#memo-slider');
var nextBtn = document.getElementById('next');
var prevBtn = document.getElementById('previous');

function addEvent(){
    //slide-wrap
    slideWrapper = document.getElementById('memo-slider-wrap');
    //current slideIndexition
    slideIndex = 0;
    //items
    memo_slides = document.querySelectorAll('#memo-slider-wrap ul li');
    //number of slides
    totalSlides = memo_slides.length;
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
    var nextBtn = document.getElementById('next');
    var prevBtn = document.getElementById('previous');
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
    for(var i=0; i<memos.length; i++){
        var memo = memos[i];
        var memo_div= document.createElement('div');
        memo_div.setAttribute('class','memo');

        var memo_content = document.createElement('div');
        memo_content.setAttribute('class','memo-content');
        var memo_time = document.createElement('div');
        memo_time.setAttribute('class','memo-time')

        //time
        time= moment(memo.time).format('MM-DD HH:mm')
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
                image_forlder = './image/memo/'
                memo_content.innerHTML = '';
                let img = document.createElement('img')
                img.src = image_forlder + memo.content;
                console.log('img.src :' + img.src)
                memo_content.appendChild(img);
                break;
        }    

        memo_div.appendChild(memo_content);
        memo_div.appendChild(memo_time);
        memo_list[i] = memo_div;
        if(i%2 != 0){
            var li = document.createElement('li');
            li.setAttribute('class','memo-li');
            li.appendChild(memo_list[i]);
            li.appendChild(memo_list[i-1]);
            document.getElementById('memo-slider').append(li);
        }
    }
    addEvent();
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

initMemo();
