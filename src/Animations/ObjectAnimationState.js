// Represents the current state of an object being animated
window.frag.ObjectAnimationState = function () {
    const private = {
        is3d: true,
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

    const public = {
        __private: private,
    };

    public.getMatrix = function () {
        if (!private.matrix) {
            let transform;
            if (private.is3d) {
                transform = window.frag.Transform()
                    .translateXYZ(private.translateX, private.translateY, private.translateZ)
                    .rotateXYZ(private.rotateX, private.rotateY, private.rotateZ)
                    .scaleXYZ(private.scaleX, private.scaleY, private.scaleZ);
            } else {
                transform = window.frag.Transform2D()
                    .translateXY(private.translateX, private.translateY)
                    .rotate(private.rotateZ)
                    .scaleXY(private.scaleX, private.scaleY);
            }
            private.matrix = transform.getMatrix();
        }
        return private.matrix;
    }

    public.getUpdateFunction = function(channelName) {
        switch (channelName) {
            case "translate-x":
                if (private.is3d)
                    return function (value) {
                        private.translateX = value;
                        if (private.matrix) private.matrix[12] = value;
                    }
                return function (value) {
                    private.translateX = value;
                    if (private.matrix) private.matrix[6] = value;
                };
            case "translate-y":
                if (private.is3d)
                    return function (value) {
                        private.translateY = value;
                        if (private.matrix) private.matrix[13] = value;
                    }
                return function (value) {
                    private.translateY = value;
                    if (private.matrix) private.matrix[7] = value;
                };
            case "translate-z":
                if (private.is3d)
                    return function (value) {
                        private.translateY = value;
                        if (private.matrix) private.matrix[14] = value;
                    }

            case "scale-x":
                return function (value) {
                    private.scaleX = value;
                    private.matrix = null;
                };
            case "scale-y":
                return function (value) {
                    private.scaleY = value;
                    private.matrix = null;
                };
            case "scale-z":
                if (private.is3d)
                    return function (value) {
                        private.scaleZ = value;
                        private.matrix = null;
                    }

            case "rotate-x":
                if (private.is3d)
                    return function (value) {
                        private.rotateX = value;
                        private.matrix = null;
                    }
            case "rotate-y":
                if (private.is3d)
                    return function (value) {
                        private.rotateY = value;
                        private.matrix = null;
                    }
            case "rotate-z":
                return function (value) {
                    private.rotateZ = value;
                    private.matrix = null;
                };
        }
        console.warn("Unsupported animation channel " + channelName);
        return function () { };
    };

    return public;
}
