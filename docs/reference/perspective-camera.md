# Perspective Camera
Scenes must have a camera. The job of the camera is to define a 
transformation matrix that will map coordinates in the scene onto 
pixel coordinates on the viewport (screen).

The perspective camera projects a 3D scene onto the viewport such
that objects that are futher from the camera appear smaller and objects
close to the camera appear larger. This is how we percieve the world
around us.

The camera can be moved to provide different perspectives on the scene,
but is always looking down the Z axis. Objects with smaller Z values are
closer to the camera and objects with larger Z values are further away.
Objects that are further away can be obscured by objects that are closer.

## Constructor
```javascript
window.frag.PerspectiveCamera(engine: Engine)
```

* `engine` is the game engine for your game. It is an instance of the `Engine` class. You can 
  have more than one on a page but more often there is just one that is constructed at the 
  very beginning.

Note that for any constructor, you can call this function on the `engine` rather than passing
`engine` as a parameter. In this case the call looks like:

```javascript
engine.PerspectiveCamera()
```

## Examples
This is an example of creating a new scene and attaching a Perspective
Camera to it.

```javascript
const engine = window.frag.Engine().start();
const degToRad = Math.PI / 180;

const camera = engine.PerspectiveCamera()
    .frustum(35 * degToRad, 50, 150);
camera.getPosition().locationZ(-50)

const scene = engine.Scene()
  .camera(camera);
```

## getPosition(): ScenePosition
Returns a `ScenePosition` object that can be used to move and rotate the camera.
Note that the cameras resting position is at (0, 0, 0) looking down the +Z axis, ie
at the world origin looking into the screen.

## frustum(fieldOfView: float, zNear: float, zFar: float): PerspectiveCamera
`fieldOfView` is an angle in radians that defines how much of the scene is
visible when viewed through this camera. When the field of view is larger, the
game player can see more of the scene.

Any objects that are closer to the camera than`zNear` will not be rendered to the 
screen. Similarly for objects that are further away than `zFar`. Note that this is the
distance from the camera along its Z-axis, not the Z-axis position in the scene.

Initially the camera Z-axis is aligned with the world Z-axis, but if you rotate the
camera then this is no longer the case.

## parent(parent: ScenePosition | SceneObject | Camera | undefined): PerspectiveCamera
Channges the cameras parent, adding the parent's location transformation to 
the camera's location transformation, so that the camera behaves as if it were
part of the parent model.

For example if you want to have a first-person view of a driving game you can
parent the camera on the car and it will then move and rotate with the car as 
it moves. The camera's own location becomes relative to its parent.

You might also want to create an empty SceneObject (with no model) and parent the
camera on that to have the camera rotate around an arbirtary point in the scene.