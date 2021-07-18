# Model
To construct a new model object call the `Model` method, then use
fluent syntax to configure the attributes of the model. This method accepts
a boolean parameter that is true for 3D models and false for 2D models. The 
default is 3D.

A model combines a mesh, material and transform. You cannot draw a mesh directly
onto the screen because the mesh does not know where it it within the scene,
or what the surface of the mesh should look like. A model combines a mesh (which
defines the shape of a surface) with a transform (which defines the size, and 
orientation) and a material (which defines the surface appearence).

You cannot add a Model directly to a scene. The Model is like a blueprint that
defines how to make scene objects of a particular type. This is much more efficient
for games that have many instances of identical objects in the game. Each instance
of a model can be positioned and animated independently, but the shape and visual
appearence is defined by the model, and if you change the model properties, all
instances of that model will change.

Models are arranged into hierarchies, i.e. models can be contained within other
models. The same model cannot be contained in more than one parent model because
the contained models inherit characteristics from their parents and this would not
work for multiple parents. If you do add the same model to multiple parent objects
then it will inherit from the last model that it was added to.

Child models are scaled, rotated and positioned relative to their parent. This is
still true even if you add the same model to multiple parents. This means that
moving, scaling or rotating the parent will move, scale or rotate all decendents
beneath it in the model hierarchy.

Models can have animations attached to them. When animations run they temporarily
change the characteristics of the decendants. For example an animation might rotate
a specific child or set of children within the model.

Models can have many animations. These animations can be stopped, started or looped
at any time, and multiple animations can be running at the same time. Differtent
animations can run concurrently and affect the same child objects in different ways.
For example one animation can scale the child whilst another animation can rotate
it at the same time. For example a vehicle might have a 'moving' animation that runs
whenever the vehicle is moving and a 'firing' animation that runs each time the
vehicle fires its gun and stops after one iteration. This vehicle can be moving,
firing or moving and firing at the same time.

## Constructor
```javascript
window.frag.Model(engine: Engine, is3d: bool | undefined)
```

* `engine` is the game engine for your game. It is an instance of the `Engine` class. You can 
  have more than one on a page but more often there is just one that is constructed at the 
  very beginning.
* `is3d` pass `false` here if you are constructing a 2-dimentional model. Note that
  2-dimensional models will only work with 2-dimensional shaders. For 3-dimensional
  models you can omit this parameter or pass `true`.

Note that for any constructor, you can call this function on the `engine` rather than passing
`engine` as a parameter. In this case the call looks like:

```javascript
engine.Model(is3d: bool | undefined)
```

## Examples
This is an example of creating a new model with child models. This example was taken
from the ['butterflies' sample](../../samples/butterflies.html) if you want to see
this code in context.

Note that in this example the parent model has no mesh and therefore does not draw 
anything, it just provides an anchor point that can be moved around the scene to
move both butterfly wings together.

```javascript
const wingLength = randomFloat(0.5, 0.7);

const butterflyModel = engine.Model()
    .name('Butterfly ' + id)
    .material(butterflyMaterial)
    .shader(shader);

butterflyModel.addChild()
    .name('Left wing ' + id)
    .mesh(wingMesh)
    .getPosition()
        .rotateY(-45 * degToRad)
        .scaleY(wingLength)
        .rotateZ(180 * degToRad);

butterflyModel.addChild()
    .name('Right wing ' + id)
    .mesh(wingMesh)
    .getPosition()
        .rotateY(-45 * degToRad)
        .scaleY(wingLength);
```

## dispose()
Frees resources consumed by the Model.

## name(name: string)
Sets the name of this model. This is mostly for debugging purposes, but it also used
to associate animations with child models. Animations contain channels and each
channel has a regular expression defining the names of the child models that it
applies to. For example if you name your wheels 'wheel1', 'wheel2', 'wheel3' and 'wheel4',
then you can define an animation channel that targets any model whose name starts
with 'wheel'. This avoids having to define the same animation multiple times, and makes
the game run more efficiently because there are fewer animation channels.

## getPosition()
Returns a `ScenePosition` object that can be used to manipulate the location of the
model. Note that you do not have to get a `ScenePosition` object, this is just a 
more convenient way of modifying the `location` property of the model.

## shader(shader: Shader)
You must call the `shader` method for root level models to define how this model should
be rendered into pixels. Child models will inherit the parent shader unless you also
call the `shader` method on a child to override this.

Some shaders are much more expensive than others to run, and models typically need
specific shader features to draw correctly. By optimizing the shader that you use for
each model, you can maximize the frame rate of your game and make it more fun to play.

Note that 2D shaders only work with 2D models and 3D shaders only work with 3D models.

## mesh(mesh: MeshData)
You can call this method on any Model to define its shape. Models don't have to have
a mesh, in which case they are just being used to group children so that they can be
manipulated together (by an animation for example).

## material(material: Material)
This defines the material that will be used to paint the surface of the mesh. You don't
have to assign materials, you can set vertex colors instead if you prefer.

Child models will inherit the material of their parents untill you override this by
callng the `material` function on the child models.

## addChild(model: Model)
Call this method to build a heirarchy of models. For example a car model might have
4 wheel models contained within it.

Animations can only be applied to descendents, so anything that you want to animate
must be a child.

## shadeSmooth(depth)
Configures the mesh for this model to use smooth shading. If the mesh is shared by
multiple models, then these models will be affected.

The depth parameter defines how many levels of the model hierarchy to traverse. Pass
0 to change this model without affecting any if its descendents. Pass a value
of 1 to change this model and its immediate children.

To traverse the entire object heirarchy omit the depth parameter.

## shadeFlat(depth)
Configures the mesh for this model to use flat shading. If the mesh is shared by
multiple models, then these models will be affected.

The depth parameter defines how many levels of the model hierarchy to traverse. Pass
0 to change this model without affecting any if its descendents. Pass a value
of 1 to change this model and its immediate children.

To traverse the entire object heirarchy omit the depth parameter.

## textureSmooth(depth)
Configures the mesh for this model to use smooth textures. If the mesh is shared by
multiple models, then these models will be affected.

The depth parameter defines how many levels of the model hierarchy to traverse. Pass
0 to change this model without affecting any if its descendents. Pass a value
of 1 to change this model and its immediate children.

To traverse the entire object heirarchy omit the depth parameter.

## textureFlat(depth)
Configures the mesh for this model to use flat textures. If the mesh is shared by
multiple models, then these models will be affected.

The depth parameter defines how many levels of the model hierarchy to traverse. Pass
0 to change this model without affecting any if its descendents. Pass a value
of 1 to change this model and its immediate children.

To traverse the entire object heirarchy omit the depth parameter.

## wireframe(drawWireframe, depth)
Turns wireframe drawing on/off for the mesh for this model. If the mesh is shared by
multiple models, then these models will be affected.

The depth parameter defines how many levels of the model hierarchy to traverse. Pass
0 to change this model without affecting any if its descendents. Pass a value
of 1 to change this model and its immediate children.

To traverse the entire object heirarchy omit the depth parameter.

## drawNormals(length, color, depth)
Configuring normal drawing for the mesh for this model. If the mesh is shared by
multiple models, then these models will be affected.

The length parameter defines the length of the normal lines that are drawn. Pass
zero to turn off normal drawing. The length is in model space, and is affected by
the scale of the model.

The color parameter is optional, When provided it should be an array of 3 floating
point numbers between 0 and 1 representing the proportion of red, green and blue.
This color will only work if the shader drawing the model supports vertex colors.

The depth parameter defines how many levels of the model hierarchy to traverse. Pass
0 to change this model without affecting any if its descendents. Pass a value
of 1 to change this model and its immediate children.

To traverse the entire object heirarchy omit the depth parameter.

## addAnimation(animation: ModelAnimation)
Adds an animation to a model. The animation will affect all descendents whose names
match the regular expressions in the animation channels.

Animations have names, and these names become properties of the `SceneObject`
instances that are created from this model. For example if I create an animation 
called "moving" and add it to a model, then all instances of that model will have 
a `moving` property that can be used to control the animation.

Here is an incomplete example that illustrates the relationship between the animation
name and the `animations` property of `SceneObject`:

```javascript
const modelAnimation = engine.ModelAnimation().name("running");

const model = engine.Model().addAnimation(modelAnimation);

const sceneObject = engine.SceneObject(model);
sceneObject.animations.running.start();

```
