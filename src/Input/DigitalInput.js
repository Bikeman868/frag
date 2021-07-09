// Represents an input that can only be on or off. For example
// keyboard keys of mouse buttons
window.frag.DigitalInput = function(inputName, onChange) {
    const frag = window.frag;

    const private = {
        inputName,
        onChange
    }

    const public = {
        __private: private,
        isOn: false
    }

    if ((/mouse/).test(inputName)) {
        let buttons = 1;
        if ((/left/).test(inputName)) buttons = 1;
        if ((/right/).test(inputName)) buttons = 2;
        if ((/middle/).test(inputName)) buttons = 4;
        if ((/back/).test(inputName)) buttons = 8;
        if ((/forward/).test(inputName)) buttons = 16;
        if ((/any/).test(inputName)) buttons = 31;

        const isDown = function(evt) {
            return (evt.buttons & buttons) !== 0;
        }

        const handler = function(evt) {
            const isOn = isDown(evt);
            if (isOn !== public.isOn) {
                public.isOn = isOn;
                if (private.onChange) private.onChange(isOn, public, evt);
            }
        }

        public.enable = function() {
            frag.canvas.addEventListener("mousedown", handler, false);
            frag.canvas.addEventListener("mouseup", handler, false);
        }

        public.disable = function() {
            frag.canvas.removeEventListener("mousedown", handler, false);
            frag.canvas.removeEventListener("mouseup", handler, false);
        }
    }

    return public;
}