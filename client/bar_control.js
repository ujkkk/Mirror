let barController = {}
let currBar=null;
let closeCurr = null;

const bar_button = document.getElementsByClassName('bar_button')

let container = []

container[0] =  document.getElementById('bar_phone_container')
container[1] =  document.getElementById('callbook-modal')
container[2] = document.getElementById('message_memo_container')
container[3] =  document.getElementById('memo_container')

function setBarEvent() {
    for(let i=0;i<bar_button.length;i++){
        bar_button[i].addEventListener("click", function (e) { setCurrBar(i) })
    }
    console.log("bar control")
}

setBarEvent()

function setCurrBar(curr){
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