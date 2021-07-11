# Analog Input

The `AnalogInput(inputName: string, analogState: AnalogState)` function constructs 
a analog input object that can capture player actions on input devices and mutate
an `AnalogState` object.

Note that you must call the `enable()` method of the analog input for it to start
capturing and player inputs. There is also a `disable()` method you can call to
stop responding to this player action. You can also add inputs to an `InputMethod`
to enable or disable a set of inputs all at once.

## Example

The following example moves the camera in and out of the scene when the mouse 
wheel is scrolled:

```javascript
const frag = window.frag;

// Define an action that sets the Z-axis position of the camera
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

## Mouse input

For mouse input the `inputName` parameter is a hyphen separated list of keywords.
The keywords and not case sensitive and can be put in any order, so order 
them in a way that is most readable for you.

To indicate that you want to capture mouse input, the keyword list must include
`mouse`. If you do not add any other keywords the default is to capture horizontal
movement of the mouse regardless of the state of the mouse buttons. You can add
the following keywords to change this default:
* `horizontal` redundent since this is the default, add it to improve readability
* `vertical` captures vertical movement of the mouse
* `inverted` inverts the mouse direction, so for example moving the mouse to the 
  right will decrease the value of the analog state instead of increasing it.
* `wheel` capture the rolling of the wheel on the mouse rather than movement of the
  mouse itself.
* `left` the left mouse button must be pressed for mouse movements to be recorded
* `right` the right mouse button must be pressed for mouse movements to be recorded
* `middle` the middle mouse button must be pressed for mouse movements to be recorded
* `back` the back mouse button must be pressed for mouse movements to be recorded
* `forward` the forward mouse button must be pressed for mouse movements to be recorded
* `any` any mouse button must be pressed for mouse movements to be recorded

## Keyboard input

You can allow the player to increase or decrease an analog value using two keys on
the keyboard, one for up and one for down. To create this kind of binding pass a
string of the form `keys-a-d` as the `inputName` parameter. In this example the "A"
key would reduce the analog value and the "D" key would increase it.

This is a list of
[keyboard key values](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values) 
that you can use. If you simply pass `keys` as the `inputName` parameter then the default
keys are `ArrowLeft` and `ArrowRight`.

## Touch screen input
This is not implemented yet.

## Game pad input
This is not implemented yet.

## Pointer input
Browsers define a "pointer" input device that unifies the various input methods avoiding the
need to specifically configure individual input devices. For example if the player is on a phone
with no mouse the "pointer" input will surface touch events, but if the player is on a laptop
with no touch screen then it will surface track pad input.

This is not implemented yet.

## Device orientation input
This is not implemented yet.

# Device accelorometer input
This is not implemented yet.
