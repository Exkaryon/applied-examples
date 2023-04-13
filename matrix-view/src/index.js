import './style.scss';
const videoElement = document.querySelector('video');
const playButton = document.querySelector('button');
let videoCanvas, matrixCanvas;



// Холст, который отрисовывает оригинальное видео.
class VideoCanvas {

    constructor(video, width, height){
        this.video = video;
        this.width = width;
        this.height = height;
        this._init();
    }

    _init(){
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d', {willReadFrequently: true});
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    drawOriginVideo(width, height){
        this.ctx.drawImage(this.video, 0, 0, this.width, this.height);
        this.imageData = this.ctx.getImageData(0, 0, this.width, this.height);
    }
} 



// Класс холста, отрисовывающего эффект матрицы.
class MatrixCanvas {
    fontSize = 10;          // Размер шрифта для матричного дождя.
    scale = 1;              // Масштаб холста с матрицей. Fullscreen = Math.floor(document.body.offsetWidth / this.videoWidth)
    characters = (`アァカ サタナ ハマヤ ャラワ ガザダ バパイ ィキシ チニヒ ミリヰ ギジヂ ビピウ ゥクス ツヌフ ムユュ ルグズ ブヅプ エェケ セテネ ヘメレ ヱゲゼ デベペ オォコ ソトノ ホモヨ ョロヲ ゴゾド ボポヴ ッン`);
    videoMatrix = [];       // Представление видео в виде матрицы
    rainMatrix = [];        // Матрица дождя
    symbolFading = 26;      // Скорость угасания символов в кадрах
    get symbolFadingStep (){ return Math.floor(255 / this.symbolFading)};       // Величина угасания значения каждого предыдущего символа в дожде.

    constructor(videoWidth, videoHeight){
        this.videoWidth = videoWidth;
        this.videoHeight = videoHeight;
        //this.scale = document.body.offsetWidth / this.videoWidth - .05;
        this._init();
    }

    _init(){
        this.canvas = document.querySelector('canvas');
        this.ctx  = this.canvas.getContext('2d');
        // Расчет требуемого размера видео холста в пикселях для проекции оригинального видео.
        this.videoCanvasWidth = Math.round(this.videoWidth / this.fontSize);
        this.videoCanvasHeight = Math.round(this.videoHeight * this.videoCanvasWidth / this.videoWidth);
        // Расчет размера матричного холста в символах
        this.cols = this.videoCanvasWidth// * this.scale;
        this.rows = this.videoCanvasHeight// * this.scale;
        // Расчет и установка настоящих размеров
        this.canvas.width = this.cols * this.fontSize * this.scale;
        this.canvas.height = this.rows * this.fontSize * this.scale;
        this.rainMatrixStartState();
        this.ctx.font = 'bold '+this.fontSize * this.scale + 'px monospace';
    }

    _randomizer(min, max) {
        return Math.floor( (min + Math.random() * (max + 1 - min)));
    }


    _getSymbol(){
        return this.characters.charAt(Math.floor(Math.random() * this.characters.length));
    }


    // Получение массива значений пикселей видео снятого с кадра 
    getVideoFrameMatrix(imageData){
        this.videoMatrix = [];
        let row = [];
        for(let i = 0; i < imageData.data.length; i = i + 4){
            row.push(255 - Math.round((imageData.data[i] + imageData.data[i+1] + imageData.data[i+2]) / 3));
            if(!((i + 4) % (this.cols * 4))){
                this.videoMatrix.push(row);
                row = [];
            }
        }
    }


    // Получение массива значений начального состояния матричного дождя.
    rainMatrixStartState(){
        for(let i = 0; i < this.cols; i++){
            let yPos = Math.floor(Math.random() * this.rows);
            let units = [];
            let val = 0;
            for(let j = this.rows-1; j >= 0; j--){
                val = j == yPos
                ? 255
                : j < yPos
                    ? (val - this.symbolFadingStep) > 0 ? val - this.symbolFadingStep : 0
                    : 0;
                    units[j] = {addr:[i ,j], symbol: this._getSymbol(), value: val};
            }
            this.rainMatrix.push({colUnits: units, dropletTimeout: this._randomizer(1, this.cols)});
        }
    }

    // Визуализация кадра матрицы дождя с наложением видеоматрицы.
    getRainFrameMatrix(){
        //this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = 'rgba(0,0,0,1)';
        this.ctx.fillRect(0,0, this.canvas.width, this.canvas.height)

        // Проход по колонкам
        this.rainMatrix.forEach((colData, colNum) => {
            // Перебор элементов (строк) в колонке.
            for(let rowNum = this.rows-1; rowNum >= 0; rowNum--){

                // Когда значение текущей "ячейки/символа" = 0 и она не является первой, она получет значение предыдущей ячейки в колонке. Во всех остальных случаях, значение уменьшается на symbolFadingStep. 
                if(colData.colUnits[rowNum].value == 0 && rowNum !== 0){
                    colData.colUnits[rowNum].value = colData.colUnits[rowNum-1].value;
                    if(colData.colUnits[rowNum].value == 255){   // Кроме  i == 0 (первых символов в колонках)
                        colData.colUnits[rowNum].symbol = this._getSymbol();
                    }
                }else{
                    colData.colUnits[rowNum].value = colData.colUnits[rowNum].value > this.symbolFadingStep ? colData.colUnits[rowNum].value - this.symbolFadingStep : 0;
                }

                // Поканальная визуализация с перекрытием значений из видео на матричный дождь.
                let rainValue = Math.floor(colData.colUnits[rowNum].value / 1.3);
                let symbol = ' ';
                let channels = [];
                if(this.videoMatrix[rowNum][colNum] > rainValue){
                    channels = [
                        0,//Math.floor(this.videoMatrix[rowNum][colNum] / 1),
                        this.videoMatrix[rowNum][colNum],// + rainValue > 255 ? 255 : this.videoMatrix[rowNum][colNum] + rainValue,
                        0,//Math.floor(this.videoMatrix[rowNum][colNum] / 3)
                    ];
                    symbol = colData.colUnits[rowNum].symbol == ' ' ? 'ポ' : colData.colUnits[rowNum].symbol;
                }else{
                    channels = [0, rainValue, 0];
                    symbol = colData.colUnits[rowNum].symbol;
                }
                this.ctx.fillStyle = `rgba(${channels[0]}, ${channels[1]}, ${channels[2]}, 1)`;
                this.ctx.fillText(symbol, colNum * this.fontSize * this.scale, (rowNum + 1) * this.fontSize * this.scale);

                //this.ctx.fillRect(colNum * this.fontSize, rowNum * this.fontSize, this.fontSize, this.fontSize)

                // Слитная визуализация с прорисовкой видео матрицы и матрицы дождя.
                //this.ctx.fillStyle = `rgba(0, ${this.videoMatrix[rowNum][colNum]}, 0, 1)`;
                //this.ctx.fillText(colData.colUnits[rowNum].symbol == ' ' ? 'ポ' : colData.colUnits[rowNum].symbol, colNum * this.fontSize * this.scale, (rowNum + 1) * this.fontSize * this.scale);
                //this.ctx.fillStyle = `rgba(0, ${colData.colUnits[rowNum].value}, 0, 0.5)`;
                //this.ctx.fillText(colData.colUnits[rowNum].symbol, colNum * this.fontSize * this.scale, (rowNum + 1) * this.fontSize * this.scale);
            }

            colData.dropletTimeout--;
            // Если таймаут появления новой "капли" в колонке исчерпан, запускается новая.
            if(colData.dropletTimeout <= 0){
                colData.dropletTimeout = this._randomizer(this.symbolFading, Math.floor(this.cols * 1.5));
                colData.colUnits[0].value = 255;
                colData.colUnits[0].symbol = this._getSymbol();
            }
        });
    }
}



class Player {
    videoFPS = 5;           // Кадров в секунду для видео матрицы (он не может превысить скорость rainFPS)
    rainFPS = 25;           // Кадров в секунду для матрицы дождя
    play = true             // Флаг для проигрывания холста
    prevFrameTime = 0;      // timeStamp предыдущего кадра. 
    videoTimer = 0;         // счетчик для отрисовки видеоматрицы
    rainTimer = 0;          // счетчик для отрисовки матричного дождя

    constructor(){}

    animate(timeStamp = 0){
        let frameTime = timeStamp - this.prevFrameTime;
        this.prevFrameTime = timeStamp;

        if(this.videoTimer > 1000 / this.videoFPS){
            videoCanvas.drawOriginVideo();
            matrixCanvas.getVideoFrameMatrix(videoCanvas.imageData);
            this.videoTimer = 0;
        }

        if(this.rainTimer + 1 > 1000 / this.rainFPS){
            matrixCanvas.getRainFrameMatrix();
            this.rainTimer = 0;
        }

        this.rainTimer += frameTime;
        this.videoTimer += frameTime;

        if(!this.play) return;
        requestAnimationFrame(this.animate.bind(this));
    }

    recordVideo(){
        const stream = matrixCanvas.canvas.captureStream(this.rainFPS);
        const originVideoStream = videoElement.captureStream();
        stream.addTrack(originVideoStream.getAudioTracks()[0]);
        this.mediaRecorder = new MediaRecorder(stream);
        this.mediaRecChanks = [];
        this.mediaRecorder.addEventListener('dataavailable', (ev) => this.mediaRecChanks.push(ev.data));
        this.mediaRecorder.addEventListener("stop", () => this.saveVideo(), {once: true});
    }

    saveVideo(){
        let blob = new Blob(this.mediaRecChanks, {
            type: this.mediaRecChanks[0].type
        })
    
        let url = URL.createObjectURL(blob);
        let a = document.createElement('a');
        a.href = url;
        a.download = 'video.webm';
        a.click();
    }

    start(){
        this.play = true;
        this.animate();
        this.recordVideo(this.rainFPS);
        this.mediaRecorder.start();
    }

    stop(){
        this.play = false;
        this.mediaRecorder.stop();
    }
};


const player = new Player();


// Когда видео готово проигрываться.
videoElement.addEventListener('canplaythrough', (e) => {
    matrixCanvas = new MatrixCanvas(videoElement.clientWidth, videoElement.clientHeight);
    videoCanvas = new VideoCanvas(videoElement, matrixCanvas.videoCanvasWidth, matrixCanvas.videoCanvasHeight);
}, {once: true});


// Кнопка старта (Play).
playButton.addEventListener('click', () => {
    playButton.setAttribute('disabled', 'disabled');
    videoElement.play();
    player.start();
});


// Когда проигрывание достигло конца видео.
videoElement.addEventListener('ended', (e) => {
    playButton.removeAttribute('disabled');
    player.stop();
});
