export default class VideoCanvas {

    constructor(video, width, height){
        this.video = video;
        this.width = width;
        this.height = height;
        this.#init();
    }

    #init(){
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d', {willReadFrequently: true});
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    getFrameData(){
        this.ctx.drawImage(this.video, 0, 0, this.width, this.height);
        this.imageData = this.ctx.getImageData(0, 0, this.width, this.height);
    }
}