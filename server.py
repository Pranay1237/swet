from flask import Flask, request, jsonify
import cv2
import numpy as np
import base64
from io import BytesIO

app = Flask(__name__)

@app.route('/detect_face', methods=['POST'])
def detect_face():
    try:
        # Get the image data from the request
        image_data = request.form['imageData'].split(',')[1]
        image_binary = base64.b64decode(image_data)
        image_np = np.frombuffer(image_binary, dtype=np.uint8)
        image = cv2.imdecode(image_np, cv2.IMREAD_COLOR)

        # Perform face detection (you may need to adjust the path to the classifier XML file)
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5)

        if len(faces) > 0:
            response = {'result': 'success', 'message': 'Face detected!'}
        else:
            response = {'result': 'failure', 'message': 'No face detected.'}

        return jsonify(response)
    except Exception as e:
        print('Error:', e)
        return jsonify({'result': 'error', 'message': 'Server error'})

if __name__ == '__main__':
    app.run(debug=True)
