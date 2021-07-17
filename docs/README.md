# Frag Framework Documentation

## Samples
There are a number of [sample web pages](../samples) that demonstrate
the features of the framework. These samples get progressivly more
complicated and are designed to be studied and experimented with.

For people who like to learn by doing this is the best place to start.
If you prefer reading reference material instead then read on...

## Subjects
The following documents are general discussions around a specific topic

* ~[Materials and shaders](materials.md)~
* ~[Asset loaders](loaders.md)~
* [Animation](animation.md)
* ~[Configuration options](configuration.md)~
* [Packaging models](packaging.md)
* [Player input](inputs.md)
* [Text rendering](text.md)
## Reference
The following classes are documented at detailed technical level. Note that the ones
with strikeout formatting are planned but not written yet. Please reach out if you
need help, or take a look at the source code.

* [AnalogAction](reference/analog-action.md) applies analog state changes to something in the game.
* [AnalogInput](reference/analog-input.md) updates an analog state from an input device.
* [AnalogState](reference/analog-state.md) stores a floating point value that can be controlled by the player.
* [Animation](./reference/animation.md) is the core animation engine
* [DigitalAction](reference/digital-action.md) applies digital state changes to something in the game.
* [DigitalInput](reference/digital-action.md) updates a digital state from an input device.
* [DigitalState](reference/digital-action.md) stores an on/off value that can be controlled by the player
* [Font](reference/font.md) used to construct models that render text in the scene
* [InputMethod](reference/input-method.md) a collection of analog and digital inputs that can be enabled/disabled together.
* [KeyframeAnimationAction](./reference/keyframe-animation-action.md) adds keyframe action to an animation
* [Material](./reference/material.md) defines the surface appearence of part of a model
* ~[MaterialLoader](./reference/material-loader.md)~ loads material packages from the server
* [Matrix](./reference/matrix.md) performs matrix math
* [Model](./reference/model.md) is a template for instancing scene objects
* [ModelAnimation](./reference/model-animation.md) adds animation effects to a model
* ~[PackageLoader](./reference/package-loader.md)~ loads asset packages from the server
* [OrthographicCamera](./reference/orthographic-camera.md) draws objects in the scene at their actual size
* [ParallelAnimationAction](./reference/parallel-animation-action.md)
* [PerspectiveCamera](./reference/perspective-camera.md) objects further from the camera appear smaller
* [Scene](./reference/scene.md) a collection of objects and a camera to draw them
* [SceneObject](./reference/scene-object.md) an instance of a model that can be positioned within a scene
* [ScenePosition](./reference/scene-position.md) location, orientation and scale
* ~[Shader](./reference/shader.md)~ builds programs that run on the GPU to render the scene
* [Texture](./reference/texture.md) defines one aspect of a material, for example how shiny it is
* ~[Transform](./reference/transform.md)~ builds a 3x3 matrix that defines a sequence of 2D transformations
* ~[Transform2D](./reference/transform-2d.md)~ builds a 4x4 matrix that defines a sequence of 3D transformations
* [UiCamera](./reference/ui-camera.md) projects a 2D scene onto the front of the viewport
* ~[UiShader](./reference/ui-shader.md)~ is used in combination with the UI camera to render a UI
* [ValueAnimationAction](./reference/value-animation-action.md) smoothly animate a value over time
* [Vector](./reference/vector.md) performs vector math
