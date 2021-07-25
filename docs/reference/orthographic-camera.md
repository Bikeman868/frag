# Orthographic Camera

Scenes must have a camera. The job of the camera is to define a 
transformation matrix that will map coordinates in the scene onto 
pixel coordinates on the viewport (screen).

The orthographic camera projects a 3D scene onto the viewport such
that the size of an object on the screen does not change with distance
from the camera.

The camera can be moved to provide different perspectives on the scene,
but is always looking down the Z axis. Objects with smaller Z values are
closer to the camera and objects with larger Z values are further away.
Objects that are further away can be obscured by objects that are closer.

## Constructor
```javascript
window.frag.OrthographicCamera(engine: Engine)
```

* `engine` is the game engine for your game. It is an instance of the `Engine` class. You can 
  have more than one on a page but more often there is just one that is constructed at the 
  very beginning.

Note that for any constructor, you can call this function on the `engine` rather than passing
`engine` as a parameter. In this case the call looks like:

```javascript
engine.OrthographicCamera()
```

## Examples
This is an example of creating a new scene and attaching a Orthogrphic
Camera to it.

```javascript
const engine = window.frag.Engine().start();
const degToRad = Math.PI / 180;

const camera = engine.OrthographicCamera()
  .frustum(100, 0, 200);
camera.getPosition().locationZ(-200);

const scene = engine.Scene()
  .name('My scene')
  .camera(camera);
```

## getPosition(): ScenePosition
Returns a `ScenePosition` object that can be used to move and rotate the camera.
Note that the cameras resting position is at(0, 0, 0) looking down the +Z axis, ie
at the world origin looking into the screen.

## frustum(scale: float, zNear: float, zFar: float): OrthographicCamera
`scale` defines the width of the viewport in scene coordinate space. For example setting
the scale to 100 means that objects whose X-axis coordinate is between -100 and +100
will be visible in the viewport.

Note that Frag maintains the aspect ratio of your models. The effective y scale value
is defined by the aspect ratio of the canvas element on your html page. For example if
your canvas is twice as wide as it is high, then setting scale to 100 means that objects
with Y-axis values between -50 and +50 will be visible in the viewport.

Any objects that are closer to the camera than`zNear` will not be rendered to the 
screen. Similarly for objects that are further away than `zFar`. Note that this is the
distance from the camera along its Z-axis, not the Z-axis position in the scene.

Initially the camera Z-axis is aligned with the world Z-axis, but if you rotate the
camera then this is no longer the case.

## parent(parent: ScenePosition | SceneObject | Camera | undefined): OrthographicCamera
Channges the cameras parent, adding the parent's location transformation to 
the camera's location transformation, so that the camera behaves as if it were
part of the parent model.

For example if you want to have a first-person view of a driving game you can
parent the camera on the car and it will then move and rotate with the car as 
it moves. The camera's own location becomes relative to its parent.

You might also want to create an empty SceneObject (with no model) and parent the
camera on that to have the camera rotate around an arbirtary point in the scene.