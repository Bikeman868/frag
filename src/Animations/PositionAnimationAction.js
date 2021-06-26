// Provides a mechanism to move an object in the scene at a specific speed
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
        private.moveTo = location;
        return public;
    }

    public.moveToXYZ = function (x, y, z) {
        return public.moveTo([x, y, z]);
    }

    public.moveToXY = function (x, y) {
        return public.moveTo([x, y]);
    }

    public.rotateTo = function (vector) {
        private.rotateTo = vector;
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

    public.start = function (animation, gameTick) {
        private.startLocation = private.scenePosition.getLocation();
        private.startRotate = private.scenePosition.getRotate();

        if (private.moveTo) {
            let distance = Vector.length(Vector.sub(private.moveTo - private.startLocation));
            public.duration = Math.floor(private.ticksPerDistance * distance + 1);
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

        if (private.moveTo) {
            moveBy = Vector.sub(private.moveTo - private.startLocation);
        }
        
        if (private.rotateTo) {
            rotateBy = Vector.sub(private.rotateTo - private.startRotate);
        }

        if (moveBy) {
            private.scenePosition.location(Vector.add(private.startLocation, Vector.mult(moveBy, r)));
        }

        if (rotateBy) {
            private.scenePosition.rotate(Vector.add(private.startRotate, Vector.mult(rotateBy, r)));
        }

        return public;
    }

    public.stop = function (animation, gameTick) {
        if (private.onStop) private.onStop(animation, public, gameTick);
        return public;
    }

    return public;
}
