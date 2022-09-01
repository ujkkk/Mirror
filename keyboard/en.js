//index
var index = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"]; //19개

var number_index = ['1','2','3','4','5','6','7','8','9','0'];

var JMN = function(char_uni){ // 글자가 자음인가 모음인가 숫자인가? 
	console.log('char_uni : '+ char_uni);
	if(char_uni >= 97 && char_uni <= 122){
		return "a";
	}else if(char_uni >= 48 && char_uni <= 57){
		return "N";
	}
	else{
		return "";
	}
}

$('.key').on("click",function(){
	
	//버튼 입력 값 
	var key=$(this).val(); 
	
	//합쳐서 나올 값
	var hangeul="";
	
	// input란에 있는 값
	var text=$('#test').val(); 
	
	
	//input란에 있는 마지막 문자
	var lasttext = text.substring(text.length-1);
	
	
	if(key==" space "){
		key=" ";
		$('#test').val(text+key);
		$('#test').focus();
	}
	
	else if(key=="◀-"){
		text=text.substring(0,text.length-1);
		$('#test').val(text);
		$('#test').focus();
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
			$('#test').val(text+key);
			$('#test').focus();
			return;
		}
        else if(JMN(lasttext_uni)=="a"){
            console.log(3);
            chosung="";
            joongsung="";
            jongsung=key;
            console.log("key : " + key);
            $('#test').val(text+key);
            $('#test').focus();
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
			$('#test').val(text+key);
			$('#test').focus();
		}
        else if(key_jm =='a'){
			chosung="";
			joongsung="";
			jongsung="";
			console.log("key : " + key);
			$('#test').val(text+key);
			$('#test').focus();
		}
		//앞에 자음만 있는 경우 + 자음
		else if(lasttext==chosung&&key_jm=="J"){
			console.log("앞에 자음만 있는 경우 + 자음");
			var newja = chosung+key;
			
			//앞자음 + 뒷자음 = 콤보인경우
			if(Jcombo.indexOf(newja)!=-1){
				newja = Jcombo_index[Jcombo.indexOf(newja)];
					
				text=text.substring(0,text.length-1);		
				$('#test').val(text+newja);
				$('#test').focus();
			
			//앞자음+ 뒷자음 = 콤보 아님 	
			}else{
				$('#test').val(text+key);
				$('#test').focus();
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
				$('#test').val(text+hangeul);
				$('#test').focus();	

			
			}else{//앞 자음이 콤보가 아닌 경우 ex) ㄱ + ㅏ  가 
				cho_idx = chosung_index.indexOf(chosung);
				var str_uni =( (cho_idx*21) + key_idx ) * 28  + 44032;
				
				var hangeul=String.fromCharCode(str_uni);
				text=text.substring(0,text.length-1);		
				$('#test').val(text+hangeul);
				$('#test').focus();	
				
			}
				
		//앞에 모음만 있는 경우 + 자음
		}else if(lasttext==joongsung&&key_jm=="J"){
			console.log("앞에 모음만 있는 경우 + 자음");
	
			$('#test').val(text+key);
			$('#test').focus();	
		
		//앞에 모음만 있는 경우 + 모음 
		}else if(lasttext==joongsung&&key_jm=="M"){
			console.log("앞에 모음만 있는 경우 + 모음 ");
			var newchar = lasttext+key;
			
			//모음이 콤보인 경우
			if(Mcombo.indexOf(newchar)!=-1){
				newchar = Mcombo_index[Mcombo.indexOf(newchar)];
				
				text=text.substring(0,text.length-1);		
				$('#test').val(text+newchar);
				$('#test').focus();	
				
			//모음이 콤보 아닌 경우
			}else{
		
				$('#test').val(text+key);
				$('#test').focus();
				
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
				$('#test').val(text+hangeul);
				$('#test').focus();	
			
			//이전글자 종성 + 입력한 자음이 Combo에 없는 경우  ex) 각+ㅇ =각ㅇ
			}else{
				$('#test').val(text+key);
				$('#test').focus();			
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
				$('#test').val(text+hangeul);
				$('#test').focus();	
				
			
				//종성이 콤보가 아닌경우 ex 강+ㅏ  가 아 
			}else{
				var newcho_idx = chosung_index.indexOf(jongsung);

				var str_uni1 =( (cho_idx*21) + joong_idx ) * 28 + 44032;
				var str_uni2 =( (newcho_idx*21) + key_idx ) * 28 + 44032;
				console.log(jong_idx);
				
				hangeul = String.fromCharCode(str_uni1) + String.fromCharCode(str_uni2);
				console.log("새로 조합한 문자 : " + hangeul);
				
				text=text.substring(0,text.length-1);		
				$('#test').val(text+hangeul);
				$('#test').focus();				
				
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
			$('#test').val(text+hangeul);
			$('#test').focus();	
			
			//입력한 자음이 받침이 될 수 없는 경우 
			}else{
				$('#test').val(text+key);
				$('#test').focus();
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
				$('#test').val(text+hangeul);
				$('#test').focus();	
				 
				//이전글자 모음(중성) + 친글자(모음) 콤보 아닌경우 ex.구 + ㅏ = 구ㅏ
			 }else{
				 console.log("이전글자 모음 + 친글자 모음 ");
				$('#test').val(text+key);
				$('#test').focus();
			 }
				
		}
		
		
    }//마지막 문자가 공백이 아닌경우 끝 
	
	else{//마지막 문자가 공백이면 
		//input란에  바로 출력
		$('#test').val(text+key);
		$('#test').focus();
	}

}

	
});