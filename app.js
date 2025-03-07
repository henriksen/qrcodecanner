document.addEventListener('DOMContentLoaded', async () => {
    const video = document.getElementById('video');
    const cameraSelect = document.getElementById('camera-select');
    const qrCodeBody = document.getElementById('qr-code-body');

    // Create an Audio element for the beep sound
    const beepSound = new Audio('beep.mp3'); // Replace 'beep.mp3' with your beep sound file

    // Function to get available cameras
    async function getCameras() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            return devices.filter(device => device.kind === 'videoinput');
        } catch (error) {
            console.error('Error enumerating devices:', error);
            alert('Failed to enumerate devices. Please check your browser permissions.');
            return [];
        }
    }

    // Function to set up the video stream
    async function setupVideoStream(cameraId) {
        try {
            
            const constraints = {
                video: { facingMode: "environment" },
            };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            video.srcObject = stream;
        } catch (error) {
            console.error('Error accessing camera:', error);
            if (error.name === 'OverconstrainedError') {
                alert('The specified camera is not available. Please select a different camera.');
            } else if (error.name === 'NotAllowedError') {
                alert('Permission denied to access the camera. Please grant permission in your browser settings.');
            } else {
                alert('Failed to access the camera. Please check your permissions and try again.');
            }
        }
    }

    // Function to scan QR code
    function scanQRCode() {
        if (video.videoWidth === 0 || video.videoHeight === 0) {
            console.log('Video dimensions are not ready yet.');
            return;
        }

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
            addQRCodeToTable(code.data);
            playBeepSound();
        }
    }

    // Function to add QR code value to the table
    function addQRCodeToTable(value) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.textContent = value;
        row.appendChild(cell);
        qrCodeBody.appendChild(row);
    }

    // Function to play the beep sound
    function playBeepSound() {
        beepSound.play();
    }

    // Initialize the app
    async function init() {
        const cameras = await getCameras();
        if (cameras.length === 0) {
            alert('No cameras found. Please check your camera connection and try again.');
            return;
        }

        cameras.forEach(camera => {
            const option = document.createElement('option');
            option.value = camera.deviceId;
            option.textContent = camera.label || `Camera ${cameraSelect.options.length + 1}`;
            cameraSelect.appendChild(option);
        });

        cameraSelect.addEventListener('change', (e) => {
            setupVideoStream(e.target.value);
        });

        // Start with the default camera
        if (cameras.length > 0) {
            setupVideoStream(cameras[0].deviceId);
        }

        // Ensure the video is ready before scanning
        video.addEventListener('canplay', () => {
            console.log('Video is ready to play, starting QR code scanning.');
            setInterval(scanQRCode, 1000);
        });
    }

    init();
});