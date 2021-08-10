window.frag.SceneObject = function (engine, model) {
    const frag = window.frag;

    const private = {
        model,
        enabled: true,
        location: null,
        position: null,
        animationPosition: null,
        animationMap: {},
        childMap: {},
    };

    const public = {
        __private: private,
        isSceneObject: true,
        animations: {},
        parent: null,
    };

    if (model) {
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
    }

    public.addObject = function(sceneObject, childName) {
        if (sceneObject.parent) 
            sceneObject.parent.removeObject(sceneObject);
        sceneObject.parent = public;

        if (!childName) childName = ".";
        if (!private.childMap[childName]) private.childMap[childName] = [];
        private.childMap[childName].push(sceneObject);
        return public;
    };

    public.removeObject = function(sceneObject) {
        for (let childName in private.childMap) {
            const children = private.childMap[childName];
            for (let i = 0; i < children.length; i++) {
                if (children[i] === sceneObject) {
                    children.splice(i, 1);
                    sceneObject.parent = null;
                    return true;
                }
            }
        }
        return false;
    }

    public.getChildMap = function() {
        return private.childMap;
    }

    public.getAnimationMap = function() {
        return private.animationMap;
    }

    public.getLocation = function () {
        if (private.location) return private.location;
        if (private.model) {
            if (!private.model.location) return null;
            private.location = frag.Location(engine, private.model.location.is3d);
        } else {
            private.location = frag.Location(engine, true);
        }
        return private.location;
    };

    /**
     * @returns a ScenePosition object that can be used to manipulate the position
     * scale and orientation of this object in the scene
     */
    public.getPosition = function () {
        const location = public.getLocation();
        if (!location) return null;
        if (!private.position) 
            private.position = frag.ScenePosition(engine, location);
        return private.position;
    };

    /**
     * @returns a ScenePosition object that can be used to change the animation
     * position of the scene object. The animation position is added to the scene
     * object's static position to create a temporary animation effect
     */
    public.getAnimationPosition = function () {
        const location = private.getAnimationLocation();
        if (!location) return null;
        if (!private.animationPosition) 
            private.animationPosition = frag.ScenePosition(engine, location);
        return private.animationPosition;
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
        if (public.parent) public.parent.removeObject(public);
        for (let animationName in public.animations) {
            public.animations[animationName].dispose();
        }
    }

    /**
     * This is used internally by the engine. Don't call this from your game code
     */
    public.draw = function (drawContext) {
        if (!private.enabled || !private.model) return public;

        drawContext.beginSceneObject(public);
        private.model.draw(drawContext);
        drawContext.endSceneObject();

        return public;
    };

    return public;
};