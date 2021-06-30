# UI Camera
To construct a new UI camera object call the `UiCamera` 
method, then use fluent syntax to configure the attributes of the camera.

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

Note that to allow the user to interact with the UI you will need a physics
engine that tracks the position of everything in the scene, and can tell
you which object will be drawn to specific pixel. You need this so that
when the user taps on the screen you can determine which object within the
scene the user wants to interact with.

## Examples
This is an example of creating a new scene and attaching a UI Camera
to it.

```javascript
const frag = window.frag;
const degToRad = Math.PI / 180;

frag.init();

const camera = frag.UiCamera()
  .scaleX(100);

const scene = frag.Scene()
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
