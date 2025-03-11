document.addEventListener('DOMContentLoaded', () => {
    addListeners();
});

function addListeners() {
    document.getElementById('fadeInPlay').addEventListener('click', function () {
        const el = document.getElementById('fadeInBlock');
        animaster().addFadeIn(5000).play(el);
    });

    document.getElementById('fadeOutPlay').addEventListener('click', function () {
        const el = document.getElementById('fadeOutBlock');
        animaster().addFadeOut(5000).play(el);
    });

    document.getElementById('movePlay').addEventListener('click', function () {
        const el = document.getElementById('moveBlock');
        animaster().addMove(1000, { x: 100, y: 10 }).play(el);
    });

    document.getElementById('scalePlay').addEventListener('click', function () {
        const el = document.getElementById('scaleBlock');
        animaster().addScale(1000, 1.25).play(el);
    });

    document.getElementById('moveAndHidePlay').addEventListener('click', function () {
        const el = document.getElementById('moveAndHideBlock');
        const animation = animaster().addMoveAndHide(1000).play(el);
        document.getElementById('moveAndHideReset').addEventListener('click', function () {
            animation.reset();
        });
    });

    document.getElementById('showAndHidePlay').addEventListener('click', function () {
        const el = document.getElementById('showAndHideBlock');
        animaster().addShowAndHide(1000).play(el);
    });

    document.getElementById('heartBeatingPlay').addEventListener('click', function () {
        const el = document.getElementById('heartBeatingBlock');
        const heartbeatAnimation = animaster().addHeartBeating().play(el);
        document.getElementById('heartBeatingStop').addEventListener('click', function () {
            heartbeatAnimation.stop();
        });
    });

    document.getElementById('rotatePlay').addEventListener('click', function () {
        const el = document.getElementById('rotateBlock');
        animaster().addRotate(1000, 360).play(el);
    });

    const worryAnimationHandler = animaster()
        .addMove(200, { x: 80, y: 0 })
        .addMove(200, { x: 0, y: 0 })
        .addMove(200, { x: 80, y: 0 })
        .addMove(200, { x: 0, y: 0 })
        .buildHandler();

    document.getElementById('worryAnimationBlock')?.addEventListener('click', worryAnimationHandler);
}


function animaster() {
    function fadeIn(el, duration) {
        el.style.transitionDuration = duration + 'ms';
        el.classList.remove('hide');
        el.classList.add('show');
    }

    function fadeOut(el, duration) {
        el.style.transitionDuration = duration + 'ms';
        el.classList.add('hide');
        el.classList.remove('show');
    }

    function move(el, duration, translation) {
        el.style.transitionDuration = duration + 'ms';
        el.style.transform = buildTransform(translation, null);
    }

    function scale(el, duration, ratio) {
        el.style.transitionDuration = duration + 'ms';
        el.style.transform = buildTransform(null, ratio);
    }

    function rotate(el, duration, angle) {
        el.style.transitionDuration = duration + 'ms';
        el.style.transform = `rotate(${angle}deg)`;
    }

    function buildTransform(translation, ratio) {
        const transforms = [];
        if (translation) transforms.push(`translate(${translation.x}px, ${translation.y}px)`);
        if (ratio) transforms.push(`scale(${ratio})`);
        return transforms.join(' ');
    }

    function resetFadeIn(el) {
        el.classList.remove('show');
        el.style.transitionDuration = null;
    }

    function resetFadeOut(el) {
        el.classList.remove('hide');
        el.style.transitionDuration = null;
    }

    function resetMoveAndScale(el) {
        el.style.transitionDuration = '';
        el.style.transform = '';
    }

    let _steps = [];

    return {
        _steps: _steps,

        addMove(duration, translation) {
            return this._addStep("move", duration, translation);
        },

        addFadeIn(duration) {
            return this._addStep("fadeIn", duration);
        },

        addFadeOut(duration) {
            return this._addStep("fadeOut", duration);
        },

        addScale(duration, ratio) {
            return this._addStep("scale", duration, ratio);
        },

        addDelay(duration) {
            return this._addStep("delay", duration);
        },

        addMoveAndHide(duration) {
            return this
                .addMove(duration * 2 / 5, { x: 100, y: 20 })
                .addFadeOut(duration * 3 / 5);
        },

        addShowAndHide(duration) {
            return this
                .addFadeIn(duration / 3)
                .addDelay(duration / 3)
                .addFadeOut(duration / 3);
        },

        addHeartBeating() {
            return this._addStep("heartBeating", 0);
        },

        // Новый метод для анимации поворота
        addRotate(duration, angle) {
            return this._addStep("rotate", duration, angle);
        },

        _addStep(operation, duration, params) {
            const newAnimation = Object.create(this);
            newAnimation._steps = this._steps.concat([{ operation, duration, params }]);
            return newAnimation;
        },

        play(el, cycled = false) {
            const originalState = {
                transform: el.style.transform,
                transitionDuration: el.style.transitionDuration,
                className: el.className
            };

            const timeouts = [];
            const intervalIds = [];
            let totalTime = this._steps.reduce((acc, step) => acc + (step.duration || 0), 0);

            const executeStep = (step) => {
                switch (step.operation) {
                    case "move":
                        move(el, step.duration, step.params);
                        break;
                    case "fadeIn":
                        fadeIn(el, step.duration);
                        break;
                    case "fadeOut":
                        fadeOut(el, step.duration);
                        break;
                    case "scale":
                        scale(el, step.duration, step.params);
                        break;
                    case "delay":
                        break;
                    case "heartBeating":
                        let flag = false;
                        const hbId = setInterval(() => {
                            el.style.transform = flag ? buildTransform(null, 1) : buildTransform(null, 1.4);
                            flag = !flag;
                        }, 500);
                        intervalIds.push(hbId);
                        break;
                    case "rotate":
                        rotate(el, step.duration, step.params);
                        break;
                }
            };

            let accumulatedDelay = 0;
            this._steps.forEach(step => {
                const t = setTimeout(() => executeStep(step), accumulatedDelay);
                timeouts.push(t);
                accumulatedDelay += step.duration || 0;
            });

            if (cycled) {
                const cycleId = setInterval(() => {
                    let delay = 0;
                    this._steps.forEach(step => {
                        setTimeout(() => executeStep(step), delay);
                        delay += step.duration || 0;
                    });
                }, totalTime);
                intervalIds.push(cycleId);
            }

            return {
                stop() {
                    timeouts.forEach(id => clearTimeout(id));
                    intervalIds.forEach(id => clearInterval(id));
                },
                reset() {
                    this.stop();
                    resetFadeIn(el);
                    resetFadeOut(el);
                    resetMoveAndScale(el);
                    el.style.transform = originalState.transform;
                    el.style.transitionDuration = originalState.transitionDuration;
                    el.className = originalState.className;
                }
            };
        },

        buildHandler() {
            const animationInstance = this;
            return function () {
                animationInstance.play(this);
            };
        }
    };
}

