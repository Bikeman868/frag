// Represents an on/off state that can be controlled by the player using digital inputs
window.frag.DigitalState = function (engine, digitalAction, config, name) {
    const frag = window.frag;

    if (!config) config = {};
    config.isOn = !!config.isOn;

    const private = {
        digitalAction,
        config,
        name,
    }

    const public = {
        __private: private,
        isOn: config.isOn,
    }

    private.change = function(evt) {
        if (private.digitalAction) {
            if (Array.isArray(private.digitalAction)) {
                for (let i = 0; i < private.digitalAction.length; i++)
                    private.digitalAction[i](public, evt);
            } else {
                private.digitalAction(public, evt);
            }
        }
    }

    public.setIsOn = function (evt, isOn) {
        if (isOn !== public.isOn) {
            public.isOn = isOn;
            if (engine.debugInputs) console.log("Digital state", private.name, "turned", public.isOn ? "on" : "off");
            private.change(evt);
        }
        else if (engine.debugInputs) console.log("Digital state", private.name, "is already", public.isOn ? "on" : "off");
    }

    public.toggle = function (evt) {
        public.isOn = !public.isOn;
        if (engine.debugInputs) console.log("Digital state", private.name, "toggled to", public.isOn ? "on" : "off");
        private.change(evt);
    }

    return public;
}