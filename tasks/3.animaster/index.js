addListeners();
let timers = {};

function addListeners() {
    document.getElementById('fadeInPlay')
        .addEventListener('click', function () {
            const block = document.getElementById('fadeInBlock');
            animaster().showAndHide(block, 5000);
        });

    document.getElementById('movePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('moveBlock');
                test.play(block);
        });

    document.getElementById('scalePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('scaleBlock');
            timers['scaleBlock'] = animaster().heartBeating(block, 1000);
        });
    document.getElementById('fadeOutPlay')
        .addEventListener('click', function () {
            const block = document.getElementById('fadeOutBlock');
            test.play(block);
        });
    document.getElementById('stopScalePlay')
        .addEventListener('click', function () {
            timers['scaleBlock'].stop();
        });
    document.getElementById('moveAndHide')
        .addEventListener('click', function () {
            const block = document.getElementById('moveAndHideBlock');
            animaster().moveAndHide(block, 1000, {x: 100, y: 10});
        });
    document.getElementById('resetMoveAndHide')
        .addEventListener('click', function () {
            const block = document.getElementById('moveAndHideBlock');
            resetMoveAndScale(block);
            resetFadeOut(block);
        })
}

const test = animaster()
    .addScale(500, 1.4)
    .addScale(500, 1);

function animaster() {
    return {
        move: move,
        scale: scale,
        fadeIn: fadeIn,
        fadeOut: fadeOut,
        addMove: addMove,
        addScale: addScale,
        addFadeIn: addFadeIn,
        addFadeOut: addFadeOut,
        moveAndHide: moveAndHide,
        showAndHide: showAndHide,
        heartBeating: heartBeating
    };
}

function moveAndHide(element, duration, translation) {
    move(element, duration * 0.4, translation);
    setTimeout(function () {
        fadeOut(element, duration * 0.6);
    }, duration * 0.4);
}

function addMove(duration, translation, result = []){
    let _steps = result || [];
    _steps.push({
        duration: duration,
        action: (element) => move(element, duration, translation)
    });
    return animator(_steps);
}

function addFadeIn(duration, result) {
    let _steps = result || [];
    _steps.push({
        duration: duration,
        action: (element) => fadeIn(element, duration)
    });
    return animator(_steps);
}

function addFadeOut(duration, result) {
    let _steps = result || [];
    _steps.push({
        duration: duration,
        action: (element) => fadeOut(element, duration)
    });
    return animator(_steps);
}

function addScale(duration, ratio, result = []){
    let _steps = result || [];
    _steps.push({
        duration: duration,
        action: (element) => scale(element, duration, ratio)
    });
    return animator(_steps);
}

function animator(steps) {
    return {
        play: function play(element, index) {
            index = index || 0;
            if(steps.length <= index)
                return;
            steps[index].action(element);
            setTimeout(function () {
                play(element, ++index);
            }, steps[index].duration)
        },
        addMove: (dur, tr) => addMove(dur, tr, steps),
        addScale: (dur, rat) => addScale(dur, rat, steps),
        addFadeIn: (dur) => addFadeIn(dur, steps),
        addFadeOut: (dur) => addFadeOut(dur, steps)
    }
}

function showAndHide(element, duration) {
    fadeIn(element, duration * 0.33);
    setTimeout(function () {
        fadeOut(element, duration * 0.33);
    }, duration * 0.66);
}

function heartBeating(element, duration) {
    let currentRun = 0;
    scale(element, duration * 0.5, 1.4);
    let timer = setInterval(function() {
        if (currentRun % 2 === 0)
            scale(element, duration * 0.5, 1);
        else
            scale(element, duration * 0.5, 1.4);
        currentRun++;
    }, duration * 0.5);
    return {
        stop: () => clearInterval(timer)
    };
}

function stopAnimation(blockName) {
    if (timers[blockName]) {
        clearInterval(timers[blockName]);
        timers[blockName] = undefined;
    }
}

/**
 * Блок плавно появляется из прозрачного.
 * @param element — HTMLElement, который надо анимировать
 * @param duration — Продолжительность анимации в миллисекундах
 */
function fadeIn(element, duration) {
    element.style.transitionDuration = `${duration}ms`;
    element.classList.remove('hide');
    element.classList.add('show');
}

function resetFadeIn(element) {
    element.style.transitionDuration = null;
    element.classList.remove('show');
    element.classList.add('hide');
}

function fadeOut(element, duration) {
    element.style.transitionDuration = `${duration}ms`;
    element.classList.remove('show');
    element.classList.add('hide');
}

function resetFadeOut(element) {
    element.style.transitionDuration = null;
    element.classList.remove('hide');
    element.classList.add('show');
}
/**
 * Функция, передвигающая элемент
 * @param element — HTMLElement, который надо анимировать
 * @param duration — Продолжительность анимации в миллисекундах
 * @param translation — объект с полями x и y, обозначающими смещение блока
 */
function move(element, duration, translation) {
    element.style.transitionDuration = `${duration}ms`;
    element.style.transform = getTransform(translation, null);
}

function resetMoveAndScale(element) {
    element.style.transitionDuration = null;
    element.style.transform = null;
}
/**
 * Функция, увеличивающая/уменьшающая элемент
 * @param element — HTMLElement, который надо анимировать
 * @param duration — Продолжительность анимации в миллисекундах
 * @param ratio — во сколько раз увеличить/уменьшить. Чтобы уменьшить, нужно передать значение меньше 1
 */
function scale(element, duration, ratio) {
    element.style.transitionDuration = `${duration}ms`;
    element.style.transform = getTransform(null, ratio);
}

function getTransform(translation, ratio) {
    const result = [];
    if (translation) {
        result.push(`translate(${translation.x}px,${translation.y}px)`);
    }
    if (ratio) {
        result.push(`scale(${ratio})`);
    }
    return result.join(' ');
}
