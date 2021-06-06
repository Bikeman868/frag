window.frag.SceneObject = function (model) {
    const private = {
        model,
        enabled: true,
        position: null,
        animationPosition: null,
        animationMap: {}
    };

    const public = {
        __private: private,
        animations: {}
    };

    for (let i = 0; i < model.animations.length; i++) {
        const animation = model.animations[i];
        for (let j = 0; j < animation.childAnimations.length; j++) {
            const childModelName = animation.childAnimations[j].model.getName();
            if (!private.animationMap[childModelName]) {
                const animationState = window.frag.ObjectAnimationState();
                if (window.frag.debugAnimations) {
                    animationState.__private.modelName = model.getName();
                    animationState.__private.childModelName = childModelName;
                }
                private.animationMap[childModelName] = animationState;
            }
        }
        const objectAnimation = window.frag.SceneObjectAnimation(animation, private.animationMap);
        public.animations[animation.modelAnimation.getName()] = objectAnimation;
    };

    const combineTransforms = function (parent, child) {
        const parentMatrix = parent.getMatrix();
        const childMatrix = child.getMatrix();
        if (parent.is3d) return frag.Transform(frag.Matrix.m4Xm4(parentMatrix, childMatrix));
        return frag.Transform2D(frag.Matrix.m3Xm3(parentMatrix, childMatrix));
    };

    public.getPosition = function () {
        if (private.position) return private.position;
        const modelTransform = private.model.getTransform();
        private.position = window.frag.ScenePosition(modelTransform.clone());
        return private.position;
    };

    public.ensureAnimationPosition = function () {
        if (private.animationPosition) return private.animationPosition;
        const modelTransform = private.model.getTransform();
        if (!modelTransform) return null;
        private.animationPosition = window.frag.ScenePosition(modelTransform.clone());
        return private.animationPosition;
    };

    public.deleteAnimationPosition = function () {
        private.animationPosition = null;
        return public;
    };

    private.getModelToWorldTransform = function () {
        const position = public.getPosition();
        let transform = combineTransforms(private.model.getTransform(), position.getTransform());
        if (!private.animationPosition) return transform;
        const animationTransform = private.animationPosition.getTransform();
        return combineTransforms(transform, animationTransform);
    };

    public.enable = function () {
        private.enabled = true;
        return public;
    };

    public.disable = function () {
        private.enabled = false;
        return public;
    };

    public.dispose = function() {
        public.disable();
        return public;
    }

    public.draw = function (gl, worldToClipTransform) {
        if (!private.enabled) return public;
        const modelToWorldTransform = private.getModelToWorldTransform();
        if (!modelToWorldTransform) return public;

        let modelToClipTransform = combineTransforms(worldToClipTransform, modelToWorldTransform);
        private.model.draw(gl, modelToWorldTransform, modelToClipTransform, private.animationMap);

        return public;
    };

    return public;
};