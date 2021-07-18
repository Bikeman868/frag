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
  .frustrum(35 * degToRad, -100, 100)
  .scaleX(100)
  .moveToZ(-200);

const scene = engine.Scene()
  .name('My scene')
  .camera(camera);
```

## moveToXY(x: float, y: float)
Moves the camera in the XY plane to a new location so that the game player sees
the scene from a different point of view.

## moveToZ(z: float)
Moves the camera to a new position on the Z axis. This can make the camera closer
to or further from the scene.

## moveToXYZ(x: float, y: float, z: float)
Moves the camera in 3 dimensions a new location so that the game player sees
the scene from a different point of view. Note that this camera always looks
in the Z+ direction.

## frustrum(fieldOfView: float, zNear: float, zFar: float)
`fieldOfView` is an angle in radians that defines how much of the scene is
visible when viewed through this camera. When the field of view is larger, the
game player can see more of the scene.

Any objects that are closer to the camera than`zNear` will not be rendered to the 
screen. Similarly for objects that are further away than `zFar`.

## scaleX(scale: float)
Defines the width of the viewport in scene coordinate space. For example setting
the x scale to 100 means that objects whose x coordinate is between -100 and +100
will be visible in the viewport.

Note that there is no y scale. This is because Frag maintains the aspect ratio of
your models. The effective y scale value is defined by the aspect ratio of the
canvas element on your html page.
