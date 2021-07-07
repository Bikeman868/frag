// Provides a mechanism to move an object in the scene at a specific speed
window.frag.PositionAnimationAction = function (scenePosition, invLinearVelocity, invAngularVelocity) {
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

    public.rotateTo = function (eulerAngles, invAngularVelocity) {
        if (invAngularVelocity) private.invLinearVelocity = undefined;
        private.invAngularVelocity = invAngularVelocity || private.invAngularVelocity || 10;
        private.rotateTo = eulerAngles;
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

    return public;
}
