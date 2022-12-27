
from pydoc import cli
from re import T
import paho.mqtt.client as mqtt
from login import login
from createAccount import createAccoount
from createAccount import reTrain
import os
from keras.models import load_model
import shutil

embeddingModel = load_model('facenet_keras.h5')
curDir = os.path.dirname(os.path.realpath(__file__))
os.chdir(curDir)


create_account_flag = False
login_flag = False
exist_flag = False
stopFlag = False
flag = False
reTrain_flag = False
delete_login_flag = False
delete_folder_flag = False
mirror_id = None
user_name = ''
existUser = ''
delete_id = ''
user_id = 0
count= 0


def on_connect(client, userdata, flag, rc):
    print("Connect with result code:"+ str(rc))
    client.subscribe('createAccount/start')
    client.subscribe('createAccount/image')
    client.subscribe('delete/login')
    client.subscribe('delete/folder')
    client.subscribe('reTrain')
    client.subscribe('login')
    client.subscribe('exist')


def on_message(client, userdata, msg):
    global count
    global flag
    global delete_id
    global mirror_id
    print('받은 topic :' + msg.topic)
  #  print('받은 메시지 : ' + str(msg.payload))
    #command = msg.payload.decode("utf-8")
   # print("receiving ", msg.topic, " ", str(msg.payload))

    global user_id


    if(msg.topic == 'reTrain'): 
        mirror_id = int(msg.payload)
        print(mirror_id)
        global reTrain_flag
        reTrain_flag = True
    if(msg.topic == 'delete/login'):
        mirror_id = int(msg.payload)
        global delete_login_flag
        delete_login_flag = True

    if(msg.topic == 'delete/folder'):
        mirror_id = int((msg.payload)[0:3])
        delete_id = int((msg.payload)[3:])
        global delete_folder_flag
        delete_folder_flag = True

    if(msg.topic == 'exist'): 
        mirror_id = int(msg.payload)
        global exist_flag 
        exist_flag = True

    # 10개의 login 토픽이 오면 10장의 사진을 가지고 로그인 시도
    if(msg.topic == 'login'): 
        # url = msg.payload
        # mirror_id = url[0:3]
        # file = url[4:]
        # count = (count +1)%10

        # f = open('face' +  os.sep + 'login' + os.sep + 'user' + os.sep + str(count) +'.jpg','wb')
        # f.write(file)
        # print(type(file))

        mirror_id = msg.payload[0:3].decode('utf-8')
        print('mirror_id: ' + mirror_id)
        file = msg.payload[3:]
        count = (count +1)%10
        file_path = os.path.join('mirror', str(mirror_id),'login', 'user',str(count)+'.jpg')  
        f = open(file_path,'wb')
        f.write(file)
        f.close()
        # 10장의 이미지가 다 찍히면 얼굴 식별 시작
        if not (count):
             global login_flag
             login_flag = True
             count = 0

    # 받아온 user_id로 폴더 생성
    if(msg.topic == 'createAccount/start'):
        #미러 아이디는 3글자로 고정
        mirror_id = int(msg.payload[0:3])     
        user_id = int(msg.payload[3:])
        if not (flag):
            dir_path = os.path.join('mirror', str(mirror_id), 'train', str(user_id))
            #폴더가 없다면 만들고 있으면 안만들기
            if not (os.path.exists(dir_path)):
                os.mkdir(dir_path)
                flag = True

    if(msg.topic == 'createAccount/image'):
        if(flag):
            mirror_id = msg.payload[0:3].decode('utf-8')
            file =msg.payload[3:]
            count = (count +1)%20
            file_path = os.path.join('mirror', str(mirror_id), 'train', str(user_id) )
            #폴더 생성
            if (os.path.exists(file_path)):
                f = open(file_path +  os.sep + str(count) +'.jpg','wb')
                f.write(file)
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

#broker_ip = '192.168.0.8'
broker_ip = 'localhost'
client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

client.connect(broker_ip, 1883)
client.loop_start()


while True :
    if (login_flag):
        print('while - login')
        # 확인된 유저의 id 반환
        login_id = login(embeddingModel, mirror_id)   
        if(exist_flag):
            client.publish(f'{mirror_id}/exist/check', str(login_id))
            print("exist 체크 완료")
        elif(delete_login_flag):
            client.publish(f'{mirror_id}/delete/login/check', str(login_id))
            print('delete/login/check 완료')
        else :
            client.publish(f'{mirror_id}/loginCheck', str(login_id))
            print('login')
        # print("sending %s" % loginCheck)
        login_flag = False
        delete_login_flag = False
        exist_flag = False

    if (create_account_flag):
        print('while - createAccount')
        # 1은 pi 에서 받아온 유저아이디
        check = createAccoount(embeddingModel,mirror_id)
        client.publish(f'{mirror_id}/createAccount/check', user_id)
        create_account_flag = False

    if(reTrain_flag):       
        reTrain(embeddingModel, mirror_id)
        client.publish(f'{mirror_id}/reTrain/check', mirror_id)
        reTrain_flag = False

    if(delete_folder_flag):
        if not (delete_id ==''):
            curDir = os.path.dirname(os.path.realpath(__file__))
            os.chdir(curDir)
            delete_folder_name = os.path.join('mirror', str(mirror_id), 'train',str(delete_id))
            #폴더가 있다면 삭제
            if (os.path.exists(delete_folder_name)):
                shutil.rmtree(delete_folder_name)
                print('폴더를 삭제하였습니다')
                
            else:
                print('이미 삭제된 폴더입니다.')
            client.publish(f'{mirror_id}/delete/folder/check', str(delete_id))
            delete_folder_flag = False
        delete_id ==''
        delete_folder_flag = False
   
    if (stopFlag):
        break
   
print('끝내기')
client.loop_stop()
client.disconnect()
