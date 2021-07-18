# Digital State

The `DigitalState(action: undefined | DigitalAction | Array<DigitalAction>, config: Object, name: string)` 
function constructs a digital state object that holds an on/off state and can be bound to 
input devices and actions. The input devices operated by the player mutate the state, and 
these changes trigger actions that alter the game.

Note that you do not have to pass any actions, instead you can just query the 
current state whenever you need it. The advantage being that later on you might
decide that you also want to play a sound of run an animation when the state changes
and these can easily be added later.

You also don't have to configure an input bindings to this state. In this case you
can manually mutate the state in your code by calling one of these methods:
* `setIsOn(evt: Event, value: isOn: bool)`
* `toggle(evt: Event)`

## Example

The following example plays the weapon firing animation while the 'A' key is held down:

```javascript
const engine = window.frag.Engine().start();

// This is just to illustrate the types of object you need. In an actual game
// you would need to construct a model and an animation that did something.
const firingAnimation = engine.ModelAnimation().name("firing");
const weaponModel = engine.Model().addAnimation(firingAnimation);
const weapon = engine.SceneObject(weaponModel);

// Define an input action that turns the animation on and off. When the
// digital state is "on" the animation will be running and when the digital
// state os "off" the animation will be stopped
const weaponFiringAction = engine.DigitalAction("animation", { animation: weapon.animations.firing });

// Define an on/off state that triggers the weapon firing action on changes.
// Note that you can also pass an array of actions to have mutliple things
// happen when the state changes.
const weaponFiringState = engine.DigitalState(weaponFiringAction);

// Bind the 'A' key to the weapon firing state. When the key is pressed down 
// the digital state will be set to "on" and when the key is released the digital 
// state will be set to "off".
engine.DigitalInput("a-key", weaponFiringState).enable();
```

The reason that the code is broken up into these 3 pieces is so that
you can have multiple actions linked to one state, and multiple input
devices controlling that input state.

## Actions

The `action` parameter can be undefined, a function, or an array of functions. 
You can just write your own function and pass it here, or you can call 
the `window.frag.DigitalAction()` function that will construct a function for you.

If you write your own custom action function then is should use the following 
method signature:
```javascript
const myAction = function(digitalState, evt) {}
```

This function will be called whenever the digital state changes from "on" to "off" or
visa versa. If inputs set the state to "on" when it is already in the "on" state then
the action functions will not be invoked.

The `digitalState` parameter will be passed the digital state object whose state changed.
You can read the `isOn` property of this object to discover the current state.

The `evt` parameter will contain the browser event that triggered this change of state. This
could be a mouse event, keyboard event, touch event or whatever. If you write custom action
functions that use this parameter, then you should either ensure that only one kind of 
event can change this state, or check the type of the event before using it.

## Config
The `config` parameter is optional. When provided it must be an object and can contain
any of the following optional properties:
* `isOn` specifies if the digital state should start out in the "on" state.

## Name
the `name` parameter is optional, and only useful during debugging. In particular if
you assign `window.frag.debugInputs = true;` then the this name will be included in
the console log to help you figure out issues with your input handling.