//const receivedData = location.href.split('?')[1];
let mirrorDB = require('./mirror_db');
mirrorDB.userId = 1001;//receivedData;
//require('./weather_module/weather.js');

/* 여기서 서버에 접근 + DB에 받아오기 */
const { default: axios } = require('axios');
const dbAccess = require('./mirror_db');
axios.get(`http://localhost:9000/check/${mirrorDB.userId}`)
    .then(response => {

        console.log("app.js axios test | get data : "+response.data.status);
        let datas = [];
        for(let i=0;i<response.data.contents.length;i++){
            datas[i] = response.data.contents[i];
        }

        for (let i=0; i<response.data.contents.length;i++){

            if (datas[i].type == "text"){
                    let sender= "추후 생각"
                    //mirrorDB.select
                    let contents = datas[i].content;
                    dbAccess.addMemo(mirrorDB.userId,sender,contents,1);
            }
            else if(datas[i].type == 'audio'){
                let sender= data[i].sender;
                //서버에 저장되어 있는 파일명을 받아오기
                let fileName = datas[i].content
                axios({
                    url: 'http://localhost:9000/get/audio', // 통신할 웹문서
                    method: 'get', // 통신할 방식
                    data : { // 인자로 보낼 데이터
                      fileName : fileName     
                    }
                  })
                .then( response =>{
                    console.log(response);
                    time = new Date().getTime();
                    var file =  './image/server/' + time + '.jpg';
                    url = response.data;
                
                    var bstr = atob(url);
                    var n = bstr.length;
                    // base64 인코딩을 바이트 코드로 변환
                    var u8arr = new Uint8Array(n);
                    
                    fs.writeFile(file, u8arr, 'utf8', function(error){
                    });
                    while(n--) {
                        u8arr[n] = bstr.charCodeAt(n);
                    }
                
                })
            }
            else if(datas[i].type == "image"){
                let sender= data[i].sender;
                //서버에 저장되어 있는 파일명을 받아오기
                let fileName = datas[i].content
                //let fileName = '1660840019907.txt';
                
                axios({
                    url: 'http://localhost:9000/get/image', // 통신할 웹문서
                    method: 'get', // 통신할 방식
                    data : { // 인자로 보낼 데이터
                      fileName : fileName     
                    }
                  })
                .then( response =>{
                    console.log(response);
                    time = new Date().getTime();
                    var file =  './image/server/' + time + '.jpg';
                    url = response.data;
                
                    var bstr = atob(url);
                    var n = bstr.length;
                    // base64 인코딩을 바이트 코드로 변환
                    var u8arr = new Uint8Array(n);
                    
                    fs.writeFile(file, u8arr, 'utf8', function(error){
                    });
                    while(n--) {
                        u8arr[n] = bstr.charCodeAt(n);
                    }
                
                })
            }
        
        }


        // memo 제작
        require('./memo_module/create_memo');
        // memo ui 설정
        require('./memo_module/sticker');
        
    })
    .catch(
        ()=>{
            console.log("app.js axios test | server connect failed")
            // memo 제작
            require('./memo_module/create_memo');
            // memo ui 설정
            require('./memo_module/sticker');
        }
    );



