// Constructs a model animation in the context of a scene object
// For example this could be the "moving" animation for a model. Constructing this
// object enables you to start and stop this animation on a specific scene object
window.frag.SceneObjectAnimation = function (animation, animationMap) {
    const modelAnimation = animation.modelAnimation;
    const childAnimations = animation.childAnimations;

    const updateFunctions = [];

    for (let i = 0; i < childAnimations.length; i++) {
        const childAnimation = childAnimations[i];
        const modelName = childAnimation.model.getName();
        animationState = animationMap[modelName];
        if (animationState) {
            const graph = childAnimation.graph;
            const update = animationState.getUpdateFunction(graph.channel);
            updateFunctions.push(function (frame) {
                update(graph.frameValues[frame]);
            });
        }
    }

    const frameAction = function (frame) {
        for (let i = 0; i < updateFunctions.length; i++) {
            updateFunctions[i](frame);
        }
    }

    const action = window.frag.KeyframeAnimationAction()
        .setFrames(modelAnimation.getInterval(), modelAnimation.getFrames());

    for (let frame = 0; frame < modelAnimation.getFrames(); frame++) {
        action.add(frame, frameAction);
    }

    return window.frag.Animation().sequence([action], modelAnimation.getLoop());
}
