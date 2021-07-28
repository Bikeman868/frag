// Represents an analog value that can be changed by the player using analog inputs
window.frag.AnalogState = function(engine, analogAction, config, name) {
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
        inverted: false,
    }

    const public = {
        __private: private,
        value: config.value,
        minValue: config.minValue,
        maxValue: config.maxValue,
        maxVelocity: Math.abs(config.maxVelocity),
        velocity: 0,
    }

    public.analogAction = function(action) {
        private.analogAction = action;
    }

    if (config.maxValue < config.minValue) {
        private.inverted = true;
        public.minValue = config.maxValue;
        public.maxValue = config.minValue;
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

    private.setValue = function(evt, value) {
        if (value < public.minValue) {
            value = public.minValue;
            public.velocity = 0;
        }
        if (value > public.maxValue) {
            value = public.maxValue;
            public.velocity = 0;
        }
        if (Math.abs(public.value - value) > 1e-5) {
            public.value = value;
            if (engine.debugInputs) console.log("Analog state", private.name, "set to", value);
            private.change(evt);
        }
    }

    private.increment = function(evt) {
        public.velocity += public.velocity >= 0 ? private.config.acceleration : private.config.deceleration;
        if (public.velocity > private.config.maxVelocity) public.velocity = private.config.maxVelocity;
        private.setValue(evt, public.value + public.velocity, false);
    }

    private.decrement = function(evt) {
        public.velocity -= public.velocity <= 0 ? private.config.acceleration : private.config.deceleration;
        if (public.velocity < -private.config.maxVelocity) public.velocity = -private.config.maxVelocity;
        private.setValue(evt, public.value + public.velocity, false);
    }

    public.setValue = function(evt, value, calcVelocity) {
        if (private.inverted)
            value = public.minValue + public.maxValue - value;

        if (calcVelocity) public.velocity = value - public.value;

        private.setValue(evt, value);
    }

    public.getValue = function() {
        if (private.inverted)
            return public.minValue + public.maxValue - public.value;
        return public.value;
    }

    public.increment = function(evt) {
        if (private.inverted) private.decrement(evt);
        else private.increment(evt);
    }

    public.decrement = function(evt) {
        if (private.inverted) private.increment(evt);
        else private.decrement(evt);
    }

    public.setVelocity = function(evt, velocity) {
        if (inverted) public.velocity = -velocity;
        else public.velocity = velocity;
        if (public.velocity > private.config.maxVelocity) public.velocity = private.config.maxVelocity;
        if (public.velocity < -private.config.maxVelocity) public.velocity = -private.config.maxVelocity;
        private.setValue(evt, public.value + public.velocity);
    }

    return public;
}