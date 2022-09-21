let barController = {}
let currBar=null;
let closeCurr = null;

const bar_button = document.getElementsByClassName('bar_button')

const call = document.getElementById('bar_phone_container')
const callbook = document.getElementById('bar_phone_container')
const message = document.getElementById('bar_phone_container')
const memo = document.getElementById('bar_phone_container')

function setBarEvent() {
    for(let i=0;i<bar_button.length;i++){
        bar_button[i].addEventListener("click", function (e) { setCurrBar(i) })
    }
    console.log("bar control")
}

setBarEvent()

function setCurrBar(curr){
    console.log('curr@@')
    if(closeCurr == null && closeCurr != curr){
        if(currBar != null) {
            if(currBar == curr) {
                currBar = null
                closeCurr = currBar
            }
            else {
                closeCurr = currBar
                bar_button[currBar].click()
                currBar = curr
            }
        }
        else {
            //bar_button[curr].click()
            currBar = curr
        }
    }
    else {
        closeCurr = null;
    }
    
    
}


barController.currBar = currBar
barController.setCurrBar = setCurrBar

module.exports = barController