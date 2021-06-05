// A public is a camera and a collection od meshes. The camera defines how the
// meshes will be projected onto the viewport. Several scenes can be projecterd onto
// the same viewport, but only one of these scenes should set the viewport and the rest
// should adjust to the viewport.

window.frag.Scene = function () {
    const private = {
        sceneObjects: [],
        activeCamera: null
    }

    private.cameraUpdated = function () {
    }

    const public = {
        __private: private
    };

    public.dispose = function () {
        if (private.activeCamera)
            private.activeCamera.worldToClipTransform.observableMatrix.unsubscribe(private.cameraUpdated);
    }

    public.addObject = function (sceneObject) {
        private.sceneObjects.push(sceneObject);
        return public;
    };

    public.camera = function (camera) {
        if (private.activeCamera)
            private.activeCamera.worldToClipTransform.observableMatrix.unsubscribe(private.cameraUpdated);

        private.activeCamera = camera;

        if (camera)
            camera.worldToClipTransform.observableMatrix.subscribe(private.cameraUpdated);

        return public;
    }

    public.setViewport = function (gl) {
        if (private.activeCamera)
            private.activeCamera.setViewport(gl);
        return public;
    }

    public.adjustToViewport = function (gl) {
        if (private.activeCamera)
            private.activeCamera.adjustToViewport(gl);
        return public;
    }

    public.draw = function (gl) {
        if (private.activeCamera) {
            for (let i = 0; i < private.sceneObjects.length; i++)
                private.sceneObjects[i].draw(gl, private.activeCamera.worldToClipTransform);
        }
    }

    return public;
};