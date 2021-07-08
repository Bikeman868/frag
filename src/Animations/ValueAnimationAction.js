// Provides a mechanism to change a value over time. For example smoothly change
// one color into another or smoothly move an object within the scene.
// ValueAnimationAction objects can be passed to an Animation object as the action
// to take in one of the steps in an animation sequence
window.frag.ValueAnimationAction = function () {
    const private = {};

    const public = {
        __private: private,
        duration: 30,
        interval: 5,
    };

    public.setDuration = function (gameTicks) {
        public.duration = gameTicks;
        return public;
    }

    public.setInterval = function (gameTicks) {
        public.interval = gameTicks;
        return public;
    }

    public.onStart = function (onStart) {
        private.onStart = onStart;
        return public;
    }

    public.onStop = function (onStop) {
        private.onStop = onStop;
        return public;
    }

    public.onStep = function (onStep) {
        private.onStep = onStep;
        return public;
    }

    public.start = function (animation, gameTick) {
        private.startTick = gameTick;
        private.endTick = gameTick + public.duration;
        if (private.onStart) private.onStart(animation, public, gameTick);
        return public;
    }

    public.action = function (animation, gameTick) {
        if (private.onStep) {
            const r = (gameTick - private.startTick) / public.duration;
            private.onStep(animation, r, public, gameTick);
        }
        return public;
    }

    public.stop = function (animation, gameTick) {
        if (private.onStop) private.onStop(animation, public, gameTick);
        return public;
    }

    return public;
}
