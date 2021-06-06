# Project status
This framework is being developed alongside a game. Once the game is production 
ready this framework will be considered beta.

Right now we are still making breaking changes, so this should be considered an
alpha release for people who are interested in tracking the development of this
project. We do not recommend using this for writing production games yet.

# Who is this for?
Frag is a low level WebGL framework that is designed for independent game developers
wanting to write 2D or 3D rendered games that can be played in a browser on any 
device.

Note that this framework is designed to make your life easier when it comes to
everything to do with graphics, but does not attempt to provide everything that you
need to produce a game. For example this framework does not include a physics
engine. There are a number of physics engines that you can choose to integrate if
you need that functionality.

The functioanllity that is provided:
* Drawing stuff to the screen with high refresh rate and minimum load on the hardware
* Support for old devices that only support OpenGL 1.1
* Bulk loading of models and materials designed in tools like Blender and Substance Player
* Separation of models from materials so that the same models can be used with different
  skins in different parts of the game.
* Powerful animation engine that can run many parallel animations on the same model
* Efficient reuse of assets. For example you can draw a wheel mesh once then scale it 
  and paint it differetly on various models to create all the different types of wheel 
  that you need without duplicating the mesh. Meshes, textures, materials, and animations
  can all be reused.
* Animations apply to model sub-components using regular expressions so that you can
  for example define a rotating animation and apply it to any wheel in any model.
* A shader builder that can create a shader with only the features that you need.
* Full support for custom shaders and granular application of shaders to model
  components so for example you only need the shader that supports light emmissions
  for drawing the parts of the model that emit light.

This framework is great is you have an original game idea and want to fast track the
graphics development. If you want to create a world in which you have a character 
that can run around and do stuff, then a better starting point would be Unreal Engine.

There is nothing out there that is better if you have limited resources, want to
target the widest possible audience, and your game has some unique gameplay.

# Concepts
These are the main elements that you will be working with

## Canvas
You need to add an HTML5 canvas to your web page. If you call your canvas "scene"
then Frag will pick it up automatically. If you want to call it something else
then there is a small code snippet you need to define that.

## Scene
You need to create at least 1 scene. You can display multiple scenes on top of each
other, this is often the best way of combining the 3D game elements with a 2D UI
that sits at the front of the viewport. You can also render a scene onto a texture
and paint this texture onto part of a model - for example a window or a mirror.

## Camera
You need to create at least one camera. You need to associate a camera with each
scene to define how the contents of that scene are projected onto the viewport.

## Model
A model is a design for some graphics in your game. For example a vehicle, a building,
a weapon, some terrain or a character. Models are compositions of other models. For example you
can create or load a model of a wheel, then create a model of a car that has 4 wheel
models within it.

Models can have multiple animations defined. These animations can be started and
stopped independetly and can run on a loop. Animations affect the characteristics
of the child models. For example you can add an animation that causes all of the
wheel models within your car model to rotate until the animation is stopped.

Each model is defined by: 
* A mesh that describes the shape of the model in 2D or 3D
* A material that is painted onto the mesh
* A transform that defines the position and orientation of the model
* A shader that combines the mesh, material and transform into pixels

## Mesh
A collection of 2D or 3D points that define a surface. A mesh can be comprised
of several pieces, where each piece can be a set of triangles, rectangles, a
triangle strip or a triangle fan.

A mesh can also have normal vectors to define how light is reflected off the
surface of the mesh and tangent vectors to define how to apply normal maps
to the surface. Normal maps are also used for displacement textures.

## Shader
You need to specify which shader to use to draw each model in your scene. Frag
has a shader builder that can build a wide variety of shaders for you with various
characteristics, or you can write a custom shader to suit your needs.

Shaders are responsible for converting models into pixels. Models can composed
from of other models, and each model can be drawn with a different shader if you
like. By default models will use the shader defined for their parent model, so 
typically you only need to define the shader for the root model in each model
hierarchy.

Note that 2D shaders can only draw 2D models and 3D shaders can only draw 3D models.

## Texture
Textures are bitmaps that are used to paint parts of a model. Textures can be
of several different types, for example you can make a texture that defines
the colors of the pixels that are drawn, but you can also make textures that
deform the models mesh to create detail, or change the way light is reflected
off the surface to give the impression of structure that is not in the mesh.

## Material
A material is a collection of textures that define the appearence of a model.
Each model has only one material attached to it, but models are compositions of
other models that can each have their own material.

The same texture can be reused on multiple materials. If you want to dyanmically
create and dispose materials, you can define whether the material will dispose
of textures or not.

# Example scenes

Here are some scenes that illustrate how to use Frag.

## Hello cube
This is a very simple scene that displays a spining cube with a texture painted on it.

There are other samples for you to explore in the [samples folder](./samples)

```html
<!DOCTYPE html>
<html xmlns='http://www.w3.org/1999/xhtml' lang='en-US'>
<head>
    <title>Hello cube</title>
    <meta name='viewport' content='width=device-width, initial-scale=1.0' />
    <style>
        html,
        body {
            overflow: hidden;
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
        }

        #scene {
            width: 100vw;
            height: 100vh;
            touch-action: none;
            display: block;
        }
    </style>
</head>
<body>
    <canvas id='scene'></canvas>
    <script>
        // This script provides an oportunity to customize 
        // Frag and is not required
        window.frag = {
            canvas: document.getElementById("scene"),
            init: function(frag){
                frag.debugShaderBuilder = true;
            }
        }
    </script>
    <script src='../dist/frag.min.js'></script>
    <script>
        const frag = window.frag;
        const degToRad = Math.PI / 180;

        // The perspective camera makes objects further from the camera look smaller
        const camera = frag.PerspectiveCamera()
            .frustrum(35 * degToRad, -100, 100)
            .scaleX(100)
            .moveToZ(-120);

        // We always need at least one scene
        const scene = frag.Scene()
            .camera(camera);

        // The camera attached to the main scene defines the size of the
        // viewport. Other scenes will adapt their size to size of the viewport
        frag.mainScene(scene);

        // We need a shader to draw onto the screen. The more features you
        // enable the lower the frame rate will be for your game
        const shader = frag.Shader()
            .name("My shader")
            .diffuseTexture()
            .directionalLightWhite()
            .compile();

        // This texture will be used to paint the sides of the cube. Note that
        // using larger textures will have dramatic impact on the performance of 
        // your game, so you will have to compromise on visuals to target lower 
        // performance devices
        const texture = frag.Texture()
            .name('My texture')
            .dataFormat(frag.gl.RGB)
            .fromUrl(0, 'https://images.pexels.com/photos/122458/pexels-photo-122458.jpeg?auto=compress&cs=tinysrgb&h=512&w=512', '');

        // For this simple example the material only has a diffuse texture. You
        // can add more realism by adding other types of texture but these will
        // consume memory on the graphics card and reduce the frame rate
        const material = frag.Material()
            .name('My material')
            .setTexture('diffuse', texture);

        // Frag has functions that will build simple shapes. These are OK
        // for demo and getting started, but you probably wont use them
        // much in your game. The recommended tool for drawing meshes is Blender.
        const mesh = frag.Cube(
            8, { 
                duplicateTexture: true 
            })
            .name('My cube')
            .shadeSmooth()
            .textureSmooth();

        // A model combines
        // - A mesh defines the shape of the model
        // - A material defines how to paint the surface of the model
        // - A transform defines the postition and orientation of the model
        // - A shader defines how to turn the other things into pixels
        const model = frag.Model()
            .name('My model')
            .mesh(mesh)
            .material(material)
            .transform(frag.Transform().identity())
            .shader(shader);

        // You can create as many instances of each model in the scene
        // that you need. Each instance can be independently moved,
        // rotated, scaled and animated but they all share the same
        // mesh, material and shader defined bu the model.
        const cube = frag.SceneObject(model)
            .enable();
        cube.getPosition()
            .scale(40);
        scene.addObject(cube);

        // There are several animation option available including
        // keyframes and smooth transitions over time. Here we are
        // using the simplest animation technique of executing a
        // function at regular intervals
        const spinningAnimation = frag.Animation()
            .repeatTicks(function () {
                const position = cube.getPosition();

                let rotationX = position.getRotateX() + 0.01;
                if (rotationX > Math.PI) rotationX -= Math.PI * 2;
                position.rotateX(rotationX);

                let rotationY = position.getRotateY() - 0.01;
                if (rotationY < -Math.PI) rotationY += Math.PI * 2;
                position.rotateY(rotationY);
            }, 5);
        spinningAnimation.start();
    </script>
</body>
```
