﻿// The framework maintains a list of these animations and runs the animations
// efficiently within the rendering cycle. All animation mechanisms use this
// implementation as a base. Note that an object can be passed into the constructor
// and it will be embelished with proprties and methods to make it into an animation.
// This allows you to store custom fields relating to your animation and access them
// within the animation steps.
window.frag.Animation = function (obj) {
    const private = {
        stopAfter: 0
    }

    const public = obj || {};
    public.__private = private;

    const DEFAULT_STEP_DURATION = 100;
    const DEFAULT_STEP_INTERVAL = 5;
    const DEFAULT_REPEAT_TICKS = 20;
    const DEFAULT_REPEAT_FRAMES = 1;

    // This is called internally by the framework. You should not call this
    // from your application code.
    public.execute = function (gameTick, frameTick) {
        if (private.stopAfter !== undefined) {
            private.stopAt = gameTick + private.stopAfter;
            delete private.stopAfter;
        }

        if (private.stopAt !== undefined && gameTick >= private.stopAt) {
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
                        private.nextStepTick = gameTick + (step.duration || DEFAULT_STEP_DURATION);
                    }
                }
            } else {
                private.nextStepTick = gameTick + (step.duration || DEFAULT_STEP_DURATION);
                if (step.start) step.start(public, gameTick);
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
        private.sequence = actions;
        private.sequenceIndex = 0;
        private.autoRestart = loop;
        return public;
    }

    // Starts the animation running
    public.start = function () {
        delete private.nextStepTick;
        delete private.stopAfter;
        delete private.stopAt;
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

    window.frag.addAnimation(public);

    public.dispose = function () {
        window.frag.removeAnimation(public);
    }

    return public;
}

