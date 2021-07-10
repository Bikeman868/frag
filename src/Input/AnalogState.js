// Represents an analog value that can be changed by the player using analog inputs
window.frag.AnalogState = function(analogAction, config, name) {
    const frag = window.frag;

    if (!config) config = {};
    config.value = config.value || 0;
    config.minValue = config.minValue === undefined ? -100 : config.minValue;
    config.maxValue = config.maxValue === undefined ? 100 : config.maxValue;
    config.maxVelocity = config.maxVelocity || 5;
    config.acceleration = config.acceleration === undefined ? 0.25 : config.acceleration;
    config.deceleration = config.deceleration === undefined ? 1 : config.deceleration;

    const private = {
        analogAction,
        config,
        name,
    }

    const public = {
        __private: private,
        value: config.value,
        minValue: config.minValue,
        maxValue: config.maxValue,
        velocity: 0,
    }

    private.change = function(evt) {
        if (private.analogAction) {
            if (Array.isArray(private.analogAction)) {
                for (let i = 0; i < private.analogAction.length; i++)
                    private.analogAction[i](public, evt);
            } else {
                private.analogAction(public, evt);
            }
        }
    }

    public.setValue = function(evt, value, calcVelocity) {
        if (calcVelocity) public.velocity = value - public.value;
        if (value < private.config.minValue) {
            value = private.config.minValue;
            public.velocity = 0;
        }
        if (value > private.config.maxValue) {
            value = private.config.maxValue;
            public.velocity = 0;
        }
        if (Math.abs(public.value - value) > 1e-5) {
            public.value = value;
            if (frag.debugInputs) console.log("Analog state", private.name, "set to", value);
            private.change(evt);
        }
    }

    public.increment = function(evt) {
        public.velocity += public.velocity >= 0 ? private.config.acceleration : private.config.deceleration;
        if (public.velocity > private.config.maxVelocity) public.velocity = private.config.maxVelocity;
        public.setValue(evt, public.value + public.velocity, false);
    }

    public.decrement = function(evt) {
        public.velocity -= public.velocity <= 0 ? private.config.acceleration : private.config.deceleration;
        if (public.velocity < -private.config.maxVelocity) public.velocity = -private.config.maxVelocity;
        public.setValue(evt, public.value + public.velocity, false);
    }

    return public;
}