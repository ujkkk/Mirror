// 로딩 start
function loading(){
    document.getElementById("loading").style.display='block';
    if(document.getElementById("message")){
        document.getElementById("message").innerHTML="";
    }
}

//로딩 stop
function stopLoading(){
    document.getElementById("loading").style.display='none';
    if(document.getElementById("message")){
        document.getElementById("message").innerHTML="";
    }
}

module.exports = {loading,stopLoading }