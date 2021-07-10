// Returne functions that can be bound to digital inputs
window.frag.DigitalAction = function(actionName, context) {
    const frag = window.frag;

    if (context && context.animation) {
        if (/^animation$/i.test(actionName)) {
            return function(input) {
                if (frag.debugInputs) console.log("Turning animation", input.isOn ? "on" : "off");
                if (input.isOn) context.animation.start();
                else context.animation.stop();
            }
        }

        if (/^animation-start$/i.test(actionName)) {
            return function(input) {
                if (!input.isOn) {
                    if (frag.debugInputs) console.log("Starting animation");
                    context.animation.start();
                }
            }
        }

        if (/^animation-stop$/i.test(actionName)) {
            return function(input) {
                if (!input.isOn) {
                    if (frag.debugInputs) console.log("Stopping animation");
                    context.animation.stop();
                }
            }
        }
    }

    if (context && context.sceneObject) {
        if (/^sceneobject$/i.test(actionName)) {
            return function(input) {
                if (frag.debugInputs) console.log("Turning scene object", input.isOn ? "on" : "off");
                if (input.isOn) context.sceneObject.enable();
                else context.sceneObject.disable();
            }
        }
    }

    if (context && context.model) {
        if (/^model$/i.test(actionName)) {
            return function(input) {
                if (frag.debugInputs) console.log("Turning", context.model.getName(), "model", input.isOn ? "on" : "off");
                if (input.isOn) context.model.enable();
                else context.model.disable();
            }
        }
    }

    return null;
}