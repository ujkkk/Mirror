
const mqtt = require('mqtt');

const options = {
    host: '192.168.0.2',
    port: 1883
};

const HeartRate = document.getElementById("HeartRate")

const client = mqtt.connect(options);
client.on('connect', function () {

    console.log("서버 mqtt와 연결");
    //real time message 받는 토픽
    client.subscribe(`heartRate/4004`);
})

client.on('message', async (topic, message, packet) => {
    console.log(`message is ${message}`);
    console.log(`topic is ${topic}`);

    //로그인시 서버로부터 받은 메시지 저장 
    if (topic == `heartRate/4004`) {
        const bytesString = String.fromCharCode(...message) // byte -> string으로 변환

        console.log("type: string - "+bytesString);
        console.log()
		if(Number(bytesString)>0) {
	        addChartData(bytesString)
			HeartRate.innerText = bytesString
		}
}
})


// Chart 객체에 넘겨줄 차트에 대한 정보들을 정의한 객체. 명품 html5의 7장 프로토타입 참고
var config = {
	// type은 차트 종류 지정
	type: 'line', /* line 등으로 바꿀 수 있음 */

	// data는 차트에 출력될 전체 데이터 표현
	data: {
		// labels는 배열로 데이터의 레이블들
		labels: [],

		// datasets 배열로 이 차트에 그려질 모든 데이터 셋 표현. 아래는 그래프 1개만 있는 경우
		datasets: [{
			
			backgroundColor: 'rgb(255, 236, 112)',
			borderColor: 'rgb(255, 236, 112)',
			borderWidth: 2,
			data: [], /* 각 레이블에 해당하는 데이터 */
			fill : true, /* 그래프 아래가 채워진 상태로 그려집니다. 해보세요 */
		}]
	},

	//  차트의 속성 지정
	options: {
		legend: {
        	display: false
        },
		responsive : false, // 크기 조절 금지
		scales: { /* x축과 y축 정보 */
			xAxes: [{
				display: false,
				scaleLabel: { display: false, labelString: '' },
			}],
			yAxes: [{
				display: false,
				scaleLabel: { display: false, labelString: '' },

			}]
		}
	}
};
var ctx = null
var chart = null
var LABEL_SIZE =10; // 차트에 그려지는 데이터의 개수 
var tick = 0; // 도착한 데이터의 개수임, tick의 범위는 0에서 99까지만 

function drawChart() {
	ctx = document.getElementById('canvasHeart').getContext('2d');
	chart = new Chart(ctx, config);
	init();
} // end of drawChart()


// chart의 차트에 labels의 크기를 LABEL_SIZE로 만들고 0~19까지 레이블 붙이기
function init() {
	for(let i=0; i<LABEL_SIZE; i++) {
		chart.data.labels[i] = i;
	}
	chart.update();
}

function addChartData(value) {
	tick++; // 도착한 데이터의 개수 증가
	tick %= 100; // tick의 범위는 0에서 99까지만. 100보다 크면 다시 0부터 시작
	let n = chart.data.datasets[0].data.length; // 현재 데이터의 개수 
	if(n < LABEL_SIZE) 
		chart.data.datasets[0].data.push(value);
	else {
		// 새 데이터 value 삽입
		chart.data.datasets[0].data.push(value);
		chart.data.datasets[0].data.shift();

		// 레이블 삽입
		chart.data.labels.push(tick);
		chart.data.labels.shift();
	}
	chart.update();
}

function hideshow() { // 캔버스 보이기 숨기기 
	if(canvas.style.display == "none") 	canvas.style.display = "block"
	else canvas.style.display = "none"  
}

window.addEventListener("load", drawChart); // load 이벤트가 발생하면 drawChart() 호출하도록 등록
