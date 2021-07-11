# Digital Input

The `DigitalInput(inputName: string, digitalState: DigitalState)` function constructs 
a digital input object can capture player actions on input devices and mutate
a `DigitalState` object.

Note that you must call the `enable()` method of the digital input for it to start
capturing and player inputs. There is also a `disable()` method you can call to
stop responding to this player action. You can also add inputs to an `InputMethod`
to enable or disable a set of inputs all at once.

## Example

The following example starts a weapon firing animation when the 'A' key is 
pressed down and stops the animation when the key is released:

```javascript
const frag = window.frag;

// This is just to illustrate the types of object you need. In an actual game
// you would need to construct a model and an animation that did something.
const firingAnimation = frag.ModelAnimation().name("firing");
const weaponModel = frag.Model().addAnimation(firingAnimation);
const weapon = frag.SceneObject(weaponModel);

// Define an input action that turns the animation on and off. When the
// digital state is "on" the animation will be running and when the digital
// state os "off" the animation will be stopped
const weaponFiringAction = frag.DigitalAction("animation", { animation: weapon.animations.firing });

// Define an on/off state that triggers the weapon firing action on changes.
// Note that you can also pass an array of actions to have mutliple things
// happen when the state changes.
const weaponFiringState = frag.DigitalState(weaponFiringAction);

// Bind the 'A' key to the weapon firing state. When the key is pressed down 
// the digital state will be set to "on" and when the key is released the digital 
// state will be set to "off".
frag.DigitalInput("a-key", weaponFiringState).enable();
```

The reason that the code is broken up into these 3 pieces is so that
you can have multiple actions linked to one state, and multiple input
devices controlling that input state.

## Input name

The `inputName` parameter is a hyphen separated list of keywords. The keywords
and not case sensitive and can be put in any order, so order them in a way that
is most readable for you.

You can only use one of the following keywords. Which one you pick determines
the other keywords that are available:
* `mouse` indicates that you want to capture input from the mouse buttons
* `key` indicates that you want to capture input from a keyboard key

Regardless of which input device you are binding to, the following keywords are
always available:
* `toggle` each time the key or button is pressed down the digital state is toggled. 
  When the key is released nothing happens
* `inverted` reverses the up and down events so that pressing and releasing the button
  or key generates a key up followed by key down. When used in conjunction with the `toggle`
  keyword causes the toggle to operate on releasing the key because this looks like a key down.
* `on` turns the digital state "on" on key down (or key up if inverted). Never turns the state "off.
* `off` turns the digital state "off" on key down (or key up if inverted). Never turns the state "on.

When the `mouse` keyword is included, the following keywords become available:
* `left` to capture pressing the left mouse button
* `right` to capture pressing the right mouse button
* `middle` to capture pressing the middle mouse button
* `back` to capture pressing the back mouse button
* `forward` to capture pressing the forward mouse button
* `any` to capture pressing the any of the mouse buttons

Note that some mice only have a left button, others have left and right etc.
Gaming mice usually have left, right, middle, back and forwards plus some other
buttons. In this case the other buttons can be mapped to keyboard keys by the
mouse driver. To make this work for all players be sure to give them key mapping
options.

When the `key` keyword is included, the following keywords become available:
* `ctrl` this key is only actioned if the Ctrl key is pressed at the same time
* `alt` this key is only actioned if the Alt key is pressed at the same time
* `shift` this key is only actioned if the Shift key is pressed at the same time
* `meta` this key is only actioned if the Meta key is pressed at the same time

For the `key` keywords anything that is not a keyword is assumed to be the key value to capture.
See https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values for a list
of the supported key values.