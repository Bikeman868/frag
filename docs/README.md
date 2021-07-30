# Frag Framework Documentation

## Samples
There are a number of [sample web pages](../samples) that demonstrate
the features of the framework. These samples get progressivly more
advanced. The samples contain copious comments that serve as additional
documentation; I took this approach because reading documentation in the
context of fully working code can be more insightful. Studying these
samples and experimenting by changing them is the recommended approach
to learning the framework for people who learn from doing. All of
these samples are stand-along static html pages that you can edit and
refesh in your browser without having to install anything or compile anything.

For people who like to learn by doing this is the best place to start.
If you prefer reading reference material instead then read on...

## The basics
* You need an html web page with at least one `<canvas />` element on it.
* You need to load the `frag.min.js` file before running your javascript.
* You need to call `window.frag.Engine()` to construct a game engine. If the `id` 
  of your canvas is "scene", then you don't need to pass anything to the engine constructor.
* You can call the `start()` method of engine to render your game scene continuously, 
  or you can call the `render()` method each time you want to redraw the screen.

To define what's in your game scene you will contruct objects by calling methods of `window.frag` 
just like we did to construct the game engine. These constructors all start with a capital letter
and they all take the game engine as the first parameter. For example `window.frag.Scene(engine)`.

The game engine provides another syntax for constructing objects. Calling `engine.Scene()` will 
call `window.frag.Scene(engine)` it's just a little less typing and one extra level of function 
call. This also works with constructors that take additional parameters, for example calling
`engine.ScaneObject(model)` will call `window.frag.SceneObject(engine, model)` etc.

You can also use the `new` keyword if you like, but it will have no effect. For example
`const model = new engine.Model();` will behave identially to `const model = engine.Model();`. If
you find this syntax more readable, or you are using thr `new` keyword with your own classes and
like the consistency, then please feel free to use it to construct Frag objects.

Things can mostly be done in any order. For example you can start using a font from an asset
catalog then download the font into the catalog and this will work just fine, but the text
will not be rendered until the font has finished downloading of course.

Every object has a `dispose()` method that will clean up any resources it is using.
In many cases these `dispose()` methods do nothing, but calling it will ensure compatibility
with future versions of the framework. You should dispose objects in the oposite order to
how you constructed them.

The best place to go from here is to take a look at the [spinning cube sample](../samples/hello-cube.html)
followed by the other samples in the order presented in the [samples readme file](../samples/README.md).

## Subjects
The following documents are general discussions around a specific topic

* [Position, scale, orientation and parenting](transforms.md)
* ~[Materials and shaders](materials.md)~
* ~[Asset loaders](loaders.md)~
* [Animation](animation.md)
* ~[Configuration options](configuration.md)~
* [Packaging models](packaging.md)
* [Player input](inputs.md)
* [Text rendering](text.md)
* [Physics engine integration](physics.md)

## Reference
The following classes are documented at detailed technical level. Note that the ones
with strikeout formatting are planned but not written yet. Please reach out if you
need help, or take a look at the source code.

These class names are function names in Frag, and calling this function will construct a new
object of that type. For example to construct an `AnalogAction` you shoud call `window.frag.AnalogAction()`.
Note that the first parameter to each constructor function is the game engine, other constructor
parameters vary.

Note that the math classes only have static methods and can not be constructed. These classes
are `Matrix`, `Vector` and `Triangle`. For these classes you can call the static methods directly,
for example `const normal = window.frag.Triangle.normal(triangle);`.

* [`AnalogAction`](reference/analog-action.md) applies analog state changes to something in the game.
* [`AnalogInput`](reference/analog-input.md) updates an analog state from an input device.
* [`AnalogState`](reference/analog-state.md) stores a floating point value that can be controlled by the player.
* [`Animation`](./reference/animation.md) is the core animation engine.
* [`CustomShader`](./reference/custom-shader.md) the base class for all code that runs on the GPU.
* [`DigitalAction`](reference/digital-action.md) applies digital state changes to something in the game.
* [`DigitalInput`](reference/digital-action.md) updates a digital state from an input device.
* [`DigitalState`](reference/digital-action.md) stores an on/off value that can be controlled by the player.
* [`Engine`](reference/engine.md) renders a WebGL scene onto a canvas element on the page.
* [`Font`](reference/font.md) used to construct models that render text in the scene.
* [`InputMethod`](reference/input-method.md) a collection of analog and digital inputs that can be enabled/disabled together.
* [`KeyframeAnimationAction`](./reference/keyframe-animation-action.md) adds keyframe action to an animation.
* [`Material`](./reference/material.md) defines the surface appearence of part of a model.
* [`Matrix`](./reference/matrix.md) performs matrix math.
* [`Model`](./reference/model.md) is a template for instancing scene objects.
* [`ModelAnimation`](./reference/model-animation.md) adds animation effects to a model.
* ~[`PackageLoader`](./reference/package-loader.md)~ loads asset packages from the server.
* [`OrthographicCamera`](./reference/orthographic-camera.md) draws objects in the scene at their actual size.
* [`ParallelAnimationAction`](./reference/parallel-animation-action.md) runs multiple animation actions in parallel.
* [`PerspectiveCamera`](./reference/perspective-camera.md) objects further from the camera appear smaller.
* [`PositionLink`](./reference/position-link.md) makes one object mimic the movements of another object.
* [`Scene`](./reference/scene.md) a collection of objects and a camera to draw them.
* [`SceneObject`](./reference/scene-object.md) an instance of a model that can be positioned within a scene.
* [`ScenePosition`](./reference/scene-position.md) location, orientation and scale.
* [`Shader`](./reference/shader.md) builds programs that run on the GPU to render the scene.
* [`Texture`](./reference/texture.md) defines one aspect of a material, for example how shiny it is.
* ~[`Transform`](./reference/transform.md)~ builds a 3x3 matrix that defines a sequence of 2D transformations.
* ~[`Transform2D`](./reference/transform-2d.md)~ builds a 4x4 matrix that defines a sequence of 3D transformations.
* [`UiCamera`](./reference/ui-camera.md) projects a 2D scene onto the front of the viewport.
* ~[`UiShader`](./reference/ui-shader.md)~ is used in combination with the UI camera to render a UI.
* [`ValueAnimationAction`](./reference/value-animation-action.md) smoothly animate a value over time.
* [`Vector`](./reference/vector.md) performs vector math.
