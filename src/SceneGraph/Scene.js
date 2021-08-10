// A public is a camera and a collection of meshes. The camera defines how the
// meshes will be projected onto the viewport. Several scenes can be projecterd onto
// the same viewport, but only one of these scenes should set the viewport and the rest
// should adjust to the viewport.

window.frag.Scene = function(engine) {
    const private = {
        sceneObjects: [],
        camera: null
    }

    const public = {
        __private: private
    };

    public.dispose = function() {
    }

    public.addObject = function(sceneObject) {
        if (sceneObject.parent) 
            sceneObject.parent.removeObject(sceneObject);
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
        private.camera = camera;
        return public;
    }

    public.getCamera = function() {
        return private.camera;
    }

    public.setViewport = function () {
        if (private.camera)
            private.camera.setViewport();
        return public;
    }

    public.adjustToViewport = function () {
        if (private.camera)
            private.camera.adjustToViewport();
        return public;
    }

    public.draw = function (drawContext) {
        if (!private.camera || !private.sceneObjects) return public;

        drawContext.beginScene(public);

        for (let i = 0; i < private.sceneObjects.length; i++)
            private.sceneObjects[i].draw(drawContext);

        drawContext.endScene();
        return public;
    }

    return public;
};