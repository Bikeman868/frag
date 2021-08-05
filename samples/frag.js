/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/Animations/Animation.js":
/*!*************************************!*\
  !*** ./src/Animations/Animation.js ***!
  \*************************************/
/***/ (() => {

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



/***/ }),

/***/ "./src/Animations/KeyframeAnimationAction.js":
/*!***************************************************!*\
  !*** ./src/Animations/KeyframeAnimationAction.js ***!
  \***************************************************/
/***/ (() => {

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

    public.dispose = function () {
    }

    return public;
}


/***/ }),

/***/ "./src/Animations/ModelAnimation.js":
/*!******************************************!*\
  !*** ./src/Animations/ModelAnimation.js ***!
  \******************************************/
/***/ (() => {

// Defines an animation that can be applied to scene objects based on a particular model
window.frag.ModelAnimation = function (engine) {
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

    public.dispose = function () {
    }

    return public;
};


/***/ }),

/***/ "./src/Animations/ObjectAnimationState.js":
/*!************************************************!*\
  !*** ./src/Animations/ObjectAnimationState.js ***!
  \************************************************/
/***/ (() => {

// Represents the current state of an object being animated
window.frag.ObjectAnimationState = function (engine) {
    const private = {
    };

    const public = {
        __private: private,
        location: window.frag.Location(),
    };

    public.getMatrix = function () {
        return public.location.getMatrix();
    }

    public.getUpdateFunction = function(channelName) {
        switch (channelName) {
            case "translate-x":
                return function (value) {
                    public.location.translateX = value;
                    public.location.isModified = true;
                };
            case "translate-y":
                return function (value) {
                    public.location.translateY = value;
                    public.location.isModified = true;
                };
            case "translate-z":
                return function (value) {
                    public.location.translateZ = value;
                    public.location.isModified = true;
                }

            case "scale-x":
                return function (value) {
                    public.location.scaleX = value;
                    public.location.isModified = true;
                };
            case "scale-y":
                return function (value) {
                    public.location.scaleY = value;
                    public.location.isModified = true;
                };
            case "scale-z":
                return function (value) {
                    public.location.scaleZ = value;
                    public.location.isModified = true;
                }

            case "rotate-x":
                return function (value) {
                    public.location.rotateX = value;
                    public.location.isModified = true;
                }
            case "rotate-y":
                return function (value) {
                    public.location.rotateY = value;
                    public.location.isModified = true;
                }
            case "rotate-z":
                return function (value) {
                    public.location.rotateZ = value;
                    public.location.isModified = true;
                };
        }
        console.warn("Unsupported animation channel " + channelName);
        return function () { };
    };

    public.dispose = function () {
    }

    return public;
}


/***/ }),

/***/ "./src/Animations/ParallelAnimationAction.js":
/*!***************************************************!*\
  !*** ./src/Animations/ParallelAnimationAction.js ***!
  \***************************************************/
/***/ (() => {

window.frag.ParallelAnimationAction = function (engine, actions) {
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

    public.dispose = function () {
    }

    return public;
}


/***/ }),

/***/ "./src/Animations/PositionAnimationAction.js":
/*!***************************************************!*\
  !*** ./src/Animations/PositionAnimationAction.js ***!
  \***************************************************/
/***/ (() => {

// Provides a mechanism to move an object in the scene at a specific speed
window.frag.PositionAnimationAction = function (engine, scenePosition, invLinearVelocity, invAngularVelocity) {
    const frag = window.frag;
    const Vector = frag.Vector;

    const private = {
        scenePosition,
        invLinearVelocity,
        invAngularVelocity,
        startLocation: undefined,
        startRotate: undefined,
        moveBy: undefined,
        rotateBy: undefined,
        moveTo: undefined,
        rotateTo: undefined,
    };

    const public = {
        __private: private,
    };

    public.setInterval = function (gameTicks) {
        public.interval = gameTicks;
        return public;
    }

    public.moveBy = function (vector, invLinearVelocity) {
        invLinearVelocity = invLinearVelocity || private.invLinearVelocity || 1;
        let distance = Vector.length(vector);
        public.duration = Math.floor(invLinearVelocity * distance + 1);
        private.moveBy = vector;
        return public;
    }

    public.moveTo = function (location, invLinearVelocity) {
        if (invLinearVelocity) private.invAngularVelocity = undefined;
        private.invLinearVelocity = invLinearVelocity || private.invLinearVelocity || 1;
        private.moveTo = location;
        return public;
    }

    public.rotateBy = function (vector, invAngularVelocity) {
        invAngularVelocity = invAngularVelocity || private.invAngularVelocity || 10;
        let distance = Vector.length(vector);
        public.duration = Math.floor(invAngularVelocity * distance + 1);
        private.rotateBy = vector;
        return public;
    }

    public.rotateTo = function (heading, invAngularVelocity) {
        if (invAngularVelocity) private.invLinearVelocity = undefined;
        private.invAngularVelocity = invAngularVelocity || private.invAngularVelocity || 10;
        private.rotateTo = heading;
        return public;
    }


    public.moveByXYZ = function (x, y, z, invLinearVelocity) {
        return public.moveBy([x, y, z], invLinearVelocity);
    }

    public.moveByXY = function (x, y, invLinearVelocity) {
        return public.moveBy([x, y, 0], invLinearVelocity);
    }

    public.moveToXYZ = function (x, y, z, invLinearVelocity) {
        return public.moveTo([x, y, z], invLinearVelocity);
    }

    public.moveToXY = function (x, y, invLinearVelocity) {
        return public.moveTo([x, y, 0], invLinearVelocity);
    }


    public.rotateByXYZ = function (x, y, z, invAngularVelocity) {
        return public.rotateBy([x, y, z], invAngularVelocity);
    }

    public.rotateByXY = function (x, y, invAngularVelocity) {
        return public.rotateBy([x, y, 0], invAngularVelocity);
    }

    public.rotateToXYZ = function (x, y, z, invAngularVelocity) {
        return public.rotateTo([x, y, z], invAngularVelocity);
    }

    public.rotateToXY = function (x, y, invAngularVelocity) {
        return public.rotateTo([x, y, 0], invAngularVelocity);
    }


    public.onStart = function (onStart) {
        private.onStart = onStart;
        return public;
    }

    public.onStop = function (onStop) {
        private.onStop = onStop;
        return public;
    }

    const angularDelta = function(a, b) {
        const delta = Vector.sub(a, b);
        for (let i = 0; i < delta.length; i++) {
            while (delta[i] < -Math.PI) delta[i] += Math.PI * 2;
            while (delta[i] > Math.PI) delta[i] -= Math.PI * 2;
        }
        return delta;
    }

    const linearDelta = function(a, b) {
        const delta = Vector.sub(a, b);
        return delta;
    }

    public.start = function (animation, gameTick) {
        private.startLocation = private.scenePosition.getLocation();
        private.startRotate = private.scenePosition.getRotate();

        if (private.rotateTo && private.invAngularVelocity) {
            private.rotateDelta = angularDelta(private.rotateTo, private.startRotate);
            const distance = Vector.length(private.rotateDelta);
            public.duration = Math.floor(private.invAngularVelocity * distance + 1);
        }

        if (private.moveTo && private.invLinearVelocity) {
            private.moveDelta = linearDelta(private.moveTo, private.startLocation);
            const distance = Vector.length(private.moveDelta);
            public.duration = Math.floor(private.invLinearVelocity * distance + 1);
        }

        private.startTick = gameTick;
        private.endTick = gameTick + public.duration;
        if (private.onStart) private.onStart(animation, public, gameTick);
        return public;
    }

    public.action = function (animation, gameTick) {
        const r = (gameTick - private.startTick) / public.duration;
        let moveBy = private.moveBy;
        let rotateBy = private.rotateBy;

        if (private.moveDelta) 
            moveBy = private.moveDelta;

        if (private.rotateDelta)
            rotateBy = private.rotateDelta;

        if (moveBy) 
            private.scenePosition.location(Vector.add(private.startLocation, Vector.mult(moveBy, r)));

        if (rotateBy) 
            private.scenePosition.rotate(Vector.add(private.startRotate, Vector.mult(rotateBy, r)));

        return public;
    }

    public.stop = function (animation, gameTick) {
        if (private.onStop) private.onStop(animation, public, gameTick);
        return public;
    }

    public.dispose = function () {
        public.stop();
    }

    return public;
}


/***/ }),

/***/ "./src/Animations/RepeatAnimationAction.js":
/*!*************************************************!*\
  !*** ./src/Animations/RepeatAnimationAction.js ***!
  \*************************************************/
/***/ (() => {

// Provides a mechanism to execute another animation action a specific
// number of times
window.frag.RepeatAnimationAction = function (engine, action, count) {
    return {
        duration: action.duration * count,
        interval: action.interval,
        start: action.start,
        stop: action.stop,
        action: action.action,
        dispose: function () {}    
    };
}


/***/ }),

/***/ "./src/Animations/SceneObjectAnimation.js":
/*!************************************************!*\
  !*** ./src/Animations/SceneObjectAnimation.js ***!
  \************************************************/
/***/ (() => {

// Constructs a model animation in the context of a scene object
// For example this could be the "moving" animation for a model. Constructing this
// object enables you to start and stop this animation on a specific scene object
window.frag.SceneObjectAnimation = function (engine, animation, animationMap) {
    const modelAnimation = animation.modelAnimation;
    const childAnimations = animation.childAnimations;

    const updateFunctions = [];

    for (let i = 0; i < childAnimations.length; i++) {
        const childAnimation = childAnimations[i];
        const modelName = childAnimation.model.getName();
        animationState = animationMap[modelName];
        if (animationState) {
            const graph = childAnimation.graph;
            const update = animationState.getUpdateFunction(graph.channel);
            updateFunctions.push(function (frame) {
                update(graph.frameValues[frame]);
            });
        }
    }

    const frameAction = function (frame) {
        for (let i = 0; i < updateFunctions.length; i++) {
            updateFunctions[i](frame);
        }
    }

    const action = window.frag.KeyframeAnimationAction(engine)
        .setFrames(modelAnimation.getInterval(), modelAnimation.getFrames());

    for (let frame = 0; frame < modelAnimation.getFrames(); frame++) {
        action.add(frame, frameAction);
    }

    return window.frag.Animation(engine)
        .perform(action, modelAnimation.getLoop());
}


/***/ }),

/***/ "./src/Animations/ValueAnimationAction.js":
/*!************************************************!*\
  !*** ./src/Animations/ValueAnimationAction.js ***!
  \************************************************/
/***/ (() => {

// Provides a mechanism to change a value over time. For example smoothly change
// one color into another or smoothly move an object within the scene.
// ValueAnimationAction objects can be passed to an Animation object as the action
// to take in one of the steps in an animation sequence
window.frag.ValueAnimationAction = function (engine) {
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

    public.dispose = function () {
        public.stop();
    }

    return public;
}


/***/ }),

/***/ "./src/Cameras/FrustumCamera.js":
/*!**************************************!*\
  !*** ./src/Cameras/FrustumCamera.js ***!
  \**************************************/
/***/ (() => {

// This camera makes objects closer to the public appear larger. The frustum
// defines clipping and scaling of the scene

window.frag.FrustumCamera = function (engine) {
    const private = {
        zNear: 100,
        zFar: 200,
        xScale: 100,
    }

    const public = { };

    window.frag.cameraMixin(engine, private, public);

    public.frustum = function (xScale, zNear, zFar) {
        if (zNear <= 0) console.error('You cannot include things that are behind the camera in the cameras field of view. zNear must be greater than zero');
        if (zNear >= zFar) console.error('The camera zFar must be greater than zNear');
        if (xScale <= 0) console.error('Camera x-scale must be greater than zero');

        private.xScale = xScale;
        private.zNear = zNear;
        private.zFar = zFar;

        private.frustumChanged = true;
        return public;
    }

    private.updateFrustum = function() {
        if (private.frustumChanged) {
            private.projectionMatrix = window.frag.Matrix.frustum(
                -private.xScale, 
                private.xScale, 
                -private.xScale / private.aspectRatio, 
                private.xScale / private.aspectRatio, 
                private.zNear, 
                private.zFar);
            private.frustumChanged = false;
            private.transformChanged = true;
        }
    }

    return public;
};


/***/ }),

/***/ "./src/Cameras/OrthographicCamera.js":
/*!*******************************************!*\
  !*** ./src/Cameras/OrthographicCamera.js ***!
  \*******************************************/
/***/ (() => {

// This camera draws objects in their actual size regardless of how far from the camera they are.
// The frustum affects z clip space and XY scaling to the viewport but does not scale objects in the scene

window.frag.OrthographicCamera = function (engine) {
    const private = {
        zNear: 100,
        zFar: 200,
        xScale: 100,
    };

    const public = { };

    window.frag.cameraMixin(engine, private, public);

    public.frustum = function (xScale, zNear, zFar) {
        if (zNear <= 0) console.error('You cannot include things that are behind the camera in the cameras field of view. zNear must be greater than zero');
        if (zNear >= zFar) console.error('The camera zFar must be greater than zNear');
        if (xScale <= 0) console.error('Camera x-scale must be greater than zero');

        private.xScale = xScale;
        private.zNear = zNear;
        private.zFar = zFar;

        private.frustumChanged = true;
        return public;
    }

    private.updateFrustum = function() {
        if (private.frustumChanged) {
            private.projectionMatrix = window.frag.Matrix.orthographic(
                -private.xScale, 
                private.xScale, 
                -private.xScale / aspectRatio, 
                private.xScale / aspectRatio, 
                private.zNear, 
                private.zFar);
            private.frustumChanged = false;
            private.transformChanged = true;
        }
    }

    return public;
};


/***/ }),

/***/ "./src/Cameras/PerspectiveCamera.js":
/*!******************************************!*\
  !*** ./src/Cameras/PerspectiveCamera.js ***!
  \******************************************/
/***/ (() => {

// This camera makes objects closer to the public appear larger. The frustum
// defines clipping and scaling of the scene

window.frag.PerspectiveCamera = function (engine) {
    const private = {
        fov: 45 * Math.PI / 180,
        zNear: 100,
        zFar: 200,
        aspectRatio: 1,
    }

    const public = { };

    window.frag.cameraMixin(engine, private, public);

    public.frustum = function (fieldOfView, zNear, zFar) {
        if (fieldOfView <= 0) console.error('Camera field of view must be greater than zero');
        if (fieldOfView >= Math.PI * 0.5) console.error('Camera field of view must be less than 90 degrees');
        if (zNear <= 0) console.error('You cannot include things that are behind the camera in the cameras field of view. zNear must be greater than zero');
        if (zNear >= zFar) console.error('The camera zFar must be greater than zNear');

        private.fov = fieldOfView;
        private.zNear = zNear;
        private.zFar = zFar;

        private.frustumChanged = true;
        return public;
    }

    private.updateFrustum = function() {
        if (private.frustumChanged) {
            private.projectionMatrix = window.frag.Matrix.perspective(
                private.fieldOfView, 
                private.aspectRatio, 
                private.zNear, 
                private.zFar);
            private.frustumChanged = false;
            private.transformChanged = true;
        }
    }

    return public;
};


/***/ }),

/***/ "./src/Cameras/UiCamera.js":
/*!*********************************!*\
  !*** ./src/Cameras/UiCamera.js ***!
  \*********************************/
/***/ (() => {

// This public draws 2D shapes scaled to the width of the viewport.
// It is designed to be used in conjunction with the UiShader which will project onto the front of the viewport.

window.frag.UiCamera = function (engine) {

    const private = {
        aspectRatio: 1};

    const public = {
        worldToClipTransform: window.frag.Transform2D(engine).identity()
    };

    public.scaleX = function (horizontalScale) {
        var matrix = public.worldToClipTransform.getMatrix();
        matrix[0] = 1 / horizontalScale;
        public.worldToClipTransform.setMatrix(matrix);
        private.aspectRatio = -1;
        return public;
    }

    public.setViewport = function () {
        const gl = engine.gl;
        gl.viewport(0, 0, gl.canvas.clientWidth, gl.canvas.clientHeight);
        gl.canvas.width = gl.canvas.clientWidth;
        gl.canvas.height = gl.canvas.clientHeight;

        return public.adjustToViewport();
    };

    public.adjustToViewport = function () {
        const gl = engine.gl;
        const aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;

        if (private.aspectRatio != aspectRatio) {
            const matrix = public.worldToClipTransform.getMatrix();
            matrix[4] = matrix[0] * aspectRatio;
            public.worldToClipTransform.setMatrix(matrix);

            private.aspectRatio = aspectRatio;
        }

        return public;
    }

    public.dispose = function () {
    }

    return public;
};


/***/ }),

/***/ "./src/Cameras/cameraMixin.js":
/*!************************************!*\
  !*** ./src/Cameras/cameraMixin.js ***!
  \************************************/
/***/ (() => {

// Note that these parameters have underscores because of a bug in webpack.
window.frag.cameraMixin = function(engine, _private, _public) {
    _private.worldTransform = window.frag.Transform3D(engine);
    _private.position = window.frag.ScenePosition(engine);
    _private.parentPosition = null;
    _private.parentLocation = null;
    _private.projectionMatrix = null;
    _private.worldMatrix = null;
    _private.transformChanged = true;
    _private.positionChanged = true;
    _private.frustumChanged = true;
    _private.aspectRatio = 1;

    _public.__private = _private;
    _public.worldToClipTransform = window.frag.Transform3D(engine);

    _public.dispose = function () {
        _public.parent(null);
        _private.position.observableLocation.unsubscribe(_private.onPositionChanged);
        _private.worldToClipTransform.dispose();
        _private.position.dispose();
    }

    _private.onPositionChanged = function() {
        _private.positionChanged = true;
    }

    _private.position.observableLocation.subscribe(_private.onPositionChanged);

    _public.getPosition = function () {
        return _private.position;
    }

    _private.updateAspect = function () {
        const aspectRatio = engine.gl.drawingBufferWidth / engine.gl.drawingBufferHeight;
        if (aspectRatio !== _private.aspectRatio) {
            _private.aspectRatio = aspectRatio;
            _private.frustumChanged = true;
        }
    }

    _private.updateWorld = function () {
        if (_private.positionChanged) {
            let positionMatrix = _private.position.getMatrix();
            if (_private.parentLocation) {
                const parentMatrix = _private.parentLocation.getMatrix();
                positionMatrix = window.frag.Matrix.m4Xm4(parentMatrix, positionMatrix);
            }
            _private.worldMatrix = window.frag.Matrix.m4Invert(positionMatrix);
            _private.positionChanged = false;
            _private.transformChanged = true;
        }
    }

    _public.setViewport = function () {
        const gl = engine.gl;
        gl.viewport(0, 0, gl.canvas.clientWidth, gl.canvas.clientHeight);
        gl.canvas.width = gl.canvas.clientWidth;
        gl.canvas.height = gl.canvas.clientHeight;

        return _public.adjustToViewport();
    };

    _public.adjustToViewport = function () {
        const gl = engine.gl;
        const Matrix = window.frag.Matrix;

        _private.updateAspect();
        _private.updateFrustum();
        _private.updateWorld();

        if  (_private.transformChanged) {
            _public.worldToClipTransform.setMatrix(Matrix.m4Xm4(_private.projectionMatrix, _private.worldMatrix));
            _private.transformChanged = false;
        }

        return _public;
    }

    _private.parentPositionChanged = function(location) {
        _private.parentLocation = location;
        _private.positionChanged = true;
    }

    _public.parent = function(scenePosition) {
        if (_private.parentPosition) {
            _private.parentPosition.observableLocation.unsubscribe(_private.parentPositionChanged);
        }

        if (scenePosition && scenePosition.getPosition) scenePosition = scenePosition.getPosition();
        _private.parentPosition = scenePosition;

        if (scenePosition) {
            scenePosition.observableLocation.subscribe(_private.parentPositionChanged);
        } else {
            _private.parentPositionChanged(null);
        }
        return _public
    }
}

/***/ }),

/***/ "./src/Framework/Engine.js":
/*!*********************************!*\
  !*** ./src/Framework/Engine.js ***!
  \*********************************/
/***/ (() => {

window.frag = window.frag || {};
window.frag.Engine = function(config) {
    config = config || {};

    const private = {
        startFunctions: [],
        scenes: [],
        activeAnimations: {},
        inactiveAnimations: {},
        running: false,
        startTime: performance.now(),
        gameTick: 0,
        frameTick: 0,
        mainScene: null,
        nextAnimationId: 0,
        currentFrameCount: 0,
        frameCounts: [],
        frameCountsSum: 0,
        nextFpsPush: 0,
        hitTestShader: null,
        nextTextureUnit: 0,
    }

    const public = {
        __private: private,
        canvas: config.canvas || document.getElementById('scene'),
        renderInterval: config.renderInterval || 15,
        gameTickMs: config.gameTickMs || 10,
        debugPackageLoader: config.debugPackageLoader === undefined ? false : config.debugPackageLoader,
        debugShaderBuilder: config.debugShaderBuilder === undefined ? false : config.debugShaderBuilder,
        debugAnimations: config.debugAnimations === undefined ? false : config.debugAnimations,
        debugMeshes: config.debugMeshes === undefined ? false : config.debugMeshes,
        debugInputs: config.debugInputs === undefined ? false : config.debugInputs,
        debugParticles: config.debugParticles === undefined ? false : config.debugParticles,
        transparency: config.transparency === undefined ? false : config.transparency,
        fps: 0,
    }
    public.gl = public.canvas.getContext('webgl');

    public.correctClock = function(serverTick) {
        let difference = serverTick - private.gameTick;
        if (difference > 0) {
            private.startTime += public.gameTickMs;
        } else if (difference < 0) {
            private.startTime -= public.gameTickMs;
        }
    }

    public.allocateTextureUnit = function () {
        const result = private.nextTextureUnit;
        private.nextTextureUnit = (private.nextTextureUnit + 1) % public.maxTextureUnits;
        return result;
    };

    public.mainScene = function (scene) {
        if (private.mainScene) private.mainScene.dispose();
        private.mainScene = scene;
        return public;
    }

    public.getGameTick = function() {
        return private.gameTick;
    }

    public.getElapsedSeconds = function() {
        return private.gameTick * public.gameTickMs / 1000;
    }

    public.getMainScene = function () {
        return private.mainScene;
    }

    public.addScene = function (scene) {
        private.scenes.push(scene);
        return public;
    };

    public.removeScene = function (scene) {
        for (let i = 0; i < private.scenes.length; i++) {
            if (private.scenes[i] === scene) {
                private.scenes.splice(i, 1);
                return true;
            }
        }
        return false;
    };

    public.activateAnimation = function(animation) {
        private.activeAnimations[animation.id] = animation;
        delete private.inactiveAnimations[animation.id];
        return public;
    }

    public.deactivateAnimation = function(animation) {
        private.inactiveAnimations[animation.id] = animation;
        delete private.activeAnimations[animation.id];
        return public;
    }

    public.addAnimation = function (animation) {
        animation.id = private.nextAnimationId++;
        private.inactiveAnimations[animation.id] = animation;
        return public;
    };

    public.removeAnimation = function (animation) {
        delete private.inactiveAnimations[animation.id];
        delete private.activeAnimations[animation.id];
        return public;
    };

    private.playAnimations = function () {
        for (let id in private.activeAnimations) {
            let animation = private.activeAnimations[id];
            if (animation.nextFrameTick !== undefined) {
                if (private.frameTick >= animation.nextFrameTick) {
                    animation.nextFrameTick = private.frameTick + 10;
                    animation.action(null, private.gameTick, private.frameTick);
                }
            } else if (animation.nextGameTick != undefined) {
                if (private.gameTick >= animation.nextGameTick) {
                    animation.nextGameTick = private.gameTick + 5;
                    animation.action(null, private.gameTick, private.frameTick);
                }
            } else {
                animation.nextGameTick = private.gameTick + 5;
            }
        }
    };

    public.hitTest = function (x, y, width, height, scene) {
        width = width || public.canvas.clientWidth;
        height = height || public.canvas.clientHeight;
        scene = scene || public.getMainScene();
    
        if (!private.hitTestShader) {
            const vertexShader =
                'attribute vec4 a_position;\n' +
                'uniform mat4 u_clipMatrix;\n' +
                'void main() {;\n' +
                '  gl_Position = u_clipMatrix * a_position;\n' +
                '}';
    
            const fragmentShader =
                'precision mediump float;\n' +
                'uniform vec4 u_color;\n' +
                'void main() {;\n' +
                '  gl_FragColor = u_color;\n' +
                '}';

            private.hitTestShader = frag.CustomShader(public)
                .name('Hit test')
                .source(vertexShader, fragmentShader)
                .attribute('position')
                .uniform('clipMatrix')
                .uniform('color');
        }
    
        const gl = public.gl;
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    
        const frameBuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    
        const depthBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
    
        gl.viewport(0, 0, width, height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
        const drawContext = frag.DrawContext(public).forHitTest(private.hitTestShader);
    
        gl.disable(gl.BLEND);
    
        if (Array.isArray(scene)) {
            for (let i = 0; i < scene.length; i++) {
                scene[i].adjustToViewport();
                scene[i].draw(drawContext);
            }
        } else {
            scene.adjustToViewport();
            scene.draw(drawContext);
        }
    
        const pixel = new Uint8Array(4);
        gl.readPixels(x, height - y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    
        if (engine.transparency) gl.enable(gl.BLEND);
    
        const red = pixel[0];
        const green = pixel[1];
        const blue = pixel[2];
        const alpha = pixel[3];
    
        const modelId = alpha | (blue << 8) | ((green & 0x0f) << 16);
        const sceneObjectId = ((green & 0xf0) >> 4) | (red << 4);
    
        if ((modelId < drawContext.models.length) && (sceneObjectId < drawContext.sceneObjects.length))
            return {
                sceneObject: drawContext.sceneObjects[sceneObjectId],
                model: drawContext.models[modelId]
            };
    
        return null;
    }    

    public.render = function () {
        if (!private.mainScene) return public;

        const t0 = performance.now();
        private.gameTick = Math.floor((t0 - private.startTime) / public.gameTickMs);
        private.frameTick++;

        private.playAnimations();

        const gl = public.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        private.mainScene.setViewport();
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const drawContext = frag.DrawContext(public).forRender(private.gameTick);
        private.mainScene.draw(drawContext);

        for (let i = 0; i < private.scenes.length; i++) {
            private.scenes[i].adjustToViewport();
            private.scenes[i].draw(drawContext);
        }

        const t1 = performance.now();
        private.currentFrameCount++;
        if (t1 > private.nextFpsPush)
        {
            private.nextFpsPush = t1 + 100;
            private.frameCountsSum += private.currentFrameCount;
            private.frameCounts.push(private.currentFrameCount);
            private.currentFrameCount = 0;
            if (private.frameCounts.length > 20) private.frameCountsSum -= private.frameCounts.shift();
            public.fps = 10 * private.frameCountsSum / private.frameCounts.length;
        }

        return public;
    }

    private.renderLoop = function () {
        public.render();
        if (private.running)
            setTimeout(private.renderLoop, public.renderInterval);
    }

    public.onStart = function (startFunction) {
        private.startFunctions.push(startFunction);
        return public;
    }

    public.initialize = function () {
        for (var i = 0; i < private.startFunctions.length; i++)
            private.startFunctions[i](public);
    }

    public.start = function() {
        public.initialize();
        private.running = true;
        private.renderLoop();
        return public;
    }

    public.stop = function() {
        private.running = false;
        return public;
    }

    public.dispose = function () {
        public.stop();
    }

    public.onStart(function (engine) {
        engine.canvas.addEventListener('contextmenu', event => event.preventDefault());

        const gl = engine.gl;
        engine.maxTextureUnits = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);

        gl.clearColor(1, 1, 1, 1);
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);

        if (engine.transparency) {
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        }
        return public;    
    });

    // This method allows you to call engine.Constructor() instead of
    // having to write frag.Constructor(engine)
    const addProxy = function (name) {
        public[name] = function () {
            const args = Array.prototype.slice.call(arguments);
            args.unshift(public);
            return frag[name].apply(null, args); 
        }
    }

    addProxy('Observable');
    addProxy('Transform');
    addProxy('Transform2D');
    addProxy('Transform3D');
    addProxy('Location');
    
    addProxy('CustomShader');
    addProxy('Shader');
    addProxy('UiShader');
    addProxy('FontShader');
    
    addProxy('Texture');
    addProxy('Font');
    addProxy('Material');
    
    addProxy('VertexData');
    addProxy('Mesh');
    addProxy('MeshOptimizer');
    addProxy('Model');
    addProxy('ScenePosition');
    addProxy('SceneObject');
    addProxy('Scene');
    addProxy('DrawContext');
    addProxy('PositionLink');

    addProxy('UiCamera');
    addProxy('OrthographicCamera');
    addProxy('PerspectiveCamera');
    addProxy('FrustumCamera');
    
    addProxy('Animation');
    addProxy('ObjectAnimationState');
    addProxy('ModelAnimation');
    addProxy('SceneObjectAnimation');
    addProxy('ValueAnimationAction');
    addProxy('KeyframeAnimationAction');
    addProxy('ParallelAnimationAction');
    addProxy('RepeatAnimationAction');
    addProxy('PositionAnimationAction');
    
    addProxy('Cube');
    addProxy('Cylinder');
    addProxy('Disc');
    addProxy('Plane');
    addProxy('Sphere');
    
    addProxy('AssetCatalog');
    addProxy('PackageLoader');
    
    addProxy('InputMethod');
    addProxy('DigitalState');
    addProxy('AnalogState');
    addProxy('DigitalInput');
    addProxy('AnalogInput');
    addProxy('DigitalAction');
    addProxy('AnalogAction');
    
    addProxy('CustomParticleSystem');
    addProxy('CustomParticleEmitter');
    addProxy('MineExplosionEmitter');
    addProxy('SphericalExplosionEmitter');
    addProxy('SprayEmitter');
    addProxy('RainEmitter');

    return public;
};


/***/ }),

/***/ "./src/Framework/Location.js":
/*!***********************************!*\
  !*** ./src/Framework/Location.js ***!
  \***********************************/
/***/ (() => {

// Represents a location, scale and orientation
window.frag.Location = function (engine, is3d) {
    const public = {
        is3d,
        isModified: false,
        matrix: null,
        translateX: 0,
        translateY: 0,
        translateZ: 0,
        scaleX: 1,
        scaleY: 1,
        scaleZ: 1,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0
    };

    public.dispose = function () {
    }

    public.clone = function() {
        const clone = window.frag.Location(engine, public.is3d);
        clone.isModified = public.isModified;
        clone.matrix = public.matrix;
        clone.translateX = public.translateX;
        clone.translateY = public.translateY;
        clone.translateZ = public.translateZ;
        clone.scaleX = public.scaleX;
        clone.scaleY = public.scaleY;
        clone.scaleZ = public.scaleZ;
        clone.rotateX = public.rotateX;
        clone.rotateY = public.rotateY;
        clone.rotateZ = public.rotateZ;
        return clone;
    }

    public.add = function(other) {
        public.translateX += other.translateX;
        public.translateY += other.translateY;
        public.translateZ += other.translateZ;
        public.scaleX *= other.scaleX;
        public.scaleY *= other.scaleY;
        public.scaleZ *= other.scaleZ;
        public.rotateX += other.rotateX;
        public.rotateY += other.rotateY;
        public.rotateZ += other.rotateZ;
        public.isModified = true;
        return public;
    }

    public.getMatrix = function () {
        if (public.matrix && !public.isModified)
            return public.matrix;

        let transform;
        if (public.is3d) {
            transform = window.frag.Transform3D(engine)
                .translateXYZ(public.translateX, public.translateY, public.translateZ)
                .rotateXYZ(public.rotateX, public.rotateY, public.rotateZ)
                .scaleXYZ(public.scaleX, public.scaleY, public.scaleZ);
        } else {
            transform = window.frag.Transform2D(engine)
                .translateXY(public.translateX, public.translateY)
                .rotate(public.rotateZ)
                .scaleXY(public.scaleX, public.scaleY);
        }

        public.matrix = transform.getMatrix();
        public.isModified = false;

        return public.matrix;
    }

    return public;
}

/***/ }),

/***/ "./src/Framework/Observable.js":
/*!*************************************!*\
  !*** ./src/Framework/Observable.js ***!
  \*************************************/
/***/ (() => {

window.frag.Observable = function (engine, notify) {
    const private = {
        notify,
        observers: []
    }

    const public = {
        __private: private
    };

    public.dispose = function () {
    }

    public.subscribe = function (observer) {
        private.observers.push(observer);
        private.notify(observer);
    };

    public.unsubscribe = function (observer) {
        for (let i = 0; i < private.observers.length; i++) {
            if (private.observers[i] === observer) {
                private.observers.splice(i, 1);
                return true;
            }
        }
        return false;
    };

    public.notify = function (fn) {
        fn = fn || private.notify || (function (observer) { observer(); });
        for (let i = 0; i < private.observers.length; i++) {
            fn(private.observers[i]);
        }
    }

    return public;
};

window.frag.ObservableValue = function () {
    let value = null;
    const observable = frag.Observable(engine, (fn) => { fn(value); });

    const public = {};

    public.get = function () {
        return value;
    }

    public.set = function (v) {
        value = v;
        observable.notify();
    }

    public.subscribe = function (fn) {
        return observable.subscribe(fn);
    }

    public.unsubscribe = function (fn) {
        return observable.unsubscribe(fn);
    }

    return public;
};

/*
const observedValue = window.frag.ObservableValue(engine);
observedValue.set(42);

let observer1 = function (v) { console.log("Observer 1 received " + v); }
observedValue.subscribe(observer1);

observedValue.set(43);

let observer2 = function (v) { console.log("Observer 2 received " + v); }
observedValue.subscribe(observer2);

observedValue.unsubscribe(observer1);

observedValue.set(44);
*/

/***/ }),

/***/ "./src/Framework/Transform.js":
/*!************************************!*\
  !*** ./src/Framework/Transform.js ***!
  \************************************/
/***/ (() => {

window.frag.Transform = function (engine, matrix) {
    if (matrix && matrix.length === 9)
        return window.frag.Transform2D(engine, matrix)
    return window.frag.Transform3D(engine, matrix);
};


/***/ }),

/***/ "./src/Framework/Transform2D.js":
/*!**************************************!*\
  !*** ./src/Framework/Transform2D.js ***!
  \**************************************/
/***/ (() => {

// This is a wrapper around a 3x3 matrix. It provides methods to operate on the matrix
// and can apply the matrix to a shader for rendering. It also provides an observable
// that you can subscribe to changes in the matrix
window.frag.Transform2D = function (engine, matrix) {
    const frag = window.frag;
    const _ = 0;

    const private = {
        matrix
    }

    const public = {
        __private: private,
        observableMatrix: window.frag.Observable(
            engine, (observer) => { 
                observer(private.matrix) 
            }),
        is3d: false,
    };

    public.dispose = function () {
        public.observableMatrix.dispose();
    }

    public.clone = function (matrix) {
        return window.frag.Transform2D(engine, matrix || private.matrix);
    }

    public.getMatrix = function () {
        return private.matrix;
    }

    public.setMatrix = function (matrix) {
        private.matrix = matrix;
        public.observableMatrix.notify();
        return public;
    }

    public.transform = function (matrix) {
        if (private.matrix)
            return public.setMatrix(frag.Matrix.m3Xm3(private.matrix, matrix));
        return public.setMatrix(matrix);
    }

    public.identity = function () {
        return public.setMatrix([
            1, _, _,
            _, 1, _,
            _, _, 1,
        ]);
    }

    public.scale = function (s) {
        return public.transform([
            s, _, _,
            _, s, _,
            _, _, 1,
        ]);
    }

    public.scaleXY = function (x, y) {
        return public.transform([
            x, _, _,
            _, y, _,
            _, _, 1,
        ]);
    }

    public.translateX = function (d) {
        return public.transform([
            1, _, _,
            _, 1, _,
            d, _, 1,
        ]);
    }

    public.translateY = function (d) {
        return public.transform([
            1, _, _,
            _, 1, _,
            _, d, 1,
        ]);
    }

    public.translateXY = function (x, y) {
        return public.transform([
            1, _, _,
            _, 1, _,
            x, y, 1,
        ]);
    }

    public.rotate = function (rad) {
        var c = Math.cos(rad);
        var s = Math.sin(rad);
        return public.transform([
            c,-s, _,
            s, c, _,
            _, _, 1,
        ]);
    }

    public.apply = function (uniform) {
        if (uniform !== undefined) {
            engine.gl.uniformMatrix3fv(uniform, false, public.getMatrix());
        }
        return public;
    }

    return public;
};


/***/ }),

/***/ "./src/Framework/Transform3D.js":
/*!**************************************!*\
  !*** ./src/Framework/Transform3D.js ***!
  \**************************************/
/***/ (() => {

// This is a wrapper around a 4x4 matrix. It provides methods to operate on the matrix
// and can apply the matrix to a shader for rendering. It also provides an observable
// that you can subscribe to changes in the matrix
window.frag.Transform3D = function (engine, matrix) {
    const frag = window.frag;
    const _ = 0;

    const private = {
        matrix,
    };

    const public = {
        __private: private,
        observableMatrix: window.frag.Observable(
            engine, (observer) => { 
                observer(private.matrix) 
            }),
        is3d: true,
    };

    public.dispose = function () {
        public.observableMatrix.dispose();
    }

    public.clone = function (matrix) {
        return window.frag.Transform3D(engine, matrix || private.matrix);
    }

    public.getMatrix = function () {
        return private.matrix;
    }

    public.setMatrix = function (matrix) {
        private.matrix = matrix;
        public.observableMatrix.notify();
        return public;
    }

    public.transform = function (matrix) {
        if (private.matrix)
            return public.setMatrix(frag.Matrix.m4Xm4(private.matrix, matrix));
        return public.setMatrix(matrix);
    }

    public.identity = function () {
        return public.setMatrix([
            1, _, _, _,
            _, 1, _, _,
            _, _, 1, _,
            _, _, _, 1,
        ]);
    }

    public.scale = function (s) {
        return public.transform([
            s, _, _, _,
            _, s, _, _,
            _, _, s, _,
            _, _, _, 1,
        ]);
    }

    public.scaleX = function (s) {
        return public.transform([
            s, _, _, _,
            _, 1, _, _,
            _, _, 1, _,
            _, _, _, 1,
        ]);
    }

    public.scaleY = function (s) {
        return public.transform([
            1, _, _, _,
            _, s, _, _,
            _, _, s, _,
            _, _, _, 1,
        ]);
    }

    public.scaleZ = function (s) {
        return public.transform([
            1, _, _, _,
            _, 1, _, _,
            _, _, s, _,
            _, _, _, 1,
        ]);
    }

    public.scaleXY = function (x, y) {
        return public.transform([
            x, _, _, _,
            _, y, _, _,
            _, _, 1, _,
            _, _, _, 1,
        ]);
    }

    public.scaleXYZ = function (x, y, z) {
        return public.transform([
            x, _, _, _,
            _, y, _, _,
            _, _, z, _,
            _, _, _, 1,
        ]);
    }

    public.translateX = function (d) {
        return public.transform([
            1, _, _, _,
            _, 1, _, _,
            _, _, 1, _,
            d, _, _, 1,
        ]);
    }

    public.translateY = function (d) {
        return public.transform([
            1, _, _, _,
            _, 1, _, _,
            _, _, 1, _,
            _, d, _, 1,
        ]);
    }

    public.translateZ = function (d) {
        return public.transform([
            1, _, _, _,
            _, 1, _, _,
            _, _, 1, _,
            _, _, d, 1,
        ]);
    }

    public.translateXY = function (x, y) {
        return public.transform([
            1, _, _, _,
            _, 1, _, _,
            _, _, 1, _,
            x, y, _, 1,
        ]);
    }

    public.translateXYZ = function (x, y, z) {
        return public.transform([
            1, _, _, _,
            _, 1, _, _,
            _, _, 1, _,
            x, y, z, 1,
        ]);
    }

    public.rotateX = function (rad) {
        var c = Math.cos(rad);
        var s = Math.sin(rad);
        return public.transform([
            1, _, _, _,
            _, c, s, _,
            _,-s, c, _,
            _, _, _, 1,
        ]);
    }

    public.rotateY = function (rad) {
        var c = Math.cos(rad);
        var s = Math.sin(rad);
        return public.transform([
            c, _,-s, _,
            _, 1, _, _,
            s, _, c, _,
            _, _, _, 1,
        ]);
    }

    public.rotateZ = function (rad) {
        var c = Math.cos(rad);
        var s = Math.sin(rad);
        return public.transform([
            c, s, _, _,
           -s, c, _, _,
            _, _, 1, _,
            _, _, _, 1,
        ]);
    }

    public.rotateXYZ = function (x, y, z) {
        if (x) public.rotateX(x);
        if (y) public.rotateY(y);
        if (z) public.rotateZ(z);
        return public;
    }

    public.apply = function (uniform) {
        if (uniform !== undefined) {
            engine.gl.uniformMatrix4fv(uniform, false, public.getMatrix());
        }
        return public;
    }

    return public;
};

// Unit tests for Transform3D
/*
window.tests = window.tests || {};

window.tests.transform = {
    check: function (name, transform, vector, expected) {
        const result = window.frag.Matrix.m4Xv4(transform.getMatrix(), vector);
        window.tests.expectArray(name, expected, result);
    },
    t1: window.frag.Transform3D(engine).identity(),
    t2: window.frag.Transform3D(engine).scaleXYZ(2, 3, 4).translateXYZ(1, 2, 3),
    t3: window.frag.Transform3D(engine).translateXYZ(1, 2, 3).scaleXYZ(2, 3, 4),

    run: function (test) {
        test.check("Identity matrix", test.t1, [9, 13, 56, 1], [9, 13, 56, 1]);
        test.check("Scale+translate matrix", test.t2, [1, 1, 1, 1], [4, 9, 16, 1]);
        test.check("Translate+scale matrix", test.t3, [1, 1, 1, 1], [3, 5, 7, 1]);
    }
};

window.tests.transform.run(window.tests.transform);
*/

/***/ }),

/***/ "./src/Input/AnalogAction.js":
/*!***********************************!*\
  !*** ./src/Input/AnalogAction.js ***!
  \***********************************/
/***/ (() => {

// Returne functions that can be bound to analog inputs
window.frag.AnalogAction = function(engine, actionName, context) {

    const splits = actionName.split("-");

    let mode = "move";
    let axis = "z";

    for (let i = 0; i < splits.length; i++) {
        if ((/^move$/i).test(splits[i])) mode = "move";
        if ((/^rotate$/i).test(splits[i])) mode = "rotate";
        if ((/^scale$/i).test(splits[i])) mode = "scale";
        if ((/^x$/i).test(splits[i])) axis = "x";
        if ((/^y$/i).test(splits[i])) axis = "y";
        if ((/^z$/i).test(splits[i])) axis = "z";
        if ((/^right$/i).test(splits[i])) axis = "right";
        if ((/^up$/i).test(splits[i])) axis = "up";
        if ((/^forward$/i).test(splits[i])) axis = "forward";
    }

    const scenePosition = function (getPosition) {
        if (mode === "move") {
            if (axis === "x") 
                return function(analogState) { getPosition().locationX(analogState.value); }
            if (axis === "y") 
                return function(analogState) { getPosition().locationY(analogState.value); }
            if (axis === "z") 
                return function(analogState) { getPosition().locationZ(analogState.value); }
        }
        if (mode === "rotate") {
            if (axis === "x") 
                return function(analogState) { getPosition().rotateX(analogState.value); }
            if (axis === "y") 
                return function(analogState) { getPosition().rotateY(analogState.value); }
            if (axis === "z") 
                return function(analogState) { getPosition().rotateZ(analogState.value); }
        }
        return null;
    }

    if (/camera/i.test(actionName)) {
        return scenePosition(function () {
            return engine.getMainScene().getCamera().getPosition();
        });
    }

    if (context && context.sceneObject) {
        if (/sceneobject/i.test(actionName)) {
            return scenePosition(context.sceneObject.getPosition);
        }
    }

    return null;    
}

/***/ }),

/***/ "./src/Input/AnalogInput.js":
/*!**********************************!*\
  !*** ./src/Input/AnalogInput.js ***!
  \**********************************/
/***/ (() => {

// Represents an input that can be moved up and down in value. For example
// the scroll wheel on the mouse or a joystick axis
window.frag.AnalogInput = function(engine, inputName, analogState, options) {
    options = options || {};
    if (options.scale === undefined) options.scale = 1;

    const private = {
        inputName,
        analogState,
    }

    const public = {
        __private: private,
    }

    public.dispose = function () {
        public.disable();
    }

    const splits = inputName.split("-");

    if ((/mouse/i).test(inputName)) {
        let buttons = 0;
        let vertical = false;
        let inverted = false;
        let wheel = false;
        let downPosition;
        let downValue;

        for (let i = 0; i < splits.length; i++) {
            if ((/^horizontal$/).test(splits[i])) vertical = false;
            if ((/^vertical$/).test(splits[i])) vertical = true;
            if ((/^inverted$/).test(splits[i])) inverted = true;
            if ((/^wheel$/).test(splits[i])) wheel = true;
            if ((/^left$/).test(splits[i])) buttons = 1;
            if ((/^right$/).test(splits[i])) buttons = 2;
            if ((/^middle$/).test(splits[i])) buttons = 4;
            if ((/^back$/).test(splits[i])) buttons = 8;
            if ((/^forward$/).test(splits[i])) buttons = 16;
            if ((/^any$/).test(splits[i])) buttons = 255;
        }

        const moveHandler = function (evt) {
            if (buttons === 0) {
                let fraction = vertical ? (engine.canvas.clientHeight - evt.clientY) / engine.canvas.clientHeight : evt.clientX / engine.canvas.clientWidth;
                fraction *= options.scale;
                if (fraction > 1) fraction = 1;
                if (inverted) fraction = 1 - fraction;
                const value = ((private.analogState.maxValue - private.analogState.minValue) * fraction) + private.analogState.minValue;
                if (engine.debugInputs) console.log("Analog input", private.inputName, "=", value);
                private.analogState.setValue(evt, value, true);
            } else if ((evt.buttons & buttons) !== 0) {
                let fraction = vertical 
                    ? (inverted ? (evt.clientY - downPosition) : (downPosition - evt.clientY)) / engine.canvas.clientHeight
                    : (inverted ? (downPosition - evt.clientX) : (evt.clientX - downPosition)) / engine.canvas.clientWidth;
                fraction *= options.scale;
                if (fraction > 1) fraction = 1;
                const value = downValue + ((private.analogState.maxValue - private.analogState.minValue) * fraction);
                if (engine.debugInputs) console.log("Analog input", private.inputName, "=", value);
                private.analogState.setValue(evt, value, true);
            }
            return true;
        }

        const downHandler = function(evt) {
            if ((evt.buttons & buttons) !== 0) {
                downPosition = vertical ? evt.clientY : evt.clientX;
                downValue = private.analogState.getValue();
            }
        }

        const wheelHandler = function(evt) {
            if (engine.debugInputs) console.log("Analog input", private.inputName, "delta", evt.deltaY);
            if (inverted) {
                if (evt.deltaY > 0) private.analogState.decrement(evt); else private.analogState.increment(evt);
            } else {
                if (evt.deltaY < 0) private.analogState.decrement(evt); else private.analogState.increment(evt);
            }
            evt.preventDefault();
            return true;
        }

        public.enable = function () {
            if (wheel) {
                engine.canvas.addEventListener("wheel", wheelHandler, false);
            } else {
                engine.canvas.addEventListener("mousemove", moveHandler, false);
                if (buttons !== 0) engine.canvas.addEventListener("mousedown", downHandler, false);
            }
            return public;
        }

        public.disable = function () {
            if (wheel) {
                engine.canvas.removeEventListener("wheel", wheelHandler, false);
            } else {
                engine.canvas.removeEventListener("mousemove", moveHandler, false);
                if (buttons !== 0) engine.canvas.removeEventListener("mousedown", downHandler, false);
            }
            return public;
        }

        return public;
    }

    if ((/keys/i).test(splits[0])) {
        let leftKey = "ArrowLeft";
        let rightKey = "ArrowRight";
        if (splits.length > 1) leftKey = splits[1];
        if (splits.length > 2) rightKey = splits[2];

        const handler = function (evt) {
            if (evt.key === leftKey) {
                if (engine.debugInputs) console.log("Analog input", private.inputName, "decrement");
                private.analogState.decrement(evt);
                evt.preventDefault();
            } else if (evt.key === rightKey) {
                if (engine.debugInputs) console.log("Analog input", private.inputName, "increment");
                private.analogState.increment(evt);
                evt.preventDefault();
            }
            return true;
        }

        public.enable = function () {
            document.addEventListener("keydown", handler, false);
            return public;
        }

        public.disable = function () {
            document.removeEventListener("keydown", handler, false);
            return public;
        }

        return public;
    }

    if ((/touch/i.test(inputName))) {
        let mode = "horizontal";
        let inverted = false;
        let additionalTouches = false;
        let downPosition;
        let downValue;
        let clientLength;
        let span;
        let index = 0;

        for (let i = 0; i < splits.length; i++) {
            if ((/^horizontal$/).test(splits[i])) mode = "horizontal";
            if ((/^vertical$/).test(splits[i])) mode = "vertical";
            if ((/^pinch$/).test(splits[i])) mode = "pinch";
            if ((/^rotate$/).test(splits[i])) mode = "rotate";
            if ((/^inverted$/).test(splits[i])) inverted = true;
            if ((/^plus$/).test(splits[i])) additionalTouches = true;
            if ((/^1$/).test(splits[i])) index = 0;
            if ((/^2$/).test(splits[i])) index = 1;
            if ((/^3$/).test(splits[i])) index = 2;
        }

        let moveHandler = null;
        let touchStartHandler = null;

        if (mode === "horizontal") {
            moveHandler = function (evt) {
                if ((additionalTouches && evt.touches.length > index) || evt.touches.length === index + 1) {
                    const touch = evt.touches.item(index);
                    let fraction = (inverted ? (downPosition - touch.clientX) : (touch.clientX - downPosition)) / clientLength;
                    fraction *= options.scale;
                    if (fraction > 1) fraction = 1;
                    const value = downValue + (span * fraction);
                    if (engine.debugInputs) console.log("Analog input", private.inputName, "=", value);
                    private.analogState.setValue(evt, value, true);
                }
                return true;
            }
            touchStartHandler = function(evt) {
                if (evt.touches.length === index + 1) {
                    const touch = evt.touches.item(index);
                    downPosition = touch.clientX;
                    downValue = private.analogState.getValue();
                    span = private.analogState.maxValue - private.analogState.minValue;
                    clientLength = engine.canvas.clientWidth;
                }
                return true;
            }
        }

        if (mode === "vertical") {
            moveHandler = function (evt) {
                if ((additionalTouches && evt.touches.length > index) || evt.touches.length === index + 1) {
                    const touch = evt.touches.item(index);
                    let fraction =  (inverted ? (touch.clientY - downPosition) : (downPosition - touch.clientY)) / clientLength;
                    fraction *= options.scale;
                    if (fraction > 1) fraction = 1;
                    const value = downValue + (span * fraction);
                    if (engine.debugInputs) console.log("Analog input", private.inputName, "=", value);
                    private.analogState.setValue(evt, value, true);
                }
                return true;
            }
            touchStartHandler = function(evt) {
                if (evt.touches.length === index + 1) {
                    const touch = evt.touches.item(index);
                    downPosition = touch.clientY;
                    downValue = private.analogState.getValue();
                    span = private.analogState.maxValue - private.analogState.minValue;
                    clientLength = engine.canvas.clientHeight;
                }
                return true;
            }
        }

        if (mode === "pinch") {
            const distance = function(evt) {
                const touch1 = evt.touches.item(0);
                const touch2 = evt.touches.item(1);
                const spanX = touch2.clientX - touch1.clientX;
                const spanY = touch2.clientY - touch1.clientY;
                return Math.sqrt(spanX * spanX + spanY * spanY);
            }

            moveHandler = function (evt) {
                if ((additionalTouches && evt.touches.length > 1) || evt.touches.length === 2) {
                    const position = distance(evt);
                    let fraction = (position - downPosition) / clientLength;
                    fraction *= options.scale;
                    if (fraction > 1) fraction = 1;
                    if (inverted) fraction = -fraction;
                    const value = downValue + span * fraction;
                    if (engine.debugInputs) console.log("Analog input", private.inputName, "=", value);
                    private.analogState.setValue(evt, value, true);
                }
                return true;
            }
            touchStartHandler = function(evt) {
                if (evt.touches.length === 2) {
                    downPosition = distance(evt);
                    downValue = private.analogState.getValue();
                    span = private.analogState.maxValue - private.analogState.minValue;
                    clientLength = Math.sqrt(engine.canvas.clientHeight * engine.canvas.clientHeight + engine.canvas.clientWidth * engine.canvas.clientWidth) * 0.5;
                }
                return true;
            }
        }

        if (mode === "rotate") {
            const angle = function(evt) {
                const touch1 = evt.touches.item(0);
                const touch2 = evt.touches.item(1);
                const dirX = touch2.clientX - touch1.clientX;
                const dirY = touch2.clientY - touch1.clientY;
                return Math.atan2(dirY, dirX);
            }

            moveHandler = function (evt) {
                if ((additionalTouches && evt.touches.length > 1) || evt.touches.length === 2) {
                    const position = angle(evt);
                    let fraction = (position - downPosition) / clientLength;
                    fraction *= options.scale;
                    if (fraction > 1) fraction = 1;
                    if (inverted) fraction = -fraction;
                    const value = downValue + span * fraction;
                    if (engine.debugInputs) console.log("Analog input", private.inputName, "=", value);
                    private.analogState.setValue(evt, value, true);
                }
                return true;
            }
            touchStartHandler = function(evt) {
                if (evt.touches.length === 2) {
                    downPosition = angle(evt);
                    downValue = private.analogState.getValue();
                    span = private.analogState.maxValue - private.analogState.minValue;
                    clientLength = Math.PI * 0.5;
                }
                return true;
            }
        }

        public.enable = function () {
            if (moveHandler) engine.canvas.addEventListener("touchmove", moveHandler, false);
            if (touchStartHandler) engine.canvas.addEventListener("touchstart", touchStartHandler, false);
            return public;
        }

        public.disable = function () {
            if (moveHandler) engine.canvas.removeEventListener("touchmove", moveHandler, false);
            if (touchStartHandler) engine.canvas.removeEventListener("touchstart", touchStartHandler, false);
            return public;
        }

        return public;
    }

    if ((/pointer/i).test(inputName)) {
        let buttons = 0;
        let vertical = false;
        let inverted = false;
        let downPosition;
        let downValue;

        for (let i = 0; i < splits.length; i++) {
            if ((/^horizontal$/).test(splits[i])) vertical = false;
            if ((/^vertical$/).test(splits[i])) vertical = true;
            if ((/^inverted$/).test(splits[i])) inverted = true;
            if ((/^left$/).test(splits[i])) buttons = 1;
            if ((/^right$/).test(splits[i])) buttons = 2;
            if ((/^middle$/).test(splits[i])) buttons = 4;
            if ((/^back$/).test(splits[i])) buttons = 8;
            if ((/^forward$/).test(splits[i])) buttons = 16;
            if ((/^eraser$/).test(splits[i])) buttons = 32;
            if ((/^any$/).test(splits[i])) buttons = 255;
        }

        const moveHandler = function (evt) {
            if (buttons === 0) {
                let fraction = vertical ? evt.clientY / engine.canvas.clientHeight : evt.clientX / engine.canvas.clientWidth;
                fraction *= options.scale;
                if (fraction > 1) fraction = 1;
                if (inverted) fraction = 1 - fraction;
                const value = ((private.analogState.maxValue - private.analogState.minValue) * fraction) + private.analogState.minValue;
                if (engine.debugInputs) console.log("Analog input", private.inputName, "=", value);
                private.analogState.setValue(evt, value, true);
            } else if ((evt.buttons & buttons) !== 0) {
                let fraction = vertical 
                    ? (inverted ? (downPosition - evt.clientY) : (evt.clientY - downPosition)) / engine.canvas.clientHeight
                    : (inverted ? (downPosition - evt.clientX) : (evt.clientX - downPosition)) / engine.canvas.clientWidth;
                fraction *= options.scale;
                if (fraction > 1) fraction = 1;
                const value = downValue + ((private.analogState.maxValue - private.analogState.minValue) * fraction);
                if (engine.debugInputs) console.log("Analog input", private.inputName, "=", value);
                private.analogState.setValue(evt, value, true);
            }
            return true;
        }

        const downHandler = function(evt) {
            if ((evt.buttons & buttons) !== 0) {
                downPosition = vertical ? evt.clientY : evt.clientX;
                downValue = private.analogState.getValue();
            }
        }

        public.enable = function () {
            engine.canvas.addEventListener("pointermove", moveHandler, false);
            if (buttons !== 0) engine.canvas.addEventListener("pointerdown", downHandler, false);
            return public;
        }

        public.disable = function () {
            engine.canvas.removeEventListener("pointermove", moveHandler, false);
            if (buttons !== 0) engine.canvas.removeEventListener("pointerdown", downHandler, false);
            return public;
        }

        return public;
    }

    if ((/gamepad/i.test(inputName))) {
        let controllerIndex = 0;
        let stickIndex = 0;
        let axisIndex = 0;
        let gamepad = null;
        let inverted = false;
        let interval;

        for (let i = 0; i < splits.length; i++) {
            if ((/^horizontal$/).test(splits[i])) axisIndex = 0;
            if ((/^vertical$/).test(splits[i])) axisIndex = 1;
            if ((/^inverted$/).test(splits[i])) inverted = true;
            if ((/^player1$/).test(splits[i])) controllerIndex = 0;
            if ((/^player2$/).test(splits[i])) controllerIndex = 1;
            if ((/^player3$/).test(splits[i])) controllerIndex = 2;
            if ((/^player4$/).test(splits[i])) controllerIndex = 3;
            if ((/^stick1$/).test(splits[i])) stickIndex = 0;
            if ((/^stick2$/).test(splits[i])) stickIndex = 1;
            if ((/^stick3$/).test(splits[i])) stickIndex = 2;
            if ((/^stick4$/).test(splits[i])) stickIndex = 3;
        }

        const index = stickIndex * 2 + axisIndex;

        const poll = function (evt) {
            if (gamepad) {
                const value = gamepad.axes[index];
                if (inverted) value = -value;
                private.analogState.setVelocity(evt, value * private.analogState.maxVelocity);
            }
        }

        const connectedHandler = function(evt) {
            if (engine.debugInputs) console.log("Gamepad", evt.gamepad.index, "connected", "id:" + evt.gamepad.id, "with", e.gamepad.axes.length, "axes");
            if (evt.gamepad.index === controllerIndex && gamepad.axes.length > index) {
                gamepad = evt.gamepad;
                interval = setInterval(poll, 50);
            }
        }

        const disconnectedHandler = function(evt) {
            if (engine.debugInputs) console.log("Gamepad", evt.gamepad.index, "disconnected", "id:" + evt.gamepad.id);
            if (evt.gamepad.id === gamepad.id) {
                clearInterval(interval);
                gamepad = null;
            }
        }

        public.enable = function () {
            window.addEventListener("gamepadconnected", connectedHandler, false);
            window.addEventListener("gamepaddisconnected", disconnectedHandler, false);
            return public;
        }

        public.disable = function () {
            window.removeEventListener("gamepadconnected", connectedHandler, false);
            window.removeEventListener("gamepaddisconnected", disconnectedHandler, false);
            return public;
        }

        return public;
    }

    if ((/orientation/i.test(inputName))) {
        // https://developer.mozilla.org/en-US/docs/Web/Events/Detecting_device_orientation
        return public;
    }

    return public;
}

/***/ }),

/***/ "./src/Input/AnalogState.js":
/*!**********************************!*\
  !*** ./src/Input/AnalogState.js ***!
  \**********************************/
/***/ (() => {

// Represents an analog value that can be changed by the player using analog inputs
window.frag.AnalogState = function(engine, analogAction, config, name) {
    const frag = window.frag;

    if (!config) config = {};
    config.value = config.value || 0;
    config.minValue = config.minValue === undefined ? -100 : config.minValue;
    config.maxValue = config.maxValue === undefined ? 100 : config.maxValue;
    config.maxVelocity = config.maxVelocity || 5;
    config.acceleration = config.acceleration === undefined ? 0.25 : config.acceleration;
    config.deceleration = config.deceleration === undefined ? 1 : config.deceleration;

    const private = {
        analogAction,
        config,
        name,
        inverted: false,
    }

    const public = {
        __private: private,
        value: config.value,
        minValue: config.minValue,
        maxValue: config.maxValue,
        maxVelocity: Math.abs(config.maxVelocity),
        velocity: 0,
    }

    public.analogAction = function(action) {
        private.analogAction = action;
    }

    if (config.maxValue < config.minValue) {
        private.inverted = true;
        public.minValue = config.maxValue;
        public.maxValue = config.minValue;
    }

    private.change = function(evt) {
        if (private.analogAction) {
            if (Array.isArray(private.analogAction)) {
                for (let i = 0; i < private.analogAction.length; i++)
                    private.analogAction[i](public, evt);
            } else {
                private.analogAction(public, evt);
            }
        }
    }

    private.setValue = function(evt, value) {
        if (value < public.minValue) {
            value = public.minValue;
            public.velocity = 0;
        }
        if (value > public.maxValue) {
            value = public.maxValue;
            public.velocity = 0;
        }
        if (Math.abs(public.value - value) > 1e-5) {
            public.value = value;
            if (engine.debugInputs) console.log("Analog state", private.name, "set to", value);
            private.change(evt);
        }
    }

    private.increment = function(evt) {
        public.velocity += public.velocity >= 0 ? private.config.acceleration : private.config.deceleration;
        if (public.velocity > private.config.maxVelocity) public.velocity = private.config.maxVelocity;
        private.setValue(evt, public.value + public.velocity, false);
    }

    private.decrement = function(evt) {
        public.velocity -= public.velocity <= 0 ? private.config.acceleration : private.config.deceleration;
        if (public.velocity < -private.config.maxVelocity) public.velocity = -private.config.maxVelocity;
        private.setValue(evt, public.value + public.velocity, false);
    }

    public.setValue = function(evt, value, calcVelocity) {
        if (private.inverted)
            value = public.minValue + public.maxValue - value;

        if (calcVelocity) public.velocity = value - public.value;

        private.setValue(evt, value);
    }

    public.getValue = function() {
        if (private.inverted)
            return public.minValue + public.maxValue - public.value;
        return public.value;
    }

    public.increment = function(evt) {
        if (private.inverted) private.decrement(evt);
        else private.increment(evt);
    }

    public.decrement = function(evt) {
        if (private.inverted) private.increment(evt);
        else private.decrement(evt);
    }

    public.setVelocity = function(evt, velocity) {
        if (inverted) public.velocity = -velocity;
        else public.velocity = velocity;
        if (public.velocity > private.config.maxVelocity) public.velocity = private.config.maxVelocity;
        if (public.velocity < -private.config.maxVelocity) public.velocity = -private.config.maxVelocity;
        private.setValue(evt, public.value + public.velocity);
    }

    return public;
}

/***/ }),

/***/ "./src/Input/DigitalAction.js":
/*!************************************!*\
  !*** ./src/Input/DigitalAction.js ***!
  \************************************/
/***/ (() => {

// Returne functions that can be bound to digital inputs
window.frag.DigitalAction = function(engine, actionName, context) {
    const frag = window.frag;

    if (context && context.animation) {
        if (/^animation$/i.test(actionName)) {
            return function(digitalState) {
                if (engine.debugInputs) console.log("Turning animation", digitalState.isOn ? "on" : "off");
                if (digitalState.isOn) context.animation.start();
                else context.animation.stop();
            }
        }

        if (/^animation-start$/i.test(actionName)) {
            return function(digitalState) {
                if (!digitalState.isOn) {
                    if (engine.debugInputs) console.log("Starting animation");
                    context.animation.start();
                }
            }
        }

        if (/^animation-stop$/i.test(actionName)) {
            return function(digitalState) {
                if (!digitalState.isOn) {
                    if (engine.debugInputs) console.log("Stopping animation");
                    context.animation.stop();
                }
            }
        }
    }

    if (context && context.sceneObject) {
        if (/^sceneobject$/i.test(actionName)) {
            return function(digitalState) {
                if (engine.debugInputs) console.log("Turning scene object", digitalState.isOn ? "on" : "off");
                if (digitalState.isOn) context.sceneObject.enable();
                else context.sceneObject.disable();
            }
        }
    }

    if (context && context.model) {
        if (/^model$/i.test(actionName)) {
            return function(digitalState) {
                if (engine.debugInputs) console.log("Turning", context.model.getName(), "model", digitalState.isOn ? "on" : "off");
                if (digitalState.isOn) context.model.enable();
                else context.model.disable();
            }
        }
    }

    return null;
}

/***/ }),

/***/ "./src/Input/DigitalInput.js":
/*!***********************************!*\
  !*** ./src/Input/DigitalInput.js ***!
  \***********************************/
/***/ (() => {

// Represents an input that can only be on or off. For example keyboard keys or mouse buttons
window.frag.DigitalInput = function (engine, inputName, digitalState) {
    const frag = window.frag;

    const private = {
        inputName,
        digitalState,
        toggle: false,
        inverted: false,
        setOn: false,
        setOff: false,
    }

    const public = {
        __private: private,
    }

    public.dispose = function () {
        public.disable();
    }

    const splits = inputName.split("-");

    const setIsOn = function (evt, isOn) {
        if (private.inverted) isOn = !isOn;
        if (engine.debugInputs) console.log("Digital input", private.inputName, "is", isOn ? "on" : "off");
        if (private.toggle) {
            if (isOn) private.digitalState.toggle(evt);
        } else {
            if (private.setOn || private.setOff) {
                if (isOn) {
                    // Note that it is deliberate that you can set both on and off.
                    // In this case each time you press the key down the digital
                    // state will go on and off again very quickly
                    if (private.setOn) private.digitalState.setIsOn(evt, true);
                    if (private.setOff) private.digitalState.setIsOn(evt, false);
                }
            } else {
                private.digitalState.setIsOn(evt, isOn);
            }
        }
    }

    if ((/mouse/i).test(inputName)) {
        let buttons = 1;

        for (let i = 0; i < splits.length; i++) {
            if ((/^toggle$/i).test(splits[i])) private.toggle = true;
            if ((/^inverted$/i).test(splits[i])) private.inverted = true;
            if ((/^on$/i).test(splits[i])) private.setOn = true;
            if ((/^off$/i).test(splits[i])) private.setOff = true;
            if ((/^left$/i).test(splits[i])) buttons = 1;
            if ((/^right$/i).test(splits[i])) buttons = 2;
            if ((/^middle$/i).test(splits[i])) buttons = 4;
            if ((/^back$/i).test(splits[i])) buttons = 8;
            if ((/^forward$/i).test(splits[i])) buttons = 16;
            if ((/^eraser$/i).test(splits[i])) buttons = 32;
            if ((/^any$/i).test(splits[i])) buttons = 255;
        }

        const handler = function (evt) {
            setIsOn(evt, (evt.buttons & buttons) !== 0);
            return true;
        }

        public.enable = function () {
            engine.canvas.addEventListener("mousedown", handler, false);
            engine.canvas.addEventListener("mouseup", handler, false);
        }

        public.disable = function () {
            engine.canvas.removeEventListener("mousedown", handler, false);
            engine.canvas.removeEventListener("mouseup", handler, false);
        }

        return public;
    }

    if ((/pointer/i).test(inputName)) {
        let buttons = 1;

        for (let i = 0; i < splits.length; i++) {
            if ((/^toggle$/i).test(splits[i])) private.toggle = true;
            if ((/^inverted$/i).test(splits[i])) private.inverted = true;
            if ((/^on$/i).test(splits[i])) private.setOn = true;
            if ((/^off$/i).test(splits[i])) private.setOff = true;
            if ((/^left$/i).test(splits[i])) buttons = 1;
            if ((/^right$/i).test(splits[i])) buttons = 2;
            if ((/^middle$/i).test(splits[i])) buttons = 4;
            if ((/^back$/i).test(splits[i])) buttons = 8;
            if ((/^forward$/i).test(splits[i])) buttons = 16;
            if ((/^eraser$/i).test(splits[i])) buttons = 32;
            if ((/^any$/i).test(splits[i])) buttons = 255;
        }

        const handler = function (evt) {
            setIsOn(evt, (evt.buttons & buttons) !== 0);
            return true;
        }

        public.enable = function () {
            engine.canvas.addEventListener("pointerdown", handler, false);
            engine.canvas.addEventListener("pointerup", handler, false);
        }

        public.disable = function () {
            engine.canvas.removeEventListener("pointerdown", handler, false);
            engine.canvas.removeEventListener("pointerup", handler, false);
        }

        return public;
    }

    if ((/key/i).test(inputName)) {
        let key;
        let ctrl = false;
        let shift = false;
        let alt = false;
        let meta = false;

        for (let i = 0; i < splits.length; i++) {
            if ((/^toggle$/i).test(splits[i])) private.toggle = true;
            else if ((/^inverted$/i).test(splits[i])) private.inverted = true;
            else if ((/^on$/i).test(splits[i])) private.setOn = true;
            else if ((/^off$/i).test(splits[i])) private.setOff = true;
            else if (/^ctrl$/i.test(splits[i])) ctrl = true;
            else if (/^shift$/i.test(splits[i])) shift = true;
            else if (/^alt$/i.test(splits[i])) alt = true;
            else if (/^meta$/i.test(splits[i])) meta = true;
            else if (/^key$/i.test(splits[i]));
            else key = splits[i];
        }

        const handler = function (evt, isDown) {
            if (evt.key !== key ||
                evt.altKey !== alt ||
                evt.ctrlKey !== ctrl ||
                evt.shiftKey !== shift ||
                evt.metaKey !== meta)
                return true;

            evt.preventDefault();
            setIsOn(evt, isDown);

            return true;
        }

        const keyDownHandler = function (evt) {
            return handler(evt, true);
        }

        const keyUpHandler = function (evt) {
            return handler(evt, false);
        }

        public.enable = function () {
            document.addEventListener("keydown", keyDownHandler, false);
            document.addEventListener("keyup", keyUpHandler, false);
        }

        public.disable = function () {
            document.removeEventListener("keydown", keyDownHandler, false);
            document.removeEventListener("keyup", keyUpHandler, false);
        }

        return public;
    }

    return public;
}

/***/ }),

/***/ "./src/Input/DigitalState.js":
/*!***********************************!*\
  !*** ./src/Input/DigitalState.js ***!
  \***********************************/
/***/ (() => {

// Represents an on/off state that can be controlled by the player using digital inputs
window.frag.DigitalState = function (engine, digitalAction, config, name) {
    const frag = window.frag;

    if (!config) config = {};
    config.isOn = !!config.isOn;

    const private = {
        digitalAction,
        config,
        name,
    }

    const public = {
        __private: private,
        isOn: config.isOn,
    }

    public.dispose = function () {
    }

    private.change = function(evt) {
        if (private.digitalAction) {
            if (Array.isArray(private.digitalAction)) {
                for (let i = 0; i < private.digitalAction.length; i++)
                    private.digitalAction[i](public, evt);
            } else {
                private.digitalAction(public, evt);
            }
        }
    }

    public.setIsOn = function (evt, isOn) {
        if (isOn !== public.isOn) {
            public.isOn = isOn;
            if (engine.debugInputs) console.log("Digital state", private.name, "turned", public.isOn ? "on" : "off");
            private.change(evt);
        }
        else if (engine.debugInputs) console.log("Digital state", private.name, "is already", public.isOn ? "on" : "off");
    }

    public.toggle = function (evt) {
        public.isOn = !public.isOn;
        if (engine.debugInputs) console.log("Digital state", private.name, "toggled to", public.isOn ? "on" : "off");
        private.change(evt);
    }

    return public;
}

/***/ }),

/***/ "./src/Input/InputMethod.js":
/*!**********************************!*\
  !*** ./src/Input/InputMethod.js ***!
  \**********************************/
/***/ (() => {

// A collection of inputs that can be turned on and off.
window.frag.InputMethod = function(engine) {
    const private = {
        inputs: [],
        enabled: false
    }

    const public = {
        __private: private
    }

    public.dispose = function () {
        public.disable();
    }

    // Enables all of the inputs for this input method
    public.enable = function() {
        if (!private.enabled) {
            for (var i = 0; i< private.inputs.length; i++)
                private.inputs[i].enable();
            private.enabled = true;
        }
        return public;
    }

    // Disables all of the inputs for this input method
    public.disable = function() {
        if (private.enabled) {
            private.enabled = false;
            for (var i = 0; i< private.inputs.length; i++)
                private.inputs[i].disable();
        }
        return public;
    }

    // Adds a new input method
    public.add = function(input) {
        private.inputs.push(input);
        if (private.enabled) input.enable();
        return public;
    }

    return public;
}

/***/ }),

/***/ "./src/Loaders/AssetCatalog.js":
/*!*************************************!*\
  !*** ./src/Loaders/AssetCatalog.js ***!
  \*************************************/
/***/ (() => {

window.frag.AssetCatalog = function (engine, shader, defaultTextures) {
    const frag = window.frag;
    const gl = engine.gl;

    const defaultTexturePixels = new Uint8Array([
        0x7F, 0x7F, 0x7F, 0xFF, // Opaque medium grey
        0x00, 0x00, 0xFF, 0x00, // Very shinny
        0x00, 0x00, 0x00,       // No light emmission
        0x7F, 0x7F, 0xFF]);     // Normal (0, 0, 1)
    
    if (!defaultTextures) defaultTextures = {};
    if (!defaultTextures.diffuse) defaultTextures.diffuse = frag.Texture(engine)
        .name("default-diffuse-texture")
        .dataFormat(gl.RGBA)
        .fromArrayBuffer(0, defaultTexturePixels.buffer, 0, 1, 1);
    if (!defaultTextures.surface) defaultTextures.surface = frag.Texture(engine)
        .name("default-surface-texture")
        .dataFormat(gl.RGBA)
        .fromArrayBuffer(0, defaultTexturePixels.buffer, 4, 1, 1);
    if (!defaultTextures.emmissive) defaultTextures.emmissive = frag.Texture(engine)
        .name("default-emmissive-texture")
        .dataFormat(gl.RGB)
        .fromArrayBuffer(0, defaultTexturePixels.buffer, 8, 1, 1);
    if (!defaultTextures.normal) defaultTextures.normal = frag.Texture(engine)
        .name("default-normal-map-texture")
        .dataFormat(gl.RGB)
        .fromArrayBuffer(0, defaultTexturePixels.buffer, 11, 1, 1);

    if (!shader) {
        shader = frag.Shader(engine)
            .name("Model")
            .verticiesXYZ()
            .matrix3D()
            .diffuseTexture()
            .directionalLightGrey()
            .compile();
    };

    const private = {
        defaultTextures,
        fonts: {},
        materials: {},
        models: {},
    };

    const public = {
        __private: private,
        shader
    };

    public.dispose = function () {
    }

    public.getFont = function(name) {
        var font = private.fonts[name];
        if (!font) {
            font = frag.Font(engine)
                .name(name)
            private.fonts[name] = font;
        }
        return font;
    }

    public.getMaterial = function(name) {
        var material = private.materials[name];
        if (!material) {
            material = frag.Material(engine)
                .name(name)
                .disposeTextures(false)
                .setTexture("diffuse", private.defaultTextures.diffuse)
                .setTexture("emmissive", private.defaultTextures.emmissive)
                .setTexture("surface", private.defaultTextures.surface)
                .setTexture("normalMap", private.defaultTextures.normal);
            private.materials[name] = material;
        }
        return material;
    }

    public.getModel = function (name, isChild) {
        var model = isChild ? undefined : private.models[name];
        if (!model) {
            model = frag.Model(engine, public.shader.is3d)
                .name(name)
                .shader(public.shader);
            if (!isChild) private.models[name] = model;
        }
        return model;
    }

    return public;
}


/***/ }),

/***/ "./src/Loaders/PackageLoader.js":
/*!**************************************!*\
  !*** ./src/Loaders/PackageLoader.js ***!
  \**************************************/
/***/ (() => {

window.frag.PackageLoader = function (engine) {
    if (engine.packageLoader) return engine.packageLoader;

    const frag = window.frag;

    const uInt32 = new Uint32Array([0x11223344]);
    const uInt8 = new Uint8Array(uInt32.buffer);
    const littleEndian = uInt8[0] === 0x44;

    const round4 = function(n) { return Math.round(n * 10000) / 10000; }

    const private = {
    }

    const public = {
        __private: private,
        littleEndian,
    };

    public.dispose = function () {
    }

    engine.packageLoader = public;

    private.loadFontV1 = function (context, objectIndex, headerOffset) {
        const nameLength = context.header.getUint8(headerOffset++);
        var name = "";
        for (let i = 0; i < nameLength; i++) {
            name += String.fromCharCode(context.header.getUint8(headerOffset++));
        }

        const font = context.assetCatalog.getFont(name);
        if (engine.debugPackageLoader)
            console.log("Object[" + objectIndex + "] is font " + name);

        const faceLength = context.header.getUint8(headerOffset++);
        var fontFace = "";
        for (let i = 0; i < faceLength; i++) {
            fontFace += String.fromCharCode(context.header.getUint8(headerOffset++));
        }

        const lineHeight = context.header.getUint16(headerOffset, littleEndian);
        const width = context.header.getUint16(headerOffset + 2, littleEndian);
        const height = context.header.getUint16(headerOffset + 4, littleEndian);
        const charCount = context.header.getUint16(headerOffset + 6, littleEndian);
        headerOffset += 8;

        if (engine.debugPackageLoader)
            console.log("  " + width + "x" + height + " pixel texture contains " + charCount + " characters from " + lineHeight + "px " + fontFace);

        font.lineHeight(lineHeight);

        for (let charIndex = 0; charIndex < charCount; charIndex++) {
            const charLength = context.header.getUint8(headerOffset++);
            var char = "";
            for (let i = 0; i < charLength; i++) {
                char += String.fromCharCode(context.header.getUint8(headerOffset++));
            }
            const x = context.header.getUint16(headerOffset + 0, littleEndian);
            const y = context.header.getUint16(headerOffset + 2, littleEndian);
            const width = context.header.getUint16(headerOffset + 4, littleEndian);
            const height = context.header.getUint16(headerOffset + 6, littleEndian);
            const originX = context.header.getInt16(headerOffset + 8, littleEndian);
            const originY = context.header.getInt16(headerOffset + 10, littleEndian);
            const advance = context.header.getInt16(headerOffset + 12, littleEndian);
            headerOffset += 14;

            font.addChar(char, x, y, width, height, originX, originY, advance);
        }

        const modeLength = context.header.getUint8(headerOffset++);
        var mode = "";
        for (let i = 0; i < modeLength; i++) {
            mode += String.fromCharCode(context.header.getUint8(headerOffset++));
        }

        if (mode === "RGB") font.dataFormat(engine.gl.RGB);
        else if (mode === "RGBA") font.dataFormat(engine.gl.RGBA);
        else if (mode === "L") font.dataFormat(engine.gl.LUMINANCE);
        else console.error("Font " + name + " unsupported mode " + mode);

        const imageWidth = context.header.getUint16(headerOffset + 0, littleEndian);
        const imageHeight = context.header.getUint16(headerOffset + 2, littleEndian);
        let dataOffset = context.header.getUint32(headerOffset + 4, littleEndian) + context.dataOffset;
        headerOffset += 8;

        if (imageWidth !== width)             
            console.error("Font " + name + " width does not match image width");
        if (imageHeight !== height)             
            console.error("Font " + name + " height does not match image height");

        const dataArray = new Uint8Array(context.data, dataOffset);
        font.fromArrayBuffer(dataArray, 0, width, height);
        return font;
    }

    private.loadMaterialV1 = function (context, objectIndex, headerOffset) {
        const nameLength = context.header.getUint8(headerOffset++);
        var name = "";
        for (let i = 0; i < nameLength; i++) {
            name += String.fromCharCode(context.header.getUint8(headerOffset++));
        }
        const material = context.assetCatalog.getMaterial(name);
        const textureCount = context.header.getUint8(headerOffset++)

        if (engine.debugPackageLoader)
            console.log("Object[" + objectIndex + "] is " + name + " material with " + textureCount + " textures");
            
        for (let i = 0; i < textureCount; i++) {
            const textureTypeLength = context.header.getUint8(headerOffset++);
            var textureType = "";
            for (let i = 0; i < textureTypeLength; i++) {
                textureType += String.fromCharCode(context.header.getUint8(headerOffset++));
            }

            const modeLength = context.header.getUint8(headerOffset++);
            var mode = "";
            for (let i = 0; i < modeLength; i++) {
                mode += String.fromCharCode(context.header.getUint8(headerOffset++));
            }
    
            const texture = frag.Texture(engine);
            if (mode === "RGB") texture.dataFormat(engine.gl.RGB);
            else if (mode === "RGBA") texture.dataFormat(engine.gl.RGBA);
            else if (mode === "L") texture.dataFormat(engine.gl.LUMINANCE);
            else console.error("Texture " + name + " unsupported mode " + mode);
    
            const imageWidth = context.header.getUint16(headerOffset + 0, littleEndian);
            const imageHeight = context.header.getUint16(headerOffset + 2, littleEndian);
            const dataOffset = context.header.getUint32(headerOffset + 4, littleEndian) + context.dataOffset;
            headerOffset += 8;
    
            if (engine.debugPackageLoader)
                console.log("  Texture " + textureType + " is " + imageWidth + "x"  + imageHeight + "px in " + mode + " format");

            const dataArray = new Uint8Array(context.data, dataOffset);
            texture.fromArrayBuffer(0, dataArray, dataOffset, imageWidth, imageHeight);
            material.setTexture(textureType, texture);
        }
        return material;
    }

    private.loadMeshV1 = function (context, objectIndex, headerOffset) {
        const mesh = frag.Mesh(engine);
        const fragmentCount = context.header.getUint16(headerOffset, littleEndian);
        headerOffset += 2;
        if (engine.debugPackageLoader)
            console.log("Object[" + objectIndex + "] is a mesh with " + fragmentCount + " fragments");

        for (let fragmentIndex = 0; fragmentIndex < fragmentCount; fragmentIndex++) {
            const vertexFormat = context.header.getUint8(headerOffset);
            const dataFlags = context.header.getUint8(headerOffset + 1);
            const normalFormat = context.header.getUint8(headerOffset + 2);
            const tangentFormat = context.header.getUint8(headerOffset + 3);
            const bitangentFormat = context.header.getUint8(headerOffset + 4);
            const uvFormat = context.header.getUint8(headerOffset + 5);
            const colorFormat = context.header.getUint8(headerOffset + 6);
            const meshVertexCount = context.header.getUint32(headerOffset + 7, littleEndian);
            const indexVertexCount = context.header.getUint32(headerOffset + 11, littleEndian);
            let dataOffset = context.header.getUint32(headerOffset + 15, littleEndian) + context.dataOffset;
            headerOffset += 19;

            const isIndexed = (dataFlags & 0x01) === 0x01;
            const is3D = (dataFlags & 0x02) === 0x02;

            let triangleCount = 0;
            if (vertexFormat === 1) {
                triangleCount = meshVertexCount / 3;
            }
            else if (vertexFormat === 2) {
                triangleCount = meshVertexCount / 2;
            }
            else if (vertexFormat === 3) {
                triangleCount = meshVertexCount - 2;
            }
            else if (vertexFormat === 4) {
                triangleCount = meshVertexCount - 2;
            };

            if (engine.debugPackageLoader) {
                let msg = "  fragment[" + fragmentIndex + "] has " + meshVertexCount + " verticies forming ";
                if (vertexFormat === 1) {
                    msg += triangleCount + " triangles"
                }
                else if (vertexFormat === 2) {
                    msg += (triangleCount / 2) + " rectangles"
                }
                else if (vertexFormat === 3) {
                    msg += "a strip of " + triangleCount + "triangles"
                }
                else if (vertexFormat === 4) {
                    msg += "a fan of " + triangleCount + " triangles"
                };

                if (isIndexed) msg += " indexed";
                if (!is3D) msg += " in 2D";

                switch (normalFormat) {
                    case 1:
                        msg += " with custom normals";
                        break;
                    case 2:
                        msg += " with indexed normals";
                        break;
                    case 3:
                        msg += " with triangle normals";
                        break;
                }

                switch (tangentFormat) {
                    case 1:
                        msg += " with custom tangents";
                        break;
                    case 2:
                        msg += " with indexed tangents";
                        break;
                    case 3:
                        msg += " with triangle tangents";
                        break;
                    case 4:
                        msg += " with single tangent";
                        break;
                }

                switch (bitangentFormat) {
                    case 1:
                        msg += " with bitangents";
                        break;
                }

                switch (uvFormat) {
                    case 1:
                        msg += " with custom uvs";
                        break;
                    case 2:
                        msg += " with indexed uvs";
                        break;
                    case 3:
                        msg += " with triangle uvs";
                        break;
                }

                switch (colorFormat) {
                    case 1:
                        msg += " with custom colors";
                        break;
                    case 2:
                        msg += " with custom colors and transparency";
                        break;
                    case 3:
                        msg += " with indexed colors";
                        break;
                    case 4:
                        msg += " with indexed colors and transparency";
                        break;
                }

                console.log(msg);
            }

            const index = isIndexed ? [] : undefined;
            if (isIndexed) {
                indexArray = new Int16Array(context.data, dataOffset);
                for (let i = 0; i < meshVertexCount; i++) {
                    index.push(indexArray[i]);
                }
                dataOffset += 2 * meshVertexCount;
                if ((meshVertexCount & 1) == 1) dataOffset += 2;
            }

            const verticies = [];
            const normals = normalFormat === 0 ? undefined : [];
            const tangents = tangentFormat === 0 ? undefined : [];
            const bitangents = bitangentFormat === 0 ? undefined : [];
            const uvs = uvFormat === 0 ? undefined : [];
            const colors = undefined;

            const dataArray = new Float32Array(context.data, dataOffset);

            for (let vertexOffset = 0; vertexOffset < meshVertexCount; vertexOffset++) {
                let indexOffset = isIndexed ? index[vertexOffset] : vertexOffset;

                let triangleOffset = Math.trunc(vertexOffset / 3);
                if (vertexFormat === 2) {
                    triangleOffset = Math.trunc(vertexOffset / 4);
                }
                else if (vertexFormat === 3 || vertexFormat === 4) {
                    if (vertexOffset < 3) triangleOffset = 0;
                    else triangleOffset = vertexOffset - 2;
                }

                let sectionDataIndex = 0;
                let vertexDataIndex = is3D ? indexOffset * 3 : indexOffset * 2;

                verticies.push(dataArray[vertexDataIndex]); // X
                verticies.push(dataArray[vertexDataIndex + 1]); // Y
                if (is3D) {
                    verticies.push(dataArray[vertexDataIndex + 2]); // Z
                    sectionDataIndex += indexVertexCount * 3;
                } else {
                    sectionDataIndex += indexVertexCount * 2;
                }

                switch (normalFormat) {
                    case 1:
                        vertexDataIndex = sectionDataIndex + vertexOffset * 3;
                        sectionDataIndex += meshVertexCount * 3;
                        break;
                    case 2:
                        vertexDataIndex = sectionDataIndex + indexOffset * 3;
                        sectionDataIndex += indexVertexCount * 3;
                        break;
                    case 3:
                        vertexDataIndex = sectionDataIndex + triangleOffset * 3;
                        sectionDataIndex += triangleCount * 3;
                        break;
                }
                if (normalFormat !== 0) {
                    normals.push(dataArray[vertexDataIndex]); // X
                    normals.push(dataArray[vertexDataIndex + 1]); // Y
                    normals.push(dataArray[vertexDataIndex + 2]); // Z
                }

                //if (hasTangents) {
                //    tangents.push(dataArray[vertexDataIndex]); // X
                //    tangents.push(dataArray[vertexDataIndex + 1]); // Y
                //    tangents.push(dataArray[vertexDataIndex + 2]); // Z
                //    vertexDataIndex += indexVertexCount * 3;
                //}

                //if (hasBitangents) {
                //    bitangents.push(dataArray[vertexDataIndex]); // X
                //    bitangents.push(dataArray[vertexDataIndex + 1]); // Y
                //    bitangents.push(dataArray[vertexDataIndex + 2]); // Z
                //    vertexDataIndex += indexVertexCount * 3;
                //}

                //if (hasUvs) {
                //    uvs.push(dataArray[vertexDataIndex]); // U
                //    uvs.push(dataArray[vertexDataIndex + 1]); // V
                //    vertexDataIndex += indexVertexCount * 2;
                //}
            }

            if (engine.debugPackageLoader && engine.debugMeshes) {
                let msg = "  vertices[";
                for (var i = 0; i < verticies.length; i++) {
                    if (i > 0) msg += ', ';
                    msg += round4(verticies[i]);
                }
                msg += "]";
                console.log(msg);
            }

            const vertexData = frag.VertexData(engine);
            if (vertexFormat === 1 || vertexFormat === 2) {
                if (is3D)
                    vertexData.setTriangles(verticies, colors, uvs, normals, tangents, bitangents)
                else
                    vertexData.setTriangles2D(verticies, colors, uvs, normals, tangents, bitangents);
            }
            else if (vertexFormat === 3) vertexData.setTriangleStrip(verticies, colors, uvs, normals, tangents, bitangents);
            else if (vertexFormat === 4) vertexData.setTriangleFan(verticies, colors, uvs, normals, tangents, bitangents);

            mesh.addVertexData(vertexData);
        }

        return mesh;
    }

    private.loadAnimationV1 = function (context, objectIndex, headerOffset) {
        const nameLength = context.header.getUint8(headerOffset++);
        var name = "";
        for (let i = 0; i < nameLength; i++) {
            name += String.fromCharCode(context.header.getUint8(headerOffset++));
        }

        const flags = context.header.getUint8(headerOffset);
        const frames = context.header.getUint16(headerOffset + 1, littleEndian);
        const interval = context.header.getUint16(headerOffset + 3, littleEndian);
        const channelCount = context.header.getUint8(headerOffset + 5);
        headerOffset += 6;

        const loop = (flags & 0x1) === 0x1;
        const reverse = (flags & 0x2) === 0x2;

        if (engine.debugPackageLoader) {
            let msg = "Object[" + objectIndex + "] is '" + name + "' animation which runs for " + frames + "x" + interval + " ms";
            if (loop) msg += ". Repeats until stopped";
            if (reverse) msg += ". Plays in reverse after playing forwards";
            console.log(msg);
        }

        const modelAnimation = frag.ModelAnimation(engine)
            .name(name)
            .loop(loop)
            .frames(frames)
            .interval(interval / engine.gameTickMs);

        for (let i = 0; i < channelCount; i++) {
            const patternLength = context.header.getUint8(headerOffset++);
            var pattern = "";
            for (let i = 0; i < patternLength; i++) {
                pattern += String.fromCharCode(context.header.getUint8(headerOffset++));
            }

            const channelNameLength = context.header.getUint8(headerOffset++);
            var channelName = "";
            for (let i = 0; i < channelNameLength; i++) {
                channelName += String.fromCharCode(context.header.getUint8(headerOffset++));
            }

            if (engine.debugPackageLoader && engine.debugAnimations) {
                msg = "  Channel " + channelName + " applies to " + pattern + " children"
                console.log(msg);
            }

            const keyframes = {};
            const keyframeCount = context.header.getUint16(headerOffset, littleEndian);
            headerOffset += 2;

            for (let j = 0; j < keyframeCount; j++) {
                const frame = context.header.getUint16(headerOffset, littleEndian);
                const transitionEnum = context.header.getUint8(headerOffset + 2);
                const value = context.header.getFloat32(headerOffset + 3, littleEndian);
                headerOffset += 7;

                var transition = "step";
                if (transitionEnum === 1) transition = "linear";
                else if (transitionEnum === 2) transition = "spline";
                keyframes[frame] = { value, transition };

                if (engine.debugPackageLoader && engine.debugAnimations) {
                    msg = "    Keyframe[" + frame + "] = " + round4(value) + " " + transition;
                    console.log(msg);
                }
            }

            modelAnimation.addChannel({
                channel: channelName,
                pattern: new RegExp(pattern, "i"),
                keyframes: keyframes
            });
        }

        return modelAnimation;
    }

    private.loadModelV1 = function (context, objectIndex, headerOffset) {
        const nameLength = context.header.getUint8(headerOffset++);
        var name = "";
        for (let i = 0; i < nameLength; i++) {
            name += String.fromCharCode(context.header.getUint8(headerOffset++));
        }

        const modelFlags = context.header.getUint8(headerOffset);
        const materialIndex = context.header.getUint16(headerOffset + 1, littleEndian);
        const meshIndex = context.header.getUint16(headerOffset + 3, littleEndian);
        headerOffset += 5;

        const location = frag.Location(engine, true); // Loaded models are always 3D
        location.translateX = context.header.getFloat32(headerOffset + 0, littleEndian);
        location.translateY = context.header.getFloat32(headerOffset + 4, littleEndian);
        location.translateZ = context.header.getFloat32(headerOffset + 8, littleEndian);
        location.rotateX = context.header.getFloat32(headerOffset + 12, littleEndian);
        location.rotateY = context.header.getFloat32(headerOffset + 16, littleEndian);
        location.rotateZ = context.header.getFloat32(headerOffset + 20, littleEndian);
        location.scaleX = context.header.getFloat32(headerOffset + 24, littleEndian);
        location.scaleY = context.header.getFloat32(headerOffset + 28, littleEndian);
        location.scaleZ = context.header.getFloat32(headerOffset + 32, littleEndian);
        location.isModified = true;
        headerOffset += 36;

        const childCount = context.header.getUint16(headerOffset, littleEndian);
        const animationCount = context.header.getUint16(headerOffset + 2, littleEndian);
        headerOffset += 4;

        const isRoot = (modelFlags & 1) === 1;
        const hasMaterial = (modelFlags & 2) === 2;
        const hasMesh = (modelFlags & 4) === 4;

        if (engine.debugPackageLoader) {
            console.log("Object[" + objectIndex + "] is " + 
                (isRoot ? "root " : "") + "model " + name + " with " + childCount + " children and " + animationCount + " animations." + 
                (hasMesh ? " Paint mesh " + meshIndex : " No mesh") + (hasMaterial ? " with material " + materialIndex : ". No material"));
            console.log("Object[" + objectIndex + "] at (" + 
                round4(location.translateX) + "," + round4(location.translateY) + "," + round4(location.translateZ) +").["+ 
                round4(location.rotateX) + "," + round4(location.rotateY) + "," + round4(location.rotateZ) + "]x(" + 
                round4(location.scaleX) + "," + round4(location.scaleY) + "," + round4(location.scaleZ) + ")");
        }

        const model = context.assetCatalog.getModel(name, !isRoot);
        model.location = location;

        if (hasMaterial) model.material(context.materials[materialIndex]);
        if (hasMesh) model.mesh(context.meshes[meshIndex]);

        for (let i = 0; i < childCount; i++) {
            const modelIndex = context.header.getUint16(headerOffset, littleEndian);
            headerOffset += 2;
            model.addChild(context.models[modelIndex]);
        }

        if (isRoot) {
            if (engine.debugAnimations && animationCount > 0)
                console.log("Model #" + objectIndex + " '" + name + "' has " + animationCount + " animations");
            for (let i = 0; i < animationCount; i++) {
                const animationIndex = context.header.getUint16(headerOffset, littleEndian);
                headerOffset += 2;

                const animation = context.animations[animationIndex];
                if (engine.debugAnimations) {
                    const channels = animation.getChannelGraphs();
                    console.log("  Animation '" + animation.getName() + "' has " + channels.length + " channels." + (animation.__private.loop ? " Loop " : "") + animation.__private.frames + "x" + animation.__private.interval + " frames");
                    for (let channelIndex = 0; channelIndex < channels.length; channelIndex++) {
                        console.log("    Animates " + channels[channelIndex].channel + " for children matching " + channels[channelIndex].pattern);
                    }
                }
                model.addAnimation(animation);
            }
        } else {
            if (animationCount > 0) console.warn("Model #" + objectIndex + " '" + name + "' has " + animationCount + " animations but is not a root");
        }

        return model;
    };

    public.loadFromBuffer = function(buffer, assetCatalog){
        if (!assetCatalog) assetCatalog = frag.AssetCatalog(engine);

        const bytes = new Uint8Array(buffer);
        const header = new DataView(buffer, 0, bytes.length);

        const version = bytes[0];
        const headerLength = header.getUint32(4, littleEndian);
        var headerOffset = 8;
        const dataOffset = headerOffset + headerLength;

        if (engine.debugPackageLoader)
            console.log("Asset pack V" + version + " is " + bytes.length + " bytes with " + headerLength + " header bytes");

        const context = {
            assetCatalog,
            header,
            data: buffer,
            dataOffset,
            materials: {},
            meshes: {},
            animations: {},
            models: {},
            fonts: {}
        };

        if (version === 1) {
            var objectSize = header.getUint16(headerOffset, littleEndian);
            var expectedObjectIndex = 0;
            while (objectSize !== 0) {
                const objectIndex = header.getUint16(headerOffset + 2, littleEndian);
                const objectType = header.getUint8(headerOffset + 4);
                const objectOffset = headerOffset + 5;

                if (objectIndex !== expectedObjectIndex++) {
                    console.error("Object indexes are not consecutive");
                    return;
                }

                if (objectType === 0) break;

                if (objectType === 1) {
                    context.materials[objectIndex] = private.loadMaterialV1(context, objectIndex, objectOffset);
                }
                else if (objectType === 2) {
                    context.meshes[objectIndex] = private.loadMeshV1(context, objectIndex, objectOffset);
                }
                else if (objectType === 3) {
                    context.animations[objectIndex] = private.loadAnimationV1(context, objectIndex, objectOffset);
                }
                else if (objectType === 4) {
                    context.models[objectIndex] = private.loadModelV1(context, objectIndex, objectOffset);
                }
                else if (objectType === 5) {
                    context.fonts[objectIndex] = private.loadFontV1(context, objectIndex, objectOffset);
                }
                else console.error("Unknown object type " + objectType);

                headerOffset += objectSize;
                objectSize = header.getUint16(headerOffset, littleEndian);
            }
        } else {
            console.error("Version " + version + " asset packs are not supported");
        }
        return assetCatalog
    };

    public.loadFromUrl = function (url, assetCatalog, onload) {
        var xhttp = new XMLHttpRequest();
        xhttp.responseType = "arraybuffer";
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                assetCatalog = public.loadFromBuffer(this.response, assetCatalog);
                if (onload) onload(assetCatalog)
            }
        };
        xhttp.open("GET", url, true);
        xhttp.send();
        return public;
    };

    return public;
};


/***/ }),

/***/ "./src/Materials/Font.js":
/*!*******************************!*\
  !*** ./src/Materials/Font.js ***!
  \*******************************/
/***/ (() => {

window.frag.Font = function (engine, _private, _instance) {
    const frag = window.frag;
    const gl = engine.gl;

    const private = _private || {
        glTexture: null,
        generated: false,
        internalFormat: gl.RGBA,
        format: gl.RGBA,
        dataType: gl.UNSIGNED_BYTE,
        valuesPerPixel: 4,
        chars: {},
        lineHeight: 24,
    }

    const instance = {
        textColor: [0, 0, 0, 1],
        backgroundColor: [0, 0, 0, 1],
        kerning: false,
        letterSpacing: 0,
    }

    if (_instance) {
        instance.textColor = _instance.textColor;
        instance.backgroundColor = _instance.backgroundColor;
        instance.kerning = _instance.kerning;
        instance.letterSpacing = _instance.letterSpacing;
    }

    const public = {
        __private: private,
        textureUnit: engine.allocateTextureUnit()
    };

    public.dispose = function () {
        if (private.glTexture) {
            gl.deleteTexture(private.glTexture);
            private.glTexture = null;
            private.disposed = true;
        }
    }

    public.clone = function () {
        return window.frag.Font(engine, private, instance);
    }

    public.name = function (value) {
        private.name = value;
        return public;
    }

    public.kerning = function (kerning) {
        instance.kerning = kerning;
        return public;
    }

    public.letterSpacing = function (pixels) {
        instance.letterSpacing = pixels;
        return public;
    }

    public.textColor = function(textColor) {
        instance.textColor = textColor;
        return public;
    }

    public.backgroundColor = function(backgroundColor) {
        instance.backgroundColor = backgroundColor;
        return public;
    }

    public.dataFormat = function (format) {
        private.internalFormat = format;
        private.format = format;

        if (format === gl.RGBA) {
            private.dataType = gl.UNSIGNED_BYTE;
            private.valuesPerPixel = 4;
        }
        else if (format === gl.RGB) {
            private.dataType = gl.UNSIGNED_BYTE;
            private.valuesPerPixel = 3;
        }
        else if (format === gl.LUMINANCE_ALPHA) {
            private.dataType = gl.UNSIGNED_BYTE;
            private.valuesPerPixel = 2;
        }
        else if (format === gl.LUMINANCE || formaat === gl.ALPHA) {
            private.dataType = gl.UNSIGNED_BYTE;
            private.valuesPerPixel = 1;
        }

        return public;
    }

    private.setup = function (width, height) {
        private.width = width;
        private.height = height;

        if (!private.glTexture)
            private.glTexture = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, private.glTexture);

        if ((width & (width - 1)) !== 0 || (height & (height - 1)) !== 0) {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            private.generated = true;
        }
    }

    public.lineHeight = function (height) {
        private.lineHeight = height;
        return public;
    }

    public.addChar = function(char, x, y, width, height, originX, originY, advance) {
        private.chars[char] = { x, y, width, height, originX, originY, advance };
        return public;
    }

    public.fromArrayBuffer = function (buffer, offset, width, height) {
        let bufferView;
        if (private.dataType === gl.UNSIGNED_BYTE)
            bufferView = new Uint8Array(buffer, offset, width * height * private.valuesPerPixel);

        private.setup(width, height);
        gl.texImage2D(gl.TEXTURE_2D, 0, private.internalFormat, width, height, 0, private.format, private.dataType, bufferView);

        return public;
    }

    public.fromImage = function (image) {
        const load = function() {
            private.setup(image.width, image.height);
            gl.texImage2D(gl.TEXTURE_2D, 0, private.internalFormat, private.format, private.dataType, image);
        }
        if (image.onload)
            load();
        else
            image.onload = load;
        return public;
    }

    public.apply = function (shader) {
        const gl = engine.gl;
        
        if (shader.uniforms["fgcolor"] !== undefined) {
            gl["uniform" + instance.textColor.length + "fv"](shader.uniforms["fgcolor"], instance.textColor);
        }
        if (shader.uniforms["bgcolor"] !== undefined) {
            gl["uniform" + instance.backgroundColor.length + "fv"](shader.uniforms["bgcolor"], instance.backgroundColor);
        }

        const uniform = shader.uniforms["diffuse"];
        if (!uniform || !private.glTexture)
            return public;
        
        gl.activeTexture(gl.TEXTURE0 + public.textureUnit);
        gl.bindTexture(gl.TEXTURE_2D, private.glTexture);

        if (!private.generated) {
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            private.generated = true;
        }

        gl.uniform1i(uniform, public.textureUnit);
        return public;
    }

    public.buildTextMesh = function (text) {
        const verticies = [];
        const uvs = [];
        const normals = [];

        const pushVerticies = function (left, right, top, bottom) {
            verticies.push(left);
            verticies.push(bottom);
            verticies.push(0);

            verticies.push(right);
            verticies.push(top);
            verticies.push(0);

            verticies.push(left);
            verticies.push(top);
            verticies.push(0);

            verticies.push(left);
            verticies.push(bottom);
            verticies.push(0);

            verticies.push(right);
            verticies.push(bottom);
            verticies.push(0);

            verticies.push(right);
            verticies.push(top);
            verticies.push(0);

            for (let i = 0; i < 6; i++) {
                normals.push(0);
                normals.push(0);
                normals.push(-1);
            }
        }

        const pushTexture = function(left, right, top, bottom) {
            left = left  / private.width;
            right = right  / private.width;
            top = top / private.height;
            bottom = bottom / private.height;

            uvs.push(left);
            uvs.push(bottom);

            uvs.push(right);
            uvs.push(top);

            uvs.push(left);
            uvs.push(top);

            uvs.push(left);
            uvs.push(bottom);

            uvs.push(right);
            uvs.push(bottom);

            uvs.push(right);
            uvs.push(top);
        }

        const drawChar = function (ch, x) {
            dimensions = private.chars[ch];
            if (!dimensions) return x;

            const left = x - dimensions.originX;
            const right = left + dimensions.width;
            const top = dimensions.originY;
            const bottom = top - dimensions.height;

            pushVerticies(left, right, top, bottom);
    
            const texLeft = dimensions.x;
            const texTop = private.height - dimensions.y;
            const texRight = texLeft + dimensions.width;
            const texBottom = texTop - dimensions.height;

            pushTexture(texLeft, texRight, texTop, texBottom);

            let advance = dimensions.advance;
            if (!instance.kerning)
                advance = dimensions.width > dimensions.advance 
                    ? dimensions.width 
                    : dimensions.advance;

            return x + advance + instance.letterSpacing;
        }

        let x = 0;
        for (let i = 0; i < text.length; i++) {
            x = drawChar(text[i], x);
        }

        return frag.Mesh(engine)
            .addTriangles(verticies, undefined, uvs, normals)
            .shadeFlat()
            .textureFlat();
    }

    public.buildTextModel = function(text) {
        const mesh = public.buildTextMesh(text);

        const model = frag.Model(engine, true)
            .shader(frag.FontShader(engine))
            .mesh(mesh)
            .material(public);
        return model;
    }

    public.updateTextModel = function(model, text) {
        const oldMesh = model.getMesh();
        model.mesh(public.buildTextMesh(text));
        oldMesh.dispose();
        return public;
    }

    return public;
};


/***/ }),

/***/ "./src/Materials/Material.js":
/*!***********************************!*\
  !*** ./src/Materials/Material.js ***!
  \***********************************/
/***/ (() => {

window.frag.Material = function (engine) {
    const private = {
        textures: {},
        disposeTextures: false
    }

    const public = {
        __private: private
    };

    public.dispose = function () {
        if (private.disposeTextures) {
            for (let textureType in private.textures) {
                const texture = private.textures[textureType];
                if (texture) texture.dispose();
            }
        }
        private.textures = {};
    };

    public.disposeTextures = function (shouldDispose) {
        private.disposeTextures = shouldDispose;
        return public;
    }

    public.name = function (value) {
        private.name = value;
        return public;
    };

    // The name of the texture type must match the name of a uniform on the shader
    public.setTexture = function (textureType, texture) {
        if (private.disposeTextures) {
            const currentTexture = private.textures[textureType];
            if (currentTexture) currentTexture.dispose();
        }
        private.textures[textureType] = texture;
        return public;
    }

    public.apply = function (shader) {
        for (let textureType in private.textures) {
            const texture = private.textures[textureType];
            if (texture) texture.apply(textureType, shader);
        }
        return public;
    };

    return public;
};


/***/ }),

/***/ "./src/Materials/Texture.js":
/*!**********************************!*\
  !*** ./src/Materials/Texture.js ***!
  \**********************************/
/***/ (() => {

window.frag.Texture = function (engine) {
    const gl = engine.gl;

    const private = {
        glTexture: null,
        generated: false,
        internalFormat: gl.RGBA,
        format: gl.RGBA,
        dataType: gl.UNSIGNED_BYTE,
        valuesPerPixel: 4
    }

    const public = {
        __private: private,
        textureUnit: engine.allocateTextureUnit()
    };

    public.dispose = function () {
        if (private.glTexture) {
            gl.deleteTexture(private.glTexture);
            private.glTexture = null;
            private.disposed = true;
        }
    }

    public.name = function (value) {
        private.name = value;
        return public;
    }

    public.dataFormat = function (format) {
        private.internalFormat = format;
        private.format = format;

        if (format === gl.RGBA) {
            private.dataType = gl.UNSIGNED_BYTE;
            private.valuesPerPixel = 4;
        }
        else if (format === gl.RGB) {
            private.dataType = gl.UNSIGNED_BYTE;
            private.valuesPerPixel = 3;
        }
        else if (format === gl.LUMINANCE_ALPHA) {
            private.dataType = gl.UNSIGNED_BYTE;
            private.valuesPerPixel = 2;
        }
        else if (format === gl.LUMINANCE || formaat === gl.ALPHA) {
            private.dataType = gl.UNSIGNED_BYTE;
            private.valuesPerPixel = 1;
        }

        return public;
    }

    private.setup = function (width, height) {
        private.width = width;
        private.height = height;

        if (!private.glTexture)
            private.glTexture = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, private.glTexture);

        if ((width & (width - 1)) !== 0 || (height & (height - 1)) !== 0) {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            private.generated = true;
        }
    }

    public.fromArrayBuffer = function (level, buffer, offset, width, height) {
        let bufferView;
        if (private.dataType === gl.UNSIGNED_BYTE)
            bufferView = new Uint8Array(buffer, offset, width * height * private.valuesPerPixel);

        private.setup(width, height);
        gl.texImage2D(gl.TEXTURE_2D, level, private.internalFormat, width, height, 0, private.format, private.dataType, bufferView);

        return public;
    }

    public.fromImage = function (level, image) {
        const load = function() {
            private.setup(image.width, image.height);
            gl.texImage2D(gl.TEXTURE_2D, level, private.internalFormat, private.format, private.dataType, image);
        }
        if (image.onload)
            load();
        else
            image.onload = load;
        return public;
    }

    public.fromUrl = function (level, url, crossOrigin) {
        const image = new Image();
        public.fromImage(level, image);
        if (crossOrigin !== undefined)
            image.crossOrigin = crossOrigin;
        image.src = url;
        return public;
    }

    public.update = function (width, height, gameTick) {
        if (!private.scene) return public;
        
        if (width !== undefined && height !== undefined) {
            if (width !== private.width || height !== private.height) {
                public.fromScene(private.scene, width, height);
            }
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, private.frameBuffer);
        gl.viewport(0, 0, private.width, private.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        private.scene.adjustToViewport();
        private.scene.draw(frag.DrawContext(engine).forRender(gameTick));

        return public;
    }

    public.fromScene = function (scene, width, height) {
        const level = 0;

        private.setup(width, height);
        gl.texImage2D(gl.TEXTURE_2D, level, private.internalFormat, width, height, 0, private.format, private.dataType, null);

        private.scene = scene;
        private.frameBuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, private.frameBuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, private.glTexture, level);

        private.depthBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, private.depthBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, private.depthBuffer);

        return public.update(width, height);
    }

    public.apply = function (textureType, shader) {
        const uniform = shader.uniforms[textureType];
        if (!uniform || !private.glTexture)
            return public;
        
        const gl = engine.gl;
        gl.activeTexture(gl.TEXTURE0 + public.textureUnit);
        gl.bindTexture(gl.TEXTURE_2D, private.glTexture);

        if (!private.generated) {
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            private.generated = true;
        }

        gl.uniform1i(uniform, public.textureUnit);
        return public;
    }

    return public;
};


/***/ }),

/***/ "./src/Math/Matrix.js":
/*!****************************!*\
  !*** ./src/Math/Matrix.js ***!
  \****************************/
/***/ (() => {

window.frag = window.frag || {};
window.frag.Matrix = {
    m3Identity: function () {
        return [
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        ];
    },

    m3Invert: function (a) {
        return a; // TODO: http://blog.acipo.com/matrix-inversion-in-javascript/
    },

    m3Transpose: function (a) {
        return [
            a[0], a[3], a[6],
            a[1], a[4], a[7],
            a[2], a[5], a[8],
        ];
    },

    m3Xm3: function (a, b) {
        const a00 = a[0 * 3 + 0];
        const a01 = a[0 * 3 + 1];
        const a02 = a[0 * 3 + 2];
        const a10 = a[1 * 3 + 0];
        const a11 = a[1 * 3 + 1];
        const a12 = a[1 * 3 + 2];
        const a20 = a[2 * 3 + 0];
        const a21 = a[2 * 3 + 1];
        const a22 = a[2 * 3 + 2];

        const b00 = b[0 * 3 + 0];
        const b01 = b[0 * 3 + 1];
        const b02 = b[0 * 3 + 2];
        const b10 = b[1 * 3 + 0];
        const b11 = b[1 * 3 + 1];
        const b12 = b[1 * 3 + 2];
        const b20 = b[2 * 3 + 0];
        const b21 = b[2 * 3 + 1];
        const b22 = b[2 * 3 + 2];
        return [
            b00 * a00 + b01 * a10 + b02 * a20,
            b00 * a01 + b01 * a11 + b02 * a21,
            b00 * a02 + b01 * a12 + b02 * a22,
            b10 * a00 + b11 * a10 + b12 * a20,
            b10 * a01 + b11 * a11 + b12 * a21,
            b10 * a02 + b11 * a12 + b12 * a22,
            b20 * a00 + b21 * a10 + b22 * a20,
            b20 * a01 + b21 * a11 + b22 * a21,
            b20 * a02 + b21 * a12 + b22 * a22,
        ];
    },

    m3Xv3: function (a, b) {
        const a00 = a[0 * 3 + 0];
        const a01 = a[0 * 3 + 1];
        const a02 = a[0 * 3 + 2];
        const a10 = a[1 * 3 + 0];
        const a11 = a[1 * 3 + 1];
        const a12 = a[1 * 3 + 2];
        const a20 = a[2 * 3 + 0];
        const a21 = a[2 * 3 + 1];
        const a22 = a[2 * 3 + 2];

        const b0 = b[0];
        const b1 = b[1];
        const b2 = b[2];

        return [
            b0 * a00 + b1 * a10 + b2 * a20,
            b0 * a01 + b1 * a11 + b2 * a21,
            b0 * a02 + b1 * a12 + b2 * a22,
        ];
    },

    m4Identity: function () {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
    },

    m4Invert: function (m) {
        // TODO: remove the transpose step
        m = window.frag.Matrix.m4Transpose(m);

        const r = [];
        r[0] = m[5]*m[10]*m[15] - m[5]*m[14]*m[11] - m[6]*m[9]*m[15] + m[6]*m[13]*m[11] + m[7]*m[9]*m[14] - m[7]*m[13]*m[10];
        r[1] = -m[4]*m[10]*m[15] + m[4]*m[14]*m[11] + m[6]*m[8]*m[15] - m[6]*m[12]*m[11] - m[7]*m[8]*m[14] + m[7]*m[12]*m[10];
        r[2] = m[4]*m[9]*m[15] - m[4]*m[13]*m[11] - m[5]*m[8]*m[15] + m[5]*m[12]*m[11] + m[7]*m[8]*m[13] - m[7]*m[12]*m[9];
        r[3] = -m[4]*m[9]*m[14] + m[4]*m[13]*m[10] + m[5]*m[8]*m[14] - m[5]*m[12]*m[10] - m[6]*m[8]*m[13] + m[6]*m[12]*m[9];

        r[4] = -m[1]*m[10]*m[15] + m[1]*m[14]*m[11] + m[2]*m[9]*m[15] - m[2]*m[13]*m[11] - m[3]*m[9]*m[14] + m[3]*m[13]*m[10];
        r[5] = m[0]*m[10]*m[15] - m[0]*m[14]*m[11] - m[2]*m[8]*m[15] + m[2]*m[12]*m[11] + m[3]*m[8]*m[14] - m[3]*m[12]*m[10];
        r[6] = -m[0]*m[9]*m[15] + m[0]*m[13]*m[11] + m[1]*m[8]*m[15] - m[1]*m[12]*m[11] - m[3]*m[8]*m[13] + m[3]*m[12]*m[9];
        r[7] = m[0]*m[9]*m[14] - m[0]*m[13]*m[10] - m[1]*m[8]*m[14] + m[1]*m[12]*m[10] + m[2]*m[8]*m[13] - m[2]*m[12]*m[9];

        r[8] = m[1]*m[6]*m[15] - m[1]*m[14]*m[7] - m[2]*m[5]*m[15] + m[2]*m[13]*m[7] + m[3]*m[5]*m[14] - m[3]*m[13]*m[6];
        r[9] = -m[0]*m[6]*m[15] + m[0]*m[14]*m[7] + m[2]*m[4]*m[15] - m[2]*m[12]*m[7] - m[3]*m[4]*m[14] + m[3]*m[12]*m[6];
        r[10] = m[0]*m[5]*m[15] - m[0]*m[13]*m[7] - m[1]*m[4]*m[15] + m[1]*m[12]*m[7] + m[3]*m[4]*m[13] - m[3]*m[12]*m[5];
        r[11] = -m[0]*m[5]*m[14] + m[0]*m[13]*m[6] + m[1]*m[4]*m[14] - m[1]*m[12]*m[6] - m[2]*m[4]*m[13] + m[2]*m[12]*m[5];

        r[12] = -m[1]*m[6]*m[11] + m[1]*m[10]*m[7] + m[2]*m[5]*m[11] - m[2]*m[9]*m[7] - m[3]*m[5]*m[10] + m[3]*m[9]*m[6];
        r[13] = m[0]*m[6]*m[11] - m[0]*m[10]*m[7] - m[2]*m[4]*m[11] + m[2]*m[8]*m[7] + m[3]*m[4]*m[10] - m[3]*m[8]*m[6];
        r[14] = -m[0]*m[5]*m[11] + m[0]*m[9]*m[7] + m[1]*m[4]*m[11] - m[1]*m[8]*m[7] - m[3]*m[4]*m[9] + m[3]*m[8]*m[5];
        r[15] = m[0]*m[5]*m[10] - m[0]*m[9]*m[6] - m[1]*m[4]*m[10] + m[1]*m[8]*m[6] + m[2]*m[4]*m[9] - m[2]*m[8]*m[5];
      
        var det = m[0]*r[0] + m[1]*r[1] + m[2]*r[2] + m[3]*r[3];
        if (det === 0) console.error('Matrix can not be inverted');
        for (var i = 0; i < 16; i++) r[i] /= det;

        return r;
    },

    m4Transpose: function (a) {
        return [
            a[0], a[4], a[8], a[12],
            a[1], a[5], a[9], a[13],
            a[2], a[6], a[10], a[14],
            a[3], a[7], a[11], a[15],
        ];
    },

    m4Xm4: function (a, b) {
        const a00 = a[0 * 4 + 0];
        const a01 = a[0 * 4 + 1];
        const a02 = a[0 * 4 + 2];
        const a03 = a[0 * 4 + 3];
        const a10 = a[1 * 4 + 0];
        const a11 = a[1 * 4 + 1];
        const a12 = a[1 * 4 + 2];
        const a13 = a[1 * 4 + 3];
        const a20 = a[2 * 4 + 0];
        const a21 = a[2 * 4 + 1];
        const a22 = a[2 * 4 + 2];
        const a23 = a[2 * 4 + 3];
        const a30 = a[3 * 4 + 0];
        const a31 = a[3 * 4 + 1];
        const a32 = a[3 * 4 + 2];
        const a33 = a[3 * 4 + 3];

        const b00 = b[0 * 4 + 0];
        const b01 = b[0 * 4 + 1];
        const b02 = b[0 * 4 + 2];
        const b03 = b[0 * 4 + 3];
        const b10 = b[1 * 4 + 0];
        const b11 = b[1 * 4 + 1];
        const b12 = b[1 * 4 + 2];
        const b13 = b[1 * 4 + 3];
        const b20 = b[2 * 4 + 0];
        const b21 = b[2 * 4 + 1];
        const b22 = b[2 * 4 + 2];
        const b23 = b[2 * 4 + 3];
        const b30 = b[3 * 4 + 0];
        const b31 = b[3 * 4 + 1];
        const b32 = b[3 * 4 + 2];
        const b33 = b[3 * 4 + 3];

        return [
            b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
            b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
            b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
            b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
            b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
            b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
            b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
            b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
            b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
            b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
            b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
            b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
            b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
            b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
            b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
            b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
        ];
    },

    m4Xv4: function (m, v) {
        const c0r0 = m[0];
        const c0r1 = m[1];
        const c0r2 = m[2];
        const c0r3 = m[3];
        const c1r0 = m[4];
        const c1r1 = m[5];
        const c1r2 = m[6];
        const c1r3 = m[7];
        const c2r0 = m[8];
        const c2r1 = m[9];
        const c2r2 = m[10];
        const c2r3 = m[11];
        const c3r0 = m[12];
        const c3r1 = m[13];
        const c3r2 = m[14];
        const c3r3 = m[15];

        const b0 = v[0];
        const b1 = v[1];
        const b2 = v[2];
        const b3 = v[3];

        return [
            b0 * c0r0 + b1 * c1r0 + b2 * c2r0 + b3 * c3r0,
            b0 * c0r1 + b1 * c1r1 + b2 * c2r1 + b3 * c3r1,
            b0 * c0r2 + b1 * c1r2 + b2 * c2r2 + b3 * c3r2,
            b0 * c0r3 + b1 * c1r3 + b2 * c2r3 + b3 * c3r3,
        ];
    },

    mult: function (a, b) {
        if (a.length === 9) {
            if (Array.isArray(b)) {
                if (b.length === 9) return frag.Matrix.m3xm3(a, b);
                if (b.length === 3) return frag.Matrix.m3Xv3(a, b);
            }
            console.error('Invalid M3 matrix multiplication operation', a, b);
        } else if (a.length === 16) {
            if (Array.isArray(b)) {
                if (b.length === 16) return frag.Matrix.m4Xm4(a, b);
                if (b.length === 4) return frag.Matrix.m4Xv4(a, b);
            }
            console.error('Invalid M4 matrix multiplication operation', a, b);
        } else {
            console.error('Invalid matrix multiplication operation', a, b);
        }
    },

    perspective: function(fovy, aspect, near, far) {
        var y = Math.tan(fovy) * near;
        var x = y * aspect;
        return window.frag.Matrix.frustum(-x, x, -y, y, near, far);
    },

    frustum: function (l, r, b, t, n, f) {
        const m = [];

        m[0] = 2 * n / (r - l);
        m[1] = 0;
        m[2] = 0;
        m[3] = 0;

        m[4] = 0;
        m[5] = 2 * n / (t - b);
        m[6] = 0;
        m[7] = 0;

        m[8] = 0;
        m[9] = 0;
        m[10] = (f + n) / (f - n);
        m[11] = 1;
      
        m[12] = -n * (r + l) / (r - l);
        m[13] = -n * (t + b) / (t - b);
        m[14] = 2 * f * n / (n - f);
        m[15] = 0;

        return m;
    },

    orthographic: function (l, r, b, t, n, f) {
        const m = [];

        m[0] = 2 / (r - l);
        m[1] = 0;
        m[2] = 0;
        m[3] = 0;

        m[4] = 0;
        m[5] = 2 / (t - b);
        m[6] = 0;
        m[7] = 0;

        m[8] = 0;
        m[9] = 0;
        m[10] = 2 / (f - n);
        m[11] = 0;

        m[12] = -(r + l) / (r - l);
        m[13] = -(t + b) / (t - b);
        m[14] = -(f + n) / (f - n);
        m[15] = 1;

        return m;
    }
}


/***/ }),

/***/ "./src/Math/Quaternion.js":
/*!********************************!*\
  !*** ./src/Math/Quaternion.js ***!
  \********************************/
/***/ (() => {

window.frag = window.frag || {};
window.frag.Quaternion = {
    // Returns a quaternion [x, y, z, w] that rotates around the X-axis
    rotationX: function(angle) {
        return [Math.sin(angle / 2), 0, 0, Math.cos(angle / 2)];
    },
    // Returns a quaternion [x, y, z, w] that rotates around the Y-axis
    rotationY: function(angle) {
        return [0, Math.sin(angle / 2), 0, Math.cos(angle / 2)];
    },
    // Returns a quaternion [x, y, z, w] that rotates around the Z-axis
    rotationZ: function(angle) {
        return [0, 0, Math.sin(angle / 2), Math.cos(angle / 2)];
    },
    // Creates a quaternion [x, y, z, w] which rotates around the given axis by the given angle.
    axisRotation: function(axis, angle) {
        var d = 1 / Math.sqrt(axis[0] * axis[0] +
                              axis[1] * axis[1] +
                              axis[2] * axis[2]);
        var sin = Math.sin(angle / 2);
        var cos = Math.cos(angle / 2);
        return [sin * axis[0] * d, sin * axis[1] * d, sin * axis[2] * d, cos];
    },
    // Returns a unit length quaternion
    normalize: function(q) {
        var d = 1 / Math.sqrt(q[0] * q[0] + q[1] * q[1] + q[2] * q[2] + q[3] * q[3]);
        return [q[0] * d, q[1] * d, q[2] * d, q[3] * d];
    },
    // Computes a 4x4 matrix that performs a Quaternion rotation
    toMatrix: function(q) {
        var qX = q[0];
        var qY = q[1];
        var qZ = q[2];
        var qW = q[3];
      
        var qWqW = qW * qW;
        var qWqX = qW * qX;
        var qWqY = qW * qY;
        var qWqZ = qW * qZ;
        var qXqW = qX * qW;
        var qXqX = qX * qX;
        var qXqY = qX * qY;
        var qXqZ = qX * qZ;
        var qYqW = qY * qW;
        var qYqX = qY * qX;
        var qYqY = qY * qY;
        var qYqZ = qY * qZ;
        var qZqW = qZ * qW;
        var qZqX = qZ * qX;
        var qZqY = qZ * qY;
        var qZqZ = qZ * qZ;
      
        var d = qWqW + qXqX + qYqY + qZqZ;
      
        return [
          [(qWqW + qXqX - qYqY - qZqZ) / d,
           2 * (qWqZ + qXqY) / d,
           2 * (qXqZ - qWqY) / d, 0],
          [2 * (qXqY - qWqZ) / d,
           (qWqW - qXqX + qYqY - qZqZ) / d,
           2 * (qWqX + qYqZ) / d, 0],
          [2 * (qWqY + qXqZ) / d,
           2 * (qYqZ - qWqX) / d,
           (qWqW - qXqX - qYqY + qZqZ) / d, 0],
          [0, 0, 0, 1]];
      },
}


/***/ }),

/***/ "./src/Math/Triangle.js":
/*!******************************!*\
  !*** ./src/Math/Triangle.js ***!
  \******************************/
/***/ (() => {

window.frag = window.frag || {};
window.frag.Triangle = {
    makeTriangleFromVectors: function (a, b, c) {
        return { a, b, c };
    },

    makeTriangleFromArray2D: function (array, offsetA, offsetB, offsetC) {
        if (!array) return null;
        return {
            a: [array[offsetA], array[offsetA + 1]],
            b: [array[offsetB], array[offsetB + 1]],
            c: [array[offsetC], array[offsetC + 1]],
        };
    },

    makeTriangleFromArray3D: function (array, offsetA, offsetB, offsetC) {
        if (!array) return null;
        return {
            a: [array[offsetA], array[offsetA + 1], array[offsetA + 2]],
            b: [array[offsetB], array[offsetB + 1], array[offsetB + 2]],
            c: [array[offsetC], array[offsetC + 1], array[offsetC + 2]],
        };
    },

    normal: function (triangle) {
        const Vector = window.frag.Vector;
        const v1 = Vector.sub(triangle.a, triangle.b);
        const v2 = Vector.sub(triangle.c, triangle.b);
        return Vector.normalize(Vector.cross(v1, v2));
    },
}


/***/ }),

/***/ "./src/Math/Vector.js":
/*!****************************!*\
  !*** ./src/Math/Vector.js ***!
  \****************************/
/***/ (() => {

window.frag = window.frag || {};
window.frag.Vector = {
    extract2D: function (array, offset) {
        if (!array) return null;
        offset = offset || 0;
        return [array[offset], array[offset + 1]];
    },
    extract3D: function (array, offset) {
        if (!array) return null;
        offset = offset || 0;
        return [array[offset], array[offset + 1], array[offset + 2]];
    },
    zero: function (dimensions) {
        const vector = [0, 0, 0, 0, 0];
        vector.length = dimensions;
        return vector;
    },
    add: function (a, b) {
        const result = [];
        if (Array.isArray(b))
            for (let i = 0; i < a.length; i++) result.push(a[i] + b[i]);
        else
            for (let i = 0; i < a.length; i++) result.push(a[i] + b);
        return result;
    },
    sub: function (a, b) {
        const result = [];
        if (Array.isArray(b))
            for (let i = 0; i < a.length; i++) result.push(a[i] - b[i]);
        else
            for (let i = 0; i < a.length; i++) result.push(a[i] - b);
        return result;
    },
    mult: function (a, b) {
        const result = [];
        if (Array.isArray(b))
            for (let i = 0; i < a.length; i++) result.push(a[i] * b[i]);
        else
            for (let i = 0; i < a.length; i++) result.push(a[i] * b);
        return result;
    },
    div: function (a, b) {
        const result = [];
        if (Array.isArray(b))
            for (let i = 0; i < a.length; i++) result.push(a[i] / b[i]);
        else
            for (let i = 0; i < a.length; i++) result.push(a[i] / b);
        return result;
    },
    length: function (a) {
        let sum = 0;
        for (let i = 0; i < a.length; i++) sum += a[i] * a[i];
        return Math.sqrt(sum);
    },
    average: function (a, b) {
        const result = [];
        for (let i = 0; i < a.length; i++) result.push((a[i] + b[i]) * 0.5);
        return result;
    },
    cross: function (a, b) {
        return [
            a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0],
        ];
    },
    dot: function (a, b) {
        let result = 0;
        for (let i = 0; i < a.length; i++)
            result += a[i] * b[i];
        return result;
    },
    normalize: function (a) {
        const length = window.frag.Vector.length(a);
        if (length < 1e-5) return a;

        const result = [];
        for (let i = 0; i < a.length; i++) result.push(a[i] / length);
        return result;
    },
    append: function(a, v) {
        for (let i = 0; i < v.length; i++) a.push(v[i]);
    },
    // Calculates pitch, yaw and roll relative to +Z axis (when Y is up)
    // Imagine that you have a plane flying along the Z-axis in the positive direction
    // and you want to head in a particular direction, this method will calculate
    // how much to rotate the plane by around the x, y and z axes to point in this direction
    // Pitch is a rotation around the x-axis
    // Yaw is a rotation around the y-axis
    // Roll is a rotation around the z-axis
    heading: function(directionVector, upVector) {
        const Vector = window.frag.Vector;
        if (!upVector) upVector = [0, 1, 0];

        const dir = Vector.normalize(directionVector);
        const up = Vector.normalize(upVector);

        const roll = Math.asin(dir[1]);
        const yaw = Math.atan2(dir[0], dir[2]);

        const wingDir = [-dir[2], 0, dir[0]];
        const vertical = Vector.cross(wingDir, dir);
        const pitch = Math.atan2(Vector.dot(wingDir, up), Vector.dot(vertical, up));

        return [pitch, yaw, roll];
    },
    quaternion: function(euler) {
        return window.frag.Vector.quaternionXYZ(
            euler[0],
            euler[1],
            euler[2]
        );
    },
    quaternionXYZ: function(x, y, z) {
        const cr = Math.cos(x * 0.5);
        const sr = Math.sin(x * 0.5);
        const cp = Math.cos(y * 0.5);
        const sp = Math.sin(y * 0.5);
        const cy = Math.cos(z * 0.5);
        const sy = Math.sin(z * 0.5);
    
        const qw = cr * cp * cy + sr * sp * sy;
        const qx = sr * cp * cy - cr * sp * sy;
        const qy = cr * sp * cy + sr * cp * sy;
        const qz = cr * cp * sy - sr * sp * cy;

        return [qx, qy, qz, qw];
    },
    euler: function(quaternion) {
        return window.frag.Vector.eulerXYZW(
            quaternion[0],
            quaternion[1],
            quaternion[2],
            quaternion[3]
        );
    },
    eulerXYZW: function(x, y, z, w) {
        const sinr_cosp = 2 * (w * x + y * z);
        const cosr_cosp = 1 - 2 * (x * x + y * y);
        const pitch = Math.atan2(sinr_cosp, cosr_cosp);
    
        const sinp = 2 * (w * y - z * x);
        const yaw = Math.abs(sinp) >= 1
            ? (Math.PI * (sinp > 0 ? 0.5 : -0.5))
            : Math.asin(sinp);
    
        const siny_cosp = 2 * (w * z + x * y);
        const cosy_cosp = 1 - 2 * (y * y + z * z);
        const roll = Math.atan2(siny_cosp, cosy_cosp);

        return [pitch, yaw, roll];
    }
}


/***/ }),

/***/ "./src/Particles/CustomParticleEmitter.js":
/*!************************************************!*\
  !*** ./src/Particles/CustomParticleEmitter.js ***!
  \************************************************/
/***/ (() => {

window.frag.CustomParticleEmitter = function (engine) {
    const private = {
        name: 'Custom',

        birthRange: 10,
        birthMiddle: 30,

        lifetimeRange: 10,
        lifetimeMiddle: 30,

        xPositionRange: 0,
        xPositionMiddle: 0,
        yPositionRange: 0,
        yPositionMiddle: 0,
        zPositionRange: 0,
        zPositionMiddle: 0,

        xVelocityRange: 10,
        xVelocityMiddle: 5,
        yVelocityRange: 10,
        yVelocityMiddle: 5,
        zVelocityRange: 10,
        zVelocityMiddle: 5,

        xAccelerationRange: 0,
        xAccelerationMiddle: 0,
        yAccelerationRange: 0,
        yAccelerationMiddle: 0,
        zAccelerationRange: 0,
        zAccelerationMiddle: 0,

        xOrientationRange: 0,
        xOrientationMiddle: 0,
        yOrientationRange: 0,
        yOrientationMiddle: 0,
        zOrientationRange: 0,
        zOrientationMiddle: 0,
        wOrientationRange: 0,
        wOrientationMiddle: 0,

        redRange: 1,
        redMiddle: 0.5,
        greenRange: 1,
        greenMiddle: 0.5,
        blueRange: 1,
        blueMiddle: 0.5,
        alphaRange: 0.25,
        alphaMiddle: 0.25,

        startSizeRange: 0.25,
        startSizeMiddle: 0.5,
        sizeIncreaseRange: 0.5,
        sizeIncreaseMiddle: 0.25,

        frameStartRange: 0,
        frameStartMiddle: 0,

        spinStartRange: 0,
        spinStartMiddle: 0,
        spinSpeedRange: 0,
        spinSpeedMiddle: 0,
    };

    const public = {
        __private: private,
    };

    public.dispose = function() {}

    public.name = function(name) {
        private.name = name;
        return public;
    }

    // Random number generator

    private.random = Math.random;

    public.random = function(random) {
        private.random = random;
        return public;
    }

    public.randomValue = function(range, middle, kind) {
        return private.distribution(private.random(), range, middle, kind);
    }

    // Probability distribution

    private.distribution = function(random, range, middle, kind) {
        middle = middle || 0;
        return middle + range * (random - 0.5);
    }

    public.distribution = function(distribution) {
        private.distribution = distribution;
        return public;
    }

    // Lifetime

    private.lifetime = function() {
        return public.randomValue(private.lifetimeRange, private.lifetimeMiddle, 'lifetime');
    }

    public.lifetime = function(lifetime) {
        private.lifetime = lifetime;
        return public;
    }

    public.lifetimeRange = function(min, max) {
        private.lifetimeRange = max - min;
        private.lifetimeMiddle = (max + min) * 0.5;
        return public;
    }

    // Position

    private.position = function() {
        const x = public.randomValue(private.xPositionRange, private.xPositionMiddle, 'position');
        const y = public.randomValue(private.yPositionRange, private.yPositionMiddle, 'position');
        const z = public.randomValue(private.zPositionRange, private.zPositionMiddle, 'position');
        
        return [x, y, z];
    }

    public.position = function(position) {
        private.position = position;
        return public;
    }

    public.positionRange = function(min, max) {
        private.xPositionRange = max[0] - min[0];
        private.xPositionMiddle = (max[0] + min[0]) * 0.5;

        private.yPositionRange = max[1] - min[1];
        private.yPositionMiddle = (max[1] + min[1]) * 0.5;

        private.zPositionRange = max[2] - min[2];
        private.zPositionMiddle = (max[2] + min[2]) * 0.5;

        return public;
    }

    // Velocity

    private.velocity = function() {
        const x = public.randomValue(private.xVelocityRange, private.xVelocityMiddle, 'velocity');
        const y = public.randomValue(private.yVelocityRange, private.yVelocityMiddle, 'velocity');
        const z = public.randomValue(private.zVelocityRange, private.zVelocityMiddle, 'velocity');
        
        return [x, y, z];
    }

    public.velocity = function(velocity) {
        private.velocity = velocity;
        return public;
    }

    public.velocityRange = function(min, max) {
        private.xVelocityRange = max[0] - min[0];
        private.xVelocityMiddle = (max[0] + min[0]) * 0.5;

        private.yVelocityRange = max[1] - min[1];
        private.yVelocityMiddle = (max[1] + min[1]) * 0.5;

        private.zVelocityRange = max[2] - min[2];
        private.zVelocityMiddle = (max[2] + min[2]) * 0.5;

        return public;
    }

    // Acceleration

    private.acceleration = function() {
        const x = public.randomValue(private.xAccelerationRange, private.xAccelerationMiddle, 'acceleration');
        const y = public.randomValue(private.yAccelerationRange, private.yAccelerationMiddle, 'acceleration');
        const z = public.randomValue(private.zAccelerationRange, private.zAccelerationMiddle, 'acceleration');
        
        return [x, y, z];
    }

    public.acceleration = function(acceleration) {
        private.acceleration = acceleration;
        return public;
    }

    public.accelerationRange = function(min, max) {
        private.xAccelerationRange = max[0] - min[0];
        private.xAccelerationMiddle = (max[0] + min[0]) * 0.5;

        private.yAccelerationRange = max[1] - min[1];
        private.yAccelerationMiddle = (max[1] + min[1]) * 0.5;

        private.zAccelerationRange = max[2] - min[2];
        private.zAccelerationMiddle = (max[2] + min[2]) * 0.5;

        return public;
    }

    // Orientation

    private.orientation = function() {
        const x = public.randomValue(private.xOrientationRange, private.xOrientationMiddle, 'orientation');
        const y = public.randomValue(private.yOrientationRange, private.yOrientationMiddle, 'orientation');
        const z = public.randomValue(private.zOrientationRange, private.zOrientationMiddle, 'orientation');
        const w = public.randomValue(private.wOrientationRange, private.wOrientationMiddle, 'orientation');
        
        return [x, y, z, w];
    }

    public.orientation = function(orientation) {
        private.orientation = orientation;
        return public;
    }

    public.orientationRange = function(min, max) {
        private.xOrientationRange = max[0] - min[0];
        private.xOrientationMiddle = (max[0] + min[0]) * 0.5;

        private.yOrientationRange = max[1] - min[1];
        private.yOrientationMiddle = (max[1] + min[1]) * 0.5;

        private.zOrientationRange = max[2] - min[2];
        private.zOrientationMiddle = (max[2] + min[2]) * 0.5;

        private.wOrientationRange = max[3] - min[3];
        private.wOrientationMiddle = (max[3] + min[3]) * 0.5;

        return public;
    }

    // Color

    private.color = function() {
        const red = public.randomValue(private.redRange, private.redMiddle, 'color');
        const green = public.randomValue(private.greenRange, private.greenMiddle, 'color');
        const blue = public.randomValue(private.blueRange, private.blueMiddle, 'color');
        const alpha = public.randomValue(private.alphaRange, private.alphaMiddle, 'aplha');
        
        let scale = 1 / red;
        if (green > red) scale = 1 / green;
        if (blue > red && blue > green) scale = 1 / blue;
        return [red * scale, green * scale, blue * scale, alpha];
    }

    public.color = function(color) {
        private.color = color;
        return public;
    }

    public.colorRange = function(min, max) {
        private.redRange = max[0] - min[0];
        private.redMiddle = (max[0] + min[0]) * 0.5;

        private.greenRange = max[1] - min[1];
        private.greenMiddle = (max[1] + min[1]) * 0.5;

        private.blueRange = max[2] - min[2];
        private.blueMiddle = (max[2] + min[2]) * 0.5;

        private.alphaRange = max[3] - min[3];
        private.alphaMiddle = (max[3] + min[3]) * 0.5;

        return public;
    }

    // Size

    private.startSize = function() {
        return public.randomValue(private.startSizeRange, private.startSizeMiddle, 'size');
    }

    private.endSize = function(startSize) {
        return startSize + public.randomValue(private.sizeIncreaseRange, private.sizeIncreaseMiddle, 'size');
    }

    public.startSize = function(startSize) {
        private.startSize = startSize;
        return public;
    }

    public.startSizeRange = function(startMin, startMax) {
        private.startSizeRange = startMax - startMin;
        private.startSizeMiddle = (startMax + startMin) * 0.5;
        return public;
    }

    public.endSize = function(endSize) {
        private.endSize = endSize;
        return public;
    }

    public.sizeRange = function(startMin, startMax, increaseMin, increaseMax) {
        private.startSizeRange = startMax - startMin;
        private.startSizeMiddle = (startMax + startMin) * 0.5;

        private.sizeIncreaseRange = increaseMax - increaseMin;
        private.sizeIncreaseMiddle = (increaseMax + increaseMin) * 0.5;
        return public;
    }

    // Frame

    private.frameStart = function() {
        return Math.floor(public.randomValue(private.lifetimeRange, private.lifetimeMiddle, 'frame'));
    }

    public.frameStart = function(frameStart) {
        private.frameStart = frameStart;
        return public;
    }

    public.frameStartRange = function(min, max) {
        private.frameStartRange = max - min;
        private.frameStartMiddle = (max + min) * 0.5;
        return public;
    }

    // Spin start

    private.spinStart = function() {
        return public.randomValue(private.spinStartRange, private.spinStartMiddle, 'spin');
    }

    public.spinStart = function(spinStart) {
        private.spinStart = spinStart;
        return public;
    }

    public.spinStartRange = function(startMin, startMax) {
        private.spinStartRange = startMax - startMin;
        private.spinStartMiddle = (startMax + startMin) * 0.5;
        return public;
    }

    // Spin speed

    private.spinSpeed = function() {
        return public.randomValue(private.spinSpeedRange, private.spinSpeedMiddle, 'spin');
    }

    public.spinSpeed = function(spinSpeed) {
        private.spinSpeed = spinSpeed;
        return public;
    }

    public.spinSpeedRange = function(speedMin, speedMax) {
        private.spinSpeedRange = speedMax - speedMin;
        private.spinSpeedMiddle = (speedMax + speedMin) * 0.5;
        return public;
    }

    // Particle birthing

    private.adjust = null;

    public.adjust = function(adjust) {
        private.adjust = adjust;
        return public;
    }

    public.createParticle = function() {
        const particle = {
            lifetime: private.lifetime(),
            position: private.position(),
            velocity: private.velocity(),
            acceleration: private.acceleration(),
            orientation: private.orientation(),
            color: private.color(),
            startSize: private.startSize(),
            frameStart: private.frameStart(),
            spinStart: private.spinStart(),
            spinSpeed: private.spinSpeed(),
        };
        particle.endSize = private.endSize(particle.startSize);
        if (private.adjust) private.adjust(particle);
        return particle;
    }

    private.birthParticle = public.createParticle;

    public.birthParticle = function(birthParticle) {
        private.birthParticle = birthParticle;
        return particle;
    }

    public.birthRate = function(min, max) {
        private.birthRange = max - min;
        private.birthMiddle = (max + min) * 0.5;
        return public;
    }

    public.birthParticles = function() {
        const newParticles = [];
        const count = Math.floor(public.randomValue(private.birthRange, private.birthMiddle, 'rate'));
        for (let i = 0; i < count; i++) {
            newParticles.push(private.birthParticle());
        }
        return newParticles;
    }

    return public;
}


/***/ }),

/***/ "./src/Particles/CustomParticleSystem.js":
/*!***********************************************!*\
  !*** ./src/Particles/CustomParticleSystem.js ***!
  \***********************************************/
/***/ (() => {

window.frag.CustomParticleSystem = function (engine, is3d, shader) {
    if (shader !== undefined) is3d = shader.is3d;
    if (is3d === undefined) is3d = true;

    const frag = window.frag;
    const gl = engine.gl;

    const UV_LIFE_TIME_FRAME_START_IDX = 0;
    const POSITION_START_TIME_IDX = 4;
    const VELOCITY_START_SIZE_IDX = 8;
    const ACCELERATION_END_SIZE_IDX = 12;
    const SPIN_START_SPIN_SPEED_IDX = 16;
    const ORIENTATION_IDX = 20;
    const COLOR_MULT_IDX = 24;
    const LAST_IDX = 28;

    const VERTEX_COUNT_PER_PARTICLE = 4; // 4 corners
    const INDEX_COUNT_PER_PARTICLE = 6;  // 2 triangles
    const EXTRA_PARTICLES_TO_BUFFER = 500;
    const MAX_PARTICLE_COUNT = 65536 / VERTEX_COUNT_PER_PARTICLE;
    
    // Notes:
    // The `particles` array contains references to particle instances. Dead particles have null
    // pointers in the array because we don't want to send all the data to the GPU again just
    // because one particle died.
    // Each particle instance has its own velocity, acceleration etc which is added to the 
    // particle system velocity, acceleration etc.
    // Particles can be freely moved within the `particles` array without re-building the
    // index. The index just creates triangles out of quads but defines how many particle
    // quads will be drawn.
    // The `aliveCount` says how many of the particles in the `particles` array are alive.
    // The rest of the array contains dead particles that can be overwritten with new ones.
    // `bufferedParticleCount` says how many of the particles in the `particles` array are
    // currently in the GPU.
    // `bufferedIndexCount` is the size of the index in the GPU and this is how many particles
    // will get drawn on each refresh. This can include some dead particles which will output
    // no pixels but consume GPU cycles to compute.

    const private = {
        name: "Custom",
        shader: shader || (is3d ? frag.ParticleShader3D(engine) : frag.ParticleShader2D(engine)),
        location: window.frag.Location(engine, is3d),
        lifetimeGameTickInterval: 10,
        nextLifetimeGameTick: 0,
        emitters: {},
        particles: [],
        enabled: true,
        rampTexture: null,
        colorTexture: null,
        particleBuffer: gl.createBuffer(),
        indexBuffer: gl.createBuffer(),
        aliveCount: 0,
        bufferedIndexCount: 0,
        bufferedParticleCount: 0,
        nextEmitterId: 0,
        velocity: [0, 0, 0],
        acceleration: [0, 0, 0],
        timeRange: 99999999,
        timeOffset: 0,
        numFrames: 4,
        frameDuration: 1,
    };

    const public = {
        __private: private,
        parent: null,
    }

    const corners = [
        [-0.5, -0.5],
        [+0.5, -0.5],
        [+0.5, +0.5],
        [-0.5, +0.5]];

    private.rampTexture = frag.Texture(engine)
        .name("particle-ramp-texture")
        .dataFormat(gl.RGBA)
        .fromArrayBuffer(
            0,
            new Uint8Array([
                255, 255, 255, 255, 
                255, 255, 255, 0
            ]), 
            0, 2, 1);

    private.colorTexture = frag.Texture(engine)
        .name("particle-color-texture")
        .dataFormat(gl.RGBA)
        .fromArrayBuffer(
            0, 
            new Uint8Array([255, 255, 255, 255]), 
            0, 1, 1);

    private.checkError = function(description) {
        const error = gl.getError();
        if (error !== 0) 
            console.error(private.name, 'error', error, 'in', description);
    }

    // Copies particle attributes to an array buffer so that it can
    // be uploaded into the GPU. For dead particles pass `null` for
    // the `particle` parameter
    private.populateParticleBuffer = function(particle, buffer, offset) {
        let offset0 = offset;
        let offset1 = offset + 1;
        let offset2 = offset + 2;
        let offset3 = offset + 3;

        if (!particle) {
            buffer.fill(0, offset, offset + LAST_IDX * VERTEX_COUNT_PER_PARTICLE - 1);
            return;
        }

        for (let i = 0; i < VERTEX_COUNT_PER_PARTICLE; i++) {
            buffer[offset0 + UV_LIFE_TIME_FRAME_START_IDX] = corners[i][0];
            buffer[offset1 + UV_LIFE_TIME_FRAME_START_IDX] = corners[i][1];
            buffer[offset2 + UV_LIFE_TIME_FRAME_START_IDX] = particle.lifetime;
            buffer[offset3 + UV_LIFE_TIME_FRAME_START_IDX] = particle.frameStart;

            buffer[offset0 + POSITION_START_TIME_IDX] = particle.position[0];
            buffer[offset1 + POSITION_START_TIME_IDX] = particle.position[1];
            buffer[offset2 + POSITION_START_TIME_IDX] = particle.position[2];
            buffer[offset3 + POSITION_START_TIME_IDX] = particle.startTime;

            buffer[offset0 + VELOCITY_START_SIZE_IDX] = particle.velocity[0];
            buffer[offset1 + VELOCITY_START_SIZE_IDX] = particle.velocity[1];
            buffer[offset2 + VELOCITY_START_SIZE_IDX] = particle.velocity[2];
            buffer[offset3 + VELOCITY_START_SIZE_IDX] = particle.startSize;

            buffer[offset0 + SPIN_START_SPIN_SPEED_IDX] = particle.spinStart;
            buffer[offset1 + SPIN_START_SPIN_SPEED_IDX] = particle.spinSpeed;
            buffer[offset2 + SPIN_START_SPIN_SPEED_IDX] = 0;
            buffer[offset3 + SPIN_START_SPIN_SPEED_IDX] = 0;

            buffer[offset0 + ACCELERATION_END_SIZE_IDX] = particle.acceleration[0];
            buffer[offset1 + ACCELERATION_END_SIZE_IDX] = particle.acceleration[1];
            buffer[offset2 + ACCELERATION_END_SIZE_IDX] = particle.acceleration[2];
            buffer[offset3 + ACCELERATION_END_SIZE_IDX] = particle.endSize;

            buffer[offset0 + ORIENTATION_IDX] = particle.orientation[0];
            buffer[offset1 + ORIENTATION_IDX] = particle.orientation[1];
            buffer[offset2 + ORIENTATION_IDX] = particle.orientation[2];
            buffer[offset3 + ORIENTATION_IDX] = particle.orientation[3];

            buffer[offset0 + COLOR_MULT_IDX] = particle.color[0];
            buffer[offset1 + COLOR_MULT_IDX] = particle.color[1];
            buffer[offset2 + COLOR_MULT_IDX] = particle.color[2];
            buffer[offset3 + COLOR_MULT_IDX] = particle.color[3];

            offset0 += LAST_IDX;
            offset1 += LAST_IDX;
            offset2 += LAST_IDX;
            offset3 += LAST_IDX;
        }
    }

    // Copies a range of particles indexes to the GPU based on their array index
    // Only works if the buffer in the GPU is big enough, ie number of particles 
    // is the same or than bufferedParticleCount. 
    private.bufferParticleRange = function(startIndex, particleCount) {
        if (startIndex >= private.aliveCount) return;
        if (startIndex + particleCount > private.aliveCount)
            particleCount = private.aliveCount - startIndex - 1;

        const particleFloatCount = LAST_IDX * VERTEX_COUNT_PER_PARTICLE;
        const buffer = new Float32Array(particleFloatCount * particleCount);
        let offset = 0;
        for (let i = startIndex; i < startIndex + particleCount; i++) {
            private.populateParticleBuffer(private.particles[i], buffer, offset);
            offset += particleFloatCount;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, private.particleBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, buffer.particleFloatCount * buffer.BYTES_PER_ELEMENT * startIndex, buffer);
        private.checkError('bufferSubData');

        if (engine.debugParticles)
            console.log(private.name, 'copied particles', startIndex, '-', startIndex + particleCount - 1, 'to the GPU');
}

    // Copies a list of changed particles to the GPU based on their array indexes
    // particleIndexes must be sorted from high to low
    private.bufferSpecificParticles = function(particleIndexes) {
        // TODO: if there are small gaps in the ranges it makes sense to combine them
        let rangeStart = 0;
        let rangeCount = 0;
        for (let i = 0; i < particleIndexes.length; i++) {
            const index = particleIndexes[i];
            if (i > 0) {
                const prior = particleIndexes[i - 1];
                if (prior === index) continue;
                if (prior !== index + 1 && rangeCount > 0) {
                    private.bufferParticleRange(rangeStart, rangeCount);
                    rangeCount = 0;
                }
            }
            rangeStart = index;
            rangeCount++;
        }
        if (rangeCount > 0) 
            private.bufferParticleRange(rangeStart, rangeCount);
    }

    // Copies all particles to the GPU. You must do this if the number of alive 
    // particles is bigger than bufferedParticleCount
    private.bufferAllParticles = function() {
        const count = private.aliveCount + EXTRA_PARTICLES_TO_BUFFER;
        while (private.particles.length < count) private.particles.push(null);

        const particleFloatCount = LAST_IDX * VERTEX_COUNT_PER_PARTICLE;
        const buffer = new Float32Array(particleFloatCount * count);
        let offset = 0;
        for (let i = 0; i < count; i++) {
            private.populateParticleBuffer(private.particles[i], buffer, offset);
            offset += particleFloatCount;
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, private.particleBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, buffer, gl.DYNAMIC_DRAW);
        private.checkError('bufferData for particle buffer');

        private.bufferedParticleCount = count;

        if (engine.debugParticles)
            console.log(private.name, 'initialized GPU particle buffer with', count, 'particles');
}

    // Creates an index that maps the 4 corners of each particle onto 2 triangles. This 
    // needs to be done if the number of particles changes at all, but note that the
    // `particles` array contains dead particles and is only resized when needed
    private.bufferIndexes = function() {
        let count = private.particles.length;
        if (count > MAX_PARTICLE_COUNT) count = MAX_PARTICLE_COUNT;
        if (private.bufferedIndexCount >= count) return;

        var indices = new Uint16Array(INDEX_COUNT_PER_PARTICLE * count);
        var idx = 0;
        var vertexStart = 0;
        for (let i = 0; i < count; i++) {
            indices[idx++] = vertexStart + 0;
            indices[idx++] = vertexStart + 1;
            indices[idx++] = vertexStart + 2;
            indices[idx++] = vertexStart + 0;
            indices[idx++] = vertexStart + 2;
            indices[idx++] = vertexStart + 3;
            vertexStart += VERTEX_COUNT_PER_PARTICLE;
        }
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, private.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
        private.checkError('bufferData for index buffer');

        private.bufferedIndexCount = count;

        if (engine.debugParticles)
            console.log(private.name, 'initialized GPU index buffer with', count, 'particle index');
    }

    public.dispose = function () {
        public.disable();
        if (public.parent) public.parent.removeObject(public);
        if (private.particleBuffer) {
            gl.deleteBuffer(private.particleBuffer);
            private.particleBuffer = null;
        }
        if (private.indexBuffer) {
            gl.deleteBuffer(private.indexBuffer);
            private.indexBuffer = null;
        }
        if (private.rampTexture) {
            private.rampTexture.dispose();
            private.rampTexture = null;
        }
        if (private.colorTexture) {
            private.colorTexture.dispose();
            private.colorTexture = null;
        }
    }

    public.name = function (name) {
        private.name = name;
        return public;
    }

    public.getName = function () {
        return private.name;
    }

    public.getPosition = function() {
        if (!private.position) 
            private.position = frag.ScenePosition(engine, private.location);
        return private.position;
    }

    public.enable = function () {
        private.enabled = true;
        return public;
    };

    public.disable = function () {
        private.enabled = false;
        return public;
    };

    public.rampTexture = function(texture) {
        if (private.rampTexture) private.rampTexture.dispose();
        private.rampTexture = texture;
        return public;
    }

    public.colorTexture = function(texture) {
        if (private.colorTexture) private.colorTexture.dispose();
        private.colorTexture = texture;
        return public;
    }

    public.lifetimeGameTickInterval = function(value) {
        private.lifetimeGameTickInterval = value;
        return public;
    }

    public.velocity = function(vector) {
        private.velocity = vector;
        return public;
    }

    public.acceleration = function(vector) {
        private.acceleration = vector;
        return public;
    }

    public.timeRange = function(value) {
        private.timeRange = value;
        return public;
    }

    public.timeOffset = function(value) {
        private.timeOffset = value;
        return public;
    }

    public.numFrames = function(value) {
        private.numFrames = value;
        return public;
    }

    public.frameDuration = function(value) {
        private.frameDuration = value;
        return public;
    }

    public.addEmitter = function(emitter) {
        emitter.id = private.nextEmitterId++;
        private.emitters[emitter.id] = emitter;
        return public;
    }

    public.removeEmitter = function(emitter) {
        if (!private.emitters[emitter.id]) return false;
        delete private.emitters[emitter.id];
        return true;
    }

    private.draw = function(drawContext) {
        const shader = private.shader;
        shader.bind();

        private.rampTexture.apply('rampSampler', shader);
        private.colorTexture.apply('colorSampler', shader);

        if (shader.uniforms.clipMatrix !== undefined) {
            frag.Transform(engine, drawContext.state.modelToClipMatrix)
                .apply(shader.uniforms.clipMatrix);
        }

        if (shader.uniforms.modelMatrix !== undefined) {
            frag.Transform(engine, drawContext.state.modelToWorldMatrix)
                .apply(shader.uniforms.modelMatrix);
        }

        if (shader.uniforms.clipMatrixInverse !== undefined) {
            frag.Transform(engine, frag.Matrix.m4Invert(drawContext.state.modelToClipMatrix))
                .apply(shader.uniforms.clipMatrixInverse);
        }
    
        if (shader.time !== undefined) shader.time(engine.getElapsedSeconds());

        if (shader.velocity !== undefined) shader.velocity(private.velocity);
        if (shader.acceleration !== undefined) shader.acceleration(private.acceleration);
        if (shader.timeRange !== undefined) shader.timeRange(private.timeRange);
        if (shader.timeOffset !== undefined) shader.timeOffset(private.timeOffset);
        if (shader.numFrames !== undefined) shader.numFrames(private.numFrames);
        if (shader.frameDuration !== undefined) shader.frameDuration(private.frameDuration);

        var sizeofFloat = 4;
        var stride = sizeofFloat * LAST_IDX;
        const bindAttribute = function(attribute, offset, unbind) {
            if (attribute >= 0) {
                gl.vertexAttribPointer(attribute, 4, gl.FLOAT, false, stride, sizeofFloat * offset);
                private.checkError('vertexAttribPointer');

                gl.enableVertexAttribArray(attribute);
                private.checkError('enableVertexAttribArray');

                unbind.push(function(){ gl.disableVertexAttribArray(attribute); });
            }
        };

        gl.bindBuffer(gl.ARRAY_BUFFER, private.particleBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, private.indexBuffer);

        const unbind = [];
        bindAttribute(shader.attributes.uvLifeTimeFrameStart, UV_LIFE_TIME_FRAME_START_IDX, unbind);
        bindAttribute(shader.attributes.positionStartTime, POSITION_START_TIME_IDX, unbind);
        bindAttribute(shader.attributes.velocityStartSize, VELOCITY_START_SIZE_IDX, unbind);
        bindAttribute(shader.attributes.accelerationEndSize, ACCELERATION_END_SIZE_IDX, unbind);
        bindAttribute(shader.attributes.spinStartSpinSpeed, SPIN_START_SPIN_SPEED_IDX, unbind);
        bindAttribute(shader.attributes.orientation, ORIENTATION_IDX, unbind);
        bindAttribute(shader.attributes.colorMult, COLOR_MULT_IDX, unbind);

        let drawCount = private.aliveCount;
        if (drawCount > MAX_PARTICLE_COUNT) drawCount = MAX_PARTICLE_COUNT;
        gl.drawElements(gl.TRIANGLES, drawCount * INDEX_COUNT_PER_PARTICLE, gl.UNSIGNED_SHORT, 0);
        private.checkError('drawElements');

        for (let i = 0; i < unbind.length; i++) unbind[i]();
    }


    private.addAndRemoveParticles = function(drawContext) {
        const time = engine.getElapsedSeconds();

        const deadParticleIndexes = [];
        for (let i = 0; i < private.particles.length; i++) {
            const particle = private.particles[i];
            if (!particle) continue;
            if (time > particle.startTime + particle.lifetime) {
                deadParticleIndexes.push(i);
            } else {
                const emitter = private.emitters[particle.id];
                if (emitter && emitter.isDead && emitter.isDead(particle))
                    deadParticleIndexes.push(i);
            }
        }

        if (deadParticleIndexes.length) {
            deadParticleIndexes.sort(function(a, b) { return b - a; });
            for (let i = 0; i < deadParticleIndexes.length; i++) {
                const deadIndex = deadParticleIndexes[i];
                private.aliveCount--;
                private.particles[deadIndex] = private.particles[private.aliveCount];
                private.particles[private.aliveCount] = null;
            }
        }

        let lowWaterMark = private.aliveCount;
        for(var id in private.emitters) {
            const emitter = private.emitters[id];
            const newParticles = emitter.birthParticles(public, time);
            if (newParticles) {
                for (let j = 0; j < newParticles.length; j++) {
                    const particle = newParticles[j];
                    particle.id = id;
                    particle.startTime = time;
                    if (particle.lifetime === undefined) particle.lifetime = 5;
                    if (particle.frameStart === undefined) particle.frameStart = 0;
                    if (particle.spinStart === undefined) particle.spinStart = 0;
                    if (particle.spinSpeed === undefined) particle.spinSpeed = 0;
                    if (particle.startSize === undefined) particle.startSize = 1;
                    if (particle.endSize === undefined) particle.endSize = particle.startSize;
                    if (particle.position === undefined) particle.position = [0, 0, 0];
                    if (particle.velocity === undefined) particle.velocity = [0, 1, 0];
                    if (particle.acceleration === undefined) particle.acceleration = [0, 0, 0];
                    if (particle.orientation === undefined) particle.orientation = [0, 0, 0, 0];
                    if (particle.color === undefined) particle.color = [1, 1, 1, 1];

                    if (private.particles.length > private.aliveCount)
                        private.particles[private.aliveCount] = particle;
                    else
                        private.particles.push(particle);
                    private.aliveCount++;

                    if (private.aliveCount > MAX_PARTICLE_COUNT)
                        console.error(private.name, 'has too many particles');
                }
            }
        }

        if (engine.debugParticles)
            console.log(
                private.name, 'alive=' + private.aliveCount + '/' + private.particles.length, 
                ', GPU particles=' + private.bufferedParticleCount, ', GPU index=' + private.bufferedIndexCount);

        const bufferCount = private.aliveCount + EXTRA_PARTICLES_TO_BUFFER;
        if (true) {
            if (private.particles.length > bufferCount)
                private.particles.length = bufferCount;
            private.bufferAllParticles();
            if (engine.debugParticles)
                console.log(private.name, 'copied all', private.aliveCount, 'alive particles to the GPU');
        } else {}
        private.bufferIndexes();    
        if (engine.debugParticles) console.log('');
    }

    public.draw = function(drawContext) {
        if (drawContext.isHitTest) return public;

        if (drawContext.gameTick >= private.nextLifetimeGameTick) {
            private.addAndRemoveParticles(drawContext);
            private.nextLifetimeGameTick = drawContext.gameTick + private.lifetimeGameTickInterval;
        }

        if (!private.enabled) return public;

        drawContext.beginSceneObject(private.location, {}, {});
        private.draw(drawContext);
        drawContext.endSceneObject();

        return public;
    }
    return public;
}


/***/ }),

/***/ "./src/Particles/MineExplosionEmitter.js":
/*!***********************************************!*\
  !*** ./src/Particles/MineExplosionEmitter.js ***!
  \***********************************************/
/***/ (() => {

window.frag.MineExplosionEmitter = function(engine, position, size) {
    const emitter = window.frag.CustomParticleEmitter(engine)
        .name("Mine")
        .birthRate(100, 100)
        .lifetime(function(){ return 2; })
        .position(function(){ return position; })
        .velocityRange([size * -0.1, size * 0.8, size * -0.1], [size * 0.1, size * 1.2, size * 0.1])
        .acceleration(function(){ return [0, 0, 0]; })
        .startSize(function(){ return 0.5 })
        .endSize(function(){ return 0.5 })
        .frameStart(function(){ return 0; })
        .spinStart(function(){ return 0; })
        .spinSpeed(function(){ return 0; })
        .adjust(function(p){ 
            p.acceleration = [p.velocity[0] * 1.2, 0,  p.velocity[2] * 1.2];
        });

    emitter.fire = function(particleSystem, duration) {
        duration = duration || 500;
        particleSystem.addEmitter(emitter);
        setTimeout(function(){ particleSystem.removeEmitter(emitter) }, duration);
    }

    return emitter;
}

/***/ }),

/***/ "./src/Particles/RainEmitter.js":
/*!**************************************!*\
  !*** ./src/Particles/RainEmitter.js ***!
  \**************************************/
/***/ (() => {

window.frag.RainEmitter = function(engine, position, width, depth, height, velocity, density) {
    const velocityRange = window.frag.Vector.length(velocity) * 0.05;

    const emitter = window.frag.CustomParticleEmitter(engine)
        .name("Rain")
        .birthRate(density * 0.05, density)
        .lifetime(function(){ return height; })
        .position(function(){ 
            return window.frag.Vector.add(position, [emitter.randomValue(width), 0, emitter.randomValue(depth)]); 
        })
        .velocity(function(){
            return window.frag.Vector.mult(velocity, emitter.randomValue(velocityRange, 1));
        })
        .startSize(function(){ return 1.5 })
        .endSize(function(){ return 1.5 })
        .color(function(){ return [0.5, 0.5, 0.5, 0.1]; });

    emitter.stop = function() {
        emitter.particleSystem.removeEmitter(emitter);
    }

    emitter.start = function(particleSystem, duration) {
        emitter.particleSystem = particleSystem;
        particleSystem.addEmitter(emitter);
        if (duration)
            setTimeout(emitter.stop, duration);
    }

    return emitter;
}

/***/ }),

/***/ "./src/Particles/SphericalExplosionEmitter.js":
/*!****************************************************!*\
  !*** ./src/Particles/SphericalExplosionEmitter.js ***!
  \****************************************************/
/***/ (() => {

window.frag.SphericalExplosionEmitter = function(engine, position, size) {
    const emitter = window.frag.CustomParticleEmitter(engine)
        .name("Spherical")
        .lifetime(function(){ return 3; })
        .position(function(){ return position; })
        .acceleration(function(){ return [0, 0, 0]; })
        .startSize(function(){ return 0.5 })
        .endSize(function(){ return 0.5 })
        .frameStart(function(){ return 0; })
        .spinStart(function(){ return 0; })
        .spinSpeed(function(){ return 0; });

    emitter.birthParticles = function() {
        const newParticles = [];
        const latitudeCount = 15;
        const delta = Math.PI / latitudeCount;
        for (let i = 0; i <= latitudeCount; i++) {
            const baseLatitude = Math.PI * (2 * i / latitudeCount - 1);
            const longitudeCount = i <= latitudeCount / 2 ? (i + 1) * 2 : (latitudeCount - i) * 2 ;
            for (let j = 0; j <= longitudeCount; j++) {
                particle = emitter.createParticle();
                newParticles.push(particle);

                const longitude = emitter.randomValue(delta, Math.PI * (2 * j / longitudeCount - 1));
                const latitude = emitter.randomValue(delta, baseLatitude);
                vx = Math.cos(longitude) * Math.sin(latitude) * size;
                vy = Math.cos(latitude) * size;
                vz = Math.sin(longitude) * Math.sin(latitude) * size;
                particle.velocity = [vx, vy, vz];
            }
        };
        return newParticles;
    };

    emitter.fire = function(particleSystem, duration) {
        duration = duration || 150;
        particleSystem.addEmitter(emitter);
        setTimeout(function(){ particleSystem.removeEmitter(emitter) }, duration);
    };

    return emitter;
}

/***/ }),

/***/ "./src/Particles/SprayEmitter.js":
/*!***************************************!*\
  !*** ./src/Particles/SprayEmitter.js ***!
  \***************************************/
/***/ (() => {

window.frag.SprayEmitter = function(engine, position, axis, width) {
    const emitter = window.frag.CustomParticleEmitter(engine)
        .name("Spray")
        .birthRate(25, 25)
        .lifetime(function(){ return 6; })
        .position(function(){ return position; })
        .velocity(function(){
            const velocity = Array.from(axis);
            for (var i = 0; i < 3; i++) {
                if (axis[i] === 0)
                    velocity[i] += emitter.randomValue(width);
                else
                    velocity[i] *= emitter.randomValue(0.5, 1.5);
            }
            return velocity;
        })
        .startSize(function(){ return 0.5 })
        .endSize(function(){ return 1 });

    emitter.stop = function() {
        emitter.particleSystem.removeEmitter(emitter);
    }

    emitter.start = function(particleSystem, duration) {
        emitter.particleSystem = particleSystem;
        particleSystem.addEmitter(emitter);
        if (duration)
            setTimeout(emitter.stop, duration);
    }

    return emitter;
}

/***/ }),

/***/ "./src/SceneGraph/DrawContext.js":
/*!***************************************!*\
  !*** ./src/SceneGraph/DrawContext.js ***!
  \***************************************/
/***/ (() => {

window.frag.DrawContext = function (engine) {
    const private = {
        stack: []
    }

    const public = {
        __private: private,
        shader: null,
        isHitTest: false,
        sceneObjects: null,
        models: null,
        worldToClipTransform: null,
        gameTick: 0,
        state: {
            animationMap: null,
            childMap: null,
            modelToWorldMatrix: null,
            modelToClipMatrix: null
        }
    }

    private.pushState = function() {
        private.stack.push(public.state);
        public.state = Object.assign({}, public.state);
    }

    private.popState = function() {
        public.state = private.stack.pop();
    }

    public.forHitTest = function(shader) {
        public.shader = shader;
        public.sceneObjects = [];
        public.models = [];
        public.isHitTest = true;
        return public;
    }

    public.forRender = function(gameTick) {
        public.gameTick = gameTick;
        return public;
    }

    public.beginScene = function(camera) {
        public.worldToClipTransform = camera.worldToClipTransform;
        return public;
    }

    public.endScene = function() {
        return public;
    }

    public.beginSceneObject = function(location, animationMap, childMap) {
        private.pushState();

        public.state.animationMap = animationMap;
        public.state.childMap = childMap;

        const localMatrix = location.getMatrix();

        if (public.state.modelToWorldMatrix) {
            // This is the case where this SceneObject is parented to another model
            const Matrix = frag.Matrix;
            if (public.worldToClipTransform.is3d) {
                public.state.modelToWorldMatrix = Matrix.m4Xm4(public.state.modelToWorldMatrix, localMatrix);
                public.state.modelToClipMatrix = Matrix.m4Xm4(public.state.modelToClipMatrix, localMatrix);
            } else {
                public.state.modelToWorldMatrix = Matrix.m3Xm3(public.state.modelToWorldMatrix, localMatrix);
                public.state.modelToClipMatrix = Matrix.m3Xm3(public.state.modelToClipMatrix, localMatrix);
            }    
        } else {
            // This is the case where this SceneObject is parented to the scene
            const worldToClipMatrix = public.worldToClipTransform.getMatrix();
            public.state.modelToWorldMatrix = localMatrix;
            public.state.modelToClipMatrix = public.worldToClipTransform.is3d
                ? frag.Matrix.m4Xm4(worldToClipMatrix, localMatrix)
                : frag.Matrix.m3Xm3(worldToClipMatrix, localMatrix);
        }

        return public;
    }

    public.endSceneObject = function() {
        private.popState();
        return public;
    }

    public.beginModel = function(name, location) {
        private.pushState();

        const animationMap = public.state.animationMap;

        const animationState = animationMap && name ? animationMap[name] : null;
        if (animationState) location = location.clone().add(animationState.location);
        const localMatrix = location.getMatrix();

        const Matrix = frag.Matrix;
        if (public.worldToClipTransform.is3d) {
            public.state.modelToWorldMatrix = Matrix.m4Xm4(public.state.modelToWorldMatrix, localMatrix);
            public.state.modelToClipMatrix = Matrix.m4Xm4(public.state.modelToClipMatrix, localMatrix);
        } else {
            public.state.modelToWorldMatrix = Matrix.m3Xm3(public.state.modelToWorldMatrix, localMatrix);
            public.state.modelToClipMatrix = Matrix.m3Xm3(public.state.modelToClipMatrix, localMatrix);
        }
    }

    public.endModel = function() {
        private.popState();
        return public;
    }

    return public;
}


/***/ }),

/***/ "./src/SceneGraph/Mesh.js":
/*!********************************!*\
  !*** ./src/SceneGraph/Mesh.js ***!
  \********************************/
/***/ (() => {

// Represents a collection of mesh fragments where each
// fragment is a collection of triangles
window.frag.Mesh = function (engine) {
    const frag = window.frag;
    const gl = engine.gl;

    const private = {
        glBuffer: gl.createBuffer(),
        meshFragments: [],
        debugFragments: [],
        finalized: false,
        fromBuffer: false,
        smoothShading: true,
        smoothTexture: false,
        wireframe: false,
        normalLength: 0,
        normalColor: [0, 0, 255],
    }

    const public = {
        __private: private,
        calcNormals: true,
        calcTangents: true,
        calcBitangents: false,
    };

    public.dispose = function () {
        if (private.glBuffer) {
            gl.deleteBuffer(private.glBuffer);
            private.glBuffer = null;
        }
    }

    public.name = function (value) {
        private.name = value;
        return public;
    }

    public.clear = function () {
        private.meshFragments.length = 0;
        private.finalized = false;
        return public;
    }

    public.shadeSmooth = function () {
        private.smoothShading = true;
        private.finalized = false;
        return public;
    }

    public.shadeFlat = function () {
        private.smoothShading = false;
        private.finalized = false;
        return public;
    }

    public.textureSmooth = function () {
        private.smoothTexture = true;
        private.finalized = false;
        return public;
    }

    public.textureFlat = function () {
        private.smoothTexture = false;
        private.finalized = false;
        return public;
    }

    public.wireframe = function (drawWireframe) {
        private.wireframe = !!drawWireframe;
        private.finalized = false;
        return public;
    }

    public.drawNormals = function (length, color) {
        private.normalLength = length;
        if (color !== undefined) private.normalColor = color;
        private.finalized = false;
        return public;
    }

    private.Fragment = function(vertexData) {
        return {
            vertexData,
            renderData: null,
            vertexDataOffset: undefined,
            colorDataOffset: undefined,
            uvDataOffset: undefined,
            normalDataOffset: undefined,
            tangentDataOffset: undefined,
            bitangentDataOffset: undefined,
        };
    }

    private.addFragment = function (vertexData) {
        private.meshFragments.push(private.Fragment(vertexData));
        private.finalized = false;
        return public;
    }

    public.addVertexData = function (vertexData) {
        return private.addFragment(vertexData);
    }

    public.addTriangles2D = function (verticies, colors, uvs, normals, tangents, bitangents) {
        const vertexData = frag.VertexData(engine).setTriangles2D(verticies, colors, uvs, normals, tangents, bitangents);
        return private.addFragment(vertexData);
    }

    public.addTriangles = function (verticies, colors, uvs, normals, tangents, bitangents) {
        const vertexData = frag.VertexData(engine).setTriangles(verticies, colors, uvs, normals, tangents, bitangents);
        return private.addFragment(vertexData);
    }

    public.addTriangleStrip = function (verticies, colors, uvs, normals, tangents, bitangents) {
        const vertexData = frag.VertexData(engine).setTriangleStrip(verticies, colors, uvs, normals, tangents, bitangents);
        return private.addFragment(vertexData);
    }

    public.addTriangleFan = function (verticies, colors, uvs, normals, tangents, bitangents) {
        const vertexData = frag.VertexData(engine).setTriangleFan(verticies, colors, uvs, normals, tangents, bitangents);
        return private.addFragment(vertexData);
    }

    public.fromBuffer = function (buffer, size, count, primitiveType, vertexDataOffset, colorDataOffset, uvDataOffset, normalDataOffset, tangentDataOffset, bitangentDataOffset)
    {
        const vertexData = frag.VertexData(engine);
        vertexData.vertexDimensions = size;
        vertexData.vertexCount = count;
        vertexData.primitiveType = primitiveType;
        vertexData.extractTriangles = function () { };

        private.addFragment(vertexData);
        const fragment = private.meshFragments[private.meshFragments.length - 1];

        fragment.renderData = vertexData;
        fragment.vertexDataOffset = vertexDataOffset;
        fragment.colorDataOffset = colorDataOffset;
        fragment.uvDataOffset = uvDataOffset;
        fragment.normalDataOffset = normalDataOffset;
        fragment.tangentDataOffset = tangentDataOffset;
        fragment.bitangentDataOffset = bitangentDataOffset;

        gl.bindBuffer(gl.ARRAY_BUFFER, private.glBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, buffer, gl.STATIC_DRAW);

        private.finalized = true;
        private.fromBuffer = true;

        return public;
    }

    private.addFragmentDebugInfo = function(fragment) {
        if (!private.wireframe && private.normalLength == 0) return;

        let newFragment = fragment;
        if (!private.wireframe) {
            newFragment = private.Fragment(fragment.vertexData)
            private.debugFragments.push(newFragment);
        }

        const verticies = [];
        const colors = [];
        const uvs = [];
        const normals = [];

        const addVertex = function (i) {
            const vertex = fragment.renderData.getVertexVector(i);
            const color = fragment.renderData.getColor(i);
            const uv = fragment.renderData.getUvVector(i);
            const normal = fragment.renderData.getNormalVector(i);
            if (vertex) vertex.forEach(v => verticies.push(v));
            if (color) color.forEach((c) => colors.push(c));
            else private.normalColor.forEach(() => colors.push(0));
            if (uv) uv.forEach(t => uvs.push(t));
            if (normal) normal.forEach(n => normals.push(n));
        };

        const addNormal = function (i) {
            const vertex = fragment.renderData.getVertexVector(i);
            const uv = fragment.renderData.getUvVector(i);
            const normal = fragment.renderData.getNormalVector(i);

            if (vertex) {
                for (let j = 0; j < vertex.length; j++) {
                    verticies.push(vertex[j])
                }
                for (let j = 0; j < vertex.length; j++) {
                    verticies.push(vertex[j] + normal[j] * private.normalLength)
                }
            }

            private.normalColor.forEach((c) => colors.push(c));
            private.normalColor.forEach((c) => colors.push(c));

            if (uv) {
                uv.forEach(t => uvs.push(t));
                uv.forEach(t => uvs.push(t));
            }

            if (normal) {
                normal.forEach(n => normals.push(n));
                normal.forEach(n => normals.push(n));
            }
        };

        fragment.vertexData.extractTriangles(function (a, b, c) {
            if (private.wireframe) {
                addVertex(a); addVertex(b);
                addVertex(b); addVertex(c);
                addVertex(c); addVertex(a);
            }
            if (private.normalLength > 0) {
                addNormal(a);
                addNormal(b);
                addNormal(b);
            }
        });

        if (fragment.vertexData.vertexDimensions == 2)
            newFragment.renderData = frag.VertexData(engine).setLines2D(verticies, colors, uvs, normals);
        else
            newFragment.renderData = frag.VertexData(engine).setLines(verticies, colors, uvs, normals);
    }

    private.finalize = function () {
        private.finalized = true;

        const optimizer = frag.MeshOptimizer(engine)
            .setFragments(private.meshFragments)
            .initialize(private.smoothShading, private.smoothTexture);

        if (public.calcTangents) optimizer.calcTangentsFromUvs();
        if (public.calcBitangents) optimizer.calcBitangentsFromUvs();
        if (public.calcNormals) optimizer.calcNormalsFromCross();
        if (public.calcNormals) optimizer.calcNormalsFromGeometry();
        if (public.calcBitangents) optimizer.calcBitangentsFromCross();

        private.debugFragments = [];
        private.meshFragments.forEach((f) => {
            private.addFragmentDebugInfo(f);
        });

        let length = 0;
        const countFragmentLength = function(fragment){
            length += fragment.renderData.verticies.length;
            if (fragment.renderData.colors) length += fragment.renderData.colors.length;
            if (fragment.renderData.uvs) length += fragment.renderData.uvs.length;
            if (fragment.renderData.normals) length += fragment.renderData.normals.length;
            if (fragment.renderData.tangents) length += fragment.renderData.tangents.length;
            if (fragment.renderData.bitangents) length += fragment.renderData.bitangents.length;
        }
        private.meshFragments.forEach(countFragmentLength);
        private.debugFragments.forEach(countFragmentLength);
        
        const buffer = new Float32Array(length);

        let offset = 0;

        const copy = function (arr) {
            if (!arr) return undefined;

            for (let i = 0; i < arr.length; i++) {
                buffer[offset + i] = arr[i];
            }
            const o = offset;
            offset += arr.length;
            return o * Float32Array.BYTES_PER_ELEMENT;
        };

        const copyFragmentData = function(fragment) {
            fragment.vertexDataOffset = copy(fragment.renderData.verticies);
            fragment.colorDataOffset = copy(fragment.renderData.colors);
            fragment.uvDataOffset = copy(fragment.renderData.uvs);
            fragment.normalDataOffset = copy(fragment.renderData.normals);
            fragment.tangentDataOffset = copy(fragment.renderData.tangents);
            fragment.bitangentDataOffset = copy(fragment.renderData.bitangents);
        };
        private.meshFragments.forEach(copyFragmentData);
        private.debugFragments.forEach(copyFragmentData);

        gl.bindBuffer(gl.ARRAY_BUFFER, private.glBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, buffer, gl.STATIC_DRAW);

        return public;
    }

    private.bindFragmentPosition = function(shader, fragment, unbindFuncs) {
        if (shader.attributes.position >= 0) {
            if (fragment.vertexDataOffset != undefined) {
                gl.vertexAttribPointer(shader.attributes.position, fragment.renderData.vertexDimensions, gl.FLOAT, false, 0, fragment.vertexDataOffset);
                gl.enableVertexAttribArray(shader.attributes.position)
                unbindFuncs.push(function() {gl.disableVertexAttribArray(shader.attributes.position)} );
            }
        }
    }

    private.bindFragmentColor = function(shader, fragment, unbindFuncs) {
        if (shader.attributes.color >= 0) {
            if (fragment.colorDataOffset != undefined) {
                gl.vertexAttribPointer(shader.attributes.color, fragment.renderData.colorDimensions, gl.FLOAT, false, 0, fragment.colorDataOffset);
                gl.enableVertexAttribArray(shader.attributes.color)
                unbindFuncs.push(function() {gl.disableVertexAttribArray(shader.attributes.color)} );
            }
        }
    }

    private.bindFragmentTexture = function(shader, fragment, unbindFuncs) {
        if (shader.attributes.texcoord >= 0) {
            if (fragment.uvDataOffset != undefined) {
                gl.vertexAttribPointer(shader.attributes.texcoord, fragment.renderData.uvDimensions, gl.FLOAT, false, 0, fragment.uvDataOffset);
                gl.enableVertexAttribArray(shader.attributes.texcoord);
                unbindFuncs.push(function() {gl.disableVertexAttribArray(shader.attributes.texcoord)} );
            }
        }
    }

    private.bindFragmentNormals = function(shader, fragment, unbindFuncs) {
        if (shader.attributes.normal >= 0) {
            if (fragment.normalDataOffset != null) {
                gl.vertexAttribPointer(shader.attributes.normal, fragment.renderData.normalDimensions, gl.FLOAT, true, 0, fragment.normalDataOffset);
                gl.enableVertexAttribArray(shader.attributes.normal);
                unbindFuncs.push(function() {gl.disableVertexAttribArray(shader.attributes.normal)} );
            }
        }
    }

    private.bindFragmentTangents = function(shader, fragment, unbindFuncs) {
        if (shader.attributes.tangent >= 0) {
            if (fragment.tangentDataOffset != null) {
                gl.vertexAttribPointer(shader.attributes.tangent, fragment.renderData.normalDimensions, gl.FLOAT, true, 0, fragment.tangentDataOffset);
                gl.enableVertexAttribArray(shader.attributes.tangent);
                unbindFuncs.push(function() {gl.disableVertexAttribArray(shader.attributes.tangent)} );
            }
        }
    }

    private.bindFragmentBitangents = function(shader, fragment, unbindFuncs) {
        if (shader.attributes.bitangent >= 0) {
            if (fragment.bitangentDataOffset != null) {
                gl.vertexAttribPointer(shader.attributes.bitangent, fragment.renderData.normalDimensions, gl.FLOAT, true, 0, fragment.bitangentDataOffset);
                gl.enableVertexAttribArray(shader.attributes.bitangent);
                unbindFuncs.push(function() {gl.disableVertexAttribArray(shader.attributes.bitangent)} );
            }
        }
    }

    private.drawFragment = function(shader, fragment) {
        const unbindFuncs = [];

        private.bindFragmentPosition(shader, fragment, unbindFuncs);
        private.bindFragmentColor(shader, fragment, unbindFuncs);
        private.bindFragmentTexture(shader, fragment, unbindFuncs);
        private.bindFragmentNormals(shader, fragment, unbindFuncs);
        private.bindFragmentTangents(shader, fragment, unbindFuncs);
        private.bindFragmentBitangents(shader, fragment, unbindFuncs);

        gl.drawArrays(fragment.renderData.primitiveType, 0, fragment.renderData.vertexCount);

        for (let i = 0; i < unbindFuncs.length; i++) unbindFuncs[i]();
    }

    public.draw = function (shader) {
        if (!private.finalized && !private.fromBuffer) private.finalize();

        const gl = engine.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, private.glBuffer);

        for (let i = 0; i < private.meshFragments.length; i++) {
            const fragment = private.meshFragments[i];
            private.drawFragment(shader, fragment);
        }

        for (let i = 0; i < private.debugFragments.length; i++) {
            const fragment = private.debugFragments[i];
            private.drawFragment(shader, fragment);
        }

        return public;
    }

    return public;
};


/***/ }),

/***/ "./src/SceneGraph/MeshOptimizer.js":
/*!*****************************************!*\
  !*** ./src/SceneGraph/MeshOptimizer.js ***!
  \*****************************************/
/***/ (() => {

// Applies mesh smoothing and calculates normals and binormals where required
window.frag.MeshOptimizer = function (engine) {
    const frag = window.frag;

    const private = {
        meshFragments: null,
        smoothShading: true,
        smoothTexture: false,
        fragmentTriangles: null,
        groups: null,
        groupIndecies: null,
    }

    const public = {
        __private: private,
    };

    public.dispose = function () {
    }

    private.ensureTriangles = function () {
        if (private.fragmentTriangles) return;

        private.fragmentTriangles = [];

        private.meshFragments.forEach(fragment => {
            const vertexData = fragment.vertexData;
            const fragmentTriangles = {
                triangles: [],
                vertexTriangleIndecies: []
            };
            fragmentTriangles.vertexTriangleIndecies.length = vertexData.vertexCount;
            if (vertexData.verticies) {
                vertexData.extractTriangles(function (a, b, c) {
                    const vectorA = vertexData.getVertexVector(a);
                    const vectorB = vertexData.getVertexVector(b);
                    const vectorC = vertexData.getVertexVector(c);

                    const fragmentTriangle = {
                        triangle: frag.Triangle.makeTriangleFromVectors(vectorA, vectorB, vectorC),
                        normal: null,
                        tangent: null,
                        bitangent: null
                    };
                    fragmentTriangle.normal = frag.Triangle.normal(fragmentTriangle.triangle);

                    if (vertexData.uvs) {
                        const uvA = vertexData.getUvVector(a);
                        const uvB = vertexData.getUvVector(b);
                        const uvC = vertexData.getUvVector(c);

                        const Vector = frag.Vector;
                        const deltaPos1 = Vector.sub(vectorB, vectorA);
                        const deltaPos2 = Vector.sub(vectorC, vectorA);
                        const deltaUv1 = Vector.sub(uvB, uvA);
                        const deltaUv2 = Vector.sub(uvC, uvA);

                        const r = deltaUv1[0] * deltaUv2[1] - deltaUv1[1] * deltaUv2[0];
                        if (r === 0) {
                            fragmentTriangle.tangent = Vector.zero(vertexData.normalDimensions);
                            fragmentTriangle.bitangent = Vector.zero(vertexData.normalDimensions);
                        } else {
                            const ri = 1 / r;
                            fragmentTriangle.tangent = Vector.normalize(Vector.mult(Vector.sub(Vector.mult(deltaPos1, deltaUv2[1]), Vector.mult(deltaPos2, deltaUv1[1])), ri));
                            fragmentTriangle.bitangent = Vector.normalize(Vector.mult(Vector.sub(Vector.mult(deltaPos2, deltaUv1[0]), Vector.mult(deltaPos1, deltaUv2[0])), ri));
                        }
                    }

                    fragmentTriangles.triangles.push(fragmentTriangle);
                    const index = fragmentTriangles.triangles.length - 1;

                    fragmentTriangles.vertexTriangleIndecies[a] = index;
                    fragmentTriangles.vertexTriangleIndecies[b] = index;
                    fragmentTriangles.vertexTriangleIndecies[c] = index;
                });
            }

            private.fragmentTriangles.push(fragmentTriangles);
        });
    }

    private.ensureGroups = function () {
        if (private.groups) return;

        private.groups = [];
        private.groupIndecies = {};

        const equal = function (vertexData, index, vertex) {
            if (vertexData.vertexDimensions !== vertex.length) return false;
            const offset = vertexData.vertexIndex(index);
            for (var i = 0; i < vertex.length; i++)
                if (Math.abs(vertexData.verticies[offset + i] - vertex[i]) > 0.00001) return false;
            return true;
        };

        for (let fragmentIndex = 0; fragmentIndex < private.meshFragments.length; fragmentIndex++) {
            const fragment = private.meshFragments[fragmentIndex];
            const groupIndecies = private.groupIndecies[fragmentIndex] || [];
            private.groupIndecies[fragmentIndex] = groupIndecies;

            if (fragment.vertexData.verticies) {
                for (let vertexIndex = 0; vertexIndex < fragment.vertexData.vertexCount; vertexIndex++) {
                    let found = false;
                    for (var groupIndex = 0; !found && groupIndex < private.groups.length; groupIndex++) {
                        const group = private.groups[groupIndex];
                        if (equal(fragment.vertexData, vertexIndex, group.vertex)) {
                            group.fragmentIndecies[fragmentIndex] = group.fragmentIndecies[fragmentIndex] || [];
                            group.fragmentIndecies[fragmentIndex].push(vertexIndex);
                            groupIndecies.push(groupIndex);
                            found = true;
                        }
                    }
                    if (!found) {
                        groupIndecies.push(private.groups.length);
                        const group = {
                            vertex: fragment.vertexData.getVertexVector(vertexIndex),
                            fragmentIndecies: {},
                            normal: frag.Vector.zero(fragment.vertexData.normalDimensions),
                            uv: frag.Vector.zero(fragment.vertexData.uvDimensions),
                        };
                        group.fragmentIndecies[fragmentIndex] = [vertexIndex];
                        private.groups.push(group);
                    }
                }
            }
        }
    };

    private.calcGroupNormals = function () {
        private.ensureGroups();
        for (let groupIndex = 0; groupIndex < private.groups.length; groupIndex++) {
            const group = private.groups[groupIndex];
            group.normal = frag.Vector.zero(private.meshFragments[0].renderData.normalDimensions);
            for (const fragmentIndex in group.fragmentIndecies) {
                const fragment = private.meshFragments[fragmentIndex];
                const vertexData = fragment.renderData ? fragment.renderData : fragment.vertexData;
                if (vertexData && vertexData.normals) {
                    const fragmentIndecies = group.fragmentIndecies[fragmentIndex];
                    for (let i = 0; i < fragmentIndecies.length; i++) {
                        const vertexIndex = fragmentIndecies[i];
                        const vertexNormal = vertexData.getNormalVector(vertexIndex);
                        group.normal = frag.Vector.add(group.normal, vertexNormal);
                    }
                }
            };
            group.normal = frag.Vector.normalize(group.normal);
        }
    };

    private.calcGroupUvs = function () {
        private.ensureGroups();
        for (let groupIndex = 0; groupIndex < private.groups.length; groupIndex++) {
            const group = private.groups[groupIndex];
            for (const fragmentIndex in group.fragmentIndecies) {
                const fragment = private.meshFragments[fragmentIndex];
                const vertexData = fragment.renderData ? fragment.renderData : fragment.vertexData;
                if (vertexData) {
                    const fragmentIndicies = group.fragmentIndecies[fragmentIndex];
                    if (fragmentIndicies.length > 0) {
                        const vertexIndex = fragmentIndicies[0];
                        group.uv = vertexData.getUvVector(vertexIndex);
                    }
                }
            }
        }
    };

    private.calcSmoothShading = function () {
        for (let fragmentIndex = 0; fragmentIndex < private.meshFragments.length; fragmentIndex++) {
            const fragment = private.meshFragments[fragmentIndex];
            if (!fragment.renderData.normals) return;
        }

        private.calcGroupNormals();

        for (let fragmentIndex = 0; fragmentIndex < private.meshFragments.length; fragmentIndex++) {
            const fragment = private.meshFragments[fragmentIndex];
            const renderData = fragment.renderData;
            const groupIndecies = private.groupIndecies[fragmentIndex];
            if (groupIndecies.length) {
                renderData.normals = [];
                for (var vertexIndex = 0; vertexIndex < renderData.vertexCount; vertexIndex++) {
                    const group = private.groups[groupIndecies[vertexIndex]];
                    for (var i = 0; i < renderData.normalDimensions; i++)
                        renderData.normals.push(group.normal[i]);
                }
            }
        }
    }

    private.calcSmoothTexture = function () {
        private.calcGroupUvs();
        for (let fragmentIndex = 0; fragmentIndex < private.meshFragments.length; fragmentIndex++) {
            const vertexData = private.meshFragments[fragmentIndex].renderData;
            const groupIndecies = private.groupIndecies[fragmentIndex];
            if (groupIndecies.length) {
                vertexData.uvs = [];
                for (var vertexIndex = 0; vertexIndex < vertexData.vertexCount; vertexIndex++) {
                    const group = private.groups[groupIndecies[vertexIndex]];
                    for (var i = 0; i < vertexData.uvDimensions; i++)
                        vertexData.uvs.push(group.uv[i]);
                }
            }
        }
    }

    public.setFragments = function (meshFragments) {
        private.meshFragments = meshFragments;
        return public;
    };

    public.initialize = function (smoothShading, smoothTexture) {
        private.smoothShading = smoothShading;
        private.smoothTexture = smoothTexture;

        private.meshFragments.forEach((fragment) => {
            fragment.renderData = fragment.vertexData.clone();
        });

        if (smoothTexture) {
            private.calcSmoothTexture();
        }
        return public;
    };

    public.calcTangentsFromUvs = function () {
        for (let fragmentIndex = 0; fragmentIndex < private.meshFragments.length; fragmentIndex++) {
            const fragment = private.meshFragments[fragmentIndex];
            const renderData = fragment.renderData;
            const vertexData = fragment.vertexData;
            if (!renderData.tangents) {
                if (vertexData.tangents) {
                    renderData.tangents = [];
                    for (let vertexIndex = 0; vertexIndex < vertexData.vertexCount; vertexIndex++) {
                        for (var i = 0; i < vertexData.normalDimensions; i++) {
                            renderData.tangents.push(vertexData.tangents[vertexData.tangentIndex(vertexIndex, i)]);
                        }
                    }
                } else {
                    if (renderData.uvs) {
                        private.ensureTriangles();
                        const fragmentTriangles = private.fragmentTriangles[fragmentIndex];
                        if (fragmentTriangles && fragmentTriangles.triangles) {
                            renderData.tangents = [];
                            renderData.tangents.length = renderData.normalDimensions * renderData.vertexCount;
                            for (let vertexIndex = 0; vertexIndex < renderData.vertexCount; vertexIndex++) {
                                const triangleIndex = fragmentTriangles.vertexTriangleIndecies[vertexIndex];
                                const triangle = fragmentTriangles.triangles[triangleIndex];
                                if (triangle) {
                                    renderData.setTangentVector(vertexIndex, triangle.tangent);
                                }
                            }
                        }
                    }
                }
            }
        }
        return public;
    };

    public.calcBitangentsFromUvs = function () {
        for (let fragmentIndex = 0; fragmentIndex < private.meshFragments.length; fragmentIndex++) {
            const fragment = private.meshFragments[fragmentIndex];
            const renderData = fragment.renderData;
            const vertexData = fragment.vertexData;
            if (!renderData.bitangents) {
                if (vertexData.bitangents) {
                    renderData.bitangents = [];
                    for (let vertexIndex = 0; vertexIndex < vertexData.vertexCount; vertexIndex++) {
                        for (var i = 0; i < vertexData.normalDimensions; i++) {
                            renderData.bitangents.push(vertexData.bitangents[vertexData.bitangentIndex(vertexIndex, i)]);
                        }
                    }
                } else {
                    if (renderData.uvs) {
                        private.ensureTriangles();
                        const fragmentTriangles = private.fragmentTriangles[fragmentIndex];
                        if (fragmentTriangles && fragmentTriangles.triangles) {
                            renderData.bitangents = [];
                            renderData.bitangents.length = renderData.normalDimensions * renderData.vertexCount;
                            for (let vertexIndex = 0; vertexIndex < renderData.vertexCount; vertexIndex++) {
                                const triangleIndex = fragmentTriangles.vertexTriangleIndecies[vertexIndex];
                                const triangle = fragmentTriangles.triangles[triangleIndex];
                                if (triangle) {
                                    renderData.setBitangentVector(vertexIndex, triangle.bitangent);
                                }
                            }
                        }
                    }
                }
            }
        }
        return public;
    };

    public.calcNormalsFromCross = function () {
        for (let fragmentIndex = 0; fragmentIndex < private.meshFragments.length; fragmentIndex++) {
            const fragment = private.meshFragments[fragmentIndex];
            const renderData = fragment.renderData;
            const vertexData = fragment.vertexData;
            if (!renderData.normals) {
                if (vertexData.normals) {
                    renderData.normals = [];
                    for (let vertexIndex = 0; vertexIndex < vertexData.vertexCount; vertexIndex++) {
                        for (var i = 0; i < vertexData.normalDimensions; i++) {
                            renderData.normals.push(vertexData.normals[vertexData.normalIndex(vertexIndex, i)]);
                        }
                    }
                } else {
                    if (renderData.tangents && renderData.bitangents) {
                        renderData.normals = [];
                        for (let vertexIndex = 0; vertexIndex < vertexData.vertexCount; vertexIndex++) {
                            const tangent = renderData.getTangentVector(vertexIndex);
                            const bitangent = renderData.getBitangentVector(vertexIndex);
                            const normal = frag.Vector.cross(tangent, bitangent);
                            for (var i = 0; i < normal.length; i++) {
                                renderData.normals.push(normal[i]);
                            }
                        }
                    }
                }
            }
        }
        if (private.smoothShading) {
            private.calcSmoothShading();
        }
        return public;
    };

    public.calcNormalsFromGeometry = function () {
        for (let fragmentIndex = 0; fragmentIndex < private.meshFragments.length; fragmentIndex++) {
            const fragment = private.meshFragments[fragmentIndex];
            const renderData = fragment.renderData;
            const vertexData = fragment.vertexData;
            if (!renderData.normals) {
                if (vertexData.normals) {
                    renderData.normals = [];
                    for (let vertexIndex = 0; vertexIndex < vertexData.vertexCount; vertexIndex++) {
                        for (var i = 0; i < vertexData.normalDimensions; i++) {
                            renderData.normals.push(vertexData.normals[vertexData.normalIndex(vertexIndex, i)]);
                        }
                    }
                } else {
                    private.ensureTriangles();
                    const fragmentTriangles = private.fragmentTriangles[fragmentIndex];
                    if (fragmentTriangles && fragmentTriangles.triangles) {
                        renderData.normals = [];
                        renderData.normals.length = renderData.normalDimensions * renderData.vertexCount;
                        for (let vertexIndex = 0; vertexIndex < renderData.vertexCount; vertexIndex++) {
                            const triangleIndex = fragmentTriangles.vertexTriangleIndecies[vertexIndex];
                            const triangle = fragmentTriangles.triangles[triangleIndex];
                            if (triangle) renderData.setNormalVector(vertexIndex, triangle.normal);
                        }
                    }
                }
            }
        }
        if (private.smoothShading) {
            private.calcSmoothShading();
        }
        return public;
    };

    public.calcBitangentsFromCross = function () {
        for (let fragmentIndex = 0; fragmentIndex < private.meshFragments.length; fragmentIndex++) {
            const fragment = private.meshFragments[fragmentIndex];
            const renderData = fragment.renderData;
            const vertexData = fragment.vertexData;
            if (!renderData.bitangents) {
                if (vertexData.bitangents) {
                    renderData.bitangents = [];
                    for (let vertexIndex = 0; vertexIndex < vertexData.vertexCount; vertexIndex++) {
                        for (var i = 0; i < vertexData.normalDimensions; i++) {
                            renderData.bitangents.push(vertexData.bitangents[vertexData.bitangentIndex(vertexIndex, i)]);
                        }
                    }
                } else {
                    if (renderData.tangents && renderData.normals) {
                        renderData.bitangents = [];
                        for (let vertexIndex = 0; vertexIndex < vertexData.vertexCount; vertexIndex++) {
                            const normal = renderData.getNormalVector(vertexIndex);
                            const tangent = renderData.getTangentVector(vertexIndex);
                            const bitangent = frag.Vector.cross(normal, tangent);
                            for (var i = 0; i < bitangent.length; i++) {
                                renderData.bitangents.push(bitangent[i]);
                            }
                        }
                    }
                }
            }
        }
        return public;
    };

    return public;
};


/***/ }),

/***/ "./src/SceneGraph/Model.js":
/*!*********************************!*\
  !*** ./src/SceneGraph/Model.js ***!
  \*********************************/
/***/ (() => {

window.frag.Model = function (engine, is3d, parent) {
    const frag = window.frag;

    if (is3d === undefined) {
        if (parent && parent.location)
            is3d = parent.location.is3d;
        else
            is3d = true;
    }

    const private = {
        name: null,
        parent,
        children: [],
        mesh: null,
        shader: null,
        material: null,
        enabled: true
    }

    const public = {
        __private: private,
        location: frag.Location(engine, is3d),
        animations: []
    };

    public.dispose = function(){
    }

    public.addFlattenedChildren = function (flattenedChildren, predicate) {
        for (let i = 0; i < private.children.length; i++) {
            let child = private.children[i];
            if (predicate(child)) flattenedChildren.push(child);
            child.addFlattenedChildren(flattenedChildren, predicate);
        }
    }

    public.getPosition = function() {
        return frag.ScenePosition(engine, public.location);
    }

    public.name = function (value) {
        private.name = value;
        return public;
    }

    public.getName = function () {
        return private.name;
    }

    public.shader = function (value) {
        if (value.is3d !== public.location.is3d){
            const m = public.location.is3d ? "3D" : "2D";
            console.error("Model '" + private.name + "' has a " + m + " location and must use a " + m + " shader");
        }
        private.shader = value;
        return public;
    }

    public.getShader = function () {
        if (private.shader) return private.shader;
        if (private.parent) return private.parent.getShader();
        return undefined;
    }

    public.mesh = function (value) {
        private.mesh = value;
        return public;
    }

    public.getMesh = function() {
        return private.mesh;
    }

    public.material = function (value) {
        private.material = value;
        return public;
    }

    public.enable = function() {
        private.enabled = true;
    }

    public.disable = function() {
        private.enabled = false;
    }

    public.getMaterial = function () {
        if (private.material) return private.material;
        if (private.parent) return private.parent.getMaterial();
        return undefined;
    }

    public.addChild = function (child) {
        if (child) {
            child.__private.parent = public;
        } else {
            child = window.frag.Model(engine, undefined, public);
        }
        private.children.push(child);
        return child;
    }

    public.shadeSmooth = function (depth) {
        if (depth === undefined) depth = -1;
        if (private.mesh) private.mesh.shadeSmooth();
        
        if (depth === 0) return public;
        private.children.forEach((c) => { c.shadeSmooth(depth-1); });
        return public;
    }

    public.shadeFlat = function (depth) {
        if (depth === undefined) depth = -1;
        if (private.mesh) private.mesh.shadeFlat();
        
        if (depth === 0) return public;
        private.children.forEach((c) => { c.shadeFlat(depth-1); });
        return public;
    }

    public.textureSmooth = function (depth) {
        if (depth === undefined) depth = -1;
        if (private.mesh) private.mesh.textureSmooth();
        
        if (depth === 0) return public;
        private.children.forEach((c) => { c.textureSmooth(depth-1); });
        return public;
    }

    public.textureFlat = function (depth) {
        if (depth === undefined) depth = -1;
        if (private.mesh) private.mesh.textureFlat();
        
        if (depth === 0) return public;
        private.children.forEach((c) => { c.textureFlat(depth-1); });
        return public;
    }

    public.wireframe = function (drawWireframe, depth) {
        if (depth === undefined) depth = -1;
        if (private.mesh) private.mesh.wireframe(drawWireframe);
        
        if (depth === 0) return public;
        private.children.forEach((c) => { c.wireframe(drawWireframe, depth-1); });
        return public;
    }

    public.drawNormals = function(length, color, depth) {
        if (depth === undefined) depth = -1;
        if (private.mesh) private.mesh.drawNormals(length, color);

        if (depth === 0) return public;
        private.children.forEach((c) => { c.drawNormals(length, color, depth-1); });
        return public;
    }

    public.addAnimation = function (modelAnimation) {
        const children = [];
        public.addFlattenedChildren(children, function (child) { return child.getName(); });

        const childAnimations = [];
        const graphs = modelAnimation.getChannelGraphs();
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            const childName = child.getName();
            for (let j = 0; j < graphs.length; j++) {
                const graph = graphs[j];
                if (graph.pattern.test(childName)) {
                    childAnimations.push({
                        graph: graph,
                        model: child
                    });
                }
            }
        }

        if (childAnimations.length > 0)
            public.animations.push({ modelAnimation, childAnimations });

        return public;
    }

    public.draw = function (drawContext) {
        if (!public.location) return public;
        drawContext.beginModel(private.name, public.location);

        const shader = drawContext.shader || public.getShader();

        if (shader !== undefined && private.mesh && private.enabled) {
            shader.bind();

            if (drawContext.isHitTest && shader.uniforms.color !== undefined) {
                const sceneObjectId = drawContext.sceneObjects.length - 1;
                const modelId = drawContext.models.length;
                drawContext.models.push(public);

                const red = sceneObjectId >> 4;
                const green = ((sceneObjectId & 0x0f) << 4) | ((modelId & 0xf0000) >> 16);
                const blue = (modelId & 0xff00) >> 8;
                const alpha = modelId & 0xff;
                engine.gl.uniform4f(shader.uniforms.color, red / 255, green / 255, blue / 255, alpha / 255);
            }

            var material = public.getMaterial();
            if (material) material.apply(shader);

            if (shader.uniforms.clipMatrix !== undefined) {
                frag.Transform(engine, drawContext.state.modelToClipMatrix)
                    .apply(shader.uniforms.clipMatrix);
            }

            if (shader.uniforms.modelMatrix !== undefined) {
                frag.Transform(engine, drawContext.state.modelToWorldMatrix)
                    .apply(shader.uniforms.modelMatrix);
            }

            private.mesh.draw(shader);

            shader.unbind();
        }

        for (let i = 0; i < private.children.length; i++)
            private.children[i].draw(drawContext);

        const childMap = drawContext.state.childMap;
        const sceneObjects = parent 
            ? (childMap && private.name ? childMap[private.name] : undefined)
            : (childMap ? childMap['.'] : undefined);

        if (sceneObjects) {
            for (let i = 0; i < sceneObjects.length; i++)
                sceneObjects[i].draw(drawContext);
        }

        drawContext.endModel();
        return public;
    }

    return public;
};


/***/ }),

/***/ "./src/SceneGraph/PositionLink.js":
/*!****************************************!*\
  !*** ./src/SceneGraph/PositionLink.js ***!
  \****************************************/
/***/ (() => {

window.frag.PositionLink = function(engine) {
    const private = {
        source: null,
        dest: null,
        locationOffset: null,
        scaleOffset: null,
        rotationOffset: null,
        lookAtOffset: null,
    };

    const public = {
        __private: private,
    };

    public.dispose = function() {
        if (private.source) {
            private.source.observableLocation.unsubscribe(private.sourceChanged);
        }
    }

    private.sourceChanged = function(location) {
        if (!private.dest) return;

        if (private.locationOffset) {
            if (private.locationOffset[0] !== undefined && 
                private.locationOffset[1] !== undefined && 
                private.locationOffset[2] !== undefined) {
                private.dest.locationXYZ(
                    location.translateX + private.locationOffset[0],
                    location.translateY + private.locationOffset[1],
                    location.translateZ + private.locationOffset[2]);

            } else {
                if (private.locationOffset[0] !== undefined)
                    private.dest.locationX(location.translateX + private.locationOffset[0]);
                if (private.locationOffset[1] !== undefined)
                    private.dest.locationY(location.translateY + private.locationOffset[1]);
                if (private.locationOffset[2] !== undefined)
                    private.dest.locationZ(location.translateZ + private.locationOffset[2]);
            }
        }
        if (private.scaleOffset) {
            if (private.scaleOffset[0] !== undefined && 
                private.scaleOffset[1] !== undefined && 
                private.scaleOffset[2] !== undefined) {
                private.dest.scaleXYZ(
                    location.scaleX + private.scaleOffset[0],
                    location.scaleY + private.scaleOffset[1],
                    location.scaleZ + private.scaleOffset[2]);

            } else {
                if (private.scaleOffset[0] !== undefined)
                    private.dest.scaleX(location.scaleX * private.scaleOffset[0]);
                if (private.scaleOffset[1] !== undefined)
                    private.dest.scaleY(location.scaleY * private.scaleOffset[1]);
                if (private.scaleOffset[2] !== undefined)
                    private.dest.scaleZ(location.scaleZ * private.scaleOffset[2]);
            }
        }
        if (private.lookAtOffset) {
            const sourceLocation = private.source.getLocation();
            const destLocation =  private.dest.getLocation();
            const heading = window.frag.Vector.heading(window.frag.Vector.sub(sourceLocation, destLocation));
            if (private.lookAtOffset[0] !== undefined && 
                private.lookAtOffset[1] !== undefined && 
                private.lookAtOffset[2] !== undefined) {
                private.dest.rotateXYZ(
                    heading[0] + private.lookAtOffset[0],
                    heading[1] + private.lookAtOffset[1],
                    heading[2] + private.lookAtOffset[2]);

            } else {
                if (private.lookAtOffset[0] !== undefined)
                    private.dest.rotateX(heading[0] + private.lookAtOffset[0]);
                if (private.lookAtOffset[1] !== undefined)
                    private.dest.rotateY(heading[1] + private.lookAtOffset[1]);
                if (private.lookAtOffset[2] !== undefined)
                    private.dest.rotateZ(heading[2] + private.lookAtOffset[2]);
            }
        }
        if (private.rotationOffset) {
            if (private.rotationOffset[0] !== undefined && 
                private.rotationOffset[1] !== undefined && 
                private.rotationOffset[2] !== undefined) {
                private.dest.rotateXYZ(
                    location.rotateX + private.rotationOffset[0],
                    location.rotateY + private.rotationOffset[1],
                    location.rotateZ + private.rotationOffset[2]);

            } else {
                if (private.rotationOffset[0] !== undefined)
                    private.dest.rotateX(location.rotateX + private.rotationOffset[0]);
                if (private.rotationOffset[1] !== undefined)
                    private.dest.rotateY(location.rotateY + private.rotationOffset[1]);
                if (private.rotationOffset[2] !== undefined)
                    private.dest.rotateZ(location.rotateZ + private.rotationOffset[2]);
            }
        }
    }

    public.source = function(scenePosition) {
        if (private.source) {
            private.source.observableLocation.unsubscribe(private.sourceChanged);
        }
        
        if (scenePosition && scenePosition.getPosition)
            scenePosition = scenePosition.getPosition();

        private.source = scenePosition;
        if (scenePosition) {
            scenePosition.observableLocation.subscribe(private.sourceChanged);
        }
        return public
    }

    public.dest = function(scenePosition) {
        if (scenePosition && scenePosition.getPosition)
            scenePosition = scenePosition.getPosition();
        private.dest = scenePosition;
        return public
    }

    public.locationOffset = function(offset) {
        private.locationOffset = offset;
        return public
    }

    public.scaleOffset = function(offset) {
        private.scaleOffset = offset;
        return public
    }

    public.rotationOffset = function(offset) {
        private.rotationOffset = offset;
        return public
    }

    public.lookAtOffset = function(offset) {
        private.lookAtOffset = offset;
        return public
    }

    return public;
}

/***/ }),

/***/ "./src/SceneGraph/Scene.js":
/*!*********************************!*\
  !*** ./src/SceneGraph/Scene.js ***!
  \*********************************/
/***/ (() => {

// A public is a camera and a collection of meshes. The camera defines how the
// meshes will be projected onto the viewport. Several scenes can be projecterd onto
// the same viewport, but only one of these scenes should set the viewport and the rest
// should adjust to the viewport.

window.frag.Scene = function(engine) {
    const private = {
        sceneObjects: [],
        camera: null
    }

    const public = {
        __private: private
    };

    public.dispose = function() {
    }

    public.addObject = function(sceneObject) {
        if (sceneObject.parent) 
            sceneObject.parent.removeObject(sceneObject);
        sceneObject.parent = public;
        private.sceneObjects.push(sceneObject);
        return public;
    };

    public.removeObject = function(sceneObject) {
        for (let i = 0; i < private.sceneObjects.length; i++) {
            if (private.sceneObjects[i] === sceneObject) {
                private.sceneObjects.splice(i, 1);
                sceneObject.parent = null;
                return true;
            }
        }
        return false;
    }

    public.camera = function(camera) {
        private.camera = camera;
        return public;
    }

    public.getCamera = function() {
        return private.camera;
    }

    public.setViewport = function () {
        if (private.camera)
            private.camera.setViewport();
        return public;
    }

    public.adjustToViewport = function () {
        if (private.camera)
            private.camera.adjustToViewport();
        return public;
    }

    public.draw = function (drawContext) {
        if (!private.camera || !private.sceneObjects) return public;

        drawContext.beginScene(private.camera);

        for (let i = 0; i < private.sceneObjects.length; i++)
            private.sceneObjects[i].draw(drawContext);

        drawContext.endScene();
        return public;
    }

    return public;
};

/***/ }),

/***/ "./src/SceneGraph/SceneObject.js":
/*!***************************************!*\
  !*** ./src/SceneGraph/SceneObject.js ***!
  \***************************************/
/***/ (() => {

window.frag.SceneObject = function (engine, model) {
    const frag = window.frag;

    const private = {
        model,
        enabled: true,
        location: null,
        animationLocation: null,
        position: null,
        animationPosition: null,
        animationMap: {},
        childMap: {},
    };

    const public = {
        __private: private,
        animations: {},
        parent: null,
    };

    if (model) {
        for (let i = 0; i < model.animations.length; i++) {
            const animation = model.animations[i];
            for (let j = 0; j < animation.childAnimations.length; j++) {
                const childModelName = animation.childAnimations[j].model.getName();
                if (!private.animationMap[childModelName]) {
                    const animationState = window.frag.ObjectAnimationState(engine);
                    if (engine.debugAnimations) {
                        animationState.__private.modelName = model.getName();
                        animationState.__private.childModelName = childModelName;
                    }
                    private.animationMap[childModelName] = animationState;
                }
            }
            const objectAnimation = window.frag.SceneObjectAnimation(engine, animation, private.animationMap);
            public.animations[animation.modelAnimation.getName()] = objectAnimation;
        };
    }

    public.addObject = function(sceneObject, childName) {
        if (sceneObject.parent) 
            sceneObject.parent.removeObject(sceneObject);
        sceneObject.parent = public;

        if (!childName) childName = ".";
        if (!private.childMap[childName]) private.childMap[childName] = [];
        private.childMap[childName].push(sceneObject);
        return public;
    };

    public.removeObject = function(sceneObject) {
        for (let childName in private.childMap) {
            const children = private.childMap[childName];
            for (let i = 0; i < children.length; i++) {
                if (children[i] === sceneObject) {
                    children.splice(i, 1);
                    sceneObject.parent = null;
                    return true;
                }
            }
        }
        return false;
    }

    private.getLocation = function () {
        if (private.location) return private.location;
        if (private.model) {
            if (!private.model.location) return null;
            private.location = frag.Location(engine, private.model.location.is3d);
        } else {
            private.location = frag.Location(engine, true);
        }
        return private.location;
    };

    private.getAnimationLocation = function () {
        if (private.animationLocation) return private.animationLocation;
        if (private.model) {
            if (!private.model.location) return null;
            private.animationLocation = frag.Location(engine, private.model.location.is3d);
        } else {
            private.animationLocation = frag.Location(engine, true);
        }
        return private.animationLocation;
    };

    /**
     * @returns a ScenePosition object that can be used to manipulate the position
     * scale and orientation of this object in the scene
     */
    public.getPosition = function () {
        const location = private.getLocation();
        if (!location) return null;
        if (!private.position) 
            private.position = frag.ScenePosition(engine, location);
        return private.position;
    };

    /**
     * @returns a ScenePosition object that can be used to change the animation
     * position of the scene object. The animation position is added to the scene
     * object's static position to create a temporary animation effect
     */
    public.getAnimationPosition = function () {
        const location = private.getAnimationLocation();
        if (!location) return null;
        if (!private.animationPosition) 
            private.animationPosition = frag.ScenePosition(engine, location);
        return private.animationPosition;
    };

    /**
     * Clears any animation position that was set. This is more efficient
     * than setting the animation location to zero
     */
    public.clearAnimationPosition = function () {
        private.animationLocation = null;
        return public;
    };

    /**
     * Includes this object in the scene. Call this function when the object
     * could possibly be seen by the player. The engine will go through the
     * process of transforming the mesh into screen space and clip anything
     * that is not within the screen bounds. To avoid this expensive operations
     * for objects that you know cannot be seen by the player, call the disable() 
     * function.
     */
    public.enable = function () {
        private.enabled = true;
        return public;
    };

    /**
     * Excludes this object in the scene. Call this function when the object
     * is not viewable through the player's viewport - for example it moved
     * behind the player's point of view.
     */
     public.disable = function () {
        private.enabled = false;
        return public;
    };

    /**
     * Frees any resources consumed by this scene object and removes it from
     * the scene.
     */
    public.dispose = function() {
        public.disable();
        if (public.parent) public.parent.removeObject(public);
        for (let animationName in public.animations) {
            public.animations[animationName].dispose();
        }
    }

    /**
     * This is used internally by the engine. Don't call this from your game code
     */
    public.draw = function (drawContext) {
        if (!private.enabled || !private.model) return public;

        let location = private.getLocation();
        if (!location) return public;

        if (private.animationLocation) {
            location = location.clone().add(private.animationLocation);
        }

        drawContext.beginSceneObject(location, private.animationMap, private.childMap);

        if (drawContext.isHitTest) drawContext.sceneObjects.push(public);

        private.model.draw(drawContext);

        drawContext.endSceneObject();
        return public;
    };

    return public;
};

/***/ }),

/***/ "./src/SceneGraph/ScenePosition.js":
/*!*****************************************!*\
  !*** ./src/SceneGraph/ScenePosition.js ***!
  \*****************************************/
/***/ (() => {

// This class provides a set of helper methods for
// manipulating a Location object
window.frag.ScenePosition = function (engine, location, is3d) {
    const private = {
        location: null,
    };

    const public = {
        __private: private,
        observableLocation: window.frag.Observable(
            engine, 
            (observer) => { 
                observer(private.location);
            }),
    };

    public.dispose = function () {
    }

    private.modified = function() {
        private.location.isModified = true;
        public.observableLocation.notify();
    }

    public.setLocation = function (value) {
        private.location = value || window.frag.Location(engine, is3d === undefined ? true : is3d);
        return public;
    }
    public.setLocation(location);

    public.getMatrix = function () {
        return private.location.getMatrix();
    }

    public.getScale = function() {
        return [
            private.location.scaleX,
            private.location.scaleY,
            private.location.scaleZ
        ];
    }

    public.getScaleX = function () {
        return private.location.scaleX;
    }

    public.getScaleY = function () {
        return private.location.scaleY;
    }

    public.getScaleZ = function () {
        return private.location.scaleZ;
    }

    public.scale = function (s) {
        private.location.scaleX = s;
        private.location.scaleY = s;
        private.location.scaleZ = s;
        private.modified();
        return public;
    }

    public.scaleXYZ = function (x, y, z) {
        private.location.scaleX = x;
        private.location.scaleY = y;
        private.location.scaleZ = z;
        private.modified();
        return public;
    }

    public.scaleX = function (x) {
        private.location.scaleX = x;
        private.modified();
        return public;
    }

    public.scaleY = function (y) {
        private.location.scaleY = y;
        private.modified();
        return public;
    }

    public.scaleZ = function (z) {
        private.location.scaleZ = z;
        private.modified();
        return public;
    }

    public.scaleBy = function(scales){
        return public.scaleXYZ(
            private.location.scaleX * scales[0],
            private.location.scaleY * scales[1],
            private.location.scaleZ * scales[2]);
    }

    public.scaleByXYZ = function(xScale, yScale, zScale){
        return public.scaleXYZ(
            private.location.scaleX * xScale,
            private.location.scaleY * yScale,
            private.location.scaleZ * zScale);
    }

    public.getRotate = function() {
        return [
            private.location.rotateX,
            private.location.rotateY,
            private.location.rotateZ
        ];
    }

    public.getQuaternion = function() {
        return window.frag.Vector.quaternion(public.getRotate());
    }

    public.getRotateX = function () {
        return private.location.rotateX;
    }

    public.getRotateY = function () {
        return private.location.rotateY;
    }

    public.getRotateZ = function () {
        return private.location.rotateZ;
    }

    public.getRotate = function() {
        if (private.location.is3d)
            return [private.location.rotateX, private.location.rotateY, private.location.rotateZ];
        else
            return [private.location.rotateX, private.location.rotateY];
    }

    public.rotate = function(v) {
        if (v.length === 4)
            v = window.frag.Vector.euler(v);

        private.location.rotateX = v[0];
        if (v.length > 1) private.location.rotateY = v[1];
        if (v.length > 2) private.location.rotateZ = v[2];

        private.modified();
        return public;
    }

    public.rotateXYZ = function (x, y, z) {
        private.location.rotateX = x;
        private.location.rotateY = y;
        private.location.rotateZ = z;
        private.modified();
        return public;
    }

    public.rotateX = function (x) {
        private.location.rotateX = x;
        private.modified();
        return public;
    }

    public.rotateY = function (y) {
        private.location.rotateY = y;
        private.modified();
        return public;
    }

    public.rotateZ = function (z) {
        private.location.rotateZ = z;
        private.modified();
        return public;
    }

    public.rotateBy = function(euler){
        return public.rotateXYZ(
            private.location.rotateX + euler[0],
            private.location.rotateY + euler[1],
            private.location.rotateZ + euler[2]);
    }

    public.rotateByXYZ = function(x, y, z){
        return public.rotateXYZ(
            private.location.rotateX + x,
            private.location.rotateY + y,
            private.location.rotateZ + z);
    }

    public.getLocationX = function () {
        return private.location.translateX;
    }

    public.getLocationY = function () {
        return private.location.translateY;
    }

    public.getLocationZ = function () {
        return private.location.translateZ;
    }

    public.getLocation = function() {
        if (private.location.is3d)
            return [private.location.translateX, private.location.translateY, private.location.translateZ];
        else
            return [private.location.translateX, private.location.translateY];
    }

    public.location = function(v) {
        private.location.translateX = v[0];
        if (v.length > 1) private.location.translateY = v[1];
        if (v.length > 2) private.location.translateZ = v[2];
        private.modified();
        return public;
    }

    public.locationXYZ = function (x, y, z) {
        private.location.translateX = x;
        private.location.translateY = y;
        private.location.translateZ = z;
        private.modified();
        return public;
    }

    public.locationX = function (x) {
        private.location.translateX = x;
        private.modified();
        return public;
    }

    public.locationY = function (y) {
        private.location.translateY = y;
        private.modified();
        return public;
    }

    public.locationZ = function (z) {
        private.location.translateZ = z;
        private.modified();
        return public;
    }

    public.moveBy = function(direction){
        return public.locationXYZ(
            private.location.translateX + direction[0],
            private.location.translateY + direction[1],
            private.location.translateZ + direction[2]);
    }

    public.moveByXYZ = function(x, y, z){
        return public.locationXYZ(
            private.location.translateX + x,
            private.location.translateY + y,
            private.location.translateZ + z);
    }

    return public;
};

/***/ }),

/***/ "./src/SceneGraph/VertexData.js":
/*!**************************************!*\
  !*** ./src/SceneGraph/VertexData.js ***!
  \**************************************/
/***/ (() => {

window.frag.VertexData = function(engine) {
    const frag = window.frag;
    const gl = engine.gl;

    const private = {
    };

    const public = {
        __private: private,
        primitiveType: gl.TRIANGLES,
        vertexCount: 0,
        verticies: undefined,
        vertexDimensions: 3,
        colors: undefined,
        colorDimensions: 3,
        uvs: undefined,
        uvDimensions: 2,
        normals: undefined,
        normalDimensions: 3,
        tangents: undefined,
        bitangents: undefined,
    };

    public.dispose = function () {
    }

    public.clone = function () {
        const clone = frag.VertexData(engine);

        clone.primitiveType = public.primitiveType;
        clone.vertexCount = public.vertexCount;
        clone.vertexDimensions = public.vertexDimensions;
        clone.colorDimensions = public.colorDimensions;
        clone.uvDimensions = public.uvDimensions;
        clone.normalDimensions = public.normalDimensions;

        clone.verticies = public.verticies;

        if (public.colors) clone.colors = Array.from(public.colors);
        if (public.uvs) clone.uvs = Array.from(public.uvs);
        if (public.normals) clone.normals = Array.from(public.normals);
        if (public.tangents) clone.tangents = Array.from(public.tangents);
        if (public.bitangents) clone.bitangents = Array.from(public.bitangents);

        return clone;
    }

    public.vertexIndex = function (index, coord) { return index * public.vertexDimensions + (coord || 0); };
    public.colorIndex = function (index, coord) { return index * public.colorDimensions + (coord || 0); };
    public.uvIndex = function (index, coord) { return index * public.uvDimensions + (coord || 0); };
    public.normalIndex = function (index, coord) { return index * public.normalDimensions + (coord || 0); };
    public.tangentIndex = function (index, coord) { return index * public.normalDimensions + (coord || 0); };
    public.bitangentIndex = function (index, coord) { return index * public.normalDimensions + (coord || 0); };

    private.getVector = function (array, index, dimensions) {
        if (dimensions === 2) return frag.Vector.extract2D(array, index);
        return frag.Vector.extract3D(array, index);
    };

    private.setVector = function (array, index, v) {
        for (i = 0; i < v.length; i++)
            array[index + i] = v[i];
    };

    public.getVertexVector = function (index) {
        return private.getVector(public.verticies, public.vertexIndex(index), public.vertexDimensions);
    };

    public.setVertexVector = function (index, v) {
        return private.setVector(public.verticies, public.vertexIndex(index), v);
    };

    public.getColor = function (index) {
        return private.getVector(public.colors, public.colorIndex(index), public.colorDimensions);
    };

    public.setColor = function (index, v) {
        return private.setVector(public.colors, public.colorIndex(index), v);
    };

    public.getUvVector = function (index) {
        return private.getVector(public.uvs, public.uvIndex(index), public.uvDimensions);
    };

    public.setUvVector = function (index, v) {
        return private.setVector(public.uvs, public.uvIndex(index), v);
    };

    public.getNormalVector = function (index) {
        return private.getVector(public.normals, public.normalIndex(index), public.normalDimensions);
    };

    public.setNormalVector = function (index, v) {
        return private.setVector(public.normals, public.normalIndex(index), v);
    };

    public.getTangentVector = function (index) {
        return private.getVector(public.tangents, public.tangentIndex(index), public.normalDimensions);
    };

    public.setTangentVector = function (index, v) {
        return private.setVector(public.tangents, public.tangentIndex(index), v);
    };

    public.getBitangentVector = function (index) {
        return private.getVector(public.bitangents, public.bitangentIndex(index), public.normalDimensions);
    };

    public.setBitangentVector = function (index, v) {
        return private.setVector(public.bitangents, public.bitangentIndex(index), v);
    };

    public.setTriangles2D = function (verticies, colors, uvs, normals, tangents, bitangents) {
        public.primitiveType = gl.TRIANGLES;

        public.vertexDimensions = 2;
        public.verticies = verticies;
        public.vertexCount = verticies.length / public.vertexDimensions;

        public.colorDimensions = 3;
        public.colors = colors;

        public.uvDimensions = 2;
        public.uvs = uvs;

        public.normalDimensions = 3;
        public.normals = normals;
        public.tangents = tangents;
        public.bitangents = bitangents;

        public.extractTriangles = function (addTriangle) {
            for (let i = 0; i < public.vertexCount; i += 3) {
                addTriangle(i, i + 1, i + 2);
            }
        };

        return public;
    }

    public.setTriangles = function (verticies, colors, uvs, normals, tangents, bitangents) {
        public.primitiveType = gl.TRIANGLES;

        public.vertexDimensions = 3;
        public.verticies = verticies;
        public.vertexCount = verticies.length / public.vertexDimensions;

        public.colorDimensions = 3;
        public.colors = colors;

        public.uvDimensions = 2;
        public.uvs = uvs;

        public.normalDimensions = 3;
        public.normals = normals;
        public.tangents = tangents;
        public.bitangents = bitangents;

        public.extractTriangles = function (addTriangle) {
            for (let i = 0; i < public.vertexCount; i += 3) {
                addTriangle(i, i + 1, i + 2);
            }
        };

        return public;
    }

    public.setTriangleStrip = function (verticies, colors, uvs, normals, tangents, bitangents) {
        public.primitiveType = gl.TRIANGLE_STRIP;

        public.vertexDimensions = 3;
        public.verticies = verticies;
        public.vertexCount = verticies.length / public.vertexDimensions;

        public.colorDimensions = 3;
        public.colors = colors;

        public.uvDimensions = 2;
        public.uvs = uvs;

        public.normalDimensions = 3;
        public.normals = normals;
        public.tangents = tangents;
        public.bitangents = bitangents;

        public.extractTriangles = function (addTriangle) {
            const triangleCount = public.vertexCount - 2;
            for (let i = 0; i < triangleCount; i++) {
                if ((i & 1) === 0) addTriangle(i, i + 1, i + 2);
                else addTriangle(i + 2, i + 1, i);
            }
        };

        return public;
    }

    public.setTriangleFan = function (verticies, colors, uvs, normals, tangents, bitangents) {
        public.primitiveType = gl.TRIANGLE_FAN;

        public.vertexDimensions = 3;
        public.verticies = verticies;
        public.vertexCount = verticies.length / public.vertexDimensions;

        public.colorDimensions = 3;
        public.colors = colors;

        public.uvDimensions = 2;
        public.uvs = uvs;

        public.normalDimensions = 3;
        public.normals = normals;
        public.tangents = tangents;
        public.bitangents = bitangents;

        public.extractTriangles = function (addTriangle) {
            const triangleCount = public.vertexCount - 2;
            for (let i = 0; i < triangleCount; i++) {
                addTriangle(0, i + 1, i + 2);
            }
        };

        return public;
    }

    public.setLines2D = function (verticies, colors, uvs, normals) {
        public.primitiveType = gl.LINES;

        public.vertexDimensions = 2;
        public.verticies = verticies;
        public.vertexCount = verticies.length / public.vertexDimensions;

        public.colorDimensions = 3;
        public.colors = colors;

        public.uvDimensions = 2;
        public.uvs = uvs;

        public.normalDimensions = 3;
        public.normals = normals;
        public.tangents = null;
        public.bitangents = null;

        public.extractTriangles = function () { };

        return public;
    }

    public.setLines = function (verticies, colors, uvs, normals) {
        public.primitiveType = gl.LINES;

        public.vertexDimensions = 3;
        public.verticies = verticies;
        public.vertexCount = verticies.length / public.vertexDimensions;

        public.colorDimensions = 3;
        public.colors = colors;

        public.uvDimensions = 2;
        public.uvs = uvs;

        public.normalDimensions = 3;
        public.normals = normals;
        public.tangents = null;
        public.bitangents = null;

        public.extractTriangles = function () { };

        return public;
    }

    public.setLineStrip = function (verticies, colors, uvs, normals) {
        public.primitiveType = gl.LINE_STRIP;

        public.vertexDimensions = 3;
        public.verticies = verticies;
        public.vertexCount = verticies.length / public.vertexDimensions;

        public.colorDimensions = 3;
        public.colors = colors;

        public.uvDimensions = 2;
        public.uvs = uvs;

        public.normalDimensions = 3;
        public.normals = normals;
        public.tangents = null;
        public.bitangents = null;

        public.extractTriangles = function () { };

        return public;
    }

    return public;
};


/***/ }),

/***/ "./src/Shaders/CustomShader.js":
/*!*************************************!*\
  !*** ./src/Shaders/CustomShader.js ***!
  \*************************************/
/***/ (() => {

window.frag.createShader = function (engine, name, type, source) {
    const gl = engine.gl;

    if (engine.debugShaderBuilder)
        console.log("\n// " + name + " " + (type === gl.VERTEX_SHADER ? "vertex" : "fragment") + " shader\n" + source);

    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) return shader;

    console.error('Failed to compile shader ' + name);
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
};

window.frag.createProgram = function (engine, name, vertexShader, fragmentShader) {
    const gl = engine.gl;

    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) return program;

    console.error('Failed to link shaders into program ' + name);
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
};

window.frag.CustomShader = function (engine, is3d) {
    const frag = window.frag;
    const gl = engine.gl;

    const private = {
        name: "Custom",
        vertexShaderSource: null,
        fragmentShaderSource: null,
        bindList: [],
        unbindList: [],
    };

    const public = {
        __private: private,
        attributes: {},
        uniforms: {},
        is3d: is3d === undefined ? true : is3d,
    }

    public.dispose = function () {
        gl.deleteProgram(public.program);
    }

    public.name = function (name) {
        private.name = name;
        return public;
    }

    public.getName = function () {
        return private.name;
    }

    public.source = function (vertexShaderSource, fragmentShaderSource) {
        private.vertexShaderSource = vertexShaderSource;
        private.fragmentShaderSource = fragmentShaderSource;

        const vertexShader = frag.createShader(engine, private.name, gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = frag.createShader(engine, private.name, gl.FRAGMENT_SHADER, fragmentShaderSource);
        public.program = frag.createProgram(engine, private.name, vertexShader, fragmentShader);

        return public;
    }

    public.onBind = function (fn) {
        private.bindList.push(fn);
        return public;
    }

    public.onUnbind = function (fn) {
        private.unbindList.push(fn);
        return public;
    }

    public.attribute = function (name) {
        if (!public.program) {
            console.error("You must set the " + private.name + " shader source before defining attributes");
            return public;
        }

        const attribute = gl.getAttribLocation(public.program, "a_" + name);

        if (attribute === undefined) {
            console.error("Shader program " + private.name + " does not have attribute a_" + name);
            return public;
        }

        public.attributes[name] = attribute;
        return public;
    }

    public.uniform = function (name, glType, initialValue) {
        if (!public.program) {
            console.error("You must set the " + private.name + " shader source before defining uniforms");
            return public;
        }

        const uniform = gl.getUniformLocation(public.program, "u_" + name);

        if (!uniform) {
            console.error("Shader program " + private.name + " does not have uniform u_" + name);
            return public;
        }

        public.uniforms[name] = uniform;

        if (glType) {
            private[name] = initialValue;
            public[name] = function (newValue) { 
                private[name] = newValue;
                return public;
            }
            private.bindList.push(function (gl) {
                if (private[name] !== undefined) {
                    //console.log("gl.uniform" + glType + "(" + name + "," + private[name] + ")")
                    gl["uniform" + glType](uniform, private[name]);
                }
            });
        }

        return public;
    }

    public.bind = function () {
        const gl = engine.gl;
        gl.useProgram(public.program);
        private.bindList.forEach(f => f(gl));
        return public;
    }

    public.unbind = function () {
        const gl = engine.gl;
        private.unbindList.forEach(f => f(gl));
        return public;
    }

    return public;
};


/***/ }),

/***/ "./src/Shaders/FontShader.js":
/*!***********************************!*\
  !*** ./src/Shaders/FontShader.js ***!
  \***********************************/
/***/ (() => {

window.frag.FontShader = function(engine) {
    if (engine.fontShader) return engine.fontShader;
    
    const vertexShader = 
        "attribute vec4 a_position;\n" +
        "attribute vec2 a_texcoord;\n" +
        "uniform mat4 u_clipMatrix;\n" +
        "varying vec2 v_texcoord;\n" +
        "void main() {\n" +
        "  gl_Position = u_clipMatrix * a_position;\n" +
        "  v_texcoord = a_texcoord;\n" +
        "}";

    const fragmentShader = 
        "precision mediump float;\n" +
        "uniform sampler2D u_diffuse;\n" +
        "uniform vec4 u_fgcolor;\n" +
        "uniform vec4 u_bgcolor;\n" +
        "varying vec2 v_texcoord;\n" +
        "void main() {\n" +
        "  vec4 texture = texture2D(u_diffuse, vec2(v_texcoord.x, 1.0 - v_texcoord.y));\n" +
        "  gl_FragColor = mix(u_bgcolor, u_fgcolor, length(texture.rgb));\n" +
        "}\n";

    engine.fontShader = frag.CustomShader(engine)
        .name("Font")
        .source(vertexShader, fragmentShader)
        .attribute("position")
        .attribute("texcoord")
        .uniform("clipMatrix")
        .uniform("bgcolor", "4fv", [1, 1, 1, 1])
        .uniform("fgcolor", "4fv", [0, 0, 0, 1])
        .uniform("diffuse");
        
    return engine.fontShader;
}

/***/ }),

/***/ "./src/Shaders/ParticleShader2D.js":
/*!*****************************************!*\
  !*** ./src/Shaders/ParticleShader2D.js ***!
  \*****************************************/
/***/ (() => {

window.frag.ParticleShader2D = function(engine) {
    if (engine.particleShader2D) return engine.particleShader2D;
    
    const vertexShader = 
        'uniform mat4 u_clipMatrix;\n' +
        'uniform mat4 u_modelMatrix;\n' +
        'uniform mat4 u_clipMatrixInverse;\n' +
        'uniform vec3 u_velocity;\n' +
        'uniform vec3 u_acceleration;\n' +
        'uniform float u_timeRange;\n' +
        'uniform float u_time;\n' +
        'uniform float u_timeOffset;\n' +
        'uniform float u_frameDuration;\n' +
        'uniform float u_numFrames;\n' +
        '\n' +
        'attribute vec4 a_uvLifeTimeFrameStart; // uv, lifeTime, frameStart\n' +
        'attribute vec4 a_positionStartTime;    // position.xyz, startTime\n' +
        'attribute vec4 a_velocityStartSize;    // velocity.xyz, startSize\n' +
        'attribute vec4 a_accelerationEndSize;  // acceleration.xyz, endSize\n' +
        'attribute vec4 a_spinStartSpinSpeed;   // spinStart.x, spinSpeed.y\n' +
        'attribute vec4 a_orientation;          // a_orientation quaternion\n' +
        'attribute vec4 a_colorMult;            // multiplies color and ramp textures\n' +
        '\n' +
        'varying vec2 v_texcoord;\n' +
        'varying float v_percentLife;\n' +
        'varying vec4 v_colorMult;\n' +
        '\n' +
        'void main() {\n' +
        '  vec2 uv = a_uvLifeTimeFrameStart.xy;\n' +
        '  float lifeTime = a_uvLifeTimeFrameStart.z;\n' +
        '  float frameStart = a_uvLifeTimeFrameStart.w;\n' +
        '  vec3 position = a_positionStartTime.xyz;\n' +
        '  float startTime = a_positionStartTime.w;\n' +
        '  vec3 velocity = (u_modelMatrix * vec4(a_velocityStartSize.xyz, 0.)).xyz + u_velocity;\n' +
        '  float startSize = a_velocityStartSize.w;\n' +
        '  vec3 acceleration = (u_modelMatrix * vec4(a_accelerationEndSize.xyz, 0)).xyz + u_acceleration;\n' +
        '  float endSize = a_accelerationEndSize.w;\n' +
        '  float spinStart = a_spinStartSpinSpeed.x;\n' +
        '  float spinSpeed = a_spinStartSpinSpeed.y;\n' +
        '\n' +
        '  float localTime = mod((u_time - u_timeOffset - startTime), u_timeRange);\n' +
        '  float percentLife = clamp(localTime / lifeTime, 0., 1.);\n' +
        '\n' +
        '  float frame = mod(floor(localTime / u_frameDuration + frameStart), u_numFrames);\n' +
        '  float uOffset = frame / u_numFrames;\n' +
        '  float u = uOffset + (uv.x + 0.5) * (1. / u_numFrames);\n' +
        '\n' +
        '  v_texcoord = vec2(u, uv.y + 0.5);\n' +
        '  v_colorMult = a_colorMult;\n' +
        '\n' +
        '  vec3 basisX = u_clipMatrixInverse[0].xyz;\n' +
        '  vec3 basisZ = u_clipMatrixInverse[1].xyz;\n' +
        '\n' +
        '  float size = mix(startSize, endSize, percentLife);\n' +
        '  float s = sin(spinStart + spinSpeed * localTime);\n' +
        '  float c = cos(spinStart + spinSpeed * localTime);\n' +
        '\n' +
        '  vec4 rotatedPoint = vec2(uv.x * c + uv.y * s, -uv.x * s + uv.y * c);\n' +
        '  vec3 localPosition = vec3(basisX * rotatedPoint.x + basisZ * rotatedPoint.y) * size +\n' + 
        '    velocity * localTime + acceleration * localTime * localTime + position;\n' +
        '\n' +
        '  v_percentLife = percentLife;\n' +
        '  gl_Position = u_clipMatrix * vec4(localPosition + u_modelMatrix[3].xyz, 1.);\n' +
        '}\n';
  
    const fragmentShader = 
        'precision mediump float;\n' +
        'uniform sampler2D u_rampSampler;\n' +
        'uniform sampler2D u_colorSampler;\n' +
        '\n' +
        'varying vec2 v_texcoord;\n' +
        'varying float v_percentLife;\n' +
        'varying vec4 v_colorMult;\n' +
        '\n' +
        'void main() {\n' +
        '  vec4 colorMult = texture2D(u_rampSampler, vec2(v_percentLife, 0.5)) * v_colorMult;\n' +
        '  gl_FragColor = texture2D(u_colorSampler, v_texcoord) * colorMult;\n' +
        '}\n'
  
    engine.particleShader2D = frag.CustomShader(engine)
        .name("Particle 2D")
        .source(vertexShader, fragmentShader)

        .attribute("uvLifeTimeFrameStart")
        .attribute("positionStartTime")
        .attribute("velocityStartSize")
        .attribute("accelerationEndSize")
        .attribute("spinStartSpinSpeed")
        .attribute("orientation")
        .attribute("colorMult")

        .uniform("clipMatrix")
        .uniform("clipMatrixInverse")
        .uniform("modelMatrix")
        .uniform("rampSampler")
        .uniform("colorSampler")
        .uniform("velocity", "3fv", [0, 100, 0])
        .uniform("acceleration", "3fv", [0, -9.8, 0])
        .uniform("timeRange", "1f", 500)
        .uniform("time", "1f", 0)
        .uniform("timeOffset", "1f", 0)
        .uniform("frameDuration", "1f", 0)
        .uniform("numFrames", "1f", 50);
        
    return engine.particleShader2D;
}

/***/ }),

/***/ "./src/Shaders/ParticleShader3D.js":
/*!*****************************************!*\
  !*** ./src/Shaders/ParticleShader3D.js ***!
  \*****************************************/
/***/ (() => {

window.frag.ParticleShader3D = function(engine) {
    if (engine.particleShader3D) return engine.particleShader3D;
    
    const vertexShader = 
        'uniform mat4 u_clipMatrix;\n' +
        'uniform mat4 u_modelMatrix;\n' +
        'uniform vec3 u_velocity;\n' +
        'uniform vec3 u_acceleration;\n' +
        'uniform float u_timeRange;\n' +
        'uniform float u_time;\n' +
        'uniform float u_timeOffset;\n' +
        'uniform float u_frameDuration;\n' +
        'uniform float u_numFrames;\n' +
        '\n' +
        'attribute vec4 a_uvLifeTimeFrameStart; // uv, lifeTime, frameStart\n' +
        'attribute vec4 a_positionStartTime;    // position.xyz, startTime\n' +
        'attribute vec4 a_velocityStartSize;    // velocity.xyz, startSize\n' +
        'attribute vec4 a_accelerationEndSize;  // acceleration.xyz, endSize\n' +
        'attribute vec4 a_spinStartSpinSpeed;   // spinStart.x, spinSpeed.y\n' +
        'attribute vec4 a_orientation;          // a_orientation quaternion\n' +
        'attribute vec4 a_colorMult;            // multiplies color and ramp textures\n' +
        '\n' +
        'varying vec2 v_texcoord;\n' +
        'varying float v_percentLife;\n' +
        'varying vec4 v_colorMult;\n' +
        '\n' +
        'void main() {\n' +
        '  vec2 uv = a_uvLifeTimeFrameStart.xy;\n' +
        '  float lifeTime = a_uvLifeTimeFrameStart.z;\n' +
        '  float frameStart = a_uvLifeTimeFrameStart.w;\n' +
        '  vec3 position = a_positionStartTime.xyz;\n' +
        '  float startTime = a_positionStartTime.w;\n' +
        '  vec3 velocity = (u_modelMatrix * vec4(a_velocityStartSize.xyz, 0.)).xyz + u_velocity;\n' +
        '  float startSize = a_velocityStartSize.w;\n' +
        '  vec3 acceleration = (u_modelMatrix * vec4(a_accelerationEndSize.xyz, 0)).xyz + u_acceleration;\n' +
        '  float endSize = a_accelerationEndSize.w;\n' +
        '  float spinStart = a_spinStartSpinSpeed.x;\n' +
        '  float spinSpeed = a_spinStartSpinSpeed.y;\n' +
        '\n' +
        '  float localTime = mod((u_time - u_timeOffset - startTime), u_timeRange);\n' +
        '  float percentLife = clamp(localTime / lifeTime, 0., 1.);\n' +
        '\n' +
        '  float frame = mod(floor(localTime / u_frameDuration + frameStart), u_numFrames);\n' +
        '  float uOffset = frame / u_numFrames;\n' +
        '  float u = uOffset + (uv.x + 0.5) / u_numFrames;\n' +
        '\n' +
        '  v_texcoord = vec2(u, uv.y + 0.5);\n' +
        '  v_colorMult = a_colorMult;\n' +
        '\n' +
        '  float size = mix(startSize, endSize, percentLife);\n' +
        '  float s = sin(spinStart + spinSpeed * localTime);\n' +
        '  float c = cos(spinStart + spinSpeed * localTime);\n' +
        '\n' +
        '  vec4 rotatedPoint = vec4((uv.x * c + uv.y * s) * size, (uv.x * s + uv.y * c) * size, 0., 1.);\n' +
        '  vec3 center = velocity * localTime + acceleration * localTime * localTime + position;\n' +
        '\n' +
        '  vec4 q2 = a_orientation + a_orientation;\n' +
        '  vec4 qx = a_orientation.xxxw * q2.xyzx;\n' +
        '  vec4 qy = a_orientation.xyyw * q2.xyzy;\n' +
        '  vec4 qz = a_orientation.xxzw * q2.xxzz;\n' +
        '\n' +
        '  mat4 localMatrix = mat4(\n' + 
        '    (1.0 - qy.y) - qz.z, qx.y + qz.w, qx.z - qy.w, 0,\n' +
        '    qx.y - qz.w, (1.0 - qx.x) - qz.z, qy.z + qx.w, 0,\n' +
        '    qx.z + qy.w, qy.z - qx.w, (1.0 - qx.x) - qy.y, 0,\n' +
        '    center.x, center.y, center.z, 1);\n' +
        '  rotatedPoint = localMatrix * rotatedPoint;\n' +
        '  v_percentLife = percentLife;\n' +
        '  gl_Position = u_clipMatrix * rotatedPoint;\n' +
        '}\n';
  
    const fragmentShader = 
        'precision mediump float;\n' +
        'uniform sampler2D u_rampSampler;\n' +
        'uniform sampler2D u_colorSampler;\n' +
        '\n' +
        'varying vec2 v_texcoord;\n' +
        'varying float v_percentLife;\n' +
        'varying vec4 v_colorMult;\n' +
        '\n' +
        'void main() {\n' +
        '  vec4 colorMult = texture2D(u_rampSampler, vec2(v_percentLife, 0.5)) * v_colorMult;\n' +
        '  gl_FragColor = texture2D(u_colorSampler, v_texcoord) * colorMult;\n' +
        '}\n'
  
    engine.particleShader3D = frag.CustomShader(engine)
        .name("Particle 3D")
        .source(vertexShader, fragmentShader)
        .attribute("uvLifeTimeFrameStart")
        .attribute("positionStartTime")
        .attribute("velocityStartSize")
        .attribute("accelerationEndSize")
        .attribute("spinStartSpinSpeed")
        .attribute("orientation")
        .attribute("colorMult")
        .uniform("clipMatrix")
        .uniform("modelMatrix")
        .uniform("rampSampler")
        .uniform("colorSampler")
        .uniform("velocity", "3fv", [0, 100, 0])
        .uniform("acceleration", "3fv", [0, -9.8, 0])
        .uniform("timeRange", "1f", 500)
        .uniform("time", "1f", 0)
        .uniform("timeOffset", "1f", 0)
        .uniform("frameDuration", "1f", 0)
        .uniform("numFrames", "1f", 50);
        
    return engine.particleShader3D;
}

/***/ }),

/***/ "./src/Shaders/ParticleShaderDebug.js":
/*!********************************************!*\
  !*** ./src/Shaders/ParticleShaderDebug.js ***!
  \********************************************/
/***/ (() => {

window.frag.ParticleShaderDebug = function(engine) {
    if (engine.particleShaderDebug) return engine.particleShaderDebug;
    
    const vertexShader = 
        'uniform mat4 u_clipMatrix;\n' +
        'uniform mat4 u_modelMatrix;\n' +
        'uniform vec3 u_velocity;\n' +
        'uniform vec3 u_acceleration;\n' +
        'uniform float u_timeRange;\n' +
        'uniform float u_time;\n' +
        'uniform float u_timeOffset;\n' +
        'uniform float u_frameDuration;\n' +
        'uniform float u_numFrames;\n' +
        '\n' +
        'attribute vec4 a_uvLifeTimeFrameStart; // uv, lifeTime, frameStart\n' +
        'attribute vec4 a_positionStartTime;    // position.xyz, startTime\n' +
        'attribute vec4 a_velocityStartSize;    // velocity.xyz, startSize\n' +
        'attribute vec4 a_accelerationEndSize;  // acceleration.xyz, endSize\n' +
        'attribute vec4 a_spinStartSpinSpeed;   // spinStart.x, spinSpeed.y\n' +
        'attribute vec4 a_orientation;          // a_orientation quaternion\n' +
        '\n' +
        'void main() {\n' +
        '  vec2 uv = a_uvLifeTimeFrameStart.xy;\n' +
        '  float lifeTime = a_uvLifeTimeFrameStart.z;\n' +
        '  float frameStart = a_uvLifeTimeFrameStart.w;\n' +
        '  vec3 position = a_positionStartTime.xyz;\n' +
        '  float startTime = a_positionStartTime.w;\n' +
        '  vec3 velocity = (u_modelMatrix * vec4(a_velocityStartSize.xyz, 0.)).xyz + u_velocity;\n' +
        '  float startSize = a_velocityStartSize.w;\n' +
        '  vec3 acceleration = (u_modelMatrix * vec4(a_accelerationEndSize.xyz, 0)).xyz + u_acceleration;\n' +
        '  float endSize = a_accelerationEndSize.w;\n' +
        '  float spinStart = a_spinStartSpinSpeed.x;\n' +
        '  float spinSpeed = a_spinStartSpinSpeed.y;\n' +
        '\n' +
        '  float localTime = mod((u_time - u_timeOffset - startTime), u_timeRange);\n' +
        '  float percentLife = clamp(localTime / lifeTime, 0., 1.);\n' +
        '\n' +
        '  float frame = mod(floor(localTime / u_frameDuration + frameStart), u_numFrames);\n' +
        '  float uOffset = frame / u_numFrames;\n' +
        '  float u = uOffset + (uv.x + 0.5) * (1. / u_numFrames);\n' +
        '\n' +
        '  float size = mix(startSize, endSize, percentLife);\n' +
        '  float s = sin(spinStart + spinSpeed * localTime);\n' +
        '  float c = cos(spinStart + spinSpeed * localTime);\n' +
        '\n' +
        '  vec4 rotatedPoint = vec4((uv.x * c + uv.y * s) * size, (uv.x * s + uv.y * c) * size, 0., 1.);\n' +
        '  vec3 center = velocity * localTime + acceleration * localTime * localTime + position;\n' +
        '\n' +
        '  vec4 q2 = a_orientation + a_orientation;\n' +
        '  vec4 qx = a_orientation.xxxw * q2.xyzx;\n' +
        '  vec4 qy = a_orientation.xyyw * q2.xyzy;\n' +
        '  vec4 qz = a_orientation.xxzw * q2.xxzz;\n' +
        '\n' +
        '  mat4 localMatrix = mat4(\n' + 
        '    (1.0 - qy.y) - qz.z, qx.y + qz.w, qx.z - qy.w, 0,\n' +
        '    qx.y - qz.w, (1.0 - qx.x) - qz.z, qy.z + qx.w, 0,\n' +
        '    qx.z + qy.w, qy.z - qx.w, (1.0 - qx.x) - qy.y, 0,\n' +
        '    center.x, center.y, center.z, 1);\n' +
        '  rotatedPoint = localMatrix * rotatedPoint;\n' +
        '  gl_Position = u_clipMatrix * rotatedPoint;\n' +
        '}\n';
  
    const fragmentShader = 
        'precision mediump float;\n' +
        'void main() {\n' +
        '  gl_FragColor = vec4(1, 0, 0, 1);\n' +
        '}\n'
  
    engine.particleShaderDebug = frag.CustomShader(engine)
        .name("Particle debug")
        .source(vertexShader, fragmentShader)
        .attribute("uvLifeTimeFrameStart")
        .attribute("positionStartTime")
        .attribute("velocityStartSize")
        .attribute("accelerationEndSize")
        .attribute("spinStartSpinSpeed")
        .attribute("orientation")
        .uniform("clipMatrix")
        .uniform("modelMatrix")
        .uniform("velocity", "3fv")
        .uniform("acceleration", "3fv")
        .uniform("timeRange", "1f")
        .uniform("time", "1f")
        .uniform("timeOffset", "1f")
        .uniform("frameDuration", "1f")
        .uniform("numFrames", "1f");
        
    return engine.particleShaderDebug;
}

/***/ }),

/***/ "./src/Shaders/Shader.js":
/*!*******************************!*\
  !*** ./src/Shaders/Shader.js ***!
  \*******************************/
/***/ (() => {

// This builds a custom shader based on a set of options
window.frag.Shader = function (engine) {
    const frag = window.frag;
    const gl = engine.gl;

    const none = "None";
    const private = {
        name: "Custom",
        verticies: "XYZ",
        x: 0,
        y: 0,
        z: 0,
        colors: none,
        matrix: "mat4",
        textureCoords: none,
        diffuseTexture: none,
        emmissiveTexture: none,
        displacementTexture: none,
        normalMap: none,
        roughnessTexture: none,
        shininessTexture: none,
        metalinessTexture: none,
        normals: none,
        tangents: none,
        bitangents: none,
        directionalLight: none,
        ambientLight: none,
    };

    const public = {
        __private: private,
    };

    public.name = function (name) { private.name = name; return public; }

    public.verticiesXY = function (z) { private.verticies = "XY"; private.z = z; return public; }
    public.verticiesXZ = function (y) { private.verticies = "XZ"; private.y = y; return public; }
    public.verticiesYZ = function (x) { private.verticies = "YZ"; private.x = x; return public; }
    public.verticiesXYZ = function () { private.verticies = "XYZ"; return public; }
    public.verticiesNone = function () { private.verticies = none; return public; }

    public.matrix2D = function () { private.matrix = "mat3"; return public; }
    public.matrix3D = function () { private.matrix = "mat4"; return public; }
    public.matrixNone = function () { private.matrix = none; return public; }
           
    public.normals = function () { private.normals = "vec3"; return public; }

    public.colorsRGB = function() { private.colors = "vec3"; return public; }
    public.colorsRGBA = function() { private.colors = "vec4"; return public; }
    public.colorsNone = function() { private.colors = none; return public; }

    public.diffuseTexture = function () {
        private.diffuseTexture = "RGB";
        private.colors = none;
        if (private.textureCoords === none) private.textureCoords = "vec2";
        return public; 
    };

    public.emmissiveTexture = function () {
        private.emmissiveTexture = "RGB";
        if (private.textureCoords === none) private.textureCoords = "vec2";
        return public;
    };

    public.normalMapStandard = function () {
        private.normalMap = "Standard";
        if (private.textureCoords === none) private.textureCoords = "vec2";
        if (private.normals === none) private.normals = "vec3";
        if (private.tangents === none) private.tangents = "vec3";
        return public; 
    };

    public.normalMapOpenGL = function () {
        private.normalMap = "OpenGL";
        if (private.textureCoords === none) private.textureCoords = "vec2";
        if (private.normals === none) private.normals = "vec3";
        if (private.tangents === none) private.tangents = "vec3";
        return public; 
    };

    public.displacementTextureRaised = function () {
        private.displacementTexture = "Raised";
        if (private.textureCoords === none) private.textureCoords = "vec2";
        if (private.normals === none) private.normals = "vec3";
        return public;
    };

    public.displacementTextureSunken = function () {
        private.displacementTexture = "Sunken";
        if (private.textureCoords === none) private.textureCoords = "vec2";
        if (private.normals === none) private.normals = "vec3";
        return public;
    };

    public.displacementTextureSigned = function () {
        private.displacementTexture = "Signed";
        if (private.textureCoords === none) private.textureCoords = "vec2";
        if (private.normals === none) private.normals = "vec3";
        return public;
    };

    public.tangents = function () {
        private.tangents = "vec3";
        if (private.normals === none) private.normals = "vec3";
        return public;
    };

    public.bitangents = function () {
        private.bitangents = "vec3";
        if (private.normals === none) private.normals = "vec3";
        return public; 
    };

    public.directionalLightColor = function () {
        public.matrix3D();
        private.directionalLight = "Color";
        if (private.ambientLight === none) private.ambientLight = "Balanced";
        if (private.normals === none) private.normals = "vec3";
        return public;
    }

    public.directionalLightWhite = function () {
        public.matrix3D();
        private.directionalLight = "White";
        if (private.ambientLight === none) private.ambientLight = none;
        if (private.normals === none) private.normals = "vec3";
        return public;
    }

    public.directionalLightGrey = function () {
        public.matrix3D();
        private.directionalLight = "Grey";
        if (private.ambientLight === none) private.ambientLight = "Balanced";
        if (private.normals === none) private.normals = "vec3";
        return public;
    }

    public.directionalLightNone = function () {
        private.directionalLight = none;
        return public;
    }

    public.ambientLightBalanced = function () {
        private.ambientLight = "Balanced";
        return public;
    }

    public.ambientLightNone = function () {
        private.ambientLight = none;
        return public;
    }

    public.ambientLightFixed = function () {
        private.ambientLight = "Fixed";
        return public;
    }

    public.ambientTexture = function () {
        private.ambientLight = "Texture";
        return public;
    }

    private.addAttributeDeclarations = function(shader) {
        if (private.verticies === "XYZ") shader.vectorShader += "attribute vec4 a_position;\n";
        else if (private.verticies !== none) shader.vectorShader += "attribute vec2 a_position;\n";

        if (private.colors !== none) shader.vectorShader += "attribute " + private.colors + " a_color;\n";
        if (private.textureCoords !== none) shader.vectorShader += "attribute " + private.textureCoords + " a_texcoord;\n";
        if (private.normals !== none) shader.vectorShader += "attribute " + private.normals + " a_normal;\n";
        if (private.tangents !== none) shader.vectorShader += "attribute " + private.tangents + " a_tangent;\n";
        if (private.bitangents !== none) shader.vectorShader += "attribute " + private.bitangents + " a_bitangent;\n";
    }

    private.addUniformDeclarations = function (shader) {
        if (private.matrix !== none) {
            if (private.directionalLight !== none)
                shader.vectorShader += "uniform " + private.matrix + " u_modelMatrix;\n";
            shader.vectorShader += "uniform " + private.matrix + " u_clipMatrix;\n";
        }
        if (private.directionalLight !== none) shader.vectorShader += "uniform vec3 u_lightDirection;\n";
        if (private.directionalLight === "Color") shader.vectorShader += "uniform vec3 u_lightColor;\n";
        if (private.displacementTexture !== none) {
            shader.vectorShader += "uniform sampler2D u_height;\n";
            shader.vectorShader += "uniform float u_displacementScale;\n";
        }
        if (private.roughnessTexture !== none) shader.vectorShader += "uniform sampler2D u_roughness;\n";
        if (private.shininessTexture !== none) shader.vectorShader += "uniform sampler2D u_glossiness;\n";
        if (private.ambientLight === "Texture") shader.vectorShader += "uniform sampler2D u_ambient;\n";

        if (private.normalMap !== none) shader.fragmentShader += "uniform sampler2D u_normal;\n";
        if (private.textureCoords !== none) {
            if (private.diffuseTexture !== none) shader.fragmentShader += "uniform sampler2D u_diffuse;\n";
            if (private.emmissiveTexture !== none) shader.fragmentShader += "uniform sampler2D u_emmissive;\n";
        }
        if (private.ambientLight !== none) shader.fragmentShader += "uniform float u_ambientLight;\n";
    }

    private.addVaryingDeclarations = function (shader) {
        const add = function (type, name) {
            const statement = "varying " + type + " " + name + ";\n";
            shader.vectorShader += statement;
            shader.fragmentShader += statement;
        }

        if (private.textureCoords !== none) add(private.textureCoords, "v_texcoord");
        if (private.colors !== none) add(private.colors, "v_color");
        if (private.directionalLight !== none) {
            add("vec3", "v_lightDirection");
            if (private.directionalLight === "Color") add("vec3", "v_lightColor");
            if (private.normalMap === none) add(private.normals, "v_normal");
        }
    }

    private.addLogic = function (shader) {
        if (private.verticies === "XYZ") shader.vectorShader += "  vec4 position = a_position;\n";
        else if (private.verticies !== none) shader.vectorShader += "  vec2 position = a_position;\n";

        if (private.roughnessTexture !== none)
            shader.vectorShader += "  vec4 roughness = texture2D(u_roughness, vec2(a_texcoord.x, 1.0 - a_texcoord.y));\n";
        if (private.shininessTexture != none)
            shader.vectorShader += "  vec4 glossiness = texture2D(u_glossiness, vec2(a_texcoord.x, 1.0 - a_texcoord.y));\n";

        if (private.displacementTexture !== none) {
            shader.vectorShader += "  vec4 height = texture2D(u_height, vec2(a_texcoord.x, 1.0 - a_texcoord.y));\n";
            if (private.verticies === "XYZ" && private.normals === "vec3") {
                if (private.displacementTexture === "Sunken") shader.vectorShader += "  float displacement = -height.r;\n";
                else if (private.displacementTexture === "Signed") shader.vectorShader += "  float displacement = height.r * 2.0 - 1.0;\n";
                else if (private.displacementTexture === "Raised") shader.vectorShader += "  float displacement = height.r;\n";
                shader.vectorShader += "  position = vec4(position.xyz + (a_normal * displacement * u_displacementScale), position.w);\n";
            }
        }

        if (private.verticies === "XYZ") shader.vectorShader += "  position = u_clipMatrix * position;\n";
        else if (private.verticies !== none) shader.vectorShader += "  position = (u_clipMatrix * vec3(position, 1)).xy;\n";

        if (private.verticies === "XYZ") shader.vectorShader += "  gl_Position = position;\n";
        else if (private.verticies === "XY") shader.vectorShader += "  gl_Position = vec4(position, " + private.z + ", 1);\n";
        else if (private.verticies === "XZ") shader.vectorShader += "  gl_Position = vec4(position.x, " + private.y + ", position.y, 1);\n";
        else if (private.verticies === "YZ") shader.vectorShader += "  gl_Position = vec4(" + private.x + ", position, 1);\n";

        if (private.textureCoords !== none) shader.vectorShader += "  v_texcoord = a_texcoord;\n";

        if (private.directionalLight !== none) {
            if (private.normalMap !== none) {
                shader.vectorShader += "  vec3 T = normalize(vec3(u_modelMatrix * vec4(a_tangent, 0.0)));\n";
                if (private.bitangents !== none)
                    shader.vectorShader += "  vec3 B = normalize(vec3(u_modelMatrix * vec4(a_bitangent, 0.0)));\n";
                else
                    shader.vectorShader += "  vec3 B = normalize(vec3(u_modelMatrix * vec4(cross(a_normal, a_tangent), 0.0)));\n";
                shader.vectorShader += "  vec3 N = normalize(vec3(u_modelMatrix * vec4(a_normal, 0.0)));\n";
                shader.vectorShader += "  mat3 TBN = transpose(mat3(T, B, N));\n";
                shader.vectorShader += "  v_lightDirection = TBN * u_lightDirection;\n";
                shader.fragmentShader += "  vec3 normal = texture2D(u_normal, vec2(v_texcoord.x, 1.0 - v_texcoord.y)).rgb * 2.0 - 1.0;\n";
            } else {
                shader.vectorShader += "  v_normal = (u_modelMatrix * vec4(a_normal, 0)).xyz;\n";
                shader.vectorShader += "  v_lightDirection = u_lightDirection;\n";
                shader.fragmentShader += "  vec3 normal = normalize(v_normal);\n";
            }

            shader.fragmentShader += "  vec3 lightDirection = v_lightDirection;\n";
            shader.fragmentShader += "  float light = max(dot(normal, lightDirection), 0.0);\n";
            if (private.ambientLight !== none) shader.fragmentShader += "  light += u_ambientLight;\n";
        } else {
            if (private.ambientLight !== none) shader.fragmentShader += "  float light = u_ambientLight;\n";
        }

        if (private.directionalLight === "Color") 
            shader.vectorShader += "  v_lightColor = u_lightColor;\n";

        if (private.colors === none)
            shader.fragmentShader += "  gl_FragColor = vec4(0, 0, 0, 1.0);\n";
        else if (private.colors === "vec4") {
            shader.vectorShader += "  v_color = a_color;\n";
            shader.fragmentShader += "  gl_FragColor = v_color;\n";
        } else {
            shader.vectorShader += "  v_color = a_color;\n";
            shader.fragmentShader += "  gl_FragColor = vec4(v_color, 1.0);\n";
        }

        if (private.textureCoords === "vec2") {
            if (private.diffuseTexture === "RGB")
                shader.fragmentShader += "  gl_FragColor += texture2D(u_diffuse, vec2(v_texcoord.x, 1.0 - v_texcoord.y));\n";
        }

        if (private.ambientLight !== none || private.directionalLight !== none)
            shader.fragmentShader += "  gl_FragColor.rgb *= light;\n";

        if (private.textureCoords === "vec2") {
            if (private.emmissiveTexture === "RGB")
                shader.fragmentShader += "  gl_FragColor.rgb += texture2D(u_emmissive, vec2(v_texcoord.x, 1.0 - v_texcoord.y)).rgb;\n";
        }
    }

    public.compile = function () {
        const shader = frag.CustomShader(engine, private.matrix === "mat4")
            .name(private.name);

        const source = {
            vectorShader: "",
            fragmentShader: "precision mediump float;\n"
        }

        private.addAttributeDeclarations(source);
        private.addUniformDeclarations(source);
        private.addVaryingDeclarations(source);

        if (private.directionalLight !== none && private.normalMap !== none) {
            source.vectorShader += "highp mat3 transpose(in highp mat3 inMatrix) {\n";
            source.vectorShader += "    highp vec3 i0 = inMatrix[0];\n";
            source.vectorShader += "    highp vec3 i1 = inMatrix[1];\n";
            source.vectorShader += "    highp vec3 i2 = inMatrix[2];\n";
            source.vectorShader += "    highp mat3 outMatrix = mat3(\n";
            source.vectorShader += "        vec3(i0.x, i1.x, i2.x),\n";
            source.vectorShader += "        vec3(i0.y, i1.y, i2.y),\n";
            source.vectorShader += "        vec3(i0.z, i1.z, i2.z)\n";
            source.vectorShader += "    );\n";
            source.vectorShader += "    return outMatrix;\n";
            source.vectorShader += "}\n";
        }

        source.vectorShader += "void main() {\n";
        source.fragmentShader += "void main() {\n";

        private.addLogic(source);

        source.vectorShader += "}\n";
        source.fragmentShader += "}\n";

        shader.source(source.vectorShader, source.fragmentShader);

        if (private.verticies !== none) shader.attribute("position");
        if (private.colors !== none) shader.attribute("color");
        if (private.textureCoords !== none) shader.attribute("texcoord");
        if (private.normals !== none) shader.attribute("normal");
        if (private.tangents !== none) shader.attribute("tangent");
        if (private.bitangents !== none) shader.attribute("bitangent");

        if (private.diffuseTexture !== none) shader.uniform("diffuse");
        if (private.emmissiveTexture !== none) shader.uniform("emmissive");
        if (private.normalMap !== none) shader.uniform("normal");
        if (private.roughnessTexture !== none) shader.uniform("roughness");
        if (private.shininessTexture != none) shader.uniform("glossiness");

        if (private.ambientLight !== none) {
            if (private.ambientLight === "Texture") shader.uniform("ambient");
            else shader.uniform("ambientLight", "1f", 0.5);
        }

        if (private.displacementTexture !== none) {
            shader.uniform("height");
            shader.uniform("displacementScale", "1f", 0.2);
        }
    
        if (private.matrix !== none) {
            if (private.directionalLight !== none)
                shader.uniform("modelMatrix");
            shader.uniform("clipMatrix");
        }

        if (private.directionalLight !== none) {
            shader.uniform("lightDirection", "3fv");

            if (private.directionalLight === "Color")
                shader.uniform("lightColor", "3fv");

            const balanceAmbient = private.ambientLight === "Balanced" && shader.ambientLight;
            const innerLightDirection = shader.lightDirection;

            shader.lightDirection = function (direction) {
                const length = frag.Vector.length(direction);
                if (length > 1) {
                    innerLightDirection([-direction[0] / length, -direction[1] / length, -direction[2] / length]);
                    if (balanceAmbient) shader.ambientLight(0);
                } else {
                    innerLightDirection([-direction[0], -direction[1], -direction[2]]);
                    if (balanceAmbient) shader.ambientLight(1 - length);
                }
                return shader;
            };

            if (private.directionalLight === "White")
                shader.lightDirection([0.8, -0.2, 0.8]);
            else if (private.directionalLight === "Grey")
                shader.lightDirection([0.5, -0.1, 0.5]);
        }

        return shader;
    }
    return public;
};


/***/ }),

/***/ "./src/Shaders/UiShader.js":
/*!*********************************!*\
  !*** ./src/Shaders/UiShader.js ***!
  \*********************************/
/***/ (() => {

window.frag.UiShader = function(engine) {
    if (!engine.uiShader) {
        engine.uiShader = window.frag.Shader(engine)
            .name("UI")
            .verticiesXY(-1)  // Renders in xy plane with z = -1
            .matrix2D()       // Transformation matricies are 2D
            .diffuseTexture() // Adds support for diffuse texture mapping
            .compile();       // Compile the shader
    }
    return engine.uiShader;
}

/***/ }),

/***/ "./src/Shapes/Cube.js":
/*!****************************!*\
  !*** ./src/Shapes/Cube.js ***!
  \****************************/
/***/ (() => {

// This cube consists of a single sub-mesh so that smooth shading works correctly
window.frag.Cube = function (engine, frontFacets, options) {
    let backFacets = frontFacets;
    let topFacets = frontFacets;
    let bottomFacets = frontFacets;
    let leftFacets = frontFacets;
    let rightFacets = frontFacets;

    let color;
    let duplicateTexture = false;

    if (options) {
        if (options.frontFacets !== undefined) frontFacets = options.frontFacets;
        if (options.backFacets !== undefined) backFacets = options.backFacets;
        if (options.topFacets !== undefined) topFacets = options.topFacets;
        if (options.bottomFacets !== undefined) bottomFacets = options.bottomFacets;
        if (options.leftFacets !== undefined) leftFacets = options.leftFacets;
        if (options.rightFacets !== undefined) rightFacets = options.rightFacets;

        if (options.color !== undefined) color = options.color;
        if (options.duplicateTexture !== undefined) duplicateTexture = options.duplicateTexture;
    }

    let u0 = 0;
    let u1 = 1 / 4;
    let u2 = 2 / 4;
    let u3 = 3 / 4;
    let u4 = 1;

    let v0 = 0;
    let v1 = 1 / 3;
    let v2 = 2 / 3;
    let v3 = 1;

    const corners = [
        [-1, -1, -1],
        [+1, -1, -1],
        [+1, +1, -1],
        [-1, +1, -1],
        [+1, -1, +1],
        [-1, -1, +1],
        [-1, +1, +1],
        [+1, +1, +1],
    ];

    const verticies = [];
    const uvs = [];
    const colors = color ? [] : undefined;

    const addVertex = function(v) {
        verticies.push(v[0]);
        verticies.push(v[1]);
        verticies.push(v[2]);
        if (color) {
            color.forEach(c => { colors.push(c); });
        }
    }

    const addUv = function (u, v) {
        uvs.push(u);
        uvs.push(v);
    }

    const addFacetVerticies = function (bottomRight, topRight, bottomLeft, topLeft){
        addVertex(bottomRight);
        addVertex(topRight);
        addVertex(bottomLeft);
        addVertex(topLeft);
        addVertex(bottomLeft);
        addVertex(topRight);
    }

    const addFacetUvs = function (uLeft, vBottom, uRight, vTop) {
        addUv(uRight, vBottom);
        addUv(uRight, vTop);
        addUv(uLeft, vBottom);
        addUv(uLeft, vTop);
        addUv(uLeft, vBottom);
        addUv(uRight, vTop);
    }

    const addFace = function (facets, bottomRight, bottomLeft, topLeft, uLeft, vBottom, uRight, vTop) {
        for (var vFacet = 0; vFacet < facets; vFacet++) {
            const vFracLow = vFacet / facets;
            const vFracHigh = (vFacet + 1) / facets;

            const vFacetBottom = (vTop - vBottom) * vFracLow + vBottom;
            const vFacetTop = (vTop - vBottom) * vFracHigh + vBottom;

            for (hFacet = 0; hFacet < facets; hFacet++) {
                const hFracLow = hFacet / facets;
                const hFracHigh = (hFacet + 1) / facets;

                const Vector = window.frag.Vector;
                const up = Vector.sub(corners[topLeft], corners[bottomLeft]);
                const right = Vector.sub(corners[bottomRight], corners[bottomLeft]);

                const facetBottomLeft = Vector.add(Vector.add(corners[bottomLeft], Vector.mult(right, hFracLow)), Vector.mult(up, vFracLow));
                const facetBottomRight = Vector.add(Vector.add(corners[bottomLeft], Vector.mult(right, hFracHigh)), Vector.mult(up, vFracLow));
                const facetTopLeft = Vector.add(Vector.add(corners[bottomLeft], Vector.mult(right, hFracLow)), Vector.mult(up, vFracHigh));
                const facetTopRight = Vector.add(Vector.add(corners[bottomLeft], Vector.mult(right, hFracHigh)), Vector.mult(up, vFracHigh));

                addFacetVerticies(facetBottomRight, facetTopRight, facetBottomLeft, facetTopLeft);

                const uFacetLeft = (uRight - uLeft) * hFracLow + uLeft;
                const uFacetRight = (uRight - uLeft) * hFracHigh + uLeft;

                addFacetUvs(uFacetLeft, vFacetBottom, uFacetRight, vFacetTop);
            }
        }
    }

    if (duplicateTexture) {
        if (frontFacets) addFace(frontFacets, 1, 0, 3, u4, v3, u0, v0); // front
        if (bottomFacets) addFace(bottomFacets, 4, 5, 0, u4, v3, u0, v0); // bottom
        if (leftFacets) addFace(leftFacets, 0, 5, 6, u4, v3, u0, v0); // left
        if (rightFacets) addFace(rightFacets, 4, 1, 2, u4, v3, u0, v0); // right
        if (backFacets) addFace(backFacets, 5, 4, 7, u4, v3, u0, v0); // back
        if (topFacets) addFace(topFacets, 6, 7, 2, u4, v3, u0, v0); // top
    } else {
        if (frontFacets) addFace(frontFacets, 1, 0, 3, u1, v2, u0, v1); // front
        if (bottomFacets) addFace(bottomFacets, 4, 5, 0, u2, v2, u1, v1); // bottom
        if (leftFacets) addFace(leftFacets, 0, 5, 6, u2, v2, u1, v3); // left
        if (rightFacets) addFace(rightFacets, 4, 1, 2, u1, v1, u2, v0); // right
        if (backFacets) addFace(backFacets, 5, 4, 7, u2, v1, u3, v2); // back
        if (topFacets) addFace(topFacets, 6, 7, 2, u3, v1, u4, v2); // top
    }

    return window.frag.Mesh(engine).addTriangles(verticies, colors, uvs);
};

/***/ }),

/***/ "./src/Shapes/Cylinder.js":
/*!********************************!*\
  !*** ./src/Shapes/Cylinder.js ***!
  \********************************/
/***/ (() => {

window.frag.Cylinder = function (engine, endFacets, options) {
    endFacets = endFacets || 16;
    let sideFacets = 1;
    let topRadius = 1;
    let bottomRadius = 1;
    let drawTop = true;
    let drawBottom = true;
    let color;

    if (options) {
        if (options.sideFacets !== undefined) sideFacets = options.sideFacets;
        if (options.color !== undefined) color = options.color;
        if (options.topRadius !== undefined) topRadius = options.topRadius;
        if (options.bottomRadius !== undefined) bottomRadius = options.bottomRadius;
        if (options.drawTop !== undefined) drawTop = options.drawTop;
        if (options.drawBottom !== undefined) drawBottom = options.drawBottom;
    }

    if (endFacets < 3) endFacets = 3;
    if (topRadius === 0) drawTop = false;
    if (bottomRadius === 0) drawBottom = false;

    const step = Math.PI * 2 / endFacets;
    const mesh = window.frag.Mesh(engine);

    if (sideFacets) {
        const verticies = [];
        const colors = color ? [] : undefined;
        const uvs = [];
        const radiusDelta = topRadius - bottomRadius;

        const push = function(x, y,  z) {
            verticies.push(x);
            verticies.push(y);
            verticies.push(z);
            if (color) color.forEach(c => colors.push(c));
            uvs.push((x + 1) * 0.5);
            uvs.push((y + 1) * 0.5);
        }

        for (let s = 0; s < sideFacets; s++) {
            const f0 = s / sideFacets;
            const f1 = (s + 1) / sideFacets;
            const z0 = 1 - 2 * f0;
            const z1 = 1 - 2 * f1;
            const radius0 = radiusDelta * f0 + bottomRadius;
            const radius1 = radiusDelta * f1 + bottomRadius;
            for (let i = 0; i <= endFacets; i++) {
                const angle = i * step;
                const x = Math.sin(angle);
                const y = Math.cos(angle);

                push(x * radius0, y * radius0, z0);
                push(x * radius1, y * radius1, z1);
            }
            push(0, radius1, z1);
            mesh.addTriangleStrip(verticies, colors, uvs);
        }
    }

    if (drawTop) {
        const verticies = [0, 0, -1];
        const uvs = [0.5, 0.5];
        const normals = [0, 0, -1];
        const colors = color ? Array.from(color) : undefined;
    
        for (let i = 0; i <= endFacets; i++) {
            const angle = -i * step;
            const x = Math.sin(angle);
            const y = Math.cos(angle);

            verticies.push(x * topRadius);
            verticies.push(y * topRadius);
            verticies.push(-1);

            if (color) color.forEach(c => colors.push(c));

            uvs.push((x + 1) * 0.5);
            uvs.push((y + 1) * 0.5);

            normals.push(x);
            normals.push(y);
            normals.push(-1);
        }
        mesh.addTriangleFan(verticies, colors, uvs, normals);
    }

    if (drawBottom) {
        const verticies = [0, 0, 1];
        const uvs = [0.5, 0.5];
        const normals = [0, 0, 1];
        const colors = color ? Array.from(color) : undefined;

        for (let i = 0; i <= endFacets; i++) {
            const angle = i * step;
            const x = Math.sin(angle);
            const y = Math.cos(angle);

            verticies.push(x * bottomRadius);
            verticies.push(y * bottomRadius);
            verticies.push(1);

            if (color) color.forEach(c => colors.push(c));

            uvs.push((x + 1) * 0.5);
            uvs.push((y + 1) * 0.5);

            normals.push(x);
            normals.push(y);
            normals.push(1);
        }
        mesh.addTriangleFan(verticies, colors, uvs, normals);
    }

    return mesh;
};


/***/ }),

/***/ "./src/Shapes/Disc.js":
/*!****************************!*\
  !*** ./src/Shapes/Disc.js ***!
  \****************************/
/***/ (() => {

window.frag.Disc = function (engine, facets, options) {
    facets = facets || 32;
    let color;

    if (options) {
        if (options.color !== undefined) color = options.color;
    }

    const verticies = [0, 0, 0];
    const uvs = [0.5, 0.5];
    const normals = [0, 0, -1];
    const colors = color ? Array.from(color) : undefined;

    const step = Math.PI * 2 / facets;

    for (var i = 0; i <= facets; i++) {
        const angle = -i * step;
        const x = Math.sin(angle);
        const y = Math.cos(angle);

        verticies.push(x);
        verticies.push(y);
        verticies.push(0);
        
        if (color) color.forEach(c => colors.push(c));

        normals.push(0);
        normals.push(0);
        normals.push(-1);

        uvs.push((x + 1) * 0.5);
        uvs.push((y + 1) * 0.5);
    }

    return window.frag.Mesh(engine).addTriangleFan(verticies, colors, uvs, normals);
};

/***/ }),

/***/ "./src/Shapes/Plane.js":
/*!*****************************!*\
  !*** ./src/Shapes/Plane.js ***!
  \*****************************/
/***/ (() => {

window.frag.Plane = function (engine, facets, options) {
    facets = facets || 1;
    options = options || {};

    if (facets === 1) {
        const c = options.color || [0, 0, 0];
        const data = new Float32Array([
            1, -1, 0, 1, 1, 0, -1, -1, 0, -1, 1, 0, // verticies
            c[0], c[1], c[2], c[0], c[1], c[2], c[0], c[1], c[2], c[0], c[1], c[2],  // colors
            1, 0, 1, 1, 0, 0, 0, 1, // uvs
            0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, // normals 
            1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, // tangents
            0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, // bitangents
        ]);

        return window.frag.Mesh(engine).fromBuffer(
            data.buffer, 3, 4, engine.gl.TRIANGLE_STRIP,
            0 * Float32Array.BYTES_PER_ELEMENT,
            12 * Float32Array.BYTES_PER_ELEMENT,
            24 * Float32Array.BYTES_PER_ELEMENT,
            32 * Float32Array.BYTES_PER_ELEMENT,
            44 * Float32Array.BYTES_PER_ELEMENT,
            56 * Float32Array.BYTES_PER_ELEMENT,
        );
    }
 
    const verticies = [];
    const uvs = [];
    const normals = [];
    const colors = options.color ? [] : undefined;

    const add = function (u, v) {
        verticies.push(u * 2 - 1);
        verticies.push(v * 2 - 1);
        verticies.push(0);

        if (options.color)
            options.color.forEach(c => colors.push(c));

        uvs.push(u);
        uvs.push(v);

        normals.push(0);
        normals.push(0);
        normals.push(-1);
    }

    for (let row = 0; row < facets; row++) {
        const v0 = row / facets;
        const v1 = (row + 1) / facets;
        for (let column = 0; column < facets; column++) {
            const u0 = column / facets;
            const u1 = (column + 1) / facets;
            add(u0, v0);
            add(u1, v0);
            add(u1, v1);
            add(u0, v0);
            add(u1, v1);
            add(u0, v1);
        }
    }

    return window.frag.Mesh(engine).addTriangles(verticies, colors, uvs, normals);
};

/***/ }),

/***/ "./src/Shapes/Sphere.js":
/*!******************************!*\
  !*** ./src/Shapes/Sphere.js ***!
  \******************************/
/***/ (() => {

// This sphere consists of a single sub-mesh so that smooth shading works correctly
window.frag.Sphere = function (engine, latitudeFacets, options) {
    if (latitudeFacets === undefined) latitudeFacets = 12;
    let longitudeFacets = latitudeFacets * 2;

    let latitudeStart = 0;
    let latitudeLength = Math.PI;
    
    let longitudeStart = 0;
    let longitudeLength = 2 * Math.PI;

    let color;

    if (options) {
        if (options.latitudeStart !== undefined) latitudeStart = options.latitudeStart;
        if (options.latitudeLength !== undefined) latitudeLength = options.latitudeLength;
        if (options.latitudeFacets !== undefined) latitudeFacets = options.latitudeFacets;

        if (options.longitudeStart !== undefined) longitudeStart = options.longitudeStart;
        if (options.longitudeLength !== undefined) longitudeLength = options.longitudeLength;
        if (options.longitudeFacets !== undefined) longitudeFacets = options.longitudeFacets;

        if (options.color !== undefined) color = options.color;
    }

    if (latitudeFacets < 2) latitudeFacets = 2;
    if (longitudeFacets < 3) longitudeFacets = 3;
    if (latitudeStart < 0) latitudeStart = 0;
    if (latitudeStart + latitudeLength > Math.PI) latitudeLength = Math.PI - latitudeStart;
    if (longitudeLength > 2 * Math.PI) longitudeLength = 2 * Math.PI;

    const verticies = [];
    const uvs = [];

    for (let iy = 0; iy <= latitudeFacets; iy++) {
        const v = iy / latitudeFacets;
        let uOffset = 0;
        if (iy === 0 && latitudeStart === 0)
            uOffset = 0.5 / longitudeFacets;
        else if (iy === latitudeFacets && (latitudeStart + latitudeLength) === Math.PI)
            uOffset = -0.5 / longitudeFacets;

        for (ix = 0; ix <= longitudeFacets; ix++) {
            const u = ix / longitudeFacets;
            vertex = {
                x: Math.cos(longitudeStart + u * longitudeLength) * Math.sin(latitudeStart + v * latitudeLength),
                y: Math.cos(latitudeStart + v * latitudeLength),
                z: Math.sin(longitudeStart + u * longitudeLength) * Math.sin(latitudeStart + v * latitudeLength)
            };
            verticies.push(vertex);
            uvs.push({ u, v });
        }
    }

    const triangleVerticies = [];
    const triangleColors = color ? [] : undefined;
    const triangleUvs = [];

    const addVertex = function(index) {
        const vertex = verticies[index];
        triangleVerticies.push(vertex.x);
        triangleVerticies.push(vertex.y);
        triangleVerticies.push(vertex.z);

        const uv = uvs[index];
        triangleUvs.push(uv.u);
        triangleUvs.push(uv.v);

        if (color) color.forEach(c => { triangleColors.push(c); });
    }

    const addTriangle = function(ia, ib, ic) {
        addVertex(ia);
        addVertex(ib);
        addVertex(ic);
    }

    for (let iy = 0; iy < latitudeFacets; iy++) {
        const r0 = iy * (longitudeFacets + 1);
        const r1 = (iy + 1) * (longitudeFacets + 1);
        for (let ix = 0; ix < longitudeFacets; ix++) {
            if (iy !== 0 || latitudeStart > 0)
                addTriangle(r0 + ix + 1, r0 + ix, r1 + ix + 1);
            if (iy !== latitudeFacets - 1 || (latitudeStart + latitudeLength) < Math.PI)
                addTriangle(r0 + ix, r1 + ix, r1 + ix + 1);
        }
    }

    return window.frag.Mesh(engine).addTriangles(triangleVerticies, triangleColors, triangleUvs);
};

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__(/*! ./Math/Vector */ "./src/Math/Vector.js");
__webpack_require__(/*! ./Math/Triangle */ "./src/Math/Triangle.js");
__webpack_require__(/*! ./Math/Matrix */ "./src/Math/Matrix.js");
__webpack_require__(/*! ./Math/Quaternion */ "./src/Math/Quaternion.js")

__webpack_require__(/*! ./Framework/Observable */ "./src/Framework/Observable.js");
__webpack_require__(/*! ./Framework/Transform */ "./src/Framework/Transform.js");
__webpack_require__(/*! ./Framework/Transform2D */ "./src/Framework/Transform2D.js");
__webpack_require__(/*! ./Framework/Transform3D */ "./src/Framework/Transform3D.js");
__webpack_require__(/*! ./Framework/Location */ "./src/Framework/Location.js");
__webpack_require__(/*! ./Framework/Engine */ "./src/Framework/Engine.js");

__webpack_require__(/*! ./Shaders/CustomShader */ "./src/Shaders/CustomShader.js");
__webpack_require__(/*! ./Shaders/Shader */ "./src/Shaders/Shader.js");
__webpack_require__(/*! ./Shaders/UiShader */ "./src/Shaders/UiShader.js");
__webpack_require__(/*! ./Shaders/FontShader */ "./src/Shaders/FontShader.js");
__webpack_require__(/*! ./Shaders/ParticleShader3D */ "./src/Shaders/ParticleShader3D.js");
__webpack_require__(/*! ./Shaders/ParticleShader2D */ "./src/Shaders/ParticleShader2D.js");

__webpack_require__(/*! ./Materials/Texture */ "./src/Materials/Texture.js");
__webpack_require__(/*! ./Materials/Font */ "./src/Materials/Font.js");
__webpack_require__(/*! ./Materials/Material */ "./src/Materials/Material.js");

__webpack_require__(/*! ./SceneGraph/VertexData */ "./src/SceneGraph/VertexData.js");
__webpack_require__(/*! ./SceneGraph/Mesh */ "./src/SceneGraph/Mesh.js");
__webpack_require__(/*! ./SceneGraph/MeshOptimizer */ "./src/SceneGraph/MeshOptimizer.js");
__webpack_require__(/*! ./SceneGraph/Model */ "./src/SceneGraph/Model.js");
__webpack_require__(/*! ./SceneGraph/ScenePosition */ "./src/SceneGraph/ScenePosition.js");
__webpack_require__(/*! ./SceneGraph/SceneObject */ "./src/SceneGraph/SceneObject.js");
__webpack_require__(/*! ./SceneGraph/Scene */ "./src/SceneGraph/Scene.js");
__webpack_require__(/*! ./SceneGraph/DrawContext */ "./src/SceneGraph/DrawContext.js");
__webpack_require__(/*! ./SceneGraph/PositionLink */ "./src/SceneGraph/PositionLink.js");

__webpack_require__(/*! ./Cameras/cameraMixin */ "./src/Cameras/cameraMixin.js");
__webpack_require__(/*! ./Cameras/UiCamera */ "./src/Cameras/UiCamera.js");
__webpack_require__(/*! ./Cameras/OrthographicCamera */ "./src/Cameras/OrthographicCamera.js");
__webpack_require__(/*! ./Cameras/PerspectiveCamera */ "./src/Cameras/PerspectiveCamera.js");
__webpack_require__(/*! ./Cameras/FrustumCamera */ "./src/Cameras/FrustumCamera.js");

__webpack_require__(/*! ./Animations/Animation */ "./src/Animations/Animation.js");
__webpack_require__(/*! ./Animations/ObjectAnimationState */ "./src/Animations/ObjectAnimationState.js");
__webpack_require__(/*! ./Animations/ModelAnimation */ "./src/Animations/ModelAnimation.js");
__webpack_require__(/*! ./Animations/SceneObjectAnimation */ "./src/Animations/SceneObjectAnimation.js");
__webpack_require__(/*! ./Animations/ValueAnimationAction */ "./src/Animations/ValueAnimationAction.js");
__webpack_require__(/*! ./Animations/KeyframeAnimationAction */ "./src/Animations/KeyframeAnimationAction.js");
__webpack_require__(/*! ./Animations/ParallelAnimationAction */ "./src/Animations/ParallelAnimationAction.js");
__webpack_require__(/*! ./Animations/RepeatAnimationAction */ "./src/Animations/RepeatAnimationAction.js");
__webpack_require__(/*! ./Animations/PositionAnimationAction */ "./src/Animations/PositionAnimationAction.js");

__webpack_require__(/*! ./Shapes/Cube */ "./src/Shapes/Cube.js");
__webpack_require__(/*! ./Shapes/Cylinder */ "./src/Shapes/Cylinder.js");
__webpack_require__(/*! ./Shapes/Disc */ "./src/Shapes/Disc.js");
__webpack_require__(/*! ./Shapes/Plane */ "./src/Shapes/Plane.js");
__webpack_require__(/*! ./Shapes/Sphere */ "./src/Shapes/Sphere.js");

__webpack_require__(/*! ./Loaders/AssetCatalog */ "./src/Loaders/AssetCatalog.js");
__webpack_require__(/*! ./Loaders/PackageLoader */ "./src/Loaders/PackageLoader.js");

__webpack_require__(/*! ./Input/InputMethod */ "./src/Input/InputMethod.js");
__webpack_require__(/*! ./Input/DigitalState */ "./src/Input/DigitalState.js");
__webpack_require__(/*! ./Input/AnalogState */ "./src/Input/AnalogState.js");
__webpack_require__(/*! ./Input/DigitalInput */ "./src/Input/DigitalInput.js");
__webpack_require__(/*! ./Input/AnalogInput */ "./src/Input/AnalogInput.js");
__webpack_require__(/*! ./Input/DigitalAction */ "./src/Input/DigitalAction.js");
__webpack_require__(/*! ./Input/AnalogAction */ "./src/Input/AnalogAction.js");

__webpack_require__(/*! ./Particles/CustomParticleSystem */ "./src/Particles/CustomParticleSystem.js");
__webpack_require__(/*! ./Particles/CustomParticleEmitter */ "./src/Particles/CustomParticleEmitter.js");
__webpack_require__(/*! ./Particles/MineExplosionEmitter */ "./src/Particles/MineExplosionEmitter.js");
__webpack_require__(/*! ./Particles/SphericalExplosionEmitter */ "./src/Particles/SphericalExplosionEmitter.js");
__webpack_require__(/*! ./Particles/SprayEmitter */ "./src/Particles/SprayEmitter.js");
__webpack_require__(/*! ./Particles/RainEmitter */ "./src/Particles/RainEmitter.js");

var env = "development" || 0;
if (env === 'development') {
    __webpack_require__(/*! ./Shaders/ParticleShaderDebug */ "./src/Shaders/ParticleShaderDebug.js");
}

})();

/******/ })()
;