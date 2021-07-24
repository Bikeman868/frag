// This camera draws objects in their actual size regardless of how far from the camera they are.
// The frustrum affects z clip space and XY scaling to the viewport but does not scale objects in the scene

window.frag.OrthographicCamera = function (engine) {
    const private = {
        worldTransform: window.frag.Transform3D(engine),
        position: window.frag.ScenePosition(engine),
        projectionMatrix: null,
        worldMatrix: null,
        transformChanged: true,
        positionChanged: true,
        frustrumChanged: true,
        zNear: 100,
        zFar: 200,
        xScale: 100,
        aspectRatio: 1,
    };

    const public = {
        __private: private,
        worldToClipTransform: window.frag.Transform3D(engine)
    };

    private.onPositionChanged = function() {
        private.positionChanged = true;
    }

    private.position.observableMatrix.subscribe(private.onPositionChanged);

    public.dispose = function () {
        private.position.observableMatrix.unsubscribe(private.onPositionChanged);
    }

    public.getPosition = function () {
        return private.position;
    }

    public.frustrum = function (xScale, zNear, zFar) {
        if (zNear < 0) console.error('You cannot include things that are behind the camera in the cameras field of view. zNear must be greater than zero');
        if (zNear >= zFar) console.error('The camera zFar must be greater than zNear');

        private.xScale = xScale;
        private.zNear = zNear;
        private.zFar = zFar;
        private.frustrumChanged = true;

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
        const Matrix = window.frag.Matrix;

        const aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;

        if (aspectRatio != private.aspectRatio) {
            private.aspectRatio = aspectRatio;
            private.frustrumChanged = true;
        }

        if (private.frustrumChanged) {
            const left = -private.xScale;
            const right = -left;
            const bottom = left / private.aspectRatio;
            const top = -bottom;
            const near = private.zNear;
            const far = private.zFar;
            private.projectionMatrix = Matrix.orthographic(left, right, bottom, top, near, far);
            private.frustrumChanged = false;
            private.transformChanged = true;
        }

        if (private.positionChanged) {
            private.worldMatrix = Matrix.m4Invert(private.position.getMatrix());
            private.positionChanged = false;
            private.transformChanged = true;
        }

        if  (private.transformChanged) {
            public.worldToClipTransform.setMatrix(Matrix.m4Xm4(private.projectionMatrix, private.worldMatrix));
            private.transformChanged = false;
        }

        return public;
    }

    public.dispose = function () {
        private.worldToClipTransform.dispose();
        private.position.dispose();
    }

    return public;
};
