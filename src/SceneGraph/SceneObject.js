window.frag.SceneObject = function (model) {
    const frag = window.frag;

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

    public.getPosition = function () {
        if (private.position) return private.position;
        if (!private.model.location) return null;
        private.position = frag.ScenePosition(frag.Location(private.model.location.is3d));
        return private.position;
    };

    public.ensureAnimationPosition = function () {
        if (private.animationPosition) return private.animationPosition;
        if (!private.model.location) return null;
        private.animationPosition = frag.ScenePosition(frag.Location(private.model.location.is3d));
        return private.animationPosition;
    };

    public.deleteAnimationPosition = function () {
        private.animationPosition = null;
        return public;
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

        let position = public.getPosition();
        if (!position) return public;

        if (private.animationPosition) {
            position = position.clone().add(private.animationPosition);
        }

        const worldToClipMatrix = worldToClipTransform.getMatrix();
        const modelToWorldMatrix = position.getMatrix();
        const modelToClipMatrix = worldToClipTransform.is3d
            ? frag.Matrix.m4Xm4(worldToClipMatrix, modelToWorldMatrix)
            : frag.Matrix.m3Xm3(worldToClipMatrix, modelToWorldMatrix);

        private.model.draw(gl, modelToWorldMatrix, modelToClipMatrix, private.animationMap);

        return public;
    };

    return public;
};