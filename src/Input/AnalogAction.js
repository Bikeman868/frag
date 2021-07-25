// Returne functions that can be bound to analog inputs
window.frag.AnalogAction = function(engine, actionName, context) {

    const splits = actionName.split("-");

    let mode = "move";
    let axis = "z";

    for (let i = 0; i < splits.length; i++) {
        if ((/^move$/i).test(splits[i])) mode = "move";
        if ((/^rotate$/i).test(splits[i])) mode = "rotate";
        if ((/^scale$/i).test(splits[i])) mode = "scale";
        if ((/^x$/i).test(splits[i])) axis = "x";
        if ((/^y$/i).test(splits[i])) axis = "y";
        if ((/^z$/i).test(splits[i])) axis = "z";
        if ((/^right$/i).test(splits[i])) axis = "right";
        if ((/^up$/i).test(splits[i])) axis = "up";
        if ((/^forward$/i).test(splits[i])) axis = "forward";
    }

    const scenePosition = function (getPosition) {
        if (mode === "move") {
            if (axis === "x") 
                return function(analogState) { getPosition().locationX(analogState.value); }
            if (axis === "y") 
                return function(analogState) { getPosition().locationY(analogState.value); }
            if (axis === "z") 
                return function(analogState) { getPosition().locationZ(analogState.value); }
        }
        return null;
    }

    if (/camera/i.test(actionName)) {
        return scenePosition(function () {
            return engine.getMainScene().getCamera().getPosition();
        });
    }

    if (context && context.sceneObject) {
        if (/sceneobject/i.test(actionName)) {
            return scenePosition(context.sceneObject.getPosition);
        }
    }

    return null;    
}