window.frag.cameraMixin = function(engine, priv, pub) {
    priv.worldTransform = window.frag.Transform3D(engine);
    priv.position = window.frag.ScenePosition(engine);
    priv.projectionMatrix = null;
    priv.worldMatrix = null;
    priv.transformChanged = true;
    priv.positionChanged = true;
    priv.frustumChanged = true;
    priv.aspectRatio = 1;

    pub.__private = priv;
    pub.worldToClipTransform = window.frag.Transform3D(engine);

    pub.dispose = function () {
        priv.position.observableMatrix.unsubscribe(priv.onPositionChanged);
        priv.worldToClipTransform.dispose();
        priv.position.dispose();
    }

    priv.onPositionChanged = function() {
        priv.positionChanged = true;
    }

    priv.position.observableMatrix.subscribe(priv.onPositionChanged);

    pub.getPosition = function () {
        return priv.position;
    }

    priv.updateAspect = function () {
        const aspectRatio = engine.gl.drawingBufferWidth / engine.gl.drawingBufferHeight;
        if (aspectRatio !== priv.aspectRatio) {
            priv.aspectRatio = aspectRatio;
            priv.frustumChanged = true;
        }
    }

    priv.updateWorld = function () {
        if (priv.positionChanged) {
            priv.worldMatrix = window.frag.Matrix.m4Invert(priv.position.getMatrix());
            priv.positionChanged = false;
            priv.transformChanged = true;
        }
    }

    pub.setViewport = function () {
        const gl = engine.gl;
        gl.viewport(0, 0, gl.canvas.clientWidth, gl.canvas.clientHeight);
        gl.canvas.width = gl.canvas.clientWidth;
        gl.canvas.height = gl.canvas.clientHeight;

        return pub.adjustToViewport();
    };

    pub.adjustToViewport = function () {
        const gl = engine.gl;
        const Matrix = window.frag.Matrix;

        priv.updateAspect();
        priv.updateFrustum();
        priv.updateWorld();

        if  (priv.transformChanged) {
            pub.worldToClipTransform.setMatrix(Matrix.m4Xm4(priv.projectionMatrix, priv.worldMatrix));
            priv.transformChanged = false;
        }

        return pub;
    }
}