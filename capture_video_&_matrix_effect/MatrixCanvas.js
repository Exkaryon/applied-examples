export default class MatrixCanvas {

    fontSize = 5;
    characters = `アァカ サタナ ハマヤ ャラワ ガザダ バパイ ィキシ チニヒ ミリヰ ギジヂ ビピウ ゥクス ツヌフ ムユュ ルグズ ブヅプ エェケ セテネ ヘメレ ヱゲゼ デベペ オォコ ソトノ ホモヨ ョロヲ ゴゾド ボポヴ ッン`;
    scale = 1;
    rainMatrix = [];
    videoMatrix = [];
    symbolFading = 45;
    get symbolFadingStep(){return Math.floor(255 / this.symbolFading)};

    constructor(videoWidth, videoHeight, canvas){
        this.videoWidth = videoWidth;
        this.videoHeight = videoHeight;
        this.canvas = canvas;
        this.#init();
    }

    #init(){
        this.ctx = this.canvas.getContext('2d');
        this.videoCanvasWidth = Math.round(this.videoWidth / this.fontSize);
        this.videoCanvasHeight = Math.round(this.videoHeight * this.videoCanvasWidth / this.videoWidth);
        this.cols = this.videoCanvasWidth;
        this.rows = this.videoCanvasHeight;
        this.canvas.width = this.cols * this.fontSize * this.scale;
        this.canvas.height = this.rows * this.fontSize * this.scale;
        this.ctx.font = 'bold '+this.fontSize * this.scale+'px monospace';
        this.#rainMatrixStartState();
    }

    #randomizer(min, max){
        return Math.floor((min + Math.random() * (max + 1 - min)));
    }

    #getSymbol(){
        return this.characters.charAt(Math.floor(Math.random() * this.characters.length));
    }

    convertImageDataTo2DMatrix(imageData){
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

    #rainMatrixStartState(){
        for(let i = 0; i < this.cols; i++){
            let yPos = Math.floor(Math.random() * this.rows);
            let units = [];
            let val = 0;
            for(let j = this.rows - 1; j >= 0; j--){
                val = j == yPos
                    ? 255
                    : j < yPos
                        ? (val - this.symbolFadingStep) > 0 ? val - this.symbolFadingStep : 0
                        : 0;
                units[j] = {addr:[i, j], symbol: this.#getSymbol(), value: val};
            }
            this.rainMatrix.push({colUnits: units, dropletTimeout: this.#randomizer(1, this.cols)});
        }
    }

    renderNewVideoFrame(){
        this.ctx.fillStyle = 'rgba(0,0,0,1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.rainMatrix.forEach((colData, colNum) => {
            for(let rowNum = this.rows - 1; rowNum >= 0; rowNum--){

                if(colData.colUnits[rowNum].value == 0 && rowNum !== 0){
                    colData.colUnits[rowNum].value = colData.colUnits[rowNum - 1].value;
                    if(colData.colUnits[rowNum].value == 255){
                        colData.colUnits[rowNum].symbol = this.#getSymbol();
                    }
                }else{
                    colData.colUnits[rowNum].value = colData.colUnits[rowNum].value > this.symbolFadingStep
                                                        ? colData.colUnits[rowNum].value - this.symbolFadingStep
                                                        : 0;
                }

                // Variant 1
                let rainValue = Math.floor(colData.colUnits[rowNum].value / 1.8);
                let channels = [];
                let  symbol = '';
                if(this.videoMatrix[rowNum][colNum] > rainValue){
                    channels = [
                        this.videoMatrix[rowNum][colNum],
                        this.videoMatrix[rowNum][colNum],
                        this.videoMatrix[rowNum][colNum] / 3
                    ];
                    symbol = colData.colUnits[rowNum].symbol == ' ' ? 'ポ' : colData.colUnits[rowNum].symbol;
                }else{
                    channels = [
                        colData.colUnits[rowNum].value == 255 ? 50 : 0,
                        colData.colUnits[rowNum].value == 255 ? 180 : rainValue,
                        colData.colUnits[rowNum].value == 255 ? 50 : 0
                    ];
                    symbol = colData.colUnits[rowNum].symbol;
                }
                this.ctx.fillStyle = `rgb(${channels})`;
                this.ctx.fillText(symbol, colNum * this.fontSize * this.scale, (rowNum + 1) * this.fontSize * this.scale);

                // Variant 2
                /* this.ctx.fillStyle = `rgba(0, ${this.videoMatrix[rowNum][colNum]}, 0, 1)`;
                this.ctx.fillText(
                        colData.colUnits[rowNum].symbol == ' ' ? 'ポ' : colData.colUnits[rowNum].symbol,
                        colNum * this.fontSize * this.scale,
                        (rowNum + 1) * this.fontSize * this.scale
                    );
                this.ctx.fillStyle = `rgba(0, ${colData.colUnits[rowNum].value}, 0, 0.5)`;
                this.ctx.fillText(
                        colData.colUnits[rowNum].symbol,
                        colNum * this.fontSize * this.scale,
                        (rowNum + 1) * this.fontSize * this.scale
                    ); */
            }

            colData.dropletTimeout--;
            if(colData.dropletTimeout <= 0){
                colData.dropletTimeout = this.#randomizer(this.symbolFading, Math.floor(this.cols * 1.5));
                colData.colUnits[0].value = 255;
                colData.colUnits[0].symbol = this.#getSymbol();
            }
        });
    }
}