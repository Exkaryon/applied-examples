
export default {
    screenshot: document.getElementById('screenshot'),
    clearButton: document.getElementById('clearbutton'),
    canvas: document.getElementById('canvas'),


    init(){
        this.clearImage();
        // Обработчик очистки элемента IMG и CANVAS.
        this.clearButton.addEventListener('click', (ev) => {
            ev.preventDefault();
            this.clearImage();
        }, false);
    },


    clearImage(bg = "#454545"){
        const width = this.canvas.parentElement.clientWidth;
        this.canvas.setAttribute('width', width);
        this.canvas.setAttribute('height', Math.floor(width * 9 / 16));

        const ctx = canvas.getContext('2d');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        const data = this.canvas.toDataURL('image/png');     // Преобразование бинарного кода картинки в base64 код для SRC.
        this.screenshot.setAttribute('src', data);
    }


}
