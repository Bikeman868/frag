// Represents an input that can only be on or off. For example keyboard keys or mouse buttons
window.frag.DigitalInput = function (inputName, onChange, isOn) {
    const frag = window.frag;

    const private = {
        inputName,
        onChange,
        toggle: false,
        inverted: false,
    }

    const public = {
        __private: private,
        isOn: !!isOn
    }

    const splits = inputName.split("-");

    const change = function(evt) {
        if (private.onChange) {
            if (Array.isArray(private.onChange)) {
                for (let i = 0; i < private.onChange.length; i++)
                    private.onChange[i](evt);
            } else {
                private.onChange(public, evt);
            }
        }
    }

    const setIsOn = function (isOn, evt) {
        if (private.inverted) isOn = !isOn;
        if (private.toggle) {
            if (isOn) {
                public.isOn = !public.isOn;
                if (frag.debugInputs) console.log("Toggling digital input", inputName, public.isOn ? "on" : "off");
                change(evt);
            }
        } else {
            if (isOn !== public.isOn) {
                public.isOn = isOn;
                if (frag.debugInputs) console.log("Digital input", inputName, "turned", public.isOn ? "on" : "off");
                change(evt);
            }
        }
    }

    if ((/mouse/).test(inputName)) {
        let buttons = 1;

        for (let i = 0; i < splits.length; i++) {
            if ((/^toggle$/).test(splits[i])) private.toggle = true;
            if ((/^inverted$/).test(splits[i])) private.inverted = true;
            if ((/^left$/).test(splits[i])) buttons = 1;
            if ((/^right$/).test(splits[i])) buttons = 2;
            if ((/^middle$/).test(splits[i])) buttons = 4;
            if ((/^back$/).test(splits[i])) buttons = 8;
            if ((/^forward$/).test(splits[i])) buttons = 16;
            if ((/^any$/).test(splits[i])) buttons = 31;
        }

        const handler = function (evt) {
            setIsOn((evt.buttons & buttons) !== 0, evt);
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

    if ((/key/i).test(inputName)) {
        let key;
        let ctrl = false;
        let shift = false;
        let alt = false;
        let meta = false;

        for (let i = 0; i < splits.length; i++) {
            if ((/^toggle$/).test(splits[i])) private.toggle = true;
            else if ((/^inverted$/).test(splits[i])) private.inverted = true;
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
            setIsOn(isDown, evt);

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