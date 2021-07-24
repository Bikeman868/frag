// This camera makes objects closer to the public appear larger. The frustum
// defines clipping and scaling of the scene

window.frag.FrustumCamera = function (engine) {
    const private = {
        worldTransform: window.frag.Transform3D(engine),
        position: window.frag.ScenePosition(engine),
        projectionMatrix: null,
        worldMatrix: null,
        transformChanged: true,
        positionChanged: true,
        frustumChanged: true,
        zNear: 100,
        zFar: 200,
        xScale: 100,
        aspectRatio: 1,
    }

    const public = {
        __private: private,
        worldToClipTransform: window.frag.Transform3D(engine)
    };

    public.dispose = function () {
        private.position.observableMatrix.unsubscribe(private.onPositionChanged);
        private.worldToClipTransform.dispose();
        private.position.dispose();
    }

    private.onPositionChanged = function() {
        private.positionChanged = true;
    }

    private.position.observableMatrix.subscribe(private.onPositionChanged);

    public.getPosition = function () {
        return private.position;
    }

    public.frustum = function (xScale, zNear, zFar) {
        if (zNear < 0) console.error('You cannot include things that are behind the camera in the cameras field of view. zNear must be greater than zero');
        if (zNear >= zFar) console.error('The camera zFar must be greater than zNear');
        if (xScale <= 0) console.error('Camera x-scale must be greater than zero');

        private.xScale = xScale;
        private.zNear = zNear;
        private.zFar = zFar;

        private.frustumChanged = true;
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
            private.frustumChanged = true;
        }

        if (private.frustumChanged) {
            private.projectionMatrix = Matrix.frustum(
                -private.xScale, 
                private.xScale, 
                -private.xScale / aspectRatio, 
                private.xScale / aspectRatio, 
                private.zNear, 
                private.zFar);
            private.frustumChanged = false;
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

    return public;
};
