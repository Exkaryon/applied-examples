import screenshotBox from './screenshot-box';

export default {
    videoElement: document.getElementById('video'),
    captureButton: document.getElementById('capturebutton'),
    stream: false,


    init(){
        // Обработчик захвата изображения.
        this.captureButton.addEventListener('click', (ev) => {
            ev.preventDefault();
            this.takePicture();
        }, false);

        // Как только видопоток готов к тому чтобы воспроизвестись, устанавливаются размеры видеоэлемента и canvas, на основе исходной картинки с камеры или видео.
        this.videoElement.addEventListener('canplay', (e) => {
            this.stream = true;
        });

        this.videoElement.addEventListener('emptied', (e) => {
            this.stream = false;
        });
    },


    // Захват изображения с видео.
    takePicture() {
        const ctx = screenshotBox.canvas.getContext('2d');
        if (this.stream) {
            this.videoElement.style.width = 'auto';
            screenshotBox.canvas.width = this.videoElement.offsetWidth;
            screenshotBox.canvas.height = this.videoElement.offsetHeight;
            ctx.drawImage(this.videoElement, 0, 0, screenshotBox.canvas.width, screenshotBox.canvas.height);    // В момент нажатия кнопки захвата, кадр видео помещается в Canvas (вот так просто вставить элемент video в drawImage).
            const data = screenshotBox.canvas.toDataURL('image/png');                                           // Затем картинка из Canvas перегоняется в base64 код для SRC элемента IMG.
            screenshotBox.screenshot.setAttribute('src', data);
            this.videoElement.style.width = '';
        } else {
            screenshotBox.clearImage('#012');
        }
    }
}

