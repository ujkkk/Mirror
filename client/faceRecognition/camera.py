from asyncio.windows_events import NULL
from genericpath import exists
from logging import NullHandler
import cv2
import os
import os.path
from datetime import datetime

face_classifier = cv2.CascadeClassifier(
    cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
cam = NULL


def onCam():
    global cam
    if not (cam):
        cam = cv2.VideoCapture(0)
        cam.set(cv2.CAP_PROP_FRAME_WIDTH, 500)
        cam.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)


def closeCam():
    global cam
    if (cam != NULL):
        cam.release()
        cam = NULL
        #cv2.destroyAllWindows()


def face_extractor(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_classifier.detectMultiScale(gray, 1.3, 5)

    #찾는 얼굴이 없으면 None Return
    if faces is ():
        return None

    for (x, y, w, h) in faces:
        #print("w : " + w "+ h :" + h)
        cropped_face = img[y:y+h, x:x+w]

    return cropped_face


def createImage():
    client = client
    # 노트북 웹캠에서 받아오는 영상을 저장하기
    global capture_on
    global capture_type
    # 기본 카메라 객체 생성
    global cam
    # 열렸는지 확인
    if (cam != NULL):
        if not cam.isOpened():
            return
    else:
        print("Camera open !")

    # 웹캠의 속성 값을 받아오기
    # 정수 형태로 변환하기 위해 round
    w = round(cam.get(cv2.CAP_PROP_FRAME_WIDTH))
    h = round(cam.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cam.get(cv2.CAP_PROP_FPS)  # 카메라에 따라 값이 정상적, 비정상적

    # fourcc 값 받아오기, *는 문자를 풀어쓰는 방식, *'DIVX' == 'D', 'I', 'V', 'X'
    fourcc = cv2.VideoWriter_fourcc(*'DIVX')

    # 프레임을 받아와서 저장하기
    #while True:                 # 무한 루프
    ret, frame = cam.read()  # 카메라의 ret, frame 값 받아오기

    if not ret:  # ret이 False면 중지
        print('breake')

    if (capture_type == 'memo'):
        now = datetime.now()
        file_name_path = (str)(now.timestamp())

        cv2.imwrite('memo_module/image' + '/'+file_name_path + '.jpg', frame)
        client.publish('memo/capture/done', (str)(file_name_path))
        capture_on = False
    #메시지
    else:
        file_name_path = 'test' + '.jpg'
        #크롭된 이미지 저장
        cv2.imwrite('media' + '/'+file_name_path, frame)
        capture_on = False
        # 저장한 파일이름을 보냄
        client.publish('capture/camera_done',
                       'message_module/image/media/' + file_name_path)
        capture_on = False


def createCropImage(userName, dir_path, countN):
    onCam()
    #print("현재 위치" + str(os.getcwdb()))
    dir_path = os.path.join(dir_path, userName)
    count = 0
    #폴더 생성
    if not (os.path.exists(dir_path)):
        os.mkdir(dir_path)
        print(dir_path + "폴더생성 완료")
    while True:
        ret, frame = cam.read()
        if face_extractor(frame) is not None:
            count += 1
            face = cv2.resize(face_extractor(frame), (160, 160))
            face = cv2.cvtColor(face, cv2.COLOR_BGR2GRAY)
            file_name_path = str(count) + '.jpg'
           #크롭된 이미지 저장
           #face/login/user
            cv2.imwrite(dir_path + '/'+file_name_path, face)
        else:
            print("Face not Found")
            pass

        if cv2.waitKey(1) == 13 or count == countN:
            break

    #cv2.destroyAllWindows()
    return dir_path
