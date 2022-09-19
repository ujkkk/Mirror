const _db = require('../mirror_db')
const moment = require('moment')


function showMemoStorage() {
    console.log('showMemoStorage');
    _db.select('*', 'memo', `id =${_db.getId()}`)
        .then(memos => {
            create_storage(memos);
        })
}

var freinds_obj2 = {};
function create_storage(memos) {

    document.getElementById('memo_storage_contents').replaceChildren();
    var memo_list = new Array();
    for (var i = 0; i < memos.length; i++) {
        let memo = memos[i];

        var memo_div = document.createElement('div');
        memo_div.setAttribute('class', 'memo_storage_content');
        //memo_div.setAttribute('value', memo.sender);

        //내용
        var memo_content = document.createElement('div');
        memo_content.setAttribute('class', 'memo_storage_content_context');
        memo_content.setAttribute('vlaue', memo.seq);

        //Date
        var memo_date = document.createElement('div');
        memo_date.setAttribute('class', 'memo_storage_content_date');
        memo_date.innerHTML = moment(memo.time).format('MM-DD');

        //content
        switch (memo.type) {
            case 'text':
                memo_content.innerHTML = memo.content;
                break;
            case 'image':
                memo_content.innerHTML = '(사진)';
                break;
            case 'audio':
                memo_content.innerHTML = '(음성 메시지)';
        }
        memo_div.appendChild(memo_date);
        memo_div.appendChild(memo_content);
        console.log('memm',memos[i])
        memo_content.addEventListener("click", () => { memo_storage_detail(memo.seq) });
        document.getElementById('memo_storage_contents').prepend(memo_div);
    }

}


var currunt_sender = '';
//메시지 함에서 오른쪽 메시지 클릭시 과거의 메시지 모두 출력
function memo_storage_detail(seq) {


    //var contents = document.getElementById('memo_storage_detail_contents');
    //contents.replaceChildren();

    // if(sender =='undefined')  document.getElementById('memo_storage_detail_sender').innerHTML = '알 수 없음';
    // else document.getElementById('memo_storage_detail_sender').innerHTML = sender;
    _db.select('*', 'memo', `id=${_db.getId()} and seq=${seq}`)
        .then((memo) => {
            var memo = memo[0];
            console.log('memo-detail', memo);
            let content = document.getElementById('memo_storage_detail_content')
            let context = document.getElementById('memo_storage_detail_context');
            context.textContent = '';
            let date = document.getElementById('memo_storage_detail_date');

            //date, time
            date.innerHTML = moment(memo.time).format('MM-DD HH:mm');

            //context
            switch (memo.type) {
                case 'text':
                    context.innerHTML = memo.content;
                    break;
                case 'image':
                    let img = document.createElement('img');
                    //폴더 수정 여부 체크
                    img.src = './image/memo/' + memo.content + '.jpg';
                    context.appendChild(img);
                    break;
                case 'audio':
                    var audio_folder = './memo_module/record/audio/client/';
                    var audio = document.createElement('audio');
                    audio.setAttribute('id', 'storage-audio');
                    audio.controls = 'controls';
                    audio.src = audio_folder + memo.content + '.wav';
                    context.appendChild(audio);
                    break;

            }
            content.appendChild(context);
            content.appendChild(date);
            // contents.appendChild(content);




        })
}
module.exports = { showMemoStorage }