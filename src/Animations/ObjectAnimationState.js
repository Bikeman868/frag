// Represents the current state of an object being animated
window.frag.ObjectAnimationState = function (engine) {
    const private = {
    };

    const public = {
        __private: private,
        location: window.frag.Location(),
    };

    public.getMatrix = function () {
        return public.location.getMatrix();
    }

    public.getUpdateFunction = function(channelName) {
        switch (channelName) {
            case "translate-x":
                return function (value) {
                    public.location.translateX = value;
                    public.location.isModified = true;
                };
            case "translate-y":
                return function (value) {
                    public.location.translateY = value;
                    public.location.isModified = true;
                };
            case "translate-z":
                return function (value) {
                    public.location.translateZ = value;
                    public.location.isModified = true;
                }

            case "scale-x":
                return function (value) {
                    public.location.scaleX = value;
                    public.location.isModified = true;
                };
            case "scale-y":
                return function (value) {
                    public.location.scaleY = value;
                    public.location.isModified = true;
                };
            case "scale-z":
                return function (value) {
                    public.location.scaleZ = value;
                    public.location.isModified = true;
                }

            case "rotate-x":
                return function (value) {
                    public.location.rotateX = value;
                    public.location.isModified = true;
                }
            case "rotate-y":
                return function (value) {
                    public.location.rotateY = value;
                    public.location.isModified = true;
                }
            case "rotate-z":
                return function (value) {
                    public.location.rotateZ = value;
                    public.location.isModified = true;
                };
        }
        console.warn("Unsupported animation channel " + channelName);
        return function () { };
    };

    return public;
}
