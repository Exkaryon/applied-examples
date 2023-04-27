import './style.scss';
import streamBox from './stream-box';
import screenshotBox from './screenshot-box';


streamBox.init();
screenshotBox.init();

const captureButton = document.querySelector('#start-stop button');
const logElem = document.querySelector('#start-stop .log');


async function startCapture(displayMediaOptions) {
    logElem.innerHTML = "";
    try {
        streamBox.videoElement.srcObject = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
    } catch(err) {
        console.error("Error: " + err);
        logElem.innerHTML = err;
    }
}

function stopCapture() {
    const tracks = streamBox.videoElement.srcObject.getTracks();
    tracks.forEach(track => track.stop());
    streamBox.videoElement.srcObject = null;
}


captureButton.addEventListener('click', () => {
    if(!streamBox.videoElement.srcObject){
        startCapture({
            video: {
                cursor: "always"
            },
            audio: false
        });
        captureButton.innerText = 'Остановить трансляцию';
    }else{
        stopCapture();
        captureButton.innerText = 'Запустить трансляцию';
    }
});


