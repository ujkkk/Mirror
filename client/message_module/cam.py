
from venv import create
import cv2
import sys
import paho.mqtt.client as mqtt
from datetime import datetime
import platform

osName = platform.system()
# if(osName == "Windows"):
#     cam = cv2.VideoCapture(0)
# else: cam = cv2.VideoCapture(cv2.CAP_V4L2)
cam = cv2.VideoCapture(cv2.CAP_V4L2)
print("os" + osName)

capture_on = False
createImageFalg = False
capture_type = None
def on_connect(client, userdata, flag, rc):
    print("Connect with result code:"+ str(rc))
    client.subscribe('capture/camera')
    client.subscribe('camera/on')
    client.subscribe('camera/close')


def on_message(client, userdata, msg):
    message = msg.payload.decode("utf-8")
    print("topic : " + msg.topic) 
    print("payload : " + str(message))

    #미러앱에서 사진보내기 클릭하면 해당 토픽의 메시지가 발행
    #사진 찍어서 바이트코드로 이미지 정보 보내주기
    if(msg.topic == 'capture/camera'):
        global createImageFalg
        createImageFalg = True
        global capture_type
        capture_type =  str(message)
    if(msg.topic == 'camera/on'):
        onCam()
    if(msg.topic == 'camera/close'):
        closeCam()
        #cv2.destroyAllWindows()
    if(msg.topic == 'capture/on'):
        global capture_on
        capture_on = True

       

broker_ip = "localhost" # 현재 이 컴퓨터를 브로커로 설정
print('broker_ip : ' + broker_ip)
client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message
client.connect(broker_ip, 1883)
client.loop_start()



def onCam():
    global cam
    if(cam == None):
        # if(osName == "Windows"):
        #     cam = cv2.VideoCapture(0)
        # else: cam = cv2.VideoCapture(cv2.CAP_V4L2)
        cam = cv2.VideoCapture(cv2.CAP_V4L2)
        # #리눅스
        #cam = cv2.VideoCapture(cv2.CAP_V4L2)
        #윈도우
        #cam = cv2.VideoCapture(0)
        print(cam)
        #cam.set(cv2.CAP_PROP_FRAME_WIDTH, 500)
        #cam.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        print('onCam 메시지 : 카메라 켜짐')
        cam.set(cv2.CAP_PROP_FRAME_WIDTH, 500)
        cam.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        
def closeCam():
    global cam
   
    if(cam != None):
        print('카메라꺼짐')
        cam.release()
        cam = None



def createImage():
    global capture_on
    global capture_type
    # 기본 카메라 객체 생성
    global cam
    # 열렸는지 확인
    if(cam is None):
        onCam()

    elif(cam is not None):
        if not cam.isOpened():
           onCam()
    else:
        print("createImage")

    if(cam.isOpened()):
        print('찍음')
        # 정수 형태로 변환하기 위해 round
        w = round(cam.get(cv2.CAP_PROP_FRAME_WIDTH))
        h = round(cam.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = cam.get(cv2.CAP_PROP_FPS) # 카메라에 따라 값이 정상적, 비정상적
        # fourcc 값 받아오기, *는 문자를 풀어쓰는 방식, *'DIVX' == 'D', 'I', 'V', 'X'
        fourcc = cv2.VideoWriter_fourcc(*'DIVX')

        # 프레임을 받아와서 저장하기
        ret, frame= cam.read() # 카메라의 ret, frame 값 받아오기

        if not ret:             #ret이 False면 중지
            print("이미지가 없습니다.")
            closeCam()
            return
        #메모
        if(capture_type == 'memo'):
            now = datetime.now()
            file_name_path = (str)(now.timestamp())
            cv2.imwrite('../memo_module/image' + '/'+file_name_path +'.jpg', frame)
            client.publish('memo/capture/done', (str)(file_name_path))
            capture_on = False
        #메시지 
        else:
            file_name_path = 'test.jpg'
                    #크롭된 이미지 저장
            cv2.imwrite('./image/media/'+file_name_path, frame)
            capture_on = False
                    # 저장한 파일이름을 보냄
            client.publish('message/capture/done','media/test.jpg')
            capture_on = False


stopFlag = False
while True :
    if(createImageFalg):
        createImage()
        #stopFlag = True
        createImageFalg = False
    if (stopFlag):
        break
   
print('끝내기')
client.loop_stop()
client.disconnect()