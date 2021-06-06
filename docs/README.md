# Frag Framework Documentation

## Samples
The following sample pages are provided. These pages can be used to learn how to 
achieve particular effects and are also used to test and debug the framework itself
before each release.

### Hello Cube
This [sample](../samples/hello-cube.html) is the nearest thing to a "Hello, World" 
application for WebGL. This is a great starting point if you are new to the framework

Things to mess around with on this sample:
* Every step is documented with comments. These are designed to give you step-by-step
  instructions on how to set up a scene successfully.
* Change the ID of the canvas element and make sure Frag knows how to find it
* Change the camera settings and see how that affects the scene projection
* Try moving and/or scaling the cube
* Find some other texture bitmaps and see what they look like on the cube.
* Add multiple instances of the cube model with different sizes and place them in the scene

### Mesh debug
This [sample](../samples/mesh-debug.html) illustrates the following features and techniques
* Only draws colored verticies - no textures or materials
* Displays a cube in wireframe mode so that the mesh can be visualized
* Displays normal vectors as short blue lines sticking out from the vertices
* Spins the cube using a `ValueAnimationAction` instance

Things to mess around with on this sample:
* Speed up or slow down the rotation of the cube
* Switch the cube to flat shading and notice the effect on the normals
* Turn wireframe mode on and off
* Change the color of the cube and the color of the normals
* Shader debugging is turned on. See what it outputs to the console
* Try configuring some other shader features and see how the shader changes

### Butterflies
This [sample](../samples/butterflies.html) illustrates the following features and techniques
* Defines some very simple bufferfly models with different colors sharing the same mesh
* Reuses the same flying animation on all of the butterfly models
* Creates many butterflies based on the differently colored models and makes them fly about
* Butterflies have limited life and get removed from the scene
* This sample will show you the basics of meshes, models, animation and object lifetime

## Subjects
The following documents are general discussions around a specific topic

* [Materials and shaders](materials.md)
* [Material and model loaders](loaders.md)
* [Animation](animation.md)
* [Configuration options](configuration.md)

## Reference
The following classes are documented at detailed technical level

* [Animation](./reference/animation.md)
* [KeyframeAnimationAction](./reference/keyframe-animation-action.md)
* [Material](./reference/material.md)
* [MaterialLoader](./reference/material-loader.md)
* [MeshData](./reference/mesh-data.md)
* [Model](./reference/model.md)
* [ModelAnimation](./reference/model-animation.md)
* [ModelLoader](./reference/model-loader.md)
* [Observable](./reference/observable.md)
* [OrthographicCamera](./reference/orthographic-camrea.md)
* [PerspectiveCamera](./reference/perspective-camrea.md)
* [Scene](./reference/scene.md)
* [SceneObject](./reference/scene-object.md)
* [ScenePosition](./reference/scene-position.md)
* [Shader](./reference/shader.md)
* [Texture](./reference/texture.md)
* [Transform](./reference/transform.md)
* [Transform2D](./reference/transform-2d.md)
* [UiCamera](./reference/ui-camera.md)
* [UiShader](./reference/ui-shader.md)
* [ValueAnimation](./reference/value-animation.md)
* [VertexData](./reference/vertex-data.md)
