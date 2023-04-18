(function (){
    const progressElements = document.querySelectorAll('.progressbar');
    progressElements.forEach(elem => {
        const value = +elem.querySelector('.percent').innerText;
        if(value >= 50){
            elem.classList.add('over_50');
        }else{
            elem.classList.remove('over_50');
        }
        const deg = (360 * value / 100) + 180;
        elem.querySelector('.piece.right').style.transform = `rotate(${deg}deg)`;
    });
})();