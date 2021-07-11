// Represents an input that can be moved up and down in value. For example
// the scroll wheel on the mouse or a joystick axis
window.frag.AnalogInput = function(inputName, analogState) {
    const frag = window.frag;

    const private = {
        inputName,
        analogState,
    }

    const public = {
        __private: private,
    }

    const splits = inputName.split("-");

    if ((/mouse/i).test(inputName)) {
        let buttons = 0;
        let vertical = false;
        let inverted = false;
        let wheel = false;
        let downPosition;
        let downValue;

        for (let i = 0; i < splits.length; i++) {
            if ((/^horizontal$/).test(splits[i])) vertical = false;
            if ((/^vertical$/).test(splits[i])) vertical = true;
            if ((/^inverted$/).test(splits[i])) inverted = true;
            if ((/^wheel$/).test(splits[i])) wheel = true;
            if ((/^left$/).test(splits[i])) buttons = 1;
            if ((/^right$/).test(splits[i])) buttons = 2;
            if ((/^middle$/).test(splits[i])) buttons = 4;
            if ((/^back$/).test(splits[i])) buttons = 8;
            if ((/^forward$/).test(splits[i])) buttons = 16;
            if ((/^any$/).test(splits[i])) buttons = 31;
        }

        const moveHandler = function (evt) {
            if (buttons === 0) {
                let fraction = vertical ? evt.clientY / frag.canvas.clientHeight : evt.clientX / frag.canvas.clientWidth;
                if (inverted) fraction = 1 - fraction;
                const value = ((private.analogState.maxValue - private.analogState.minValue) * fraction) + private.analogState.minValue;
                if (frag.debugInputs) console.log("Analog input", private.inputName, "=", value);
                private.analogState.setValue(evt, value, true);
            } else if ((evt.buttons & buttons) !== 0) {
                let fraction = vertical 
                    ? (inverted ? (downPosition - evt.clientY) : (evt.clientY - downPosition)) / frag.canvas.clientHeight
                    : (inverted ? (downPosition - evt.clientX) : (evt.clientX - downPosition)) / frag.canvas.clientWidth;
                const value = downValue + ((private.analogState.maxValue - private.analogState.minValue) * fraction);
                if (frag.debugInputs) console.log("Analog input", private.inputName, "=", value);
                private.analogState.setValue(evt, value, true);
            }
            return true;
        }

        const downHandler = function(evt) {
            if ((evt.buttons & buttons) !== 0) {
                downPosition = vertical ? evt.clientY : evt.clientX;
                downValue = private.analogState.value;
            }
        }

        const wheelHandler = function(evt) {
            if (frag.debugInputs) console.log("Analog input", private.inputName, "delta", evt.deltaY);
            if (inverted) {
                if (evt.deltaY > 0) private.analogState.decrement(evt); else private.analogState.increment(evt);
            } else {
                if (evt.deltaY < 0) private.analogState.decrement(evt); else private.analogState.increment(evt);
            }
            evt.preventDefault();
            return true;
        }

        public.enable = function () {
            if (wheel) {
                frag.canvas.addEventListener("wheel", wheelHandler, false);
            } else {
                frag.canvas.addEventListener("mousemove", moveHandler, false);
                if (buttons !== 0) frag.canvas.addEventListener("mousedown", downHandler, false);
            }
        }

        public.disable = function () {
            if (wheel) {
                frag.canvas.removeEventListener("wheel", wheelHandler, false);
            } else {
                frag.canvas.removeEventListener("mousemove", moveHandler, false);
                if (buttons !== 0) frag.canvas.removeEventListener("mousedown", downHandler, false);
            }
        }

        return public;
    }

    if ((/keys/i).test(splits[0])) {
        let leftKey = "ArrowLeft";
        let rightKey = "ArrowRight";
        if (splits.length > 1) leftKey = splits[1];
        if (splits.length > 2) rightKey = splits[2];

        const handler = function (evt) {
            if (evt.key === leftKey) {
                if (frag.debugInputs) console.log("Analog input", private.inputName, "decrement");
                private.analogState.decrement(evt);
                evt.preventDefault();
            } else if (evt.key === rightKey) {
                if (frag.debugInputs) console.log("Analog input", private.inputName, "increment");
                private.analogState.increment(evt);
                evt.preventDefault();
            }
            return true;
        }

        public.enable = function () {
            document.addEventListener("keydown", handler, false);
        }

        public.disable = function () {
            document.removeEventListener("keydown", handler, false);
        }

        return public;
    }

    if ((/touch/i.test(inputName))) {
        // https://developer.mozilla.org/en-US/docs/Web/API/Touch_events
        return public;
    }

    if ((/gamepad/i.test(inputName))) {
        // https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API
        return public;
    }

    if ((/pointer/i.test(inputName))) {
        // https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events
        return public;
    }

    if ((/orientation/i.test(inputName))) {
        // https://developer.mozilla.org/en-US/docs/Web/Events/Detecting_device_orientation
        return public;
    }

    return public;
}