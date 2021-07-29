// Represents an input that can be moved up and down in value. For example
// the scroll wheel on the mouse or a joystick axis
window.frag.AnalogInput = function(engine, inputName, analogState, options) {
    options = options || {};
    if (options.scale === undefined) options.scale = 1;

    const private = {
        inputName,
        analogState,
    }

    const public = {
        __private: private,
    }

    public.dispose = function () {
        public.disable();
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
            if ((/^any$/).test(splits[i])) buttons = 255;
        }

        const moveHandler = function (evt) {
            if (buttons === 0) {
                let fraction = vertical ? (engine.canvas.clientHeight - evt.clientY) / engine.canvas.clientHeight : evt.clientX / engine.canvas.clientWidth;
                fraction *= options.scale;
                if (fraction > 1) fraction = 1;
                if (inverted) fraction = 1 - fraction;
                const value = ((private.analogState.maxValue - private.analogState.minValue) * fraction) + private.analogState.minValue;
                if (engine.debugInputs) console.log("Analog input", private.inputName, "=", value);
                private.analogState.setValue(evt, value, true);
            } else if ((evt.buttons & buttons) !== 0) {
                let fraction = vertical 
                    ? (inverted ? (evt.clientY - downPosition) : (downPosition - evt.clientY)) / engine.canvas.clientHeight
                    : (inverted ? (downPosition - evt.clientX) : (evt.clientX - downPosition)) / engine.canvas.clientWidth;
                fraction *= options.scale;
                if (fraction > 1) fraction = 1;
                const value = downValue + ((private.analogState.maxValue - private.analogState.minValue) * fraction);
                if (engine.debugInputs) console.log("Analog input", private.inputName, "=", value);
                private.analogState.setValue(evt, value, true);
            }
            return true;
        }

        const downHandler = function(evt) {
            if ((evt.buttons & buttons) !== 0) {
                downPosition = vertical ? evt.clientY : evt.clientX;
                downValue = private.analogState.getValue();
            }
        }

        const wheelHandler = function(evt) {
            if (engine.debugInputs) console.log("Analog input", private.inputName, "delta", evt.deltaY);
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
                engine.canvas.addEventListener("wheel", wheelHandler, false);
            } else {
                engine.canvas.addEventListener("mousemove", moveHandler, false);
                if (buttons !== 0) engine.canvas.addEventListener("mousedown", downHandler, false);
            }
            return public;
        }

        public.disable = function () {
            if (wheel) {
                engine.canvas.removeEventListener("wheel", wheelHandler, false);
            } else {
                engine.canvas.removeEventListener("mousemove", moveHandler, false);
                if (buttons !== 0) engine.canvas.removeEventListener("mousedown", downHandler, false);
            }
            return public;
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
                if (engine.debugInputs) console.log("Analog input", private.inputName, "decrement");
                private.analogState.decrement(evt);
                evt.preventDefault();
            } else if (evt.key === rightKey) {
                if (engine.debugInputs) console.log("Analog input", private.inputName, "increment");
                private.analogState.increment(evt);
                evt.preventDefault();
            }
            return true;
        }

        public.enable = function () {
            document.addEventListener("keydown", handler, false);
            return public;
        }

        public.disable = function () {
            document.removeEventListener("keydown", handler, false);
            return public;
        }

        return public;
    }

    if ((/touch/i.test(inputName))) {
        let mode = "horizontal";
        let inverted = false;
        let additionalTouches = false;
        let downPosition;
        let downValue;
        let clientLength;
        let span;
        let index = 0;

        for (let i = 0; i < splits.length; i++) {
            if ((/^horizontal$/).test(splits[i])) mode = "horizontal";
            if ((/^vertical$/).test(splits[i])) mode = "vertical";
            if ((/^pinch$/).test(splits[i])) mode = "pinch";
            if ((/^rotate$/).test(splits[i])) mode = "rotate";
            if ((/^inverted$/).test(splits[i])) inverted = true;
            if ((/^plus$/).test(splits[i])) additionalTouches = true;
            if ((/^1$/).test(splits[i])) index = 0;
            if ((/^2$/).test(splits[i])) index = 1;
            if ((/^3$/).test(splits[i])) index = 2;
        }

        let moveHandler = null;
        let touchStartHandler = null;

        if (mode === "horizontal") {
            moveHandler = function (evt) {
                if ((additionalTouches && evt.touches.length > index) || evt.touches.length === index + 1) {
                    const touch = evt.touches.item(index);
                    let fraction = (inverted ? (downPosition - touch.clientX) : (touch.clientX - downPosition)) / clientLength;
                    fraction *= options.scale;
                    if (fraction > 1) fraction = 1;
                    const value = downValue + (span * fraction);
                    if (engine.debugInputs) console.log("Analog input", private.inputName, "=", value);
                    private.analogState.setValue(evt, value, true);
                }
                return true;
            }
            touchStartHandler = function(evt) {
                if (evt.touches.length === index + 1) {
                    const touch = evt.touches.item(index);
                    downPosition = touch.clientX;
                    downValue = private.analogState.getValue();
                    span = private.analogState.maxValue - private.analogState.minValue;
                    clientLength = engine.canvas.clientWidth;
                }
                return true;
            }
        }

        if (mode === "vertical") {
            moveHandler = function (evt) {
                if ((additionalTouches && evt.touches.length > index) || evt.touches.length === index + 1) {
                    const touch = evt.touches.item(index);
                    let fraction =  (inverted ? (touch.clientY - downPosition) : (downPosition - touch.clientY)) / clientLength;
                    fraction *= options.scale;
                    if (fraction > 1) fraction = 1;
                    const value = downValue + (span * fraction);
                    if (engine.debugInputs) console.log("Analog input", private.inputName, "=", value);
                    private.analogState.setValue(evt, value, true);
                }
                return true;
            }
            touchStartHandler = function(evt) {
                if (evt.touches.length === index + 1) {
                    const touch = evt.touches.item(index);
                    downPosition = touch.clientY;
                    downValue = private.analogState.getValue();
                    span = private.analogState.maxValue - private.analogState.minValue;
                    clientLength = engine.canvas.clientHeight;
                }
                return true;
            }
        }

        if (mode === "pinch") {
            const distance = function(evt) {
                const touch1 = evt.touches.item(0);
                const touch2 = evt.touches.item(1);
                const spanX = touch2.clientX - touch1.clientX;
                const spanY = touch2.clientY - touch1.clientY;
                return Math.sqrt(spanX * spanX + spanY * spanY);
            }

            moveHandler = function (evt) {
                if ((additionalTouches && evt.touches.length > 1) || evt.touches.length === 2) {
                    const position = distance(evt);
                    let fraction = (position - downPosition) / clientLength;
                    fraction *= options.scale;
                    if (fraction > 1) fraction = 1;
                    if (inverted) fraction = -fraction;
                    const value = downValue + span * fraction;
                    if (engine.debugInputs) console.log("Analog input", private.inputName, "=", value);
                    private.analogState.setValue(evt, value, true);
                }
                return true;
            }
            touchStartHandler = function(evt) {
                if (evt.touches.length === 2) {
                    downPosition = distance(evt);
                    downValue = private.analogState.getValue();
                    span = private.analogState.maxValue - private.analogState.minValue;
                    clientLength = Math.sqrt(engine.canvas.clientHeight * engine.canvas.clientHeight + engine.canvas.clientWidth * engine.canvas.clientWidth) * 0.5;
                }
                return true;
            }
        }

        if (mode === "rotate") {
            const angle = function(evt) {
                const touch1 = evt.touches.item(0);
                const touch2 = evt.touches.item(1);
                const dirX = touch2.clientX - touch1.clientX;
                const dirY = touch2.clientY - touch1.clientY;
                return Math.atan2(dirY, dirX);
            }

            moveHandler = function (evt) {
                if ((additionalTouches && evt.touches.length > 1) || evt.touches.length === 2) {
                    const position = angle(evt);
                    let fraction = (position - downPosition) / clientLength;
                    fraction *= options.scale;
                    if (fraction > 1) fraction = 1;
                    if (inverted) fraction = -fraction;
                    const value = downValue + span * fraction;
                    if (engine.debugInputs) console.log("Analog input", private.inputName, "=", value);
                    private.analogState.setValue(evt, value, true);
                }
                return true;
            }
            touchStartHandler = function(evt) {
                if (evt.touches.length === 2) {
                    downPosition = angle(evt);
                    downValue = private.analogState.getValue();
                    span = private.analogState.maxValue - private.analogState.minValue;
                    clientLength = Math.PI * 0.5;
                }
                return true;
            }
        }

        public.enable = function () {
            if (moveHandler) engine.canvas.addEventListener("touchmove", moveHandler, false);
            if (touchStartHandler) engine.canvas.addEventListener("touchstart", touchStartHandler, false);
            return public;
        }

        public.disable = function () {
            if (moveHandler) engine.canvas.removeEventListener("touchmove", moveHandler, false);
            if (touchStartHandler) engine.canvas.removeEventListener("touchstart", touchStartHandler, false);
            return public;
        }

        return public;
    }

    if ((/pointer/i).test(inputName)) {
        let buttons = 0;
        let vertical = false;
        let inverted = false;
        let downPosition;
        let downValue;

        for (let i = 0; i < splits.length; i++) {
            if ((/^horizontal$/).test(splits[i])) vertical = false;
            if ((/^vertical$/).test(splits[i])) vertical = true;
            if ((/^inverted$/).test(splits[i])) inverted = true;
            if ((/^left$/).test(splits[i])) buttons = 1;
            if ((/^right$/).test(splits[i])) buttons = 2;
            if ((/^middle$/).test(splits[i])) buttons = 4;
            if ((/^back$/).test(splits[i])) buttons = 8;
            if ((/^forward$/).test(splits[i])) buttons = 16;
            if ((/^eraser$/).test(splits[i])) buttons = 32;
            if ((/^any$/).test(splits[i])) buttons = 255;
        }

        const moveHandler = function (evt) {
            if (buttons === 0) {
                let fraction = vertical ? evt.clientY / engine.canvas.clientHeight : evt.clientX / engine.canvas.clientWidth;
                fraction *= options.scale;
                if (fraction > 1) fraction = 1;
                if (inverted) fraction = 1 - fraction;
                const value = ((private.analogState.maxValue - private.analogState.minValue) * fraction) + private.analogState.minValue;
                if (engine.debugInputs) console.log("Analog input", private.inputName, "=", value);
                private.analogState.setValue(evt, value, true);
            } else if ((evt.buttons & buttons) !== 0) {
                let fraction = vertical 
                    ? (inverted ? (downPosition - evt.clientY) : (evt.clientY - downPosition)) / engine.canvas.clientHeight
                    : (inverted ? (downPosition - evt.clientX) : (evt.clientX - downPosition)) / engine.canvas.clientWidth;
                fraction *= options.scale;
                if (fraction > 1) fraction = 1;
                const value = downValue + ((private.analogState.maxValue - private.analogState.minValue) * fraction);
                if (engine.debugInputs) console.log("Analog input", private.inputName, "=", value);
                private.analogState.setValue(evt, value, true);
            }
            return true;
        }

        const downHandler = function(evt) {
            if ((evt.buttons & buttons) !== 0) {
                downPosition = vertical ? evt.clientY : evt.clientX;
                downValue = private.analogState.getValue();
            }
        }

        public.enable = function () {
            engine.canvas.addEventListener("pointermove", moveHandler, false);
            if (buttons !== 0) engine.canvas.addEventListener("pointerdown", downHandler, false);
            return public;
        }

        public.disable = function () {
            engine.canvas.removeEventListener("pointermove", moveHandler, false);
            if (buttons !== 0) engine.canvas.removeEventListener("pointerdown", downHandler, false);
            return public;
        }

        return public;
    }

    if ((/gamepad/i.test(inputName))) {
        let controllerIndex = 0;
        let stickIndex = 0;
        let axisIndex = 0;
        let gamepad = null;
        let inverted = false;
        let interval;

        for (let i = 0; i < splits.length; i++) {
            if ((/^horizontal$/).test(splits[i])) axisIndex = 0;
            if ((/^vertical$/).test(splits[i])) axisIndex = 1;
            if ((/^inverted$/).test(splits[i])) inverted = true;
            if ((/^player1$/).test(splits[i])) controllerIndex = 0;
            if ((/^player2$/).test(splits[i])) controllerIndex = 1;
            if ((/^player3$/).test(splits[i])) controllerIndex = 2;
            if ((/^player4$/).test(splits[i])) controllerIndex = 3;
            if ((/^stick1$/).test(splits[i])) stickIndex = 0;
            if ((/^stick2$/).test(splits[i])) stickIndex = 1;
            if ((/^stick3$/).test(splits[i])) stickIndex = 2;
            if ((/^stick4$/).test(splits[i])) stickIndex = 3;
        }

        const index = stickIndex * 2 + axisIndex;

        const poll = function (evt) {
            if (gamepad) {
                const value = gamepad.axes[index];
                if (inverted) value = -value;
                private.analogState.setVelocity(evt, value * private.analogState.maxVelocity);
            }
        }

        const connectedHandler = function(evt) {
            if (engine.debugInputs) console.log("Gamepad", evt.gamepad.index, "connected", "id:" + evt.gamepad.id, "with", e.gamepad.axes.length, "axes");
            if (evt.gamepad.index === controllerIndex && gamepad.axes.length > index) {
                gamepad = evt.gamepad;
                interval = setInterval(poll, 50);
            }
        }

        const disconnectedHandler = function(evt) {
            if (engine.debugInputs) console.log("Gamepad", evt.gamepad.index, "disconnected", "id:" + evt.gamepad.id);
            if (evt.gamepad.id === gamepad.id) {
                clearInterval(interval);
                gamepad = null;
            }
        }

        public.enable = function () {
            window.addEventListener("gamepadconnected", connectedHandler, false);
            window.addEventListener("gamepaddisconnected", disconnectedHandler, false);
            return public;
        }

        public.disable = function () {
            window.removeEventListener("gamepadconnected", connectedHandler, false);
            window.removeEventListener("gamepaddisconnected", disconnectedHandler, false);
            return public;
        }

        return public;
    }

    if ((/orientation/i.test(inputName))) {
        // https://developer.mozilla.org/en-US/docs/Web/Events/Detecting_device_orientation
        return public;
    }

    return public;
}