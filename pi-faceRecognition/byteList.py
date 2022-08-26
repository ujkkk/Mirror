import os
import os.path


# 디렉토리 안의 모든 이미지를 불러오고 이미지에서 얼굴 추출
def load_image(directory):
    byteArr = list()
    count = 0
	#required_size = (160, 160)
	# 파일 열거
    #os.chdir(directory + os.sep)
    for filename in os.listdir(directory):
        count = count + 1
        path = directory +os.sep + filename 
                # 얼굴 추출
                #face = extract_face(path)
            
        print(path)
        f = open(path,"rb" )
        filecontent = f.read()
        print('logint byte정보 넘김')
        byteArr.append(bytearray(filecontent))
    return byteArr
        
                                                                                                            