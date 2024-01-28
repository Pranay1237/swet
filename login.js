let attempts = 0;

function validateLogin() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (mockServerAuthentication(username, password)) {
        alert("Login successful!");
    } else {
        attempts++;

        if (attempts >= 3) {
            capturePhoto();
            alert("Too many unsuccessful login attempts. Photo captured.");

            setTimeout(() => {
                send();
            }, 2000);
            setTimeout(() => {
                del();
            }, 5000);
        } else {
            alert("Incorrect username or password. Attempt: " + attempts);
        }
    }
}

function send() {
    fetch('http://localhost:3000/')
        .then(response => {
            if (response.ok) {
                return response.text();
            } else {
                throw new Error('Request failed');
            }
        })
        .then(data => {
            console.log('Server response:', data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

function del() {
    fetch('http://localhost:3000/del')
        .then(response => {
            if (response.ok) {
                return response.text();
            } else {
                throw new Error('Request failed');
            }
        })
        .then(data => {
            console.log('Server response:', data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function checkCameraAvailability() {
    function checkAvailability() {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(() => {
                document.getElementById("cameraCheck").style.display = "none";
                document.getElementById("loginForm").style.display = "block";
            })
            .catch(() => {
                document.getElementById("cameraCheck").innerHTML = "Give access to camera to continue";
                checkAvailability();
            });
    }

    checkAvailability();
}

window.onload = checkCameraAvailability;


function capturePhoto() {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
            video.srcObject = stream;
            video.onloadedmetadata = () => {
                video.play();

                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                const photoDataUrl = canvas.toDataURL("image/jpeg");
                savePhotoLocally(photoDataUrl);
                stream.getVideoTracks()[0].stop();

                video.remove();
                canvas.remove();

                console.log("Photo captured and saved locally.");
            };
        })
        .catch((error) => {
            console.error("Error accessing camera:", error);
        });
}

function savePhotoLocally(dataUrl) {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "captured_photo.jpg";
    link.click();
}

function mockServerAuthentication(username, password) {
    return username === "user" && password === "password";
}
