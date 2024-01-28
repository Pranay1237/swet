let attempts = 0;

function validateLogin() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    if (username === "" || password === "") {
        alert("Username or password cannot be empty");
        return;
    }

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

function getImage() {
    return new Promise((resolve, reject) => {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
                const video = document.createElement("video");
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");

                video.srcObject = stream;
                video.onloadedmetadata = () => {
                    video.play();

                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);

                    const photoDataUrl = canvas.toDataURL("image/jpeg");
                    resolve(photoDataUrl);

                    video.pause();
                    video.srcObject = null;
                    stream.getTracks().forEach(track => track.stop());

                    video.remove();
                    canvas.remove();
                };
            })
            .catch((error) => {
                reject(error);
            });
    });
}

// Usage:
getImage()
    .then((photoDataUrl) => {
        console.log("Image captured");
        // Use the photoDataUrl as needed
    })
    .catch((error) => {
        console.error("Error accessing camera:", error);
    });

function sendImageToServer(image) {
    const url = "http://localhost:8000/detect_face"; // Replace with the correct URL for your Flask server

    // Send the image data to the server
    fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "imageData=" + encodeURIComponent(image),
    })
    .then(response => response.json())
    .then(data => {
        // Handle the response from the server
        console.log("Server response:", data);

        // Check if the server detected a face
        if (data.result === "success") {
            // alert("Face detected!");
            enableForm();
        } else {
            alert("No face detected.");
            disableForm();
            getImage()
                .then((photoDataUrl) => {
                    console.log("Image captured");
                    sendImageToServer(photoDataUrl);
                })
                .catch((error) => {
                    console.error("Error accessing camera:", error);
                });
        }
    })
    .catch(error => {
        console.error("Error sending image to server:", error);
    });
}

function disableForm() {
    // Disable all form elements
    const formElements = document.getElementById("loginForm").elements;
    for (let i = 0; i < formElements.length; i++) {
        formElements[i].disabled = true;
    }
}

function enableForm() {
    // Enable all form elements
    const formElements = document.getElementById("loginForm").elements;
    for (let i = 0; i < formElements.length; i++) {
        formElements[i].disabled = false;
    }
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

setInterval(() => {
    getImage()
        .then((photoDataUrl) => {
            console.log("Image captured");
            sendImageToServer(photoDataUrl);
        })
        .catch((error) => {
            console.error("Error accessing camera:", error);
        });
}, 10000);
