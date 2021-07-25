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
