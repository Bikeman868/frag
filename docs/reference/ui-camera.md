# UI Camera
Scenes must have a camera. The job of the camera is to define a 
transformation matrix that will map coordinates in the scene onto 
pixel coordinates on the viewport (screen).

The UI camera projects a 2D scene onto the viewport such that the 
scene is contained in an XY plane at the front of the z-buffer, i.e.
in front of any other content.

This camera is designed to be used in conjunction with the UI Shader.

This camera is exactly what you need for rendering a user interface, but
you can also use it to render other 2-dimensional content in an XY plane.

Note that you can also build a 3D UI if you want to, but in this case you
will not be using this camera because it only works with 2D shaders.

Note that you can also build the UI in the webpage using React.js, 
Vue.js or some other framework rather than rendering it using WebGL.

Note that you can use the UI Camera and render the UI scene onto a texture,
then apply that testure to a 3D object in the main scene. This is a good
way of placing a UI onto an object within the scene - for example on an
instrument panel within the game.

Note that to allow the user to interact with the UI you will need to use the
`hitTest` method of the `Engine`. When you call this method the engine will
draw the scene off-screen and figure out which model was closest to the 
camera at a specific pixel location on the screen.

## Constructor
```javascript
window.frag.UiCamera(engine: Engine)
```

* `engine` is the game engine for your game. It is an instance of the `Engine` class. You can 
  have more than one on a page but more often there is just one that is constructed at the 
  very beginning.

Note that for any constructor, you can call this function on the `engine` rather than passing
`engine` as a parameter. In this case the call looks like:

```javascript
engine.UiCamera()
```

## Examples
This is an example of creating a new scene and attaching a UI Camera
to it.

```javascript
const engine = window.frag.Engine().start();
const degToRad = Math.PI / 180;

const camera = engine.UiCamera()
  .scaleX(100);

const scene = engine.Scene()
  .name('My scene')
  .camera(camera);
```

## scaleX(scale: float)
Defines the width of the viewport in scene coordinate space. For example setting
the x scale to 100 means that objects whose x coordinate is between -100 and +100
will be visible in the viewport.

Note that there is no y scale. This is because Frag maintains the aspect ratio of
your models. The effective y scale value is defined by the aspect ratio of the
canvas element on your html page.
