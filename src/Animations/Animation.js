// The framework maintains a list of these animations and runs the animations
// efficiently within the rendering cycle. All animation mechanisms use this
// implementation as a base. Note that an object can be passed into the constructor
// and it will be embelished with proprties and methods to make it into an animation.
// This allows you to store custom fields relating to your animation and access them
// within the animation steps.
window.frag.Animation = function (engine, obj, isChild) {
    const private = {
        stopAfter: 0,
        isRunning: false
    }

    const public = obj || {};
    public.__private = private;

    const DEFAULT_STEP_DURATION = 100;
    const DEFAULT_STEP_INTERVAL = 5;
    const DEFAULT_REPEAT_TICKS = 20;
    const DEFAULT_REPEAT_FRAMES = 1;

    public.dispose = function () {
        engine.removeAnimation(public);
    }

    public.getIsRunning = function() {
        return private.isRunning;
    }

    // If you set the duration it should be done before passing this
    // animation to the sequence() method of another animation
    public.setDuration = function (gameTicks) {
        public.duration = gameTicks;
        return public;
    }

    // If you set the interval it should be done before passing this
    // animation to the sequence() method of another animation
    public.setInterval = function (gameTicks) {
        public.interval = gameTicks;
        return public;
    }

    // This is called internally by the framework. You should not call this
    // from your application code.
    public.action = function (parent, gameTick, frameTick) {
        if (private.stopAfter !== undefined) {
            private.stopAt = gameTick + private.stopAfter;
            delete private.stopAfter;
        }

        if (private.stopAt !== undefined && gameTick >= private.stopAt) {
            if (private.sequence) {
                let step = private.sequence[private.sequenceIndex];
                if (step && step.stop) step.stop(public, gameTick);
            }
            engine.deactivateAnimation(public);
            if (private.disposeOnStop) public.dispose();
            private.isRunning = false;
            return;
        }

        if (private.sequence) {
            let step = private.sequence[private.sequenceIndex];
            if (private.nextStepTick) {
                if (gameTick >= private.nextStepTick) {
                    if (step.stop) step.stop(public, gameTick);
                    private.sequenceIndex++;
                    if (private.sequenceIndex === private.sequence.length) {
                        if (private.autoRestart) {
                            private.sequenceIndex = 0;
                            step = private.sequence[private.sequenceIndex];
                            if (step.start) step.start(public, gameTick);
                            private.nextStepTick = gameTick + (step.duration || DEFAULT_STEP_DURATION);
                        } else {
                            private.stopAt = gameTick;
                        }
                    } else {
                        step = private.sequence[private.sequenceIndex];
                        if (step.start) step.start(public, gameTick);
                        public.interval = step.interval;
                        private.nextStepTick = gameTick + (step.duration || DEFAULT_STEP_DURATION);
                    }
                }
            } else {
                if (step.start) step.start(public, gameTick);
                private.nextStepTick = gameTick + (step.duration || DEFAULT_STEP_DURATION);
            }
            private.action = step.action;
            public.nextGameTick = gameTick + (step.interval || DEFAULT_STEP_INTERVAL);
        } else if (private.frameRepeat !== undefined) {
            public.nextFrameTick = frameTick + private.frameRepeat;
        } else if (private.tickRepeat !== undefined) {
            public.nextGameTick = gameTick + private.tickRepeat;
        }

        if (private.action) private.action(public, gameTick, frameTick);
    }

    // Defines a sequence of timed actions to perform when the animation runs
    // Each action can :
    // - optionally implement start() and stop() functions that are passed the animation object and the current game tick
    // - optionally have a duration field that defines the number of game ticks that this action should run for
    // - optionally have an interval field that defines the number of game ticks between executions of this action
    // - optionally have an action() function that will be called to perform tge animation function
    public.sequence = function (actions, loop) {
        if (Array.isArray(actions)) 
            private.sequence = actions;
        else
            private.sequence = [actions];
        private.sequenceIndex = 0;
        private.autoRestart = loop;

        let duration = 0;
        for (let i = 0; i < private.sequence.length; i++) {
            const action = private.sequence[i];
            if (action.duration !== undefined)
                duration = duration + action.duration;
            else
                duration = duration + DEFAULT_STEP_DURATION;
        }
        public.duration = duration;
        return public;
    }

    // Syntactic sugar for a sequence of one action
    public.perform = function(action, loop) {
        return public.sequence(action, loop);
    }

    // Starts the animation running
    public.start = function () {
        delete private.nextStepTick;
        delete private.stopAfter;
        delete private.stopAt;
        engine.activateAnimation(public);
        private.isRunning = true;
        return public;
    }

    // Stops the animation
    public.stop = function () {
        private.stopAfter = 0;
        return public;
    }

    // Executes an action function at a regular interval in game ticks
    public.repeatTicks = function (actionToRepeat, gameTicks) {
        delete private.autoRestart;
        delete private.frameRepeat;
        delete private.sequence;

        private.tickRepeat = gameTicks || actionToRepeat.interval || DEFAULT_REPEAT_TICKS;
        private.action = actionToRepeat;

        return public;
    }

    // Executes an action function at a regular number of frame refreshes
    public.repeatFrames = function (actionToRepeat, frameCount) {
        delete private.autoRestart;
        delete private.tickRepeat;
        delete private.sequence;

        private.frameRepeat = frameCount || DEFAULT_REPEAT_FRAMES;
        private.action = actionToRepeat;

        return public;
    }

    // Automatically stops the animation after the specified number of game ticks
    public.stopAfter = function (gameTicks) {
        private.stopAfter = gameTicks;
        delete private.stopAt;
        return public;
    }

    public.disposeOnStop = function(dispose){
        private.disposeOnStop = dispose === undefined ? true : dispose;
        return public;
    }

    if (!isChild) engine.addAnimation(public);

    return public;
}

