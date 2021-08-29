# Engine
This class renders a set of scenes onto an html canvas element using WebGL.

## Constructor
```javascript
window.frag.Engine(config: Object | undefined)
```

* `config` an optional engine configuration. For options and defaults see below.

Note that this is the only constructor where you can not call this function on 
the `engine`, you must construct the engine as shown above.

## Examples
This is an example of constructing an `Engine` for a specific canvas within the
html, and performing some custom initialization od WebGL during engine initialization.

```html
<!DOCTYPE html>
<html xmlns='http://www.w3.org/1999/xhtml' lang='en-US'>
<head>
    <title>Engine example</title>
</head>
<body>
    <canvas id='my-canvas'></canvas>
    <script src='frag.min.js'></script>
    <script>
        const engine = window.frag.Engine({
            canvas: document.getElementById("my-canvas")
        })
        .onStart((engine) =>
        {
            engine.gl.clearColor(1, 1, 1, 1);
        })
        .start();
    </script>
</body>
```

## Configuration
When constructing the engine you can pass an object as the `config` parameter to
change the engine defaults. The properties that this `config` can have are below.
All of these properties are optional.
* `canvas` the html canvas object to render to. Defaults to `document.getElementById("scene")`
* `renderInterval` the number of millisecornds to pause between screen refreshes. Defaults to 15ms.
* `gameTickMs` the duration of one game tick in milliseconds. Defaults to 10ms.
* `transparency` set to `true` to enable transparency in the scene. Mostly only needed for `Font` drawing.
* `debugPackageLoader` set to `true` to debug issues with loading asset packages.
* `debugShaderBuilder` set to `true` to debug issues with shaders.
* `debugAnimations` set to `true` to debug issues with animations.
* `debugMeshes` set to `true` to debug issues with meshes.
* `debugInputs` set to `true` to debug issues with player inputs.
* `debugParticles` set to `true` to debug issues with particle systems.

## Properties
The `Engine` instance has the following properties that you can access
* `canvas` the html canvas object to render to.
* `renderInterval` the number of millisecornds to pause between screen refreshes.
* `gameTickMs` the duration of one game tick in milliseconds.
* `debugPackageLoader` set to `true` to debug issues with loading asset packages.
* `debugShaderBuilder` set to `true` to debug issues with shaders.
* `debugAnimations` set to `true` to debug issues with animations.
* `debugMeshes` set to `true` to debug issues with meshes.
* `debugInputs` set to `true` to debug issues with player inputs.
* `transparency` set to `true` to enable transparency in the scene. Mostly only needed for `Font` drawing.
* `fps` the average number of frame redraws per second over the last few seconds.
* `maxTextureUnits` the maximum number of textures that can be simultaneously loaded into the graphics card. Do not modify this property.
* `gl` contains a reference to the WebGL context that for this engine/canvas.

## Methods

## correctClock(serverTick: int): Engine
Call this method every time the server sends a response that tells you the time on the server
in game ticks. It is very important that the `gameTickMs` property of this engine matches the
game tick interval on the server.

## allocateTextureUnit(): int
Returns the next available texture unit. If you use too many textures then this will
roll over and start repeating testure units. In this case the graphics card will swap
textures in an out or memory adding significant overhead and reducing the frame rate.

## mainScene(scene: Scene): Engine
Defines which scene will be the main scene. The main scene defines the scaling between
world space and screen pixels. Other scenes will adjust their size to these dimensions.

Do not call `addScene()` and `mainScene()` for the same scene, or the scene will be
drawn twice, and your frame rate will be half of what is should be.

## getMainScene(): Scene
Retrieve the scene that is currently the main scene.

## addScene(scene: Scene): Engine
Adds an auxilliary scene that will be drawn after the main scene using the main
scenes scaling and aspect ratio. This is most often used to draw a user experience
layer on top of the main game action, where rotating the camera in the main scene
should not also rotate the user experience.

## hitTest(x: int, y: int, width: int | undefined, height: int | undefined, scene: Scene | Scene[] | undefined): Object | null
Draws a scene or list of scenes and notices which object in the scene was closest
to the camera for a specific screen location. It also notices which mesh fragment
within the object was hit.

If there was nothing at the screen location then `hitTest()` returns `null`. If
something was hit then an object is returned with a `sceneObject` and `fragment`
property. Note that the `sceneObject` property is most often a 
[`SceneObject`](scene-object.md), but can be anything in the scene including 
a [`DynamicSurface`](dynamic-surface.md). Scene objects have an `isSceneObject`
property that is always true, and dynamic surfaces have an `isDynamicSurface`
property that is always true. You can use these properties to determine what ws hit.

This method is used to figure out what the user clicked/tapped on. Mouse events
and touch screen events have `clientX` and `clientY` properties that are pixel
coordinates relative to the control that was clicked. Passing these values to the
`x` and `y` parameters you can discover what the user clicked on.

Note that if your canvas is not filling the browser window, then you might have to 
offset the `clientX` and `clientY` properties of the mouse/touch event. Since most
games fill the whole browser window, this is not normally required.

The `width` and `height` parameters define the size of the canvas that was clicked.
This defaults to the size of the canvas that the engine is rendering to. The only
reeason to pass these parameters would be if you provded the user with a zoomed in
or zoomed out view of the canvas and allowed the user to click here. You can also
make the hit test faster and less accurate by scaling the `x` and `y` parameters
and providing correspondingly scaled `width` and `height`. This will cause the
engine to render the scene at a smaller size for the hit test.

## render()
Renders the scene once to the canvas and stops. This is not useful for most
games, but will save CPU and GPU cycles if you have a fairly static game with
no animation and you can update the screen only when the player does something.

## initialize()
Call this once before calling `render()` for the first time.

Note that this is called automatically by the `start()` method, so if you start
the engine running like this then you do not need to call the `initialize()`
method in your code.

## onStart(f: Function(engine: Engine))
Registers a function that will be called after the engine has configured WebGL
and before it renders the scene for the first time.

## start()
Starts the engine running. This will continually re-render the scene onto the 
canvas and run all animation effects.

## stop()
Stops the engine running.
