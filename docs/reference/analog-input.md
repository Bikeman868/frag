# Analog Input

The `AnalogInput(inputName: string, analogState: AnalogState)` function constructs 
a analog input object that can capture player actions on input devices and mutate
an `AnalogState` object.

Note that you must call the `enable()` method of the analog input for it to start
capturing and player inputs. There is also a `disable()` method you can call to
stop responding to this player action. You can also add inputs to an `InputMethod`
to enable or disable a set of inputs all at once.

## Constructor
```javascript
window.frag.AnalogInput(engine: Engine, inputName: string, analogState: AnalogState)
```

* `engine` is the game engine for your game. It is an instance of the `Egnine` class. You can 
  have more than one on a page but more often there is just one that is constructed at the 
  very beginning.
* `inputName` a hyphen separated list of keywords that defines which input device to capture
  input from. See below.
* `analogState` is an instance of the `AnalogState` class. This analog state will be updated
  by player actions on the input device defined by the `inputName` parameter

Note that for any constructor, you can call this function on the `engine` rather than passing
`engine` as a parameter. In this case the call looks like:

```javascript
engine.AnalogInput(inputName: string, analogState: AnalogState)
```

## Example

The following example moves the camera in and out of the scene when the mouse 
wheel is scrolled:

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

// Allow the player to also control camera zoom with touch screen pinch
const wheelInput = engine.AnalogInput("pinch-touch", cameraZoomState);

// Bind the input to the mouse wheel
wheelInput.enable();
```

The reason that the code is broken up into these 3 pieces is so that
you can have multiple actions linked to one state, and multiple input
devices controlling that input state.

## Mouse input

For mouse input the `inputName` parameter is a hyphen separated list of keywords.
The keywords are not case sensitive and can be put in any order, so order 
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
Touch screens support multiple concurrent touch points. It's sort of like having 
multiple mice but each mouse only has one button and it must be pressed for the mouse
to work.

For touch screen input the `inputName` parameter is a hyphen separated list of keywords.
The keywords are not case sensitive and can be put in any order, so order them in a way 
that is most readable for you.

To indicate that you want to capture touch input, the keyword list must include
`touch`. If you do not add any other keywords the default is to capture horizontal
movement if a single finger touching the screen. You can add the following keywords 
to change this default:
* `horizontal` redundent since this is the default, add it to improve readability
* `vertical` captures vertical movement of the finger touching the screen
* `1` captures movement when there is exactly 1 finger touching the screen
* `2` captures movement of the second finger when there are exactly 2 fingers touching the screen
* `3` captures movement of the third finger when there are exactly 3 fingers touching the screen
* `plus` allows additional fingers to be touching the screen. For example if I pass `1-plus-touch`
  as my `inputName` then this input will respond if there is 1 or more fingers touching the screen,
  but finger 1 will still control the analog value even when additional fingers are touching.
* `inverted` inverts the touch direction, so for example moving your finger to the 
  right will decrease the value of the analog state instead of increasing it.
* `pinch` the analog state will be set to the distance distance between two fingers when
  exactly 2 fingers are touching the screen. The `inverted` option works with `pinch` but is not 
  recommended.
* `rotate` the analog state is controlled by the angle between the first finger position
  to the second finger position when exactly 2 fingers are touching the screen. The `inverted` 
  option works with `rotate` but is not recommended.

## Game pad input
In terms of analog inputs, game controllers have zero or more joystick axes. Frag supports
up to four controllers each having four 2-axis joysticks.

For game pad input the `inputName` parameter is a hyphen separated list of keywords.
The keywords are not case sensitive and can be put in any order, so order them in a way 
that is most readable for you.

To indicate that you want to capture gamepad input, the keyword list must include
`gamepad`. If you do not add any other keywords the default is to capture horizontal
movement of the first joystick on the player 1 game pad:
* `horizontal` redundent since this is the default, add it to improve readability
* `vertical` captures the vertical joystick axis
* `inverted` inverts the joystick axis so that moving the joystick up will reduce the analog state value
* `player1` captures the first gamepad to connect to the device
* `player2` captures the second gamepad to connect to the device
* `player3` captures the third gamepad to connect to the device
* `player4` captures the fourth gamepad to connect to the device
* `stick1` captures the 1st joystick on the gamepad
* `stick2` captures the 2nd joystick on the gamepad
* `stick3` captures the 3rd joystick on the gamepad
* `stick4` captures the 4th joystick on the gamepad

## Pointer input
Browsers define a "pointer" input device that unifies the various input methods avoiding the
need to specifically configure individual input devices. For example if the player is on a phone
with no mouse the "pointer" input will surface touch events, but if the player is on a laptop
with no touch screen then it will surface track pad input.

For pointer input the `inputName` parameter is a hyphen separated list of keywords.
The keywords and not case sensitive and can be put in any order, so order 
them in a way that is most readable for you.

To indicate that you want to capture pointer input, the keyword list must include
`pointer`. If you do not add any other keywords the default is to capture horizontal
movement of the pointer regardless of the state of the pointer buttons. You can add
the following keywords to change this default:
* `horizontal` redundent since this is the default, add it to improve readability
* `vertical` captures vertical movement of the pointer
* `inverted` inverts the pointer direction, so for example moving the pointer to the 
  right will decrease the value of the analog state instead of increasing it.
* `left` the left button must be pressed for pointer movements to be recorded
* `right` the right button must be pressed for pointer movements to be recorded
* `middle` the middle button must be pressed for pointer movements to be recorded
* `back` the back button must be pressed for pointer movements to be recorded
* `forward` the forward button must be pressed for pointer movements to be recorded
* `eraser` the eraser button must be pressed for pointer movements to be recorded
* `any` any button must be pressed for pointer movements to be recorded

## Device orientation input
This is not implemented yet.

## Device accelorometer input
This is not implemented yet.

## Input name examples
These are just a few examples of input names and how they would affect the `AnalogState` that the input is connected to:
* `left-mouse` dragging the mouse from left to right with the left mouse button pressed will change the state value up and down.
* `mouse-vertical` any forward and backwards movement of the mouse will change the state value up and down even with no buttons pressed.
* `keys-ArrowLeft-ArrowRight` the right and left arrow keys on the keyboard will change the state value up and down.
* `1-plus-touch-horizontal-inverted` touching the screen with one or more fingers and moving horizontally will change the state value up and down in the opposite direction to the movement. The state value will track the first finger to touch the screen.
* `2-touch-vertical` when exactly two fingers are touching the screen, vertical movement of the second finger to touch will change the state value up and down.
* `2-plus-rotate` when two or more fingers are touching the screen, the angle between the first two fingers will change the state value up and down.
* `left-pointer-horizontal` captures horizontal movement of the primary pointing device (which could be a mouse, stylus or touch screen) when it's primary button is held down. In the case of touch the number of fingers can can/should be touching the screen is device dependant. On my touch device it does not matter how many fingers you touch the screen with, so this is equivalent to `1-plus-touch-horizontal`. In general the pointer device is easier to work with but harder to predict.
* `right-pointer-vertical` if your primary input device is a mouse then this will capture movement of the mouse with the right mouse button depressed. For touch devices (which don't have a right button concept) the behaviour is not well defined and could vary between devices.
* `player1-gamepad` captures the horizontal axis of the first joystick on the first gamepad to connect.
* `player2-gamepad-stick2-vertical-inverted` captures vertical movement of the 2nd joystick on the 2nd game pad to connect such that moving the joystick up reduces the analog state value and moving the joystick down increases the analog state value.
