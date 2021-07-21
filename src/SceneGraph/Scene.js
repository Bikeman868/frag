// A public is a camera and a collection of meshes. The camera defines how the
// meshes will be projected onto the viewport. Several scenes can be projecterd onto
// the same viewport, but only one of these scenes should set the viewport and the rest
// should adjust to the viewport.

window.frag.Scene = function(engine) {
    const private = {
        sceneObjects: [],
        camera: null
    }

    private.cameraUpdated = function() {
    }

    const public = {
        __private: private
    };

    public.dispose = function() {
        if (private.camera)
            private.camera.worldToClipTransform.observableMatrix.unsubscribe(private.cameraUpdated);
    }

    public.addObject = function(sceneObject) {
        sceneObject.parent = public;
        private.sceneObjects.push(sceneObject);
        return public;
    };

    public.removeObject = function(sceneObject) {
        for (let i = 0; i < private.sceneObjects.length; i++) {
            if (private.sceneObjects[i] === sceneObject) {
                private.sceneObjects.splice(i, 1);
                sceneObject.parent = null;
                return true;
            }
        }
        return false;
    }

    public.camera = function(camera) {
        if (private.camera)
            private.camera.worldToClipTransform.observableMatrix.unsubscribe(private.cameraUpdated);

        private.camera = camera;

        if (camera)
            camera.worldToClipTransform.observableMatrix.subscribe(private.cameraUpdated);

        return public;
    }

    public.getCamera = function() {
        return private.camera;
    }

    public.setViewport = function (gl) {
        if (private.camera)
            private.camera.setViewport(gl);
        return public;
    }

    public.adjustToViewport = function (gl) {
        if (private.camera)
            private.camera.adjustToViewport(gl);
        return public;
    }

    public.draw = function (drawContext) {
        if (private.camera) {
            drawContext.worldToClipTransform = private.camera.worldToClipTransform;
            for (let i = 0; i < private.sceneObjects.length; i++)
                private.sceneObjects[i].draw(drawContext);
        }
    }

    return public;
};