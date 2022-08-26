
from asyncio.windows_events import NULL
from numpy import load
from numpy import expand_dims
from sklearn.preprocessing import LabelEncoder
from sklearn.preprocessing import Normalizer
from sklearn.svm import SVC
from random import choice
import joblib
from sklearn.metrics import accuracy_score
import os
import os.path

def user_check(embedding_file_name):

    pre_embedding_file= load('trainfaces-embeddings.npz')
    label_y = pre_embedding_file['arr_1']
    # 얼굴 임베딩 불러오기
    data = load(embedding_file_name)
    
    trainX, trainy = data['arr_0'], data['arr_1']
    # 입력 벡터 일반화
    in_encoder = Normalizer(norm='l2')
    trainX = in_encoder.transform(trainX)
    # 목표 레이블 암호화
    out_encoder = LabelEncoder()
    out_encoder.fit(label_y)
    print('모델 불러오기')
    #out_encoder.fit(trainy)
    #trainy = out_encoder.transform(trainy)
    # 모델 적합
    model_file = 'model.pkl'
    if not os.path.isfile(model_file):
        print('모델이 없습니다')
        return

    print("."+  os.path.sep + model_file)
    model = joblib.load("model.pkl")

    # 추측
    yhat_train = model.predict(trainX)
    # 정확도 점수
    #score_train = accuracy_score(trainy, yhat_train)
    # 요약
    #print('정확도: 훈련=%.3f' % (score_train*100))
    count =[0 for i in range(100)]
    # 테스트 데이터셋에서 임의의 예제에 대한 테스트 모델
    for i in range(10):
        selection = i
        random_face_emb = trainX[selection]
        #random_face_class = trainy[selection]
        #random_face_name = out_encoder.inverse_transform([random_face_class])
        # 얼굴 예측
        sample = expand_dims(random_face_emb, axis=0)
        yhat_class = model.predict(sample)
        yhat_prob = model.predict_proba(sample)

        class_index = yhat_class[0]
        class_probability = yhat_prob[0,class_index] * 100
        predict_names = out_encoder.inverse_transform(yhat_class)
        print('예상: %s (%.3f)' % (predict_names[0], class_probability))
        if (class_probability> 80):      
            count[class_index]  =  count[class_index] + 1

    # 같은 유저로 50%넘는 확률로 5번 이상 인식 한다면 해당 유저로 판별
    if(max(count) > 5):
        print(max(count))
        maxIndex = count.index(max(count))
        # 이름 얻기
        class_index = yhat_class[0]
        #class_probability = yhat_prob[0,maxIndex] * 100
        class_list = [maxIndex]
        #print(class_list.shape)      
        predict_names = out_encoder.inverse_transform(class_list)
        print('사용자: %s ' % (predict_names[0])) 
        return  predict_names[0]
    else:
        print(max(count))
        
        return 0

            
   # predict_names = out_encoder.inverse_transform(yhat_class)
   # print('예상: %s (%.3f)' % (predict_names[0], class_probability))
    print(count) 

 
   

def model_fit(embedding_file_name):

    # 얼굴 임베딩 불러오기
    data = load(embedding_file_name)
    trainX_faces =data['arr_0']
    trainX, trainy = data['arr_0'], data['arr_1']
    # 입력 벡터 일반화
    in_encoder = Normalizer(norm='l2')
    trainX = in_encoder.transform(trainX)
    # 목표 레이블 암호화
    out_encoder = LabelEncoder()
    out_encoder.fit(trainy)
    trainy = out_encoder.transform(trainy)
    # 모델 적합
    model_file = 'model.pkl'
    #만들어진 모델이 없다면 새롭게 만든다
    #if not os.path.isfile(os.path.join(os.getcwd(), 'faceRecognition', model_file)):
       
   # else :
   #     model = load(os.path.join(os.getcwd(),'faceRecognition', model_file))
    model = SVC(kernel='linear', probability=True)
    model.fit(trainX, trainy)
    #모델 저장
    joblib.dump(model, model_file)

    # 추측
    yhat_train = model.predict(trainX)
    # 정확도 점수
    score_train = accuracy_score(trainy, yhat_train)
    # 요약
    print('정확도: 훈련=%.3f' % (score_train*100))

    # 테스트 데이터셋에서 임의의 예제에 대한 테스트 모델
    for i in range(20):
        selection = choice([i for i in range(trainX.shape[0])])
        random_face_pixels = trainX_faces[selection]
        random_face_emb = trainX[selection]
        random_face_class = trainy[selection]
        random_face_name = out_encoder.inverse_transform([random_face_class])
        # 얼굴 예측
        samples = expand_dims(random_face_emb, axis=0)
        yhat_class = model.predict(samples)
        yhat_prob = model.predict_proba(samples)
        # 이름 얻기
        class_index = yhat_class[0]
        class_probability = yhat_prob[0,class_index] * 100
        predict_names = out_encoder.inverse_transform(yhat_class)
        print('예상: %s (%.3f)' % (predict_names[0], class_probability))
        print('실제값: %s' % random_face_name[0])