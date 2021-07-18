# Player Inputs
You can't make a game without player interaction. If the player can't interact
then it's a movie, not a game!

Players interact through input devices like keyboard, mouse, touch screen,
accelerometer, pen and joystick, and because each player has different hardware
and a different playing style, we need to allow the player to choose how
their input devices control the game.

## Key Concepts
In Frag there are two distinct types of player input, digital and analog.
Digital inputs can only be on or off wherease analog inputs have a floating
point value at any point in time as well as velocity and acceleration.

Within the digital and analog grouping there are 3 kinds of object for you to 
work with:
* State objects are containers for the current value of something that can
  be controlled by the player. These come in 2 flavours `DigitalState` and
  `AnalogState`.
* Action objects are notified when a state changes and update something
  in the game. These also come in 2 flavours `DigitalAction` and `AnalogAction`.
* Input objects capture the actions of the player and change some state. Changing
  the state invokes any actions attached to that state. Inputs also come
  in 2 flavours `DigitalInput` and `AnalogInput`.

Note that each chain of Input -> State -> Action must be all digital or all
analog. You can not mis them up.

Note that Input objects can be grouped by a `InputMethod` so that you can turn
them all on and off together.

## Hit testing
Another key component of user interaction is the ability to detect if the player
clicked or tapped on an object in the scene. This is referred to as hit testing. To
perform a hit test, call the `hitTest(x, y, w, h, scene)` method of the Frag framework. 
The hitTest method will return `null` if there was nothing in the scene at that location. If the
player clicked on something a structure will be returned containing `model` and `sceneModel`
properties. The `model` property contains the child component within the model that
was selected.

The `hitTest` method takes the following parameters:
* `x` the horizontal position of the click/tap in pixels relative to the left edge of
  the canvas. The `clientX` property of mouse events contains this value.
* `y` the vertical position of the click/tap in pixels relative to the top edge of
  the canvas. The `clientY` property of mouse events contains this value.
* `width` is optional and defaults to the width of the canvas. This is only useful if
  you are allowing the user to click/tap on a scaled down or zoomed in version of the scene.
* `height` is optional and defaults to the height of the canvas. This is only useful if
  you are allowing the user to click/tap on a scaled down or zoomed in version of the scene.
* `scene` is optional and defaults to the main scene. If you are rendering multiple scenes,
  for example a 2D UI on top of the game scene, then you can pass a scene here and only
  the objects in this scene will be used for hit testing. You can also pass an array of scenes
  if you want to hit test across multiple scenes at once, this is more efficient than
  hit testing one scene at a time, and will only return the object closest to the camera
  for all of the scenes combined.

## Examples
A good example of handling player inputs can be found in the [Model Loader sample](../samples/model-loader.html)
which contains comments explaining what each piece of code does. It includes things like
drawing part of the model as a wireframe whilst the middle mouse button is held down.

## Debugging
If you are having problems with your inputs not doing what you expect, you can turn on
input debugging by setting the Frag config at startup like this:

```javascript
const engine = window.frag.Engine({ debugInputs: true }).start();
```

This will print detailed information in the browser console window.

## Reference
Detailed reference information for these classes can be found here:
* [AnalogAction](reference/analog-action.md) applies analog state changes to something in the game.
* [AnalogInput](reference/analog-input.md) updates an analog state from an input device.
* [AnalogState](reference/analog-state.md) stores a floating point value that can be controlled by the player.
* [DigitalAction](reference/digital-action.md) applies digital state changes to something in the game.
* [DigitalInput](reference/digital-action.md) updates a digital state from an input device.
* [DigitalState](reference/digital-action.md) stores an on/off value that can be controlled by the player
* [InputMethod](reference/input-method.md) a collection of analog and digital inputs that can be enabled/disabled together.
