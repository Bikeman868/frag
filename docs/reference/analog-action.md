# Analog Action

The `AnalogAction(actionName: string, context: Object)` function constructs
a function that can ba passed to an `AnalogState` object to perform some 
specific action in the game when the analog state changes.

The `actionName` parameter is a hyphen separated list of keywords that define
what action is taken. In some cases additional context is needed and this is
supplied by the `context` parameter. For `actionName` values that need no
additional context, the context parameter can be omitted.

The order of the keywords does not matter, you can use whatever seems most
readable to you.

## Example

The following example moves the active camera in the main scene along 
the z-axis using the scroll wheel on the mouse:

```javascript
const engine = window.frag.Engine().start();
const cameraActionZ = engine.AnalogAction("move-camera-z");
const cameraZoomState = engine.AnalogState(cameraActionZ);
const wheelInput = engine.AnalogInput("mouse-wheel", cameraZoomState);
wheelInput.enable();
```

The reason that the code is broken up into these 3 pieces is so that
you can have multiple actions linked to one state, and multiple input
devices controlling that input state.

## Keywords

The following keywords are mutually exclusive and define the thing that will
be modified by the action:
* `camera` means that the action will affect the active camera in the main scene
* `sceneobject` means that the action will affect a `SceneObject`. The scene object
  to control must be passed in the `context` parameters as a `sceneObject` property.

The following keywords are mutually exclusive and define the aspect that will be
controlled:
* `move` controls the position of the object in the scene. This is the default.
* `rotate` controls the orientation of the object in the scene.
* `scale` controls the size of the object for scene objects and the scale of the whole scene for cameras.

The following keywords are mutually exclusive and define axis of control:
* `x` moves, scales or rotates the item on the X-axis regardless of its orientation.
* `y` moves, scales or rotates the item on the Y-axis regardless of its orientation.
* `z` moves, scales or rotates the item on the Z-axis regardless of its orientation.
* `right` moves, scales or rotates the item on a horizontal axis perpendicular to the item's orientation. 
  Right is an abbreviation for right and left. For example if this were a character, this
  action would move the character left and right relative to the direction that the character
  is facing. Horizontal is defined by the Y-axis being up.
* `up` moves, scales or rotates the item on a vertical axis perpendicular to the the item's
  orientation. Up is an abbreviation for up and down. For example if this were a character, this
  action would move the character up and down relative to the direction that the character
  is facing. Vertical is defined by the Y-axis being up.
* `forward` moves, scales or rotates the item along the axis of the item's orientation. 
  Forward is an abbreviation for forward and backward. For example if this were a character, this
  action would move the character forward or backward in the direction that the character is
  facing.
