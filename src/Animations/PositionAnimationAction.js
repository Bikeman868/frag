// Provides a mechanism to change a value over time. For example smoothly change
// one color into another or smoothly move an object within the scene.
// ValueAnimationAction objects can be passed to an Animation object as the action
// to take in one of the steps in an animation sequence
window.frag.PositionAnimationAction = function (scenePosition, ticksPerDistance) {
    const frag = window.frag;
    const Vector = frag.Vector;

    const private = {
        scenePosition,
        ticksPerDistance,
        startLocation: undefined,
        startRotate: undefined,
        moveBy: undefined,
        rotateBy: undefined,
    };

    const public = {
        __private: private,
    };

    public.setInterval = function (gameTicks) {
        public.interval = gameTicks;
        return public;
    }

    public.moveBy = function (vector) {
        let distance = Vector.length(vector);
        private.moveBy = vector;
        public.duration = Math.floor(private.ticksPerDistance * distance + 1);
        return public;
    }

    public.moveByXYZ = function (x, y, z) {
        return public.moveBy([x, y, z]);
    }

    public.moveByXY = function (x, y) {
        return public.moveBy([x, y]);
    }

    public.rotateBy = function (vector) {
        private.rotateBy = vector;
        return public;
    }

    public.moveTo = function (location) {
        let current = private.scenePosition.getLocation();
        public.moveBy(Vector.sub(current, location));
        return public;
    }

    public.moveToXYZ = function (x, y, z) {
        return public.moveTo([x, y, z]);
    }

    public.moveToXY = function (x, y) {
        return public.moveTo([x, y]);
    }

    public.onStart = function (onStart) {
        private.onStart = onStart;
        return public;
    }

    public.onStop = function (onStop) {
        private.onStop = onStop;
        return public;
    }

    public.start = function (animation, gameTick) {
        private.startLocation = private.scenePosition.getLocation();
        private.startRotate = private.scenePosition.getRotate();
        private.startTick = gameTick;
        private.endTick = gameTick + public.duration;
        if (private.onStart) private.onStart(animation, public, gameTick);
        return public;
    }

    public.action = function (animation, gameTick) {
        const r = (gameTick - private.startTick) / public.duration;
        if (private.moveBy) {
            private.scenePosition.location(Vector.add(private.startLocation, Vector.mult(private.moveBy, r)));
        }
        if (private.rotateBy) {
            private.scenePosition.rotate(Vector.add(private.startRotate, Vector.mult(private.rotateBy, r)));
        }
        return public;
    }

    public.stop = function (animation, gameTick) {
        if (private.onStop) private.onStop(animation, public, gameTick);
        return public;
    }

    return public;
}
