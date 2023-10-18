# Electron을 이용한 새로운 IoT 가전 장치, CoMirror (Communication Mirror)
> 화상통화, 메시징 기능이 가능한 스마트미러
> 
> [2022 공학 경진대회, 2022 임베디트 SW 경진 대회]

<br>

## :pencil2: 작품 소개
### &nbsp;1.&nbsp;&nbsp;개발 배경
<div>
&nbsp;&nbsp; 최근 삼성의 냉장고처럼 IoT화 된 가전제품이 증가하고 있다. 이러한 가전 제품들은 공통적으로 사용자에게 정보를 제공하거나 외부에서 접근 가능하게 하며, 홈 제어 기능을 가지지만 대부분은 장치 간 통신 기능이 없거나 체계화 되어있지 않다. 
<br><br>
&nbsp;&nbsp; 본 팀은 이러한 점에 주목하여 서버 클라이언트 아키텍처로 가전 제품 간 통신 체계를 설계하고 이를 거울에 적용한 CoMirror를 개발하였다.
  CoMirror는 다중 사용자 환경을 제공하기 위해 얼굴 인식으로 사용자를 구분하는 로그인 기능과 텍스트, 이미지, 음성을 메모로 남기거나 다른 CoMirror 사용자에게 메시지 기능, CoMirror 사용자들 간에 화상 통신 기능을 개발하였다. 
</div><br>

### &nbsp;2.&nbsp;&nbsp;주요 기능 요약

- **얼굴 학습 및 인식을 통한 회원가입과 로그인 기능** <br>
&nbsp; CoMirror는 로그인을 통해 사용자를 구별하여 개인별 UI를 제공한다. CoMirror가 제공하는 전화, 메시지, 메모 기능은 로그인 후에 사용할 수 있어 본인만의 기록을 남기거나 볼 수 있으므로 개인 디바이스처럼 사용할 수 있다.

- **메시지 기능(텍스트 메시지, 이미지, 음성 파일)** <br>
&nbsp; 집을 나서기 전 오늘의 일정에 대해 가족에게 남기고 싶을 때, 바쁘게 외출 준비를 하면서 빠르게 메시지를 보내고 싶을 때 음성으로 메시지를 작성할 수 있어 다른 일을 하면서 메시지 보내기가 용이하고 간편 답장 기능을 통해 상대와 메시지를 빠르게 주고받을 수 있다.

- **CoMirror 간에 음성 및 화상 통신 기능**<br>
&nbsp; WebRTC와 Socket.io 라이브러리를 이용하여 다른 CoMirror 사용자와 음성 및 화상통신 함으로써 보다 효과적인 의사소통을 제공한다. 

- **음성인식을 통한 시스템 제어**<br>
&nbsp; 사용자는 이제 음성 명령을 통해 다른 작업을 할 때에도 손쉽게 기능을 사용할 수 있다.


<br><br>

## 🪞 하드웨어 구성
<img alt="image" src="https://github.com/HINAPIA/CoMirror/assets/109158497/15523bba-1814-4bf1-9c66-2d47617d7371">
<p align="center"> [ CoMirror 전체 시스템 구조 ] </p>
<br>

<img alt="image" src="https://github.com/HINAPIA/CoMirror/assets/109158497/bdefb457-69c9-4c10-9c53-f2aab62a2eca">
<p align="center"> [ CoMirror 클라이언트 ] </p>
<br><br>

## :wrench: 시스템 아키텍처
<p align="center"><img src="https://github.com/HINAPIA/CoMirror/assets/109158497/70391197-7cea-4907-b078-a3847d1492b7" /><br>

클라이언트는 데스크탑 웹 애플리케이션으로 구현되었으며 사용자 UI를 제공하고, 사용자의 터치와 음성 명령을 처리하는 모듈들로 구성된다. 그러므로 사용자 UI는 웹 브라우저 없이 웹 사이트를 구성하던 기술 HTML, CSS, JavaScript로 구현되었다.
<br><br>
서버에 Tensorflow와 Facenet 인공지능 라이브러리를 이용하여 얼굴 학습과 얼굴 인식을 실행하는 앱이 작동되며 Express 웹 프레임 워크를 이용하여 클라이언트와 통신한다. 
비동기적으로 동작하는 앱들 사이에 정보를 교환하는 방법으로서 IoT 표준 프로토콜 MQTT를 사용해 메시지를 송수신한다.

<br><br>


## 기대 효과
- **CoMirror를 통한 외부 CoMirror와의 통신** <br>
인터넷 환경이 갖추어진 CoMirror들은 어디서는 외부의 다른 CoMirror와 메시지, 통화 기능을 통해 자유로운 통신이 가능하다.

- **양방향 광고 디스플레이로 활용** <br>
 CoMirror의 디스플레이를 광고 목적에 맞게 사용할 수 있다. 이때, 사용자의 터치나 음성을 받음으로써 소비자에게 일방적으로 광고를 노출시키는 기존의 방식에서 벗어나, 소비자 본인이 자신에게 필요한 광고를 능동적으로 탐색할 수 있는 인터페이스를 제공할 수 있다. 

- **높은 시장성과 활용성** <br>
 CoMirror는 가정 내의 가전제품에만 국한되지 않고 통신이 필요한 곳 어디서든 활용할 수 있다.

- **다른 제품으로의 이식 가능성** <br>
 값싼 소형 임베디드 장치인 Raspberry PI 3을 사용하여 본 작품을 구축하였다. Raspberry PI 3을 부착할 수 있다면 거울뿐만 아니라 냉장고, 옷장 등 다양한 가구에서도 CoMirror의 기능을 사용할 수 있다. 또한 Raspberry PI 3 정도의 성능을 가진 장치라면 해당 장치에서도 CoMirror 기능을 사용할 수 있다.

- **홈 네트워크의 허브로서 발전 가능성** <br>
 CoMirror를 사용하는 사용자들 간 텍스트, 이미지, 오디오 등을 공유함으로써 홈 허브의 기능을 수행할 수 있다. CoMirror는 홈 내에서 정보를 공유하고 교환하는 아키텍쳐를 보여주어 홈 네트워크의 허브로서 각종 홈 네트워크를 제어하는 장치로의 확장 가능성을 보여준다.

- **CoMirror 시스템 확장 가능성** <br>
 CoMirror는 갤럭시 워치와 연동하여 CoMirror 워치 앱을 통해 사용자의 심박수를 디스플레이에 나타내고 받은 메시지를 워치 앱으로 전송할 수 있다. CoMirror와 갤럭시 워치를 연동 함으로써 워치와 같은 소형 디스플레이에도 CoMirror 시스템을 확장 시킬 수 있음을 나타내었다. 이를 통해 CoMirror 시스템의 확장은 갤럭시 워치에 국한되지 않고 갤럭시 폰, 아이폰, 태블릿 PC 등 다양한 매개체를 통해 확장될 수 있음을 보여준다.
 
- **사용자 친화적 인터페이스** <br>
 다른 복잡한 설계 없이 음성인식, 터치, 얼굴 인식만을 사용자 인터페이스로 제공하여 사용자의 편리성을 극대화했다.

<br><br>


### - 개발 도구
<p>
  <img src="https://img.shields.io/badge/VSCode-007ACC?style=for-the-badge&logo=visualstudiocode&logoColor=white"/> 
  <img src="https://img.shields.io/badge/Electron-47848F?style=for-the-badge&logo=Electron&logoColor=white"/>
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=MySQL&logoColor=white"/> 
  <img src="https://img.shields.io/badge/opencv-6EC93F?style=for-the-badge&logo=opencv&logoColor=white"/> 
  <img src="https://img.shields.io/badge/webRTC-333333?style=for-the-badge&logo=webRTC&logoColor=white"/> 
  <img src="https://img.shields.io/badge/Mosquitto-3C5280?style=for-the-badge&logo=eclipsemosquitto&logoColor=white"/>
  <img src="https://img.shields.io/badge/tensorflow Keras-FFAA5B?style=for-the-badge&logo=tensorflow&logoColor=white"/>
</p>

### - 개발 언어
![html](https://img.shields.io/badge/HTML-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![Javascript](https://img.shields.io/badge/Javascript-F7DF1E?style=for-the-badge&logo=Javascript&logoColor=white)
![Python](https://img.shields.io/badge/Python-3766AB?style=for-the-badge&logo=Python&logoColor=white)

