// A collection of inputs that can be turned on and off.
window.frag.InputMethod = function() {
    const frag = window.frag;

    const private = {
        inputs: [],
        enabled: false
    }

    const public = {
        __private: private
    }

    // Enables all of the inputs for this input method
    public.enable = function() {
        if (!private.enabled) {
            for (var i = 0; i< private.inputs.length; i++)
                private.inputs[i].enable();
            private.enabled = true;
        }
        return public;
    }

    // Disables all of the inputs for this input method
    public.disable = function() {
        if (private.enabled) {
            private.enabled = false;
            for (var i = 0; i< private.inputs.length; i++)
                private.inputs[i].disable();
        }
        return public;
    }

    // Adds a new input method
    public.add = function(input) {
        private.inputs.push(input);
        if (private.enabled) input.enable();
        return public;
    }

    return public;
}