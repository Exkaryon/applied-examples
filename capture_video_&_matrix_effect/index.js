import VideoCanvas from './VideoCanvas.js';
import MatrixCanvas from './MatrixCanvas.js';
import Player from './Player.js';

const container = document.getElementById('container');
const videoElement = container.querySelector('video');
const button = container.querySelector('button');
const canvas = container.querySelector('canvas');
let player;

videoElement.addEventListener('canplaythrough', () => {
    button.dataset.action = 'play';
    const matrixCanvas = new MatrixCanvas(videoElement.clientWidth, videoElement.clientHeight, canvas);
    const videoCanvas = new VideoCanvas(videoElement, matrixCanvas.videoCanvasWidth, matrixCanvas.videoCanvasHeight);
    player = new Player(videoCanvas, matrixCanvas, videoElement);
}, {once: true});

videoElement.addEventListener('ended', () => {
    button.dataset.action = 'save';
    player.stop();
});

button.addEventListener('click', () => {
    switch(button.dataset.action){
        case 'play':
            button.dataset.action = 'pause';
            videoElement.play();
            player.start();
            break;
        case 'pause':
            button.dataset.action = 'play';
            videoElement.pause();
            player.stop();
            break;
        case 'save':
            button.dataset.action = 'play';
            player.saveVideo();
            break;
    }
});