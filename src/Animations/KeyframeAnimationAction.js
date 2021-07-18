// Provides a mechanism to execute animation actions at specific keyframes
// KeyframeAnimationAction objects can be passed to an Animation object as the action
// to take in one of the steps in an animation sequence
window.frag.KeyframeAnimationAction = function (engine) {
    const private = {
        startTick: undefined,
        currentFrame: undefined,
        keyframes: {}
    };

    const public = {
        __private: private,
        interval: 10,
        frames: 100,
    };

    // This function is used internally
    public.start = function (animation, gameTick) {
        private.startTick = gameTick;
        private.currentFrame = -1;
        return public;
    }

    // This function is used internally
    public.action = function (animation, gameTick) {
        let currentFrame = Math.floor((gameTick - private.startTick) / public.interval);
        while (private.currentFrame < currentFrame) {
            private.currentFrame++;
            const keyframe = private.keyframes[private.currentFrame];
            if (keyframe) {
                for (let i = 0; i < keyframe.length; i++)
                    keyframe[i].action(private.currentFrame, keyframe[i].data, gameTick);
            }
        }
        return public;
    }

    public.setFrames = function(interval, frames){
        public.interval = interval;
        public.frames = frames || public.frames;
        public.duration = public.interval * public.frames;
        return public;
    }

    // Adds an action to perform at a specific keyframe. The data object will
    // be passed to the action function when the keyframe is actioned
    public.add = function(keyframeIndex, action, data){
        let keyframe = private.keyframes[keyframeIndex];
        if (!keyframe) {
            keyframe = [];
            private.keyframes[keyframeIndex] = keyframe;
        }
        keyframe.push({ action, data });
        return public;
    }

    return public;
}
