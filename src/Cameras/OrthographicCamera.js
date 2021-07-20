// This camera draws objects in their actual size regardless of how far from the camera they are.
// The frustrum affects z clip space and XY scaling to the viewport but does not scale objects in the scene

window.frag.OrthographicCamera = function (engine) {
    const private = {
        x: 0,
        y: 0,
        z: -200,
        fov: 35 * Math.PI / 180,
        zNear: -100,
        zFar: 100,
        xScale: 100,
        aspectRatio: 1,
    };

    const public = {
        __private: private,
        worldToClipTransform: window.frag.Transform(engine)
    };

    const computeTransformMatrix = function () {
        const xScale = 1 / private.xScale;
        const yScale = private.aspectRatio / private.xScale;

        const zScale = 2 / (private.zFar - private.zNear);
        const zOffset = 1 - (private.zFar * zScale);

        public.worldToClipTransform
            .identity()
            .translateZ(zOffset)
            .scaleXYZ(xScale, yScale, zScale)
            .translateXY(-private.x, -private.y);
    }

    public.moveToXY = function (x, y) {
        private.x = x;
        private.y = y;

        computeTransformMatrix();

        return public;
    }

    public.moveToXYZ = function (x, y, z) {
        private.x = x;
        private.y = y;
        private.z = z;

        computeTransformMatrix();

        return public;
    }

    public.moveToX = function (x) {
        private.x = x;

        computeTransformMatrix();

        return public;
    }

    public.moveToY = function (y) {
        private.y = y;

        computeTransformMatrix();

        return public;
    }

    public.moveToZ = function (z) {
        private.z = z;

        computeTransformMatrix();

        return public;
    }

    public.frustrum = function (fieldOfView, zNear, zFar) {
        private.fov = fieldOfView;
        private.zNear = zNear;
        private.zFar = zFar;

        computeTransformMatrix();

        return public;
    }

    public.scaleX = function (x) {
        private.xScale = x;

        computeTransformMatrix();

        return public;
    }

    public.setViewport = function (gl) {
        gl.viewport(0, 0, gl.canvas.clientWidth, gl.canvas.clientHeight);
        gl.canvas.width = gl.canvas.clientWidth;
        gl.canvas.height = gl.canvas.clientHeight;

        return public.adjustToViewport(gl);
    };

    public.adjustToViewport = function (gl) {
        const aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;

        if (aspectRatio != private.aspectRatio) {
            private.aspectRatio = aspectRatio;
            const matrix = public.worldToClipTransform.getMatrix();
            matrix[5] = matrix[0] * aspectRatio;
            public.worldToClipTransform.setMatrix(matrix);
        }

        return public;
    }

    public.dispose = function () {
    }

    return public;
};
