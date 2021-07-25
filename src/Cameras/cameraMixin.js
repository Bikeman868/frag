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