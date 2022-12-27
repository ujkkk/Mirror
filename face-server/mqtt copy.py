from re import T
import paho.mqtt.client as mqtt
from login import login
import os
from keras.models import load_model

curDir = os.path.dirname(os.path.realpath(__file__))
    #curDir = '.' + os.path.sep + 'faceRecognition'
os.chdir(curDir)
embeddingModel = load_model('facenet_keras.h5')

new_account_flag = False
login_flag = False
def on_connect(client, userdata, flag, rc):
	print("Connect with result code:"+ str(rc))
	client.subscribe('login')

def on_message(client, userdata, msg):
    command = msg.payload.decode("utf-8")
    print("receiving ", msg.topic, " ", str(msg.payload))
    if(msg.topic == 'login'):
        global login_flag
        login_flag = True
       

broker_ip = "localhost" # 현재 이 컴퓨터를 브로커로 설정
client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message
client.connect(broker_ip, 1883)
client.loop_start()

stopFlag = False
while True :
    if (login_flag):
        print('while - login')
        loginCheck = login(embeddingModel)
        client.publish('loginCheck', loginCheck)
        print("sending %s" % loginCheck)
        login_flag = False
    if (stopFlag):
        break
   
print('끝내기')
client.loop_stop()
client.disconnect()
