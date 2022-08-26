import numpy as np
import os
import os.path
from PIL import Image
from numpy import load
from numpy import expand_dims
from numpy import asarray
from keras.models import load_model



# 디렉토리 안의 모든 이미지를 불러오고 이미지에서 얼굴 추출
def load_faces(directory):
    faces = list()
    count = 0
	#required_size = (160, 160)
	# 파일 열거

    for filename in os.listdir(directory):
        count = count + 1
        path = directory + filename
                # 얼굴 추출
                #face = extract_face(path)
        image = Image.open(path).convert('RGB')
                # 배열로 변환
        pixels = np.asarray(image)
        image = Image.fromarray(pixels)
        image = image.resize((160,160))
        image.save(path)
        face_array = np.asarray(pixels)
                # 배열로 변환
                # 저장
        faces.append(face_array)
    return faces

# 이미지를 포함하는 각 클래스에 대해 하나의 하위 디렉토리가 포함된 데이터셋을 불러오기
def load_dataset(directory):
	X, y = list(), list()
	# 클래스별로 폴더 열기
	directory = directory + os.path.sep
	print('directory : ' + directory)
	#directory : face\login\
	for subdir in os.listdir(directory):
		# 경로
		path =os.path.join( directory , subdir ) + os.path.sep
		# path: face\login\user\
		print('path: ' + path)
		# 디렉토리에 있을 수 있는 파일을 건너뛰기(디렉토리가 아닌 파일)
		if not os.path.isdir(path):
			continue
		# 하위 디렉토리의 모든 얼굴 불러오기
		faces = load_faces(path)
		# 레이블 생성
		labels = [subdir for _ in range(len(faces))]
    
		# 진행 상황 요약
		print('>%d개의 예제를 불러왔습니다. 클래스명: %s' % (len(faces), subdir))
		# 저장
		X.extend(faces)
		y.extend(labels)
	return np.asarray(X), np.asarray(y)	


# 하나의 얼굴의 얼굴 임베딩 얻기
def get_embedding(model, face_pixels):
	# 픽셀 값의 척도
      #  face_pixels = face_pixels.reshape(1, 160*160)
        face_pixels = face_pixels.astype('int32')
        # 채널 간 픽셀값 표준화(전역에 걸쳐)
        print(face_pixels.shape)
        mean, std = face_pixels.mean(), face_pixels.std()
        face_pixels = (face_pixels - mean) / std
        # 얼굴을 하나의 샘플로 변환

        samples = expand_dims(face_pixels, axis=0)
        # 임베딩을 갖기 위한 예측 생성
        yhat = model.predict(samples)        
        return yhat[0]

def embedding(embeddingModel, file_dir):

	# 얼굴 데이터셋 불러오기
	data = load(file_dir)
	trainX, trainy= data['arr_0'], data['arr_1']
	print('불러오기: ', trainX.shape, trainy.shape)
	
	#model = load_model('facenet_keras.h5')
		# 훈련 셋에서 각 얼굴을 임베딩으로 변환하기
	newTrainX = list()
	for face_pixels in trainX:
		embedding = get_embedding(embeddingModel, face_pixels)
		newTrainX.append(embedding)
	newTrainX = asarray(newTrainX)
	print(newTrainX.shape)

	return newTrainX, trainy
	


    
        
