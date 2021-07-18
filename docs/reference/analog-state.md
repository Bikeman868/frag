# Analog State

This class maintains a floating point value that can be changed by analog 
inputs or program code. The analog state also has a velocity and acceleration
to limit the rate of change in the value.

The analog state can be hooked up to analog actions that are updated on
significant changes in state.

## Constructor
```javascript
window.frag.AnalogState(engine: Engine, action: undefined | AnalogAction | AnalogAction[], config: Object | undefined, name: string | undefined)
```

* `engine` is the game engine for your game. It is an instance of the `Engine` class. You can 
  have more than one on a page but more often there is just one that is constructed at the 
  very beginning.
* `action` zero or more instances of the `AnalogAction` class. This defines what changes
  in your game scene as a result of this analog state changing. Note that you do not have 
  to pass any actions, instead you can just query the current state whenever you need it. 
  The advantage being that later on you might decide that you also want to play a sound of
  run an animation when the state changes and these can easily be added later.
* `config` is an optional configuration for the state. Allows you to define the initial
  value, min and max values as well as acceleration and max velocity. See below for details.
* `name` optional, and only useful during debugging. In particular if you assign 
  `engine.debugInputs = true;` then the this name will be included in the console log to 
  help you figure out issues with your input handling.

Note that it is usual to wire up some `AnalogInput` instances to drive state changes, but
you don't have to do this. In this case you can manually mutate the state in your code 
by calling one of these methods:
* `setValue(evt: Event, value: float, calcVelocity: bool)`
* `increment(evt: Event)`
* `decrement(evt: Event)`

Note that for any constructor, you can call this function on the `engine` rather than passing
`engine` as a parameter. In this case the call looks like:

```javascript
engine.AnalogState(action: undefined | AnalogAction | AnalogAction[], config: Object | undefined, name: string | undefined)
```

## Example

The following example moves the camera in and out of the scene when the mouse wheel 
is scrolled:

```javascript
const engine = window.frag.Engine().start();

// Define an action that sets the Z-axis position of the camera
const cameraActionZ = engine.AnalogAction("move-camera-z");

// Define an analog state to hold the current value of the camera
// Z-axis position. Define the range of allowed values and how
// quickly the value can change.
const cameraZoomState = engine.AnalogState(
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
const wheelInput = engine.AnalogInput("mouse-wheel", cameraZoomState);

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

