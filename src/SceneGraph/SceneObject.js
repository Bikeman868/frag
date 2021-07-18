window.frag.SceneObject = function (engine, model) {
    const frag = window.frag;

    const private = {
        model,
        enabled: true,
        location: null,
        animationLocation: null,
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
                const animationState = window.frag.ObjectAnimationState(engine);
                if (engine.debugAnimations) {
                    animationState.__private.modelName = model.getName();
                    animationState.__private.childModelName = childModelName;
                }
                private.animationMap[childModelName] = animationState;
            }
        }
        const objectAnimation = window.frag.SceneObjectAnimation(engine, animation, private.animationMap);
        public.animations[animation.modelAnimation.getName()] = objectAnimation;
    };

    private.getLocation = function () {
        if (private.location) return private.location;
        if (!private.model.location) return null;
        private.location = frag.Location(engine, private.model.location.is3d);
        return private.location;
    };

    private.getAnimationLocation = function () {
        if (private.animationLocation) return private.animationLocation;
        if (!private.model.location) return null;
        private.animationLocation = frag.Location(engine, private.model.location.is3d);
        return private.animationLocation;
    };

    /**
     * @returns a ScemePosition object that can be used to manipulate the position
     * scale and orientation of this object in the scene
     */
    public.getPosition = function () {
        const location = private.getLocation();
        if (!location) return null;
        return frag.ScenePosition(engine, location);
    };

    /**
     * @returns a ScenePosition object that can be used to change the animation
     * position of the scene object. The animation position is added to the scene
     * object's static position to create a temporary animation effect
     */
    public.getAnimationPosition = function () {
        const location = private.getAnimationLocation();
        if (!location) return null;
        return frag.ScenePosition(engine, location);
    };

    /**
     * Clears any animation position that was set. This is more efficient
     * than setting the animation location to zero
     */
    public.clearAnimationPosition = function () {
        private.animationLocation = null;
        return public;
    };

    /**
     * Includes this object in the scene. Call this function when the object
     * could possibly be seen by the player. The engine will go through the
     * process of transforming the mesh into screen space and clip anything
     * that is not within the screen bounds. To avoid this expensive operations
     * for objects that you know cannot be seen by the player, call the disable() 
     * function.
     */
    public.enable = function () {
        private.enabled = true;
        return public;
    };

    /**
     * Excludes this object in the scene. Call this function when the object
     * is not viewable through the player's viewport - for example it moved
     * behind the player's point of view.
     */
     public.disable = function () {
        private.enabled = false;
        return public;
    };

    /**
     * Frees any resources consumed by this scene object and removes it from
     * the scene.
     */
    public.dispose = function() {
        public.disable();
        for (let animationName in public.animations) {
            public.animations[animationName].dispose();
        }
        return public;
    }

    /**
     * This is used internally by the engine. Don't call this from your game code
     */
    public.draw = function (drawContext) {
        if (!private.enabled) return public;

        let location = private.getLocation();
        if (!location) return public;

        if (private.animationLocation) {
            location = location.clone().add(private.animationLocation);
        }

        const worldToClipMatrix = drawContext.worldToClipTransform.getMatrix();
        const modelToWorldMatrix = location.getMatrix();
        const modelToClipMatrix = drawContext.worldToClipTransform.is3d
            ? frag.Matrix.m4Xm4(worldToClipMatrix, modelToWorldMatrix)
            : frag.Matrix.m3Xm3(worldToClipMatrix, modelToWorldMatrix);

        if (drawContext.isHitTest) {
            drawContext.sceneObjects.push(public);
        }

        private.model.draw(drawContext, modelToWorldMatrix, modelToClipMatrix, private.animationMap);

        return public;
    };

    return public;
};