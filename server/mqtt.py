from asyncio.windows_events import NULL
from pydoc import cli
from re import T
import paho.mqtt.client as mqtt
from login import login
from createAccount import createAccoount
from createAccount import reTrain
import os
from keras.models import load_model
import shutil

curDir = os.path.dirname(os.path.realpath(__file__))
    #curDir = '.' + os.path.sep + 'faceRecognition'
os.chdir(curDir)
embeddingModel = load_model('facenet_keras.h5')

create_account_flag = False
login_flag = False
exist_flag = False
user_id = 0
user_name = ''
flag = False
existUser = ''
reTrain_flag = False
delete_login_flag = False
delete_folder_flag = False
delete_id = ''
trainFolderName = 'train3'

def on_connect(client, userdata, flag, rc):
    print("Connect with result code:"+ str(rc))
    client.subscribe('login')
    client.subscribe('delete/login')
    client.subscribe('createAccount/start')
    client.subscribe('createAccount/image')
    client.subscribe('exist')
    client.subscribe('reTrain')
    client.subscribe('delete/folder')

count= 0
def on_message(client, userdata, msg):
    global count
    global flag
    global delete_id
    #command = msg.payload.decode("utf-8")
   # print("receiving ", msg.topic, " ", str(msg.payload))
    if(msg.topic == 'reTrain'):
        global reTrain_flag
        reTrain_flag = True
    if(msg.topic == 'delete/login'):
        global delete_login_flag
        delete_login_flag = True

    if(msg.topic == 'delete/folder'):
        delete_id = str(int(msg.payload))
        global delete_folder_flag
        delete_folder_flag = True

    if(msg.topic == 'exist'): 
        global exist_flag 
        exist_flag = True

    if(msg.topic == 'login'):  
        count = (count +1)%10
       # print('imagelist 받아오기')
        f = open('face' +  os.sep + 'login' + os.sep + 'user' + os.sep + str(count) +'.jpg','wb')
        f.write(msg.payload)
        f.close()
        print('image received')
        # 10장의 이미지가 다 찍히면
        if not (count):
             global login_flag
             login_flag = True
             count = 0

    # 받아온 user_id로 폴더 생성
    if(msg.topic == 'createAccount/start'):
        global user_id
        user_id = int(msg.payload)
        print('user_name : ' +  str(user_id))
        if not (flag):
            dir_name = 'face' + os.sep + trainFolderName + os.sep + str(user_id)
            #폴더가 없다면 만들고 있으면 안만들기
            if not (os.path.exists(dir_name)):
                os.mkdir(dir_name)
                print(dir_name + '폴더 생성')
                flag = True

    if(msg.topic == 'createAccount/image'):
        if(flag):
            count = (count +1)%20
            print('user 아이디 : ' + str(user_id) + ', 사진 받아오기')
            path = 'face' + os.sep + trainFolderName + os.sep + str(user_id)
            #폴더 생성
            if (os.path.exists(path)):
                f = open(path +  os.sep + str(count) +'.jpg','wb')
                f.write(msg.payload)
                f.close()
                if not (count):
                    # 모델 학습 시작 플래그 
                    global create_account_flag
                    create_account_flag = True
                    count = 0
                    flag = False
            
            return
        else :
            print('중복된 아이디 입니다. 회원가입 할 수 없습니다.')
            return
        
        

#broker_ip = '192.168.137.160' # 현재 이 컴퓨터를 브로커로 설정

broker_ip = 'localhost'
client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

client.connect(broker_ip, 1883)
client.loop_start()

stopFlag = False
while True :
    if(reTrain_flag):       
        reTrain(embeddingModel, trainFolderName)
        client.publish('reTrain/check', trainFolderName)
        reTrain_flag = False

    if(delete_folder_flag):
        if not (delete_id ==''):
            curDir = os.path.dirname(os.path.realpath(__file__))
            os.chdir(curDir)
            delete_folder_name = os.path.join('face',trainFolderName,delete_id)
            print('서버 mqtt.py | delete_folder_name :' + delete_folder_name)
            #폴더가 있다면 삭제
            if (os.path.exists(delete_folder_name)):
                shutil.rmtree(delete_folder_name)
                print('폴더를 삭제하였습니다')
                
            else:
                print('이미 삭제된 폴더입니다.')
            client.publish('delete/folder/check', str(delete_id))
            delete_folder_flag = False
        delete_id ==''
        delete_folder_flag = False
    if (login_flag):
       
        print('while - login')
        # 확인된 유저의 id 반환
        loginCheck = login(embeddingModel)
        
        if(exist_flag):
            client.publish('exist/check', loginCheck)
            print("exist 체크 완료")
        elif(delete_login_flag):
            client.publish('delete/login/check', loginCheck)
            print('delete/login/check 완료')

        else :
            client.publish('loginCheck', loginCheck)
            print('login')
        # print("sending %s" % loginCheck)
        login_flag = False
        delete_login_flag = False
        exist_flag = False

    if (create_account_flag):
        print('while - createAccount')
        # 1은 pi 에서 받아온 유저아이디
        check = createAccoount(embeddingModel,trainFolderName)
        client.publish('createAccount/check', check)
        print("sending %s" % check)
        create_account_flag = False
    if (stopFlag):
        break
   
print('끝내기')
client.loop_stop()
client.disconnect()
