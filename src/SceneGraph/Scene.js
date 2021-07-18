// A public is a camera and a collection of meshes. The camera defines how the
// meshes will be projected onto the viewport. Several scenes can be projecterd onto
// the same viewport, but only one of these scenes should set the viewport and the rest
// should adjust to the viewport.

window.frag.Scene = function(engine) {
    const private = {
        sceneObjects: [],
        activeCamera: null
    }

    private.cameraUpdated = function() {
    }

    const public = {
        __private: private
    };

    public.dispose = function() {
        if (private.activeCamera)
            private.activeCamera.worldToClipTransform.observableMatrix.unsubscribe(private.cameraUpdated);
    }

    public.addObject = function(sceneObject) {
        private.sceneObjects.push(sceneObject);
        return public;
    };

    public.removeObject = function(sceneObject) {
        for (let i = 0; i < private.sceneObjects.length; i++) {
            if (private.sceneObjects[i] === sceneObject) {
                private.sceneObjects.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    public.camera = function(camera) {
        if (private.activeCamera)
            private.activeCamera.worldToClipTransform.observableMatrix.unsubscribe(private.cameraUpdated);

        private.activeCamera = camera;

        if (camera)
            camera.worldToClipTransform.observableMatrix.subscribe(private.cameraUpdated);

        return public;
    }

    public.getCamera = function() {
        return private.activeCamera;
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

    public.draw = function (drawContext) {
        if (private.activeCamera) {
            drawContext.worldToClipTransform = private.activeCamera.worldToClipTransform;
            for (let i = 0; i < private.sceneObjects.length; i++)
                private.sceneObjects[i].draw(drawContext);
        }
    }

    return public;
};