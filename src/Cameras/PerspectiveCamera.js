// This camera makes objects closer to the public appear larger. The frustum
// defines clipping and scaling of the scene

window.frag.PerspectiveCamera = function (engine) {
    const private = {
        fov: 45 * Math.PI / 180,
        zNear: 100,
        zFar: 200,
        aspectRatio: 1,
    }

    const public = { };

    window.frag.cameraMixin(engine, private, public);

    public.frustum = function (fieldOfView, zNear, zFar) {
        if (fieldOfView <= 0) console.error('Camera field of view must be greater than zero');
        if (fieldOfView >= Math.PI * 0.5) console.error('Camera field of view must be less than 90 degrees');
        if (zNear <= 0) console.error('You cannot include things that are behind the camera in the cameras field of view. zNear must be greater than zero');
        if (zNear >= zFar) console.error('The camera zFar must be greater than zNear');

        private.fov = fieldOfView;
        private.zNear = zNear;
        private.zFar = zFar;

        private.frustumChanged = true;
        return public;
    }

    private.updateFrustum = function() {
        if (private.frustumChanged) {
            private.projectionMatrix = window.frag.Matrix.perspective(
                private.fieldOfView, 
                private.aspectRatio, 
                private.zNear, 
                private.zFar);
            private.frustumChanged = false;
            private.transformChanged = true;
        }
    }

    return public;
};
