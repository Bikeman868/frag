// Represents an input that can be moved up and down in value. For example
// the scroll wheel on the mouse or a joystick axis
window.frag.AnalogInput = function(inputName) {
    const frag = window.frag;

    const private = {
        inputName
    }

    const public = {
        __private: private
    }


    return public;
}