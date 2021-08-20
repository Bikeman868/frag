# Frag Framework Documentation

## Samples
There are a number of [sample web pages](../samples) that demonstrate
the features of the framework. These samples get progressivly more
advanced. The samples contain copious comments that serve as additional
documentation; I took this approach because reading documentation in the
context of fully working code can be more insightful. Studying these
samples and experimenting by changing them is the recommended approach
to learning the framework for people who learn from doing. All of
these samples are stand-alone static html pages that you can edit and
refesh in your browser without having to install anything or compile anything.

If you prefer reading reference material instead of learning by doing, then read on...

## The basics
* You need an html web page with at least one `<canvas />` element on it.
* You need to load the `frag.min.js` file before running your javascript.
* You need to call `window.frag.Engine()` to construct a game engine for 
  each canvas (most games only need 1). If the `id` of your canvas is "scene", 
  then you don't need to pass anything to the engine constructor.
* You can call the `start()` method of engine to render your game scene continuously, 
  or you can call the `render()` method each time you want to redraw the screen.
  To begin with I recommend that you call the `start()` method.

To define what's in your game scene you will contruct objects by calling methods of `window.frag` 
just like we did to construct the game engine. These constructors all start with a capital letter
and they all take the game engine as the first parameter. For example `window.frag.Scene(engine)`.

> The game engine provides another syntax for constructing objects. Calling `engine.Scene()` will 
> call `window.frag.Scene(engine)` it's just a little less typing and one extra level of function 
> call. This also works with constructors that take additional parameters, for example calling
> `engine.ScaneObject(model)` will call `window.frag.SceneObject(engine, model)` etc.

You can also use the `new` keyword if you like, but it will have no effect. For example
`const model = new engine.Model();` will behave identially to `const model = engine.Model();`. If
you find this syntax more readable, or you are using thr `new` keyword with your own classes and
like the consistency, then please feel free to use it to construct Frag objects.

Things can mostly be done in any order. For example you can start using a font from an asset
catalog then download the font into the catalog later, and this will work just fine, but the text
will not be rendered until the font has finished downloading of course.

Every object has a `dispose()` method that will clean up any resources it is using.
In many cases these `dispose()` methods do nothing, but calling it will ensure compatibility
with future versions of the framework. You should dispose objects in the oposite order to
how you constructed them.

The best place to go from here is to take a look at the [spinning cube sample](../samples/hello-cube.html)
followed by the other samples in the order presented in the [samples readme file](../samples/README.md).

## Subjects
The following documents are introductions to the main areas covered by the framework

* [Position, scale, orientation and parenting](transforms.md)
* [Materials, textures and shaders](materials.md)
* [Packaging models, fonts and materials](packaging.md)
* [Downloading and unpacking models, fonts and materials](reference/package-loader.md)
* [Animation](animation.md)
* [Game engine configuration](configuration.md)
* [Player input (mouse, keyboard, touch, gamepad etc)](inputs.md)
* [Fonts and text rendering](text.md)
* [Physics engine integration](physics.md)
* [Particle systems and emitters](particles.md)

## Reference material
The following classes are documented at detailed technical level. Note that the ones
with strikeout formatting are planned but not written yet. Please reach out if you
need help, or take a look at [the source code](../src).

These class names are function names in Frag, and calling this function will construct a new
object of that type. For example to construct an `AnalogAction` you shoud call `window.frag.AnalogAction()`.
Note that the first parameter to each constructor function is the game engine, other constructor
parameters vary.

Note that the math classes only have static methods and can not be constructed. These classes
are `Matrix`, `Vector`, `Quaternion` and `Triangle`. For these classes you can call the static methods directly,
for example `const normal = window.frag.Triangle.normal(triangle);`.

### This is the list of classes grouped into categories
To see all reference docs in alphabetical order, see [the reference documentation folder](reference).

#### Animations
* [`Animation`](reference/animation.md) is the core animation engine.
* [`KeyframeAnimationAction`](reference/keyframe-animation-action.md) adds keyframe action to an animation.
* [`ModelAnimation`](reference/model-animation.md) adds animation effects to a model.
* [`ParallelAnimationAction`](reference/parallel-animation-action.md) runs multiple animation actions in parallel.
* [`RepeatAnimationAction`](reference/repeat-animation-action.md) repeats another animation action a specific number of times in the sequence.
* [`ValueAnimationAction`](reference/value-animation-action.md) smoothly changes a value over time.

#### Cameras
* [`FrustumCamera`](reference/frustum-camera.md) identical to the perspective camera except for how the viewable area is defined.
* [`OrthographicCamera`](reference/orthographic-camera.md) draws objects in the scene at their actual size.
* [`UiCamera`](reference/ui-camera.md) projects a 2D scene onto the front of the viewport.

#### Dynamic Surfaces
* [`DynamicData`](reference/dynamic-data.md) defines the data set beneath a `DynamicSurface`.
* [`DynamicSurface`](reference/dynamic-surface.md) a special scene object that maps a subset of a `DynamicData` structure onto a mesh.

#### Framework
* [`Engine`](reference/engine.md) renders a WebGL scene onto a canvas element on the page.
* ~[`Transform`](reference/transform.md)~ builds either a `Transform2D` or `Transform3D`.
* ~[`Transform2D`](reference/transform-2d.md)~ builds a 3x3 matrix that defines a sequence of 2D transformations.
* ~[`Transform3D`](reference/transform-2d.md)~ builds a 4x4 matrix that defines a sequence of 3D transformations.

#### Input
* [`AnalogAction`](reference/analog-action.md) applies analog state changes to something in the game.
* [`AnalogInput`](reference/analog-input.md) updates an analog state from an input device.
* [`AnalogState`](reference/analog-state.md) stores a floating point value that can be controlled by the player.
* [`DigitalAction`](reference/digital-action.md) applies digital state changes to something in the game.
* [`DigitalInput`](reference/digital-action.md) updates a digital state from an input device.
* [`DigitalState`](reference/digital-action.md) stores an on/off value that can be controlled by the player.
* [`InputMethod`](reference/input-method.md) a collection of analog and digital inputs that can be enabled/disabled together.

#### Loaders
* [`AssetCatalog`](reference/asset-catalog.md) holds collections of names assets like materials, fonts and models.
* [`PackageLoader`](reference/package-loader.md) loads asset packages from the server.

#### Materials
* [`Font`](reference/font.md) used to construct models that render text in the scene.
* [`Material`](reference/material.md) defines the surface appearence of part of a model.
* [`Texture`](reference/texture.md) defines one aspect of a material, for example how shiny it is.

#### Math
* [`Matrix`](reference/matrix.md) performs matrix math.
* [`Quaternion`](reference/quaternion.md) constructs quaternions and performs conversion to euler angles.
* [`Vector`](reference/vector.md) performs vector math.
* ~[`Triangle`](reference/vector.md)~ performs triangle math.

#### Particles
* [`CustomParticleEmitter`](reference/custom-particle-emitter.md) births particles and adds them to a particle system.
* [`CustomParticleSystem`](reference/custom-particle-system.md) manages a large numbers of meshes with lifetime and sends changes to a particle shader.
* [`MineExplosionEmitter`](reference/mine-explosion-emitter.md) births particles in a particle system that looks like an explosion in the ground.
* [`RainEmitter`](reference/rain-emitter.md) births particles in a particle system that looks like rain falling.
* [`SphericalExplosionEmitter`](reference/spherical-explosion-emitter.md) births particles in a particle system that looks like a firework exploding in the sky.
* [`SprayEmitter`](reference/spray-emitter.md) births particles in a particle system that looks like a hose squirting water.

#### Scene graph
* [`Mesh`](reference/mesh.md) builds sets of triangles, triangle strips and triangle fans that define a surface.
* [`Model`](reference/model.md) is a template for instancing scene objects.
* [`PositionLink`](reference/position-link.md) makes one object mimic the movements of another object.
* [`Scene`](reference/scene.md) a collection of objects and a camera to draw them.
* [`SceneObject`](reference/scene-object.md) an instance of a model that can be positioned within a scene.
* [`ScenePosition`](reference/scene-position.md) location, orientation and scale.

#### Shaders
* [`CustomShader`](reference/custom-shader.md) the base class for all code that runs on the GPU.
* [`Shader`](reference/shader.md) builds programs that run on the GPU to render the scene.
* ~[`UiShader`](reference/ui-shader.md)~ is used in combination with the UI camera to render a UI.

#### Shapes
* [`Cube`](reference/cube.md) builds a mesh that comprises some or all of the sides of a cube.
* [`Cylinder`](reference/cylinder.md) builds a cylinder, cone or truncated cone mesh.
* [`Disc`](reference/disc.md) You can do this with a `Cylinder` but this is a bit simpler.
* [`Sphere`](reference/shpere.md) builds a mesh that covers part of a sphere.

