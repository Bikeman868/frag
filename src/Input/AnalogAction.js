// Returne functions that can be bound to analog inputs
window.frag.AnalogAction = function(actionName, context) {

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

    if (/camera/i.test(actionName)) {
        if (mode === "move") {
            if (axis === "x") 
                return function(analogState) { frag.getMainScene().getCamera().moveToX(analogState.value); }
            if (axis === "y") 
                return function(analogState) { frag.getMainScene().getCamera().moveToY(analogState.value); }
            if (axis === "z") 
                return function(analogState) { frag.getMainScene().getCamera().moveToZ(analogState.value); }
        }        
    }

    if (context && context.sceneObject) {
        if (/sceneobject/i.test(actionName)) {
            return function(analogState) {
            }
        }
    }

    return null;    
}