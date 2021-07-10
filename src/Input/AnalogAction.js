// Returne functions that can be bound to analog inputs
window.frag.AnalogAction = function(actionName, context) {

    const splits = inputName.split("-");

    if (/camera/i.test(actionName)) {
        return function(analogState) {
        }
    }

    if (/sceneobject/i.test(actionName)) {
        return function(analogState) {
        }
    }

    return null;    
}