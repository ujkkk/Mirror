const receivedData = location.href.split('?')[1];
let mirrorDB = require('./mirror_db');
mirrorDB.userId = 1001;//receivedData;
require('./weather_module/new_weather');

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