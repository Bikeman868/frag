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

    public.forRender = function() {
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

        public.state.animationMap = animationMap;
        public.state.childMap = childMap;

        const worldToClipMatrix = public.worldToClipTransform.getMatrix();
        public.state.modelToWorldMatrix = location.getMatrix();
        public.state.modelToClipMatrix = public.worldToClipTransform.is3d
            ? frag.Matrix.m4Xm4(worldToClipMatrix, public.state.modelToWorldMatrix)
            : frag.Matrix.m3Xm3(worldToClipMatrix, public.state.modelToWorldMatrix);

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
        if (location.is3d) {
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

    return public;
}
