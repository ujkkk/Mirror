// html UI
let keyboard = document.getElementById("keyboard-container");
let ko_eng_key = document.getElementById('ko-eng');
let ko_keys = document.getElementById('ko-keys');
let eng_keys = document.getElementById('eng-keys');
let isEng = false;
let shiftClicked = false;
ko_eng_key.addEventListener('click', transENG_KOR);

// index
var chosung_index = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"]; //19개
var joongsung_index = ["ㅏ","ㅐ","ㅑ","ㅒ","ㅓ","ㅔ","ㅕ","ㅖ","ㅗ","ㅘ","ㅙ","ㅚ","ㅛ","ㅜ","ㅝ","ㅞ","ㅟ","ㅠ","ㅡ","ㅢ","ㅣ"]; //22개
var jongsung_index = ["", "ㄱ", "ㄲ", "ㄳ", "ㄴ", "ㄵ", "ㄶ", "ㄷ", "ㄹ","ㄺ", "ㄻ", "ㄼ", "ㄽ", "ㄾ", "ㄿ", "ㅀ", "ㅁ", //28개
      "ㅂ", "ㅄ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
var ko_changeable_index = [{origin:"ㅂ",change:"ㅃ"},{origin:"ㅈ",change:"ㅉ"},{origin:"ㄷ",change:"ㄸ"},{origin:"ㄱ",change:"ㄲ"},{origin:"ㅅ",change:"ㅆ"},{origin:"ㅐ",change:"ㅒ"},{origin:"ㅔ",change:"ㅖ"}]      
var Jcombo_index=["ㄳ","ㄵ","ㄶ","ㄺ","ㄻ","ㄼ","ㄽ","ㄾ","ㄿ","ㅀ","ㅄ"]; //11개 
var Jcombo=["ㄱㅅ","ㄴㅈ","ㄴㅎ","ㄹㄱ","ㄹㅁ","ㄹㅂ","ㄹㅅ","ㄹㅌ","ㄹㅍ","ㄹㅎ","ㅂㅅ"];
var Mcombo_index =['ㅘ','ㅙ','ㅚ','ㅝ','ㅞ','ㅟ','ㅢ']; //7개 
var Mcombo=['ㅗㅏ','ㅗㅐ','ㅗㅣ','ㅜㅓ','ㅜㅔ','ㅜㅣ','ㅡㅣ'];

var number_index = ['1','2','3','4','5','6','7','8','9','0'];

// module element
let keyboardTarget = {};
let currentTarget;
keyboardTarget.keyboard = keyboard;


function setCurrentTarget(value){
	currentTarget = value;
}
keyboardTarget.setCurrentTarget = setCurrentTarget;

var JMN = function(char_uni){ // 글자가 자음인가 모음인가 숫자인가? 
	console.log('char_uni : '+ char_uni);
	if(char_uni >= 12593 && char_uni <= 12622){
		return "J";
	}else if(char_uni >= 12623 && char_uni <= 12643){
		return "M";
	}else if(char_uni >= 48 && char_uni <= 57){
		return "N";
	}
	else if(char_uni >= 97 && char_uni <= 122){ // 소문자
		return "A";
	}
	else if (char_uni >= 65 && char_uni <= 90){
		return "D"; // 대문자
	}
	else{
		return "";
	}
}

const keyboard_keys = document.querySelectorAll('.key');

for(let i=0; i< keyboard_keys.length; i++){
    keyboard_keys[i].addEventListener("click",function(e){keyClickEvent(e)});
}

function keyClickEvent(e){

	//버튼 입력 값 
	var key= e.target.value;
	console.log(`눌린 키보드 : ${key}`);
	//합쳐서 나올 값
	var hangeul="";
	
	// input란에 있는 값
	var text=document.getElementById(`${currentTarget}`).value;
	console.log(`text = ${text}`);
	
	
	//input란에 있는 마지막 문자
	var lasttext = text.substring(text.length-1);
	
	
	if(key==" space "){
		key=" ";
		document.getElementById(`${currentTarget}`).value = text+key;
		document.getElementById(`${currentTarget}`).focus();
	}
	
	else if(key=="←"){
		text=text.substring(0,text.length-1);
		document.getElementById(`${currentTarget}`).value = text;
		document.getElementById(`${currentTarget}`).focus();
	}
    else if (key == "한/영"){
		// document.getElementById(`${currentTarget}`).value = "";
		document.getElementById(`${currentTarget}`).focus();
	}
	else if (key == "shift"){
		let arrValue; // origin인지 change인지 구별
		
		if (shiftClicked == false){ // shift가 눌린적 없을 때
			shiftClicked = true;
			arrValue = "change";
		}
		
		else { // key배열 원상복구
			shiftClicked = false;
			arrValue = "origin";
		}
		
		if (isEng == false){ // 한글일때 shift -> 쌍자음 처리
			
			let ko_changable_arr = document.getElementsByClassName("ko_changable");

			for (let i=0;i<ko_changable_arr.length;i++){
				if (arrValue == "change")
					ko_changable_arr[i].value = ko_changeable_index[i].change
				else
					ko_changable_arr[i].value = ko_changeable_index[i].origin
			}
		}
		else { // 영어일때 shift -> 대문자
			let eng_key_arr = document.getElementsByClassName('eng');
	
			for (let i=0;i<eng_key_arr.length;i++){
				if (arrValue == "change")
					eng_key_arr[i].value = eng_key_arr[i].value.toUpperCase();
				else
					eng_key_arr[i].value = eng_key_arr[i].value.toLowerCase();
			}

		}
		document.getElementById(`${currentTarget}`).focus();
	}
	else{
		if(lasttext!=""){//마지막 문자가 공백이 아닐 경우만 실행 

			//마지막 문자의 유니코드 
			var lasttext_uni=lasttext.charCodeAt(0);
			
		
			//1. 마지막 글자의 초성,중성,종성과 인덱스 구하기
			var chosung;
			var joongsung;
			var jongsung;
			
			var jong_idx;
			var joong_idx;
			var cho_idx;
			
			//마지막 문자가 하나의 자음만 있는 경우 
			if(JMN(lasttext_uni)=="J"){
				chosung=lasttext;
				joongsung="";
				jongsung="";
				console.log(1);
			
			//마지막 문자가 하나의 모음만 있는 경우 
			}else if(JMN(lasttext_uni)=="M"){
				chosung="";
				joongsung=lasttext;
				jongsung="";
				console.log(2);
			
			//숫자인 경우
			
			}else if(JMN(lasttext_uni)=="N"){
				console.log(3);
				chosung="";
				joongsung="";
				jongsung=key;
				console.log("key : " + key);
				document.getElementById(`${currentTarget}`).value = text+key;
				document.getElementById(`${currentTarget}`).focus();
				return;
			}
			else if(JMN(lasttext_uni)=="A"){
				console.log(3);
				chosung="";
				joongsung="";
				jongsung=key;
				console.log("key : " + key);
				document.getElementById(`${currentTarget}`).value = text+key;
				document.getElementById(`${currentTarget}`).focus();
				return;
			}
			else if (JMN(lasttext_uni)=="D"){
				console.log(3);
				chosung="";
				joongsung="";
				jongsung=key;
				console.log("key : " + key);
				document.getElementById(`${currentTarget}`).value = text+key;
				document.getElementById(`${currentTarget}`).focus();
				return;
			}
			else{//마지막 문자가 하나의 자음이나 모음이 아닌경우 

				//마지막 문자에서 AC00을 뺀다
				var lastchar_uni_cal = lasttext_uni-44032; 
		
				//마지막 문자의 초성, 중성, 종성의 인덱스 구하기 
				//한글음절위치 = ((초성index * 21) + 중성index) * 28 + 종성index
				jong_idx = lastchar_uni_cal % 28;
				joong_idx = (Math.floor(lastchar_uni_cal/28)) % 21;
				cho_idx = Math.floor((Math.floor(lastchar_uni_cal / 28)) / 21);
		
				//마지막 문자의 초성, 중성, 종성 구하기 
				chosung = chosung_index[cho_idx];
				joongsung = joongsung_index[joong_idx];
				jongsung = jongsung_index[jong_idx];
			
				

		
			}//마지막 문자가 하나의 자음이나 모음이 아닌경우  초,중,종 구하기 끝 
			
			console.log("마지막문자 :  " + lasttext);
			console.log("마지막 문자의 초성,index : " + chosung + cho_idx);
			console.log("마지막 문자의 중성,index : " + joongsung + joong_idx);
			console.log("마지막 문자의 종성,index : " + jongsung + jong_idx);
			//2. 방금 친 글자 모음인지 자음인지 구별 
			var key_jm = JMN(key.charCodeAt(0));
			console.log("방금 친 글자 : " + key +  " / 자음모음 : " + key_jm);
		
			var str_uni;
			var key_idx;
			
			//3. 글자 재조합
			//숫자를 친 경우
			if(key_jm =='N'){
				chosung="";
				joongsung="";
				jongsung="";
				console.log("key : " + key);
				document.getElementById(`${currentTarget}`).value = text+key;
				document.getElementById(`${currentTarget}`).focus();
			}
			//앞에 자음만 있는 경우 + 자음
			else if(lasttext==chosung&&key_jm=="J"){
				console.log("앞에 자음만 있는 경우 + 자음");
				var newja = chosung+key;
				
				//앞자음 + 뒷자음 = 콤보인경우
				if(Jcombo.indexOf(newja)!=-1){
					newja = Jcombo_index[Jcombo.indexOf(newja)];
						
					text=text.substring(0,text.length-1);		
					document.getElementById(`${currentTarget}`).value = text+newja;
					document.getElementById(`${currentTarget}`).focus();
				
				//앞자음+ 뒷자음 = 콤보 아님 	
				}else{
					document.getElementById(`${currentTarget}`).value = text+key;
					document.getElementById(`${currentTarget}`).focus();
				}
				

			//앞에 자음만 있는경우 + 모음 
			}else if(lasttext==chosung&&key_jm=="M"){
				console.log("앞에 자음만 있는 경우 + 모음");
				key_idx = joongsung_index.indexOf(key);
				//앞 자음이 콤보인경우
				if(Jcombo_index.indexOf(lasttext)!= -1){
					var newja = Jcombo[Jcombo_index.indexOf(lasttext)];
					var newja1 = newja.substring(0,1);
					var newja2 = newja.substring(1,newja.length);
					console.log("앞 자음의 콤보 쪼개기 : " + newja1 + ", " + newja2);
					
					var newja2_idx = chosung_index.indexOf(newja2);
					
					var str_uni =( (newja2_idx*21) + key_idx ) * 28  + 44032;
					var str=String.fromCharCode(str_uni);
					
					hangeul = newja1+str;
					text=text.substring(0,text.length-1);		
					document.getElementById(`${currentTarget}`).value = text+hangeul;
					document.getElementById(`${currentTarget}`).focus();	

				
				}else{//앞 자음이 콤보가 아닌 경우 ex) ㄱ + ㅏ  가 
					cho_idx = chosung_index.indexOf(chosung);
					var str_uni =( (cho_idx*21) + key_idx ) * 28  + 44032;
					
					var hangeul=String.fromCharCode(str_uni);
					text=text.substring(0,text.length-1);		
					document.getElementById(`${currentTarget}`).value = text+hangeul;
					document.getElementById(`${currentTarget}`).focus();	
					
				}
					
			//앞에 모음만 있는 경우 + 자음
			}else if(lasttext==joongsung&&key_jm=="J"){
				console.log("앞에 모음만 있는 경우 + 자음");
		
				document.getElementById(`${currentTarget}`).value = text+key;
				document.getElementById(`${currentTarget}`).focus();	
			
			//앞에 모음만 있는 경우 + 모음 
			}else if(lasttext==joongsung&&key_jm=="M"){
				console.log("앞에 모음만 있는 경우 + 모음 ");
				var newchar = lasttext+key;
				
				//모음이 콤보인 경우
				if(Mcombo.indexOf(newchar)!=-1){
					newchar = Mcombo_index[Mcombo.indexOf(newchar)];
					
					text=text.substring(0,text.length-1);		
					document.getElementById(`${currentTarget}`).value = text+newchar;
					document.getElementById(`${currentTarget}`).focus();	
					
				//모음이 콤보 아닌 경우
				}else{
			
					document.getElementById(`${currentTarget}`).value = text+key;
					document.getElementById(`${currentTarget}`).focus();
					
				}
				
				
				
				
			//3-1 이전글자 종성이 있는경우 + 자음
			}else if(jongsung!="" && key_jm=="J"){
				console.log("이전글자 종성이 있는 경우 + 자음");
				var newjong_idx = Jcombo.indexOf(jongsung+key);
				console.log(newjong_idx);
		
				//이전글자 종성 + 입력한 자음이 Combo에 있는 경우ex) 갈+ㄱ = 갉 
				if(newjong_idx!=-1){
					newjong=Jcombo_index[newjong_idx];
					newjong_idx=jongsung_index.indexOf(newjong);
					
					str_uni = ((cho_idx * 21) + joong_idx) * 28 + newjong_idx + 44032;
					hangeul= String.fromCharCode(str_uni);
					console.log("새로 조합한 문자 : " + hangeul);
					
					text=text.substring(0,text.length-1);		
					document.getElementById(`${currentTarget}`).value = text+hangeul;
					document.getElementById(`${currentTarget}`).focus();	
				
				//이전글자 종성 + 입력한 자음이 Combo에 없는 경우  ex) 각+ㅇ =각ㅇ
				}else{
					document.getElementById(`${currentTarget}`).value = text+key;
					document.getElementById(`${currentTarget}`).focus();			
				}
				
					

			//3-2 이전글자 종성이 있는 경우 + 모음  ex) 강 + ㅏ  = 가아   값 + ㅏ + 갑 사
			}else if(jongsung!="" && key_jm=="M"){ 
				console.log("이전글자 종성이 있는경우 + 모음");
				var newjong_idx = Jcombo_index.indexOf(jongsung);
				key_idx=joongsung_index.indexOf(key);
				
				//종성이 콤보인경우			
				if(newjong_idx!=-1){
					var newjong = Jcombo[newjong_idx];
					var newjong1 = newjong.substring(0,1);
					var newjong2 = newjong.substring(1,newjong.length);
					
					var newjong1_idx = jongsung_index.indexOf(newjong1);
					var newjong2_idx = chosung_index.indexOf(newjong2);
					
					var str_uni1 =( (cho_idx*21) + joong_idx ) * 28 + newjong1_idx + 44032;
					var str_uni2 = ((newjong2_idx * 21) + key_idx ) * 28 + 44032;

					
					hangeul = String.fromCharCode(str_uni1) + String.fromCharCode(str_uni2);
					console.log("새로 조합한 문자 : " + hangeul);
					
					text=text.substring(0,text.length-1);		
					document.getElementById(`${currentTarget}`).value = text+hangeul;
					document.getElementById(`${currentTarget}`).focus();	
					
				
					//종성이 콤보가 아닌경우 ex 강+ㅏ  가 아 
				}else{
					var newcho_idx = chosung_index.indexOf(jongsung);

					var str_uni1 =( (cho_idx*21) + joong_idx ) * 28 + 44032;
					var str_uni2 =( (newcho_idx*21) + key_idx ) * 28 + 44032;
					console.log(jong_idx);
					
					hangeul = String.fromCharCode(str_uni1) + String.fromCharCode(str_uni2);
					console.log("새로 조합한 문자 : " + hangeul);
					
					text=text.substring(0,text.length-1);		
					document.getElementById(`${currentTarget}`).value = text+hangeul;
					document.getElementById(`${currentTarget}`).focus();				
					
				}
				
				
				
			//3-3 이전글자 종성이 없는 경우 + 자음 ex) 가 + ㅇ = 강, 가 + ㅉ = 가ㅉ
			}else if(jongsung=="" && key_jm=="J"){
				console.log("이전글자 종성이 없는 경우 + 자음");
				key_idx = jongsung_index.indexOf(key);
				
				//입력한 자음이 받침이 될 수 있는 경우
				if(key_idx!=-1){
				str_uni = ( (cho_idx*21)+joong_idx ) * 28 +key_idx + 44032;
				hangeul = String.fromCharCode(str_uni);
				
				console.log("새로 조합한 문자 : " + hangeul);
				
				text=text.substring(0,text.length-1);		
				document.getElementById(`${currentTarget}`).value = text+hangeul;
				document.getElementById(`${currentTarget}`).focus();	
				
				//입력한 자음이 받침이 될 수 없는 경우 
				}else{
					document.getElementById(`${currentTarget}`).value = text+key;
					document.getElementById(`${currentTarget}`).focus();
				}
				
			//3-4 이전글자 종성이 없는 경우 + 모음
			}else if(jongsung=="" && key_jm=="M"){
				console.log("이전글자 종성이 없는 경우 + 모음");
				var mcom = joongsung+key; // ㅜㅣ
				var mcom_idx = Mcombo.indexOf(mcom);	

				//이전글자 모음(중성) + 친 글자(모음) = 콤보인경우 ex. 구 + ㅣ = 귀
				if(mcom_idx!=-1){

					mcom=Mcombo_index[mcom_idx];
					mcom_idx=joongsung_index.indexOf(mcom);
					str_uni = ((cho_idx*21 )  + mcom_idx ) * 28 + 44032;			 
					hangeul = String.fromCharCode(str_uni);
					console.log("새로 조합한 문자 : " + hangeul);
						
					text=text.substring(0,text.length-1);		
					document.getElementById(`${currentTarget}`).value = text+hangeul;
					document.getElementById(`${currentTarget}`).focus();	
					
					//이전글자 모음(중성) + 친글자(모음) 콤보 아닌경우 ex.구 + ㅏ = 구ㅏ
				}else{
					console.log("이전글자 모음 + 친글자 모음 ");
					document.getElementById(`${currentTarget}`).value = text+key;
					document.getElementById(`${currentTarget}`).focus();
				}
					
			}
			

		}//마지막 문자가 공백이 아닌경우 끝 
		
		else{//마지막 문자가 공백이면 
			//input란에  바로 출력
			document.getElementById(`${currentTarget}`).value = text+key;//val(text+key);
			document.getElementById(`${currentTarget}`).focus();
		}
	}
}


// keyboard_keys.addEventListener("click",() => {
	
// 	//버튼 입력 값 
// 	var key=$(this).val(); 
	
// 	//합쳐서 나올 값
// 	var hangeul="";
	
// 	// input란에 있는 값
// 	var text=$(`#${currentTarget.id}`).val(); 
	
	
// 	//input란에 있는 마지막 문자
// 	var lasttext = text.substring(text.length-1);
	
	
// 	if(key==" space "){
// 		key=" ";
// 		$(`#${currentTarget.id}`).val(text+key);
// 		$(`#${currentTarget.id}`).focus();
// 	}
	
// 	else if(key=="◀-"){
// 		text=text.substring(0,text.length-1);
// 		$(`#${currentTarget.id}`).val(text);
// 		$(`#${currentTarget.id}`).focus();
// 	}
    
// 	else{
// 	if(lasttext!=""){//마지막 문자가 공백이 아닐 경우만 실행 

// 		//마지막 문자의 유니코드 
// 		var lasttext_uni=lasttext.charCodeAt(0);
		
	
// 		//1. 마지막 글자의 초성,중성,종성과 인덱스 구하기
// 		var chosung;
// 		var joongsung;
// 		var jongsung;
		
// 		var jong_idx;
// 		var joong_idx;
// 		var cho_idx;
		
// 		//마지막 문자가 하나의 자음만 있는 경우 
// 		if(JMN(lasttext_uni)=="J"){
// 			chosung=lasttext;
// 			joongsung="";
// 			jongsung="";
// 			console.log(1);
		
// 		//마지막 문자가 하나의 모음만 있는 경우 
// 		}else if(JMN(lasttext_uni)=="M"){
// 			chosung="";
// 			joongsung=lasttext;
// 			jongsung="";
// 			console.log(2);
		
// 		//숫자인 경우
		
// 		}else if(JMN(lasttext_uni)=="N"){
// 			console.log(3);
// 			chosung="";
// 			joongsung="";
// 			jongsung=key;
// 			console.log("key : " + key);
// 			$(`#${currentTarget.id}`).val(text+key);
// 			$(`#${currentTarget.id}`).focus();
// 			return;
// 		}
// 		else{//마지막 문자가 하나의 자음이나 모음이 아닌경우 

// 			//마지막 문자에서 AC00을 뺀다
// 			var lastchar_uni_cal = lasttext_uni-44032; 
	
// 			//마지막 문자의 초성, 중성, 종성의 인덱스 구하기 
// 			//한글음절위치 = ((초성index * 21) + 중성index) * 28 + 종성index
// 			jong_idx = lastchar_uni_cal % 28;
// 			joong_idx = (Math.floor(lastchar_uni_cal/28)) % 21;
// 			cho_idx = Math.floor((Math.floor(lastchar_uni_cal / 28)) / 21);
	
// 			//마지막 문자의 초성, 중성, 종성 구하기 
// 			chosung = chosung_index[cho_idx];
// 			joongsung = joongsung_index[joong_idx];
// 			jongsung = jongsung_index[jong_idx];
		
			

	
// 		}//마지막 문자가 하나의 자음이나 모음이 아닌경우  초,중,종 구하기 끝 
		
// 		console.log("마지막문자 :  " + lasttext);
// 		console.log("마지막 문자의 초성,index : " + chosung + cho_idx);
// 		console.log("마지막 문자의 중성,index : " + joongsung + joong_idx);
// 		console.log("마지막 문자의 종성,index : " + jongsung + jong_idx);
// 		//2. 방금 친 글자 모음인지 자음인지 구별 
// 		var key_jm = JMN(key.charCodeAt(0));
// 		console.log("방금 친 글자 : " + key +  " / 자음모음 : " + key_jm);
	
// 		var str_uni;
// 		var key_idx;
		
// 		//3. 글자 재조합
// 		//숫자를 친 경우
// 		if(key_jm =='N'){
// 			chosung="";
// 			joongsung="";
// 			jongsung="";
// 			console.log("key : " + key);
// 			$(`#${currentTarget.id}`).val(text+key);
// 			$(`#${currentTarget.id}`).focus();
// 		}
// 		//앞에 자음만 있는 경우 + 자음
// 		else if(lasttext==chosung&&key_jm=="J"){
// 			console.log("앞에 자음만 있는 경우 + 자음");
// 			var newja = chosung+key;
			
// 			//앞자음 + 뒷자음 = 콤보인경우
// 			if(Jcombo.indexOf(newja)!=-1){
// 				newja = Jcombo_index[Jcombo.indexOf(newja)];
					
// 				text=text.substring(0,text.length-1);		
// 				$(`#${currentTarget.id}`).val(text+newja);
// 				$(`#${currentTarget.id}`).focus();
			
// 			//앞자음+ 뒷자음 = 콤보 아님 	
// 			}else{
// 				$(`#${currentTarget.id}`).val(text+key);
// 				$(`#${currentTarget.id}`).focus();
// 			}
			

// 		//앞에 자음만 있는경우 + 모음 
// 		}else if(lasttext==chosung&&key_jm=="M"){
// 			console.log("앞에 자음만 있는 경우 + 모음");
// 			key_idx = joongsung_index.indexOf(key);
// 			//앞 자음이 콤보인경우
// 			if(Jcombo_index.indexOf(lasttext)!= -1){
// 				var newja = Jcombo[Jcombo_index.indexOf(lasttext)];
// 				var newja1 = newja.substring(0,1);
// 				var newja2 = newja.substring(1,newja.length);
// 				console.log("앞 자음의 콤보 쪼개기 : " + newja1 + ", " + newja2);
				
// 				var newja2_idx = chosung_index.indexOf(newja2);
				
// 				var str_uni =( (newja2_idx*21) + key_idx ) * 28  + 44032;
// 				var str=String.fromCharCode(str_uni);
				
// 				hangeul = newja1+str;
// 				text=text.substring(0,text.length-1);		
// 				$(`#${currentTarget.id}`).val(text+hangeul);
// 				$(`#${currentTarget.id}`).focus();	

			
// 			}else{//앞 자음이 콤보가 아닌 경우 ex) ㄱ + ㅏ  가 
// 				cho_idx = chosung_index.indexOf(chosung);
// 				var str_uni =( (cho_idx*21) + key_idx ) * 28  + 44032;
				
// 				var hangeul=String.fromCharCode(str_uni);
// 				text=text.substring(0,text.length-1);		
// 				$(`#${currentTarget.id}`).val(text+hangeul);
// 				$(`#${currentTarget.id}`).focus();	
				
// 			}
				
// 		//앞에 모음만 있는 경우 + 자음
// 		}else if(lasttext==joongsung&&key_jm=="J"){
// 			console.log("앞에 모음만 있는 경우 + 자음");
	
// 			$(`#${currentTarget.id}`).val(text+key);
// 			$(`#${currentTarget.id}`).focus();	
		
// 		//앞에 모음만 있는 경우 + 모음 
// 		}else if(lasttext==joongsung&&key_jm=="M"){
// 			console.log("앞에 모음만 있는 경우 + 모음 ");
// 			var newchar = lasttext+key;
			
// 			//모음이 콤보인 경우
// 			if(Mcombo.indexOf(newchar)!=-1){
// 				newchar = Mcombo_index[Mcombo.indexOf(newchar)];
				
// 				text=text.substring(0,text.length-1);		
// 				$(`#${currentTarget.id}`).val(text+newchar);
// 				$(`#${currentTarget.id}`).focus();	
				
// 			//모음이 콤보 아닌 경우
// 			}else{
		
// 				$(`#${currentTarget.id}`).val(text+key);
// 				$(`#${currentTarget.id}`).focus();
				
// 			}
			
			
			
			
// 		//3-1 이전글자 종성이 있는경우 + 자음
// 		}else if(jongsung!="" && key_jm=="J"){
// 			console.log("이전글자 종성이 있는 경우 + 자음");
// 			var newjong_idx = Jcombo.indexOf(jongsung+key);
// 			console.log(newjong_idx);
	
// 			//이전글자 종성 + 입력한 자음이 Combo에 있는 경우ex) 갈+ㄱ = 갉 
// 			if(newjong_idx!=-1){
// 				newjong=Jcombo_index[newjong_idx];
// 				newjong_idx=jongsung_index.indexOf(newjong);
				
// 				str_uni = ((cho_idx * 21) + joong_idx) * 28 + newjong_idx + 44032;
// 				hangeul= String.fromCharCode(str_uni);
// 				console.log("새로 조합한 문자 : " + hangeul);
				
// 				text=text.substring(0,text.length-1);		
// 				$(`#${currentTarget.id}`).val(text+hangeul);
// 				$(`#${currentTarget.id}`).focus();	
			
// 			//이전글자 종성 + 입력한 자음이 Combo에 없는 경우  ex) 각+ㅇ =각ㅇ
// 			}else{
// 				$(`#${currentTarget.id}`).val(text+key);
// 				$(`#${currentTarget.id}`).focus();			
// 			}
			
				

// 		//3-2 이전글자 종성이 있는 경우 + 모음  ex) 강 + ㅏ  = 가아   값 + ㅏ + 갑 사
// 		}else if(jongsung!="" && key_jm=="M"){ 
// 			console.log("이전글자 종성이 있는경우 + 모음");
// 			var newjong_idx = Jcombo_index.indexOf(jongsung);
// 			key_idx=joongsung_index.indexOf(key);
			
// 			//종성이 콤보인경우			
// 			if(newjong_idx!=-1){
// 				var newjong = Jcombo[newjong_idx];
// 				var newjong1 = newjong.substring(0,1);
// 				var newjong2 = newjong.substring(1,newjong.length);
				
// 				var newjong1_idx = jongsung_index.indexOf(newjong1);
// 				var newjong2_idx = chosung_index.indexOf(newjong2);
				
// 				var str_uni1 =( (cho_idx*21) + joong_idx ) * 28 + newjong1_idx + 44032;
// 				var str_uni2 = ((newjong2_idx * 21) + key_idx ) * 28 + 44032;

				
// 				hangeul = String.fromCharCode(str_uni1) + String.fromCharCode(str_uni2);
// 				console.log("새로 조합한 문자 : " + hangeul);
				
// 				text=text.substring(0,text.length-1);		
// 				$(`#${currentTarget.id}`).val(text+hangeul);
// 				$(`#${currentTarget.id}`).focus();	
				
			
// 				//종성이 콤보가 아닌경우 ex 강+ㅏ  가 아 
// 			}else{
// 				var newcho_idx = chosung_index.indexOf(jongsung);

// 				var str_uni1 =( (cho_idx*21) + joong_idx ) * 28 + 44032;
// 				var str_uni2 =( (newcho_idx*21) + key_idx ) * 28 + 44032;
// 				console.log(jong_idx);
				
// 				hangeul = String.fromCharCode(str_uni1) + String.fromCharCode(str_uni2);
// 				console.log("새로 조합한 문자 : " + hangeul);
				
// 				text=text.substring(0,text.length-1);		
// 				$(`#${currentTarget.id}`).val(text+hangeul);
// 				$(`#${currentTarget.id}`).focus();				
				
// 			}
			
			
			
// 		//3-3 이전글자 종성이 없는 경우 + 자음 ex) 가 + ㅇ = 강, 가 + ㅉ = 가ㅉ
// 		}else if(jongsung=="" && key_jm=="J"){
// 			console.log("이전글자 종성이 없는 경우 + 자음");
// 			key_idx = jongsung_index.indexOf(key);
			
// 			//입력한 자음이 받침이 될 수 있는 경우
// 			if(key_idx!=-1){
// 			str_uni = ( (cho_idx*21)+joong_idx ) * 28 +key_idx + 44032;
// 			hangeul = String.fromCharCode(str_uni);
			
// 			console.log("새로 조합한 문자 : " + hangeul);
			
// 			text=text.substring(0,text.length-1);		
// 			$(`#${currentTarget.id}`).val(text+hangeul);
// 			$(`#${currentTarget.id}`).focus();	
			
// 			//입력한 자음이 받침이 될 수 없는 경우 
// 			}else{
// 				$(`#${currentTarget.id}`).val(text+key);
// 				$(`#${currentTarget.id}`).focus();
// 			}
			
// 		//3-4 이전글자 종성이 없는 경우 + 모음
// 		}else if(jongsung=="" && key_jm=="M"){
// 			console.log("이전글자 종성이 없는 경우 + 모음");
// 			var mcom = joongsung+key; // ㅜㅣ
// 			var mcom_idx = Mcombo.indexOf(mcom);	

// 			//이전글자 모음(중성) + 친 글자(모음) = 콤보인경우 ex. 구 + ㅣ = 귀
// 			 if(mcom_idx!=-1){

// 				mcom=Mcombo_index[mcom_idx];
// 				mcom_idx=joongsung_index.indexOf(mcom);
// 				str_uni = ((cho_idx*21 )  + mcom_idx ) * 28 + 44032;			 
// 				hangeul = String.fromCharCode(str_uni);
// 				console.log("새로 조합한 문자 : " + hangeul);
					
// 				text=text.substring(0,text.length-1);		
// 				$(`#${currentTarget.id}`).val(text+hangeul);
// 				$(`#${currentTarget.id}`).focus();	
				 
// 				//이전글자 모음(중성) + 친글자(모음) 콤보 아닌경우 ex.구 + ㅏ = 구ㅏ
// 			 }else{
// 				 console.log("이전글자 모음 + 친글자 모음 ");
// 				$(`#${currentTarget.id}`).val(text+key);
// 				$(`#${currentTarget.id}`).focus();
// 			 }
				
// 		}
		

// 	}//마지막 문자가 공백이 아닌경우 끝 
	
// 	else{//마지막 문자가 공백이면 
// 		//input란에  바로 출력
// 		$(`#${currentTarget.id}`).val(text+key);
// 		$(`#${currentTarget.id}`).focus();
// 	}
// }

	
// });






function transENG_KOR (){
    if(isEng == false){
        ko_keys.style.display = "none";
        eng_keys.style.display = "block";
        isEng = true;
    }
    else {
        ko_keys.style.display = "block";
        eng_keys.style.display = "none";
        isEng = false;
    }
}


module.exports = keyboardTarget