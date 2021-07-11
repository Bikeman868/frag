// Represents an input that can only be on or off. For example keyboard keys or mouse buttons
window.frag.DigitalInput = function (inputName, digitalState) {
    const frag = window.frag;

    const private = {
        inputName,
        digitalState,
        toggle: false,
        inverted: false,
        setOn: false,
        setOff: false,
    }

    const public = {
        __private: private,
    }

    const splits = inputName.split("-");

    const setIsOn = function (evt, isOn) {
        if (private.inverted) isOn = !isOn;
        if (frag.debugInputs) console.log("Digital input", private.inputName, "is", isOn ? "on" : "off");
        if (private.toggle) {
            if (isOn) private.digitalState.toggle(evt);
        } else {
            if (private.setOn || private.setOff) {
                if (isOn) {
                    // Note that it is deliberate that you can set both on and off.
                    // In this case each time you press the key down the digital
                    // state will go on and off again very quickly
                    if (private.setOn) private.digitalState.setIsOn(evt, true);
                    if (private.setOff) private.digitalState.setIsOn(evt, false);
                }
            } else {
                private.digitalState.setIsOn(evt, isOn);
            }
        }
    }

    if ((/mouse/i).test(inputName)) {
        let buttons = 1;

        for (let i = 0; i < splits.length; i++) {
            if ((/^toggle$/i).test(splits[i])) private.toggle = true;
            if ((/^inverted$/i).test(splits[i])) private.inverted = true;
            if ((/^on$/i).test(splits[i])) private.setOn = true;
            if ((/^off$/i).test(splits[i])) private.setOff = true;
            if ((/^left$/i).test(splits[i])) buttons = 1;
            if ((/^right$/i).test(splits[i])) buttons = 2;
            if ((/^middle$/i).test(splits[i])) buttons = 4;
            if ((/^back$/i).test(splits[i])) buttons = 8;
            if ((/^forward$/i).test(splits[i])) buttons = 16;
            if ((/^eraser$/i).test(splits[i])) buttons = 32;
            if ((/^any$/i).test(splits[i])) buttons = 255;
        }

        const handler = function (evt) {
            setIsOn(evt, (evt.buttons & buttons) !== 0);
            return true;
        }

        public.enable = function () {
            frag.canvas.addEventListener("mousedown", handler, false);
            frag.canvas.addEventListener("mouseup", handler, false);
        }

        public.disable = function () {
            frag.canvas.removeEventListener("mousedown", handler, false);
            frag.canvas.removeEventListener("mouseup", handler, false);
        }

        return public;
    }

    if ((/pointer/i).test(inputName)) {
        let buttons = 1;

        for (let i = 0; i < splits.length; i++) {
            if ((/^toggle$/i).test(splits[i])) private.toggle = true;
            if ((/^inverted$/i).test(splits[i])) private.inverted = true;
            if ((/^on$/i).test(splits[i])) private.setOn = true;
            if ((/^off$/i).test(splits[i])) private.setOff = true;
            if ((/^left$/i).test(splits[i])) buttons = 1;
            if ((/^right$/i).test(splits[i])) buttons = 2;
            if ((/^middle$/i).test(splits[i])) buttons = 4;
            if ((/^back$/i).test(splits[i])) buttons = 8;
            if ((/^forward$/i).test(splits[i])) buttons = 16;
            if ((/^eraser$/i).test(splits[i])) buttons = 32;
            if ((/^any$/i).test(splits[i])) buttons = 255;
        }

        const handler = function (evt) {
            setIsOn(evt, (evt.buttons & buttons) !== 0);
            return true;
        }

        public.enable = function () {
            frag.canvas.addEventListener("pointerdown", handler, false);
            frag.canvas.addEventListener("pointerup", handler, false);
        }

        public.disable = function () {
            frag.canvas.removeEventListener("pointerdown", handler, false);
            frag.canvas.removeEventListener("pointerup", handler, false);
        }

        return public;
    }

    if ((/key/i).test(inputName)) {
        let key;
        let ctrl = false;
        let shift = false;
        let alt = false;
        let meta = false;

        for (let i = 0; i < splits.length; i++) {
            if ((/^toggle$/i).test(splits[i])) private.toggle = true;
            else if ((/^inverted$/i).test(splits[i])) private.inverted = true;
            else if ((/^on$/i).test(splits[i])) private.setOn = true;
            else if ((/^off$/i).test(splits[i])) private.setOff = true;
            else if (/^ctrl$/i.test(splits[i])) ctrl = true;
            else if (/^shift$/i.test(splits[i])) shift = true;
            else if (/^alt$/i.test(splits[i])) alt = true;
            else if (/^meta$/i.test(splits[i])) meta = true;
            else if (/^key$/i.test(splits[i]));
            else key = splits[i];
        }

        const handler = function (evt, isDown) {
            if (evt.key !== key ||
                evt.altKey !== alt ||
                evt.ctrlKey !== ctrl ||
                evt.shiftKey !== shift ||
                evt.metaKey !== meta)
                return true;

            evt.preventDefault();
            setIsOn(evt, isDown);

            return true;
        }

        const keyDownHandler = function (evt) {
            return handler(evt, true);
        }

        const keyUpHandler = function (evt) {
            return handler(evt, false);
        }

        public.enable = function () {
            document.addEventListener("keydown", keyDownHandler, false);
            document.addEventListener("keyup", keyUpHandler, false);
        }

        public.disable = function () {
            document.removeEventListener("keydown", keyDownHandler, false);
            document.removeEventListener("keyup", keyUpHandler, false);
        }

        return public;
    }

    return public;
}