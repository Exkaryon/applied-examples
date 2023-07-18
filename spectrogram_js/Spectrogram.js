export default class Spectrogram {
    audioCtx = new (window.AudioContext || window.webkitAudioContext);
    audioBuffer = null;
    fftSize = 256;
    smooth = 0.1;
    frequencyData = [];

    async printFrom(soundFile){
        await this.#loadSoundFile(soundFile);
        await this.#offlinePlay();
        return this.#print();
    }


    async #loadSoundFile(soundFile){
        try{
            let response = await fetch(soundFile);
            if(!response.ok) throw new Error(); 
            let responseBuffer = await response.arrayBuffer();
            this.audioBuffer = await this.audioCtx.decodeAudioData(responseBuffer);     // Длина буфера (length) в байтах.
        }catch{
            console.warn('Ошибка загрузки файла звука!' + soundFile);
        }
        
    }


    async #offlinePlay(){
        const offlineCtx = new OfflineAudioContext(
            this.audioBuffer.numberOfChannels,
            this.audioBuffer.length,
            this.audioBuffer.sampleRate
        );

        const source = offlineCtx.createBufferSource();
        source.buffer = this.audioBuffer;
        source.channelCount = this.audioBuffer.numberOfChannels;

        const analyserNode = offlineCtx.createAnalyser();
        analyserNode.fftSize = this.fftSize;
        analyserNode.smoothingTimeConstant = this.smooth;
        const bufferLength = analyserNode.frequencyBinCount;

        const processor = offlineCtx.createScriptProcessor(256, 1, 1);           //    18808 / 256 = 73.46    256 - Размер буфера в единицах выборочных кадров. 256, 512, 1024, 2048, 4096, 8192, 16384. Если он не передан или если значение равно 0, тогда реализация выберет наилучший размер буфера для данной среде, которая будет постоянной степенью 2 на протяжении всего времени существования узла.
        let byteOffset = 0;
        processor.onaudioprocess = (ev) => {
            const freqData = new Uint8Array(bufferLength, byteOffset, analyserNode.frequencyBinCount);
            analyserNode.getByteFrequencyData(freqData);
            byteOffset += analyserNode.frequencyBinCount;
            this.frequencyData.push(freqData);
        }
        source.connect(processor);
        processor.connect(offlineCtx.destination);
        source.connect(analyserNode);
        // Start the source, other wise start rendering would not process the source
        source.start(0);
        await offlineCtx.startRendering();
    }


    #print(){
        const canvas = document.createElement('canvas');
        const canvasCtx = canvas.getContext("2d");
        canvas.width = this.frequencyData.length;
        canvas.height = this.frequencyData[0].length;
        canvasCtx.fillStyle = `rgb(255, 255, 255)`;
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
        this.frequencyData.forEach((colData, colIndex) => {
            colData.reverse();
            colData.forEach((val, indx) => {
                const v = 255 - val;
                canvasCtx.fillStyle = `rgb(${v}, ${v}, ${v})`;
                canvasCtx.fillRect(colIndex,indx, 1, 1);
            });
        });
        return canvas;
    }

}





