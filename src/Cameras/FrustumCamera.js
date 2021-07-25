// This camera makes objects closer to the public appear larger. The frustum
// defines clipping and scaling of the scene

window.frag.FrustumCamera = function (engine) {
    const private = {
        zNear: 100,
        zFar: 200,
        xScale: 100,
    }

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
            private.projectionMatrix = window.frag.Matrix.frustum(
                -private.xScale, 
                private.xScale, 
                -private.xScale / private.aspectRatio, 
                private.xScale / private.aspectRatio, 
                private.zNear, 
                private.zFar);
            private.frustumChanged = false;
            private.transformChanged = true;
        }
    }

    return public;
};
