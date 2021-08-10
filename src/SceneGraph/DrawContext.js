window.frag.DrawContext = function (engine) {
    const private = {
        stack: [],
        matriciesChanged: false,
        activeShader: null,
        overrideShader: null,
    }

    const public = {
        __private: private,
        isHitTest: false,
        sceneObjects: null,
        fragments: null,
        worldToClipTransform: null,
        gameTick: 0,
        state: {
            animationMap: null,
            childMap: null,
            modelToWorldMatrix: null,
            modelToClipMatrix: null,
            shader: null,
        }
    }

    private.setShader = function(shader) {
        if (shader === private.activeShader) return;

        if (private.activeShader)
            private.activeShader.unbind();

        private.activeShader = shader;

        if (shader) shader.bind();
    }

    private.pushState = function() {
        private.stack.push(public.state);
        public.state = Object.assign({}, public.state);
    }

    private.popState = function() {
        public.state = private.stack.pop();
        private.matriciesChanged = true;
        if (!private.overrideShader)
            private.setShader(public.state.shader);
    }

    public.forHitTest = function(shader) {
        private.overrideShader = shader;
        public.sceneObjects = [];
        public.fragments = [];
        public.isHitTest = true;
        return public;
    }

    public.forRender = function(gameTick) {
        public.gameTick = gameTick;
        return public;
    }

    public.shader = function(shader) {
        if (!private.overrideShader)
        {
            public.state.shader = shader;
            private.setShader(shader);
        }
        return public;
    }

    public.getShader = function() {
        return private.activeShader;
    }

    /*
     * A scene consists of a camera and collection of objects that are positioned
     * within the scene. The scene must implement these methods:
     * getCamera() - returns the camera that provides the world to clip transform
     */
    public.beginScene = function(scene) {
        private.setShader(private.overrideShader);
        public.worldToClipTransform = scene.getCamera().worldToClipTransform;
        return public;
    }

    public.endScene = function() {
        private.setShader(null);
        return public;
    }

    /*
     * A scene object is a 2D or 3D shape within the scene. Scene objects
     * can be instances of models, dynamic surfaces, or anything else that
     * has a mesh or mesh heirachy within it. Scene objects can implement
     * the following methods to integrate with the drawing pipeline:
     * getLocation() - returns the location in the scene
     * getShader() - returns the shader to use for drawing fragments
     * getAnimationMap() - returns a map of child mesh names to animations
     * getChildMap() - returns a map of child mesh names to lists scene objects
     */
    public.beginSceneObject = function(sceneObject) {
        private.pushState();

        if (public.sceneObjects) public.sceneObjects.push(sceneObject);
        if (sceneObject.getShader) public.shader(sceneObject.getShader());

        if (sceneObject.getLocation) {
            const localMatrix = sceneObject.getLocation().getMatrix();

            public.state.animationMap = sceneObject.getAnimationMap ? sceneObject.getAnimationMap() : null;
            public.state.childMap = sceneObject.getChildMap ? sceneObject.getChildMap() : null;

            if (public.state.modelToWorldMatrix) {
                // This is the case where this SceneObject is parented to another model
                const Matrix = frag.Matrix;
                if (public.worldToClipTransform.is3d) {
                    public.state.modelToWorldMatrix = Matrix.m4Xm4(public.state.modelToWorldMatrix, localMatrix);
                    public.state.modelToClipMatrix = Matrix.m4Xm4(public.state.modelToClipMatrix, localMatrix);
                } else {
                    public.state.modelToWorldMatrix = Matrix.m3Xm3(public.state.modelToWorldMatrix, localMatrix);
                    public.state.modelToClipMatrix = Matrix.m3Xm3(public.state.modelToClipMatrix, localMatrix);
                }    
            } else {
                // This is the case where this SceneObject is parented to the scene
                const worldToClipMatrix = public.worldToClipTransform.getMatrix();
                public.state.modelToWorldMatrix = localMatrix;
                public.state.modelToClipMatrix = public.worldToClipTransform.is3d
                    ? frag.Matrix.m4Xm4(worldToClipMatrix, localMatrix)
                    : frag.Matrix.m3Xm3(worldToClipMatrix, localMatrix);
            }
            private.matriciesChanged = true;
        }

        return public;
    }

    public.endSceneObject = function() {
        private.popState();
        return public;
    }

    /*
     * A mesh is a collection of drawing primitives that are all drawn wth the same
     * shader. This is most oftena  model. The model must implement the following:
     * getShader() - returns the shader to use for drawing fragments
     * getName() - returns the name of the mesh. Enables mesh animation and scene object attachment.
     * getLocation() - the location of the mesh relative to its parent.
     */
    public.beginMesh = function(mesh) {
        private.pushState();

        if (mesh.getShader) public.shader(mesh.getShader());

        const name = mesh.getName ? mesh.getName() : null;
        const animationMap = public.state.animationMap;

        let location = mesh.getLocation();
        const animationState = animationMap && name ? animationMap[name] : null;
        if (animationState) location = location.clone().add(animationState.location);
        const localMatrix = location.getMatrix();

        const Matrix = frag.Matrix;
        if (public.worldToClipTransform.is3d) {
            public.state.modelToWorldMatrix = Matrix.m4Xm4(public.state.modelToWorldMatrix, localMatrix);
            public.state.modelToClipMatrix = Matrix.m4Xm4(public.state.modelToClipMatrix, localMatrix);
        } else {
            public.state.modelToWorldMatrix = Matrix.m3Xm3(public.state.modelToWorldMatrix, localMatrix);
            public.state.modelToClipMatrix = Matrix.m3Xm3(public.state.modelToClipMatrix, localMatrix);
        }
        private.matriciesChanged = true;
    }

    public.endMesh = function() {
        private.popState();
        return public;
    }

    /*
     * A fragment is a set of drawing primitive (for example a triangle strip) that
     * are drawn by the shader in a single operation. The fragment is the smallest
     * unit that can be detected by the hit test mechanism. During hit test renders
     * the fragment is rendered with the fragment ID in every pixel so that pixels
     * can be tested to discover which fragment is closest to the camera for every
     * pixel.
     */
    public.beginFragment =  function(fragment) {
        const shader = private.activeShader;

        if (fragment && shader.uniforms.color !== undefined && public.isHitTest) {
            public.fragments.push(fragment);

            const sceneObjectId = public.sceneObjects.length - 1;
            const modelId = public.fragments.length - 1;

            const red = sceneObjectId >> 4;
            const green = ((sceneObjectId & 0x0f) << 4) | ((modelId & 0xf0000) >> 16);
            const blue = (modelId & 0xff00) >> 8;
            const alpha = modelId & 0xff;
            engine.gl.uniform4f(shader.uniforms.color, red / 255, green / 255, blue / 255, alpha / 255);
        }

        if (private.matriciesChanged) {
            if (shader.uniforms.clipMatrix !== undefined) {
                window.frag.Transform(engine, public.state.modelToClipMatrix)
                    .apply(shader.uniforms.clipMatrix);
            }

            if (shader.uniforms.modelMatrix !== undefined) {
                frag.Transform(engine, public.state.modelToWorldMatrix)
                    .apply(shader.uniforms.modelMatrix);
            }

            private.matriciesChanged = false;
        }
        return public;
    }

    public.endFragment = function() {
        return public;
    }

    return public;
}
