import Spectrogram from "./Spectrogram.js";
const spectrogram = new Spectrogram;
const soundFile = './assets/yes.wav';
const printButton = document.querySelector('button');

printButton.addEventListener('click', async (ev) => {
    ev.target.remove();
    document.querySelector('.loading').classList.add('show');
    const picture = await spectrogram.printFrom(soundFile);
    if(picture == 'error'){
        document.querySelector('.loading').classList.add('error');
    }else{
        document.querySelector('.loading').remove();
        document.body.append(picture);
    }
});