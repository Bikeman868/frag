# Analog State

The `AnalogState(action: undefined | AnalogAction | Array<AnalogAction>, config: Object, name: string)` 
function constructs an analog state object that holds a floating point value that can be bound to 
input devices and actions. The input devices operated by the player mutate the floating point value, and 
these changes trigger actions that alter the game.

Note that you do not have to pass any actions, instead you can just query the 
current state whenever you need it. The advantage being that later on you might
decide that you also want to play a sound of run an animation when the state changes
and these can easily be added later.

You also don't have to configure an input bindings to this state. In this case you
can manually mutate the state in your code by calling one of these methods:
* `setValue(evt: Event, value: float, calcVelocity: bool)`
* `increment(evt: Event)`
* `decrement(evt: Event)`

## Example

The following example moves the camera in and out if the scene when the mouse wheel is scrolled:

```javascript
const frag = window.frag;

// Define an action that sets the Z-axis position of the camera to
// the value in an analog state
const cameraActionZ = frag.AnalogAction("move-camera-z");

// Define an analog state to hold the current value of the camera
// Z-axis position. Define the range of allowed values and how
// quickly the value can change.
const cameraZoomState = frag.AnalogState(
    cameraActionZ, 
    {   value: -200,
        minValue: -500,
        maxValue: 0,
        maxVelocity: 5,
        acceleration: 0.25,
        deceleration: 2,
    },
    "camera zoom");

// Define an analog input that converts movements of the mouse wheel
// into changes in the analog state value
const wheelInput = frag.AnalogInput("mouse-wheel", cameraZoomState);

// Bind the input to the mouse wheel
wheelInput.enable();
```

The reason that the code is broken up into these 3 pieces is so that
you can have multiple actions linked to one state, and multiple input
devices controlling that input state.

## Actions

The `action` parameter can be undefined, a function, or an array of functions. 
You can just write your own function and pass it here, or you can call 
the `frag.AnalogAction()` function that will construct a function for you.

If you write your own custom action function then is should use the following 
method signature:
```javascript
const myAction = function(analogState, evt) {}
```

This function will be called whenever the analog state significantly changes 
its value.

The `analogState` parameter will be passed the analog state object whose state changed.
You can the following properties of this object to discover the current state:
* `value` the floating point value
* `minValue` the minimum permitted value
* `maxValue` the maximum permitted value
* `velocity` the rate at which the value is changing. Note that this will be negative if the value is decreasing

The `evt` parameter will contain the browser event that triggered this change of state. This
could be a mouse event, keyboard event, touch event or whatever. If you write custom action
functions that use this parameter, then you should either ensure that only one kind of 
event can change this state, or check the type of the event before using it.

## Config
The `config` parameter is optional. When provided it must be an object and can contain
any of the following optional properties:
* `value` the initial value of the analog state. Defaults to 0
* `minValue` the lowest permitted value. Defaults to -100
* `maxValue` the highest permitted value. Defaults to 100
* `maxVelocity` the maximum rate at which the value is allowed to change. Must be positive. Defaults to 5
* `acceleration` the amount that the velocity changes by on each event pushing it in the same direction. Defaults to 0.25
* `deceleration` the amount that the velocity changes by on each event pushing it in the opposite direction. Defaults to 1

## Name
the `name` parameter is optional, and only useful during debugging. In particular if
you assign `window.frag.debugInputs = true;` then the this name will be included in
the console log to help you figure out issues with your input handling.