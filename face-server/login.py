
from asyncio.windows_events import NULL
from model import user_check
from numpy import savez_compressed
from dataPreProcess import load_dataset
from dataPreProcess import embedding
import os.path 
import os

def login(embeddingModel, mirror_id):
    
    # 현재 파일의 디렉토리 경로. 작업 파일 기준
    curDir = os.path.dirname(os.path.realpath(__file__))
    os.chdir(curDir)
    
    # 훈련 데이터셋 불러오기
    trainX, trainy = load_dataset(os.path.join('mirror',mirror_id,'login'))
    # 배열을 단일 압축 포맷 파일로 저장
    savez_compressed(os.path.join('mirror',mirror_id, 'files','loginface.npz'), trainX, trainy)
    print(trainX.shape, trainy.shape)

    newTrainX, trainy = embedding(embeddingModel,os.path.join('mirror',mirror_id, 'files','loginface.npz'))
    # 배열을 하나의 압축 포맷 파일로 저장
    savez_compressed(os.path.join('mirror',mirror_id, 'files','login-embeddings.npz'), newTrainX, trainy )
    user = user_check(os.path.join('mirror',mirror_id, 'files','login-embeddings.npz'),mirror_id)
    if(user):
        return user     
    else :
        return 'NULL'


