# Digital Action

This class can change your game scene by responding to changes in an [`DigitalState`](digital-state.md)

## Constructor
```javascript
window.frag.DigitalAction(engine: Engine, actionName: string, context: Object | undefined)
```

* `actionName` is a hyphen separated list of keywords that define what action is taken.
  In some cases additional context is needed depending on the `actionName`. See below.
  The order of the keywords does not matter, you can use whatever seems most readable to you.
* `context` ror `actionName` values that need no additional context, the context parameter 
  can be omitted. For input actions that require context see below for details.

Note that for any constructor, you can call this function on the `engine` rather than passing
`engine` as a parameter. In this case the call looks like:

```javascript
engine.DigitalAction(actionName: string, context: Object | undefined)
```

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

## Action names

When constructing a `DigitalAction` you need to supply an `actionName` parameter. This
paramater can have one of these values:
* `animation` action will start and stop an animation so that the running state of
  the animation matches the "on" state of the digital state it is connected to. Requires
  an `Animation` to be passed in the `animation` property of the `context` parameter.
* `animation-start` when the digital state turns on the animation will be started. Requires
  an `Animation` to be passed in the `animation` property of the `context` parameter.
* `animation-stop` when the digital state turns on the animation will be stopped. Requires
  an `Animation` to be passed in the `animation` property of the `context` parameter.
* `sceneobject` the visibility of the scene object will reflect the digital state. Requires
  a `SceneObject` to be passed in the `sceneObject` property of the `context` parameter.
* `model` the visibility of the model will reflect the digital state. Requires
  a `Model` to be passed in the `model` property of the `context` parameter.

