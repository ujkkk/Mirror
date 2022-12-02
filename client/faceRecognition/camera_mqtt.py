
from email.mime import image
from re import T
import paho.mqtt.client as mqtt
import json
import camera
import os
from datetime import datetime

# 미러 바뀔 때마다 수동으로 설정해줘야 한다
mirror_id = 400

new_account_flag = False
login_flag = False
loginCamera_flag = False
createAccountCamera_flag = False
exist_flag = False
delete_login_flag = False
close_flag = False
stopFlag = False
id = 0

curDir = os.path.dirname(os.path.realpath(__file__))
    #curDir = '.' + os.path.sep + 'faceRecognition'
os.chdir(curDir)


def on_connect(client, userdata, flag, rc):
    print("Connect with result code:"+ str(rc))
    print(f"얼굴인식 camera_mqtt 연결 : {mirror_id}" )
   # client.subscribe('${mirror_id}/mirror_id')
    client.subscribe(f'{mirror_id}/onCam')
    client.subscribe(f'{mirror_id}/login/camera')
    client.subscribe(f'{mirror_id}/createAccount/camera')
    client.subscribe(f'{mirror_id}/exist/camera')
    client.subscribe(f'{mirror_id}/closeCamera')
    client.subscribe(f'{mirror_id}/delete/camera')
    client.subscribe(f'{mirror_id}/re_login')
    
    



def on_message(client, userdata, msg):
   # print(f"222얼굴인식 camera_mqtt 연결 : ${mirror_id}" )
   # global mirror_id
    message = msg.payload.decode("utf-8")
    print('받은 topic : ' + msg.topic)
  #  print("받은 payload : " + str(message))
        #최초 미러 실행시 mirror_id 셋팅
    # if (msg.topic == '${mirror_id}/mirror_id'):
    #     mirror_id = str(message)
    #     client.unsubscribe('${mirror_id}/mirror_id')
    #     if(str(mirror_id)== str(message)):
    #         camera.onCam()
        
    
    if(msg.topic == f'{mirror_id}/onCam'):
        
        #if(str(mirror_id)== str(message)):
        print('onCam:' +str(mirror_id))
      #  print(message)
        camera.onCam()

    elif(msg.topic == f'{mirror_id}/closeCamera'):
        print('closeCamera:' +str(mirror_id))
        # print(message)
        # if(str(mirror_id)== str(message)):
        camera.closeCam()
    elif(msg.topic == f'{mirror_id}/re_login'):
        print("클랙 해도 됨")
        #if(str(mirror_id)== str(message)):
        client.publish(f'{mirror_id}/camera/check', mirror_id)
        camera.onCam()

    elif(msg.topic == f'{mirror_id}/login/camera'):
        #if(str(message) == str(mirror_id)):
           # print("로그인 시작 : " + msg.topic)
        #camera.onCam()
        global loginCamera_flag
        loginCamera_flag = True
            
    elif(msg.topic == f'{mirror_id}/createAccount/camera'):
        camera.onCam()
        print("topic : " + msg.topic)
        m_id = (str)(message)[0:3]
        print('m_id:' +m_id)
        #if(str(m_id) == str(mirror_id)):
        global id
        id = str(message)
        global createAccountCamera_flag
        createAccountCamera_flag = True
    #삭제 버튼 누른 유저가 삭제할 수 있는지 얼굴인식 서버에게
    #로그인 해서 id 가져오기
    elif(msg.topic ==f'{mirror_id}/delete/camera'):
        #if(str(mirror_id )== str(message)):
        client.publish('delete/login', mirror_id)
        global delete_login_flag
        delete_login_flag = True

    elif(msg.topic == f'{mirror_id}/exist/camera'):
       # if(str(message) == str(mirror_id)):
        #얼굴인식 서버에게 해당 토픽 이벤트 보냄
        client.publish('exist', mirror_id)
        global exist_flag
        exist_flag = True
        

broker_ip = "192.168.0.2" # 현재 이 컴퓨터를 브로커로 설정
#broker_ip = "127.0.0.1"
print('broker_ip : ' + broker_ip)
client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message
client.connect(broker_ip, 1883)
client.loop_start()          
       


#client를 넘겨주는 함수
def getClient():
    global client
    return client
       
def capture_for_login(dir_name):
    # dir_name1 폴더안에 10장의 얼굴 이미지를 저장
    saved_folder = camera.createCropImage('user', dir_name, 10)
    # 사진 넘겨주기
    imagelist = camera.load_image(saved_folder)
    for i in range(10) :
        imageByte = imagelist.pop()    
        # 얼굴인식 서버에게 찍은 사진을 보냄
        client.publish('login', bytearray(str(mirror_id), 'utf-8')+imageByte)
    return True

while True :
    if (loginCamera_flag):
        print('while - loginCamera')
        # 카메라로 사진 찍어서 얼굴부분만 크롭해서 저장
        dir_name = os.path.join('face','login')
        if(capture_for_login(dir_name)):
            loginCamera_flag = False 
    if(exist_flag):
        dir_name = os.path.join('face','login')
        print('기존 유저인지 확인 중')
        if(capture_for_login(dir_name)):
            loginCamera_flag = False
        exist_flag = False

    if(delete_login_flag):
        print('삭제버튼을 누른유저가 삭제권한이 있는지 확인 중')
        dir_name = os.path.join('face','login')
        if(capture_for_login(dir_name)):
            loginCamera_flag = False
        delete_login_flag = False

    if(createAccountCamera_flag):   
        if not (id == 0):
            # 파이에게 id에 해당하는 폴더 생성하라고 pub
            client.publish('createAccount/start', str(mirror_id) + str(id))
            # 카메라로 사진 찍어서 얼굴부분만 크롭해서 저장
            dir_name = os.path.join('face','train')
            saved_folder = camera.createCropImage('user', dir_name, 20)
            # 사진 넘겨주기
            imagelist = camera.load_image(saved_folder)
            for i in range(20) :
                imageByte = imagelist.pop()        
                # 서버에 보냄   
                client.publish('createAccount/image', bytearray(str(mirror_id), 'utf-8') + imageByte)
            id = 0
            createAccountCamera_flag = False
    if (stopFlag):
        break
   
client.loop_stop()
client.disconnect()
