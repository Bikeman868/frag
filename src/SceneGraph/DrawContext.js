window.frag.DrawContext = function (engine) {
    const private = {
        stack: []
    }

    const public = {
        __private: private,
        shader: null,
        isHitTest: false,
        sceneObjects: null,
        models: null,
        worldToClipTransform: null,
        gameTick: 0,
        state: {
            animationMap: null,
            childMap: null,
            modelToWorldMatrix: null,
            modelToClipMatrix: null
        }
    }

    private.pushState = function() {
        private.stack.push(public.state);
        public.state = Object.assign({}, public.state);
    }

    private.popState = function() {
        public.state = private.stack.pop();
    }

    public.forHitTest = function(shader) {
        public.shader = shader;
        public.sceneObjects = [];
        public.models = [];
        public.isHitTest = true;
        return public;
    }

    public.forRender = function(gameTick) {
        public.gameTick = gameTick;
        return public;
    }

    public.beginScene = function(camera) {
        public.worldToClipTransform = camera.worldToClipTransform;
        return public;
    }

    public.endScene = function() {
        return public;
    }

    public.beginSceneObject = function(location, animationMap, childMap) {
        private.pushState();

        public.state.animationMap = animationMap || {};
        public.state.childMap = childMap || {};

        const localMatrix = location.getMatrix();

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

        return public;
    }

    public.endSceneObject = function() {
        private.popState();
        return public;
    }

    public.beginModel = function(name, location) {
        private.pushState();

        const animationMap = public.state.animationMap;

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
    }

    public.endModel = function() {
        private.popState();
        return public;
    }

    public.setupShader = function(shader, model) {
        if (shader.uniforms.clipMatrix !== undefined) {
            window.frag.Transform(engine, public.state.modelToClipMatrix)
                .apply(shader.uniforms.clipMatrix);
        }

        if (shader.uniforms.modelMatrix !== undefined) {
            frag.Transform(engine, public.state.modelToWorldMatrix)
                .apply(shader.uniforms.modelMatrix);
        }

        if (shader.uniforms.color !== undefined && public.isHitTest) {
            const sceneObjectId = public.sceneObjects.length - 1;
            const modelId = public.models.length;
            public.models.push(model);

            const red = sceneObjectId >> 4;
            const green = ((sceneObjectId & 0x0f) << 4) | ((modelId & 0xf0000) >> 16);
            const blue = (modelId & 0xff00) >> 8;
            const alpha = modelId & 0xff;
            engine.gl.uniform4f(shader.uniforms.color, red / 255, green / 255, blue / 255, alpha / 255);
        }
    }

    return public;
}
