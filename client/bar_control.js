let barController = {}
let currBar=null;

const bar_button = document.getElementsByClassName('bar_button')

function setBarEvent() {
    for(let i=0;i<bar_button.length;i++){
        bar_button[i].addEventListener("click", function () { setCurrBar(i) })
    }
    console.log("bar control")
}

setBarEvent()

function setCurrBar(curr){
    if(currBar != null) {
        if(currBar == curr){
            currBar = null
        }
        else {
            bar_button[currBar].click()
            currBar = curr
        }
    }
    else {
        currBar = curr
    }
    
}


barController.currBar = currBar
barController.setCurrBar = setCurrBar

module.exports = barController