let ko_eng_key = document.getElementById('ko-eng');
let ko_keys = document.getElementById('ko-keys');
let eng_keys = document.getElementById('eng-keys');
let isTranse = false;
ko_eng_key.addEventListener('click', transENG_KOR);

function transENG_KOR (){
    if(isTranse == false){
        ko_keys.style.display = "none";
        eng_keys.style.display = "block";
        isTranse = true;
    }
    else {
        ko_keys.style.display = "block";
        eng_keys.style.display = "none";
        isTranse = false;
    }
}