from model import model_fit
import numpy
from dataPreProcess import load_dataset
from dataPreProcess import embedding
import os.path 

def reTrain(embeddingModel, trainFolderName):
    # 라벨링 작업
    trainX, trainy = load_dataset(os.path.join('face',trainFolderName) + os.path.sep)
    # 단일 압축 포맷 파일로 저장
    dataset_file_name = 'trainface.npz'
    numpy.savez_compressed( 'trainface.npz', trainX, trainy)
    print(trainX.shape, trainy.shape)

    # 라벨링한 데이터를 임베딩 작업
    newTrainX, trainy = embedding(embeddingModel, 'trainface.npz')
    numpy.savez_compressed('trainfaces-embeddings.npz', newTrainX, trainy )
    # 모델 학습
    model_fit('trainfaces-embeddings.npz')
    return True

def createAccoount(embeddingModel, trainFolderName):

    # 카메라로 사진 찍어서 얼굴부분만 크롭해서 저장
    curDir = os.path.dirname(os.path.realpath(__file__))
    #curDir = '.' + os.path.sep + 'faceRecognition'
    os.chdir(curDir)
    # 현재 실행주소를 ./faceRecognition 폴더로 옮김'
    # 라벨링 작업
    trainX, trainy = load_dataset(os.path.join('face',trainFolderName) + os.path.sep)
    # 단일 압축 포맷 파일로 저장
    dataset_file_name = 'trainface.npz'
    numpy.savez_compressed( 'trainface.npz', trainX, trainy)
    print(trainX.shape, trainy.shape)

    # 라벨링한 데이터를 임베딩 작업
    newTrainX, trainy = embedding(embeddingModel, 'trainface.npz')
    #embedding_file_name = 'trainfaces-embeddings.npz'
    # 배열을 하나의 압축 포맷 파일로 저장
    numpy.savez_compressed('trainfaces-embeddings.npz', newTrainX, trainy )
    # 모델 학습
    model_fit('trainfaces-embeddings.npz')
    return True

