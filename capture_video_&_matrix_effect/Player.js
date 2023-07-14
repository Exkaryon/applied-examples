export default class Player {
    
    videoFPS = 14;      // Операций в секунду для преобразования и отрисовки кадра на матричном холсте.
    rainFPS = 25;
    prevFrameTime = 0;  // TimeStamp предыдущего кадра.
    videoTimer = 0;     // Cчетчик того, сколько прошло времени с последней обработки кадра.
    rainTimer = 0;
    play = false;       // Флаг, разрешающий преобразования отрисовку кадров.

    constructor(videoCanvas, matrixCanvas, video){
        this.videoCanvas = videoCanvas;
        this.matrixCanvas = matrixCanvas;
        this.video = video;
    }

    animate(timeStamp = 0){
        let frameTime = timeStamp - this.prevFrameTime;
        this.prevFrameTime = timeStamp;

        if(this.videoTimer > 1000 / this.videoFPS){
            this.videoCanvas.getFrameData();
            this.matrixCanvas.convertImageDataTo2DMatrix(this.videoCanvas.imageData);
            this.videoTimer = 0;
        }

        if(this.rainTimer + 1 > 1000 / this.rainFPS){
            this.matrixCanvas.renderNewVideoFrame();
            this.rainTimer = 0;
        }

        this.videoTimer += frameTime;
        this.rainTimer += frameTime;

        if(!this.play) return;
        requestAnimationFrame(this.animate.bind(this));
    }

    recordVideo(){
        const stream = this.matrixCanvas.canvas.captureStream(this.rainFPS);
        const originVideoStream = this.video.captureStream();
        stream.addTrack(originVideoStream.getAudioTracks()[0]);
        this.mediaRecorder = new MediaRecorder(stream);
        this.mediaRecChanks = [];
        this.mediaRecorder.addEventListener('dataavailable', (ev) => this.mediaRecChanks.push(ev.data));
    }

    saveVideo(){
        let blob = new Blob(this.mediaRecChanks, {
            type: this.mediaRecChanks[0].type
        });
        let url = URL.createObjectURL(blob);
        let a = document.createElement('a');
        a.href = url;
        a.download = 'video.webm';
        a.click();
    }

    start(){
        this.play = true;
        this.animate();
        this.recordVideo();
        this.mediaRecorder.start();
    }

    stop(){
        this.play = false;
        this.mediaRecorder.stop();
    }
}