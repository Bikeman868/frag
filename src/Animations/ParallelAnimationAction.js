window.frag.ParallelAnimationAction = function (engine, [actions]) {
    const private = {
        actions
    };

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

    public.start = function (animation, gameTick) {
        private.actions.forEach(a => {
            if (a.start) a.start(animation, gameTick);
        });
        return public;
    }

    public.action = function (animation, gameTick) {
        private.actions.forEach(a => {
            if (a.action) a.action(animation, gameTick);
        });
        return public;
    }

    public.stop = function (animation, gameTick) {
        private.actions.forEach(a => {
            if (a.stop) a.stop(animation, gameTick);
        });
    }

    return public;
}
