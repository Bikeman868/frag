# Scene
To construct a new scene object call the `Scene` method, then use
fluent syntax to configure the attributes of the scene.

Scenes have a camera that projects the scene onto a viewport and a
collection of scene objects that defines what to draw.

If you have a game play area and a a user interface with menus and
panels etc, then you might want to have separate scenes for these
things because they are projected onto the viewport differently. For
example as the player moves through the game area you will likely
want to move the camera that projects the game play area but you dont
want to move the UI as well. The UI is also 2D and the game area is
3D.

The other reason for creating multiple scenes is that you can render
a scene onto a texture then use this texture to paint a model. This
is useful for windows and mirrors that give the player a view onto
some other part of the environment.

## Examples
This is an example of creating a new scene and attaching a UI Camera
to it. The UI camera is designed to project a 2D scene onto the screen
in front of other content.

```javascript
const frag = window.frag;

const uiCamera = frag.UiCamera();

const scene = frag.Scene()
  .name('My scene')
  .camera(uiCamera);
```

## dispose()
Frees resources consumed by the scene.

## addObject(obj: SceneObject)
Adds a `SceneObject` to the scene. The object will be drawn each time the scene
is rendered if it is enabled. Objects can be temporarily disabled to save resources
if the object is not visible in the viewport (for example behind the player).

The same object can be added to multiple scenes. Objects can be removed and re-added
to the same scene as many times as you like, but it's more efficient to just disable
the object if this is very temporary.

## removeObject(obj: SceneObject)
Removes a `SceneObject` from the scene if it is present. Returns true if the the
object was in the scene and false if it was not.

## camera(camera: Camera)
Specifies the camera for this scene. Scenes with no camera attached to them will not
render anything to the screen. The camera defines a projection from the 3D environment
represented by the objects in the scene onto a viewport. A viewport is just a rectangle
of 2D pixels that are usually drawn on the screen.

The Frag framework contains a few cameras for you to use in your game. You can also write
your own camera to implement whatever projection you want.

You can move the camera and change the camera properties to render a different view of
your scene.