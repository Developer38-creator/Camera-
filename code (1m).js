const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

// Load models (replace 'models' with the correct path if needed)
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'), // Optional, for face recognition
    faceapi.nets.faceExpressionNet.loadFromUri('/models')   // Optional, for expression detection
]).then(startVideo);

function startVideo() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(stream => {
            video.srcObject = stream;
        })
        .catch(err => console.error("Error accessing camera:", err));
}

video.addEventListener('play', () => {
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()  // Optional
            .withFaceExpressions(); // Optional

        const resizedDetections = faceapi.resizeResults(detections, displaySize);

        context.clearRect(0, 0, canvas.width, canvas.height); // Clear previous drawings

        resizedDetections.forEach(detection => {
            const box = detection.detection.box;
            const drawBox = new faceapi.draw.DrawBox(box, { label: 'Face' });
            drawBox.draw(canvas);

            //Optional: Draw Landmarks
            //faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

            //Optional: Draw face Expressions
            //faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

        });
    }, 100); // Adjust interval as needed (e.g., 33ms for ~30fps)
});