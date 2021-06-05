// Defines an animation that can be applied to scene objects based on a particular model
window.frag.ModelAnimation = function () {
    const private = {
        loop: false,
        interval: 10,
        frames: 50,
        channelGraphs: [],
        name: "",
    };

    const public = {
        __private: private,
    };

    public.getChannelGraphs = function () {
        return private.channelGraphs;
    }

    public.name = function (value) {
        private.name = value;
        return public;
    }

    public.getName = function () {
        return private.name;
    }

    public.loop = function (value) {
        private.loop = value;
        return public;
    }

    public.getLoop = function () {
        return private.loop;
    }

    public.interval = function (value) {
        private.interval = value;
        return public;
    }

    public.getInterval = function () {
        return private.interval;
    }

    public.frames = function (value) {
        private.frames = value;
        return public;
    }

    public.getFrames = function () {
        return private.frames;
    }

    const expandKeyframes = function (keyframes) {
        const values = [];
        values.length = private.frames;
        let currentValue = undefined;
        let priorKeyframe = 0;
        for (let frame = 0; frame < private.frames; frame++) {
            const keyframe = keyframes[frame];
            if (keyframe !== undefined) {
                currentValue = keyframe.value;
                if (keyframe.transition === "linear") {
                    const startValue = values[priorKeyframe];
                    const steps = frame - priorKeyframe;
                    const range = currentValue - startValue;
                    const slope = range / steps;
                    for (let i = priorKeyframe + 1; i < frame; i++) {
                        values[i] = startValue + (i - priorKeyframe) * slope;
                    }
                }
                priorKeyframe = frame;
            }
            values[frame] = currentValue;
        }
        return values;
    };

    // Build a graph of channel values at each frame based on keyframe changes

    public.addChannel = function (channel) {
        private.channelGraphs.push({
            pattern: channel.pattern,
            channel: channel.channel,
            frameValues: expandKeyframes(channel.keyframes)
        });
    };

    return public;
};
