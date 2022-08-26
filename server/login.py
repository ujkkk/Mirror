
from asyncio.windows_events import NULL
from model import user_check
from numpy import savez_compressed 
from dataPreProcess import load_dataset
from dataPreProcess import embedding
import os.path 
import os

def login(embeddingModel):
    
    #curDir = os.path.join(os.getcwd(),'faceRecognition')
    # 현재 파일의 디렉토리 경로. 작업 파일 기준
    curDir = os.path.dirname(os.path.realpath(__file__))
    #curDir = '.' + os.path.sep + 'faceRecognition'
    os.chdir(curDir)
    
    # 훈련 데이터셋 불러오기
    trainX, trainy = load_dataset(os.path.join('face', 'login'))
    # 배열을 단일 압축 포맷 파일로 저장
    savez_compressed('loginface.npz', trainX, trainy)
    print(trainX.shape, trainy.shape)

    newTrainX, trainy = embedding(embeddingModel, 'loginface.npz')
    #embedding_file_name = 'login-embeddings.npz'
    # 배열을 하나의 압축 포맷 파일로 저장
    savez_compressed('login-embeddings.npz', newTrainX, trainy )
    user = user_check('login-embeddings.npz')
    if(user):
        return user
        
    else :
        return 'NULL'

