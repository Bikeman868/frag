// Represents an input that can be moved up and down in value. For example
// the scroll wheel on the mouse or a joystick axis
window.frag.AnalogInput = function(inputName, onChange, config) {
    const frag = window.frag;

    if (!config) config = {};
    config.value = config.value || 0;
    config.minValue = config.minValue || 0;
    config.maxValue = config.maxValue == undefined ? 100 : config.maxValue;
    config.maxVelocity = config.maxVelocity || 5;
    config.acceleration = config.acceleration || 0.25;
    config.deceleration = config.deceleration || 1;

    const private = {
        inputName,
        onChange,
        config,
        inverted: false,
    }

    const public = {
        __private: private,
        value: config.value,
        velocity: 0,
    }

    const splits = inputName.split("-");

    const change = function(evt) {
        if (private.onChange) {
            if (Array.isArray(private.onChange)) {
                for (let i = 0; i < private.onChange.length; i++)
                    private.onChange[i](public, evt);
            } else {
                private.onChange(public, evt);
            }
        }
    }

    const setValue = function(value, evt) {
        if (value < config.minValue) {
            value = config.minValue;
            public.velocity = 0;
        }
        if (value > config.maxValue) {
            value = config.maxValue;
            public.velocity = 0;
        }
        if (Math.abs(public.value - value) > 1e-5) {
            public.value = value;
            if (frag.debugInputs) console.log("Analog input", inputName, "changed to", value);
            change(evt);
        }
    }

    const increment = function(evt) {
        public.velocity += public.velocity >= 0 ? config.acceleration : config.deceleration;
        if (public.velocity > config.maxVelocity) public.velocity = config.maxVelocity;
        setValue(public.value + public.velocity, evt);
    }

    const decrement = function(evt) {
        public.velocity -= public.velocity <= 0 ? config.acceleration : config.deceleration;
        if (public.velocity < -config.maxVelocity) public.velocity = -config.maxVelocity;
        setValue(public.value + public.velocity, evt);
    }

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
                const value = ((config.maxValue - config.minValue) * fraction) + config.minValue;
                setValue(value, evt);
            } else if ((evt.buttons & buttons) !== 0) {
                let fraction = vertical 
                    ? (inverted ? (downPosition - evt.clientY) : (evt.clientY - downPosition)) / frag.canvas.clientHeight
                    : (inverted ? (downPosition - evt.clientX) : (evt.clientX - downPosition)) / frag.canvas.clientWidth;
                const value = downValue + ((config.maxValue - config.minValue) * fraction);
                setValue(value, evt);
            }
            return true;
        }

        const downHandler = function(evt) {
            if ((evt.buttons & buttons) !== 0) {
                downPosition = vertical ? evt.clientY : evt.clientX;
                downValue = public.value;
            }
        }

        const wheelHandler = function(evt) {
            if (inverted) {
                if (evt.deltaY > 0) decrement(evt); else increment(evt);
            } else {
                if (evt.deltaY < 0) decrement(evt); else increment(evt);
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
                decrement(evt);
                evt.preventDefault();
            } else if (evt.key === rightKey) {
                increment(evt);
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
    }

    if ((/gamepad/i.test(inputName))) {
        // https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API
    }

    if ((/pointer/i.test(inputName))) {
        // https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events
    }

    if ((/orientation/i.test(inputName))) {
        // https://developer.mozilla.org/en-US/docs/Web/Events/Detecting_device_orientation
    }
    return public;
}