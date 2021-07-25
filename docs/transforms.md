# Position, scale, orientation and parenting
This article provides an overview of how to manage the size, location and 
orientation of the various elements within your scene.

## The basics
Like all 3D graphics frameworks Frag uses matricies for transformations.
Matricies are cool because any sequence of movements, rotations and scaling 
no matter how complex can be represented as a matrix, and multiplying the
matrix by the coordinates of a point in space calculates the transformed
location of that point in a single operation no matter how many scales, rotate
and translate operations went into building the matrix.

Even more cool is that you can take any two matricies and multiply them
together, and the result is the same as joining the two sequences of
operations into one long list no matter how many steps were involved
in producing each matrix.

Like other 3D graphics frameworks Frag uses 4x4 matricies for 3D
spaces and 3x3 matricies for 2D spaces. The reason for the extra row and
column is that it makes it possible to create a perspective effect via
the matrix multiplication, and since perspective is so commonly used in
3D graphics this is built into the WebGL pipeline.

## Coordinate system
Every 3D graphics application and framework has to choose a coordinate system.
There is no standard and no convention that is followed everywhere, so I
chose the one that seems most simple and obvious to me.

In Frag:
* The X-axis increases from left to right accross the screen.
* The Y-axis increases from bottom to top up the screen.
* The Z-axis increases from close to the camera to further from the camera going into the screen.

This is known as a left-handed coordinate system with Y up because...

If you take the thumb and first two fingers of you left hand and make them 
all at 90 degrees fron each other, then orient your hand so that your thumb 
is pointing up and your index finger is pointing away from you, then:
* Your thumb is pointing in the positive Y-axis direction
* Your index finger is pointing in the positive Z-axis direction
* Your middle finger is pointing in the positive X-axis direction

You should be aware that other 3D graphics frameworks and applications use
different coordinate systems. Some are right handed instead of left handed,
some have Z up instead of Y and some have Z comming out of the screen instead
of going into it. You should be aware of these differences when reading
articles online and using code snippets from the internet.

## Cameras
The WebGL graphics pipeline maps the screen onto a cube that has (0,0,0) at
its centre and extends to +/-1 on all 3 axes. You can use this coordinate system
if you like, or you can project some other coordinate system onto the +/-1 cube.
This is the job of the camera.

You can use whatever scale you want within your game, and configure the camera
to map some portion of your world space onto the WebGL +/-1 cube by calling
the `frustum` method of the camera passing `fieldOfView`, `zNear` and `zFar`,
and calling the `scaleX` method of the camera passing the amount of your world's
space that should be visible across the width of the screen at `zNear`.

Anything closer to the camera than `zNear` will not be visible to the camera.
Annything further than `zFar` from the camera will also be not visible to the
camara, and everything in between will be visible if it is within the field
of view.

For more background see [Introduction to Projections](http://learnwebgl.brown37.net/08_projections/projections_introduction.html)

Cameras can have a parent. When a camera is parented, its position and orientation
will be relative to its parent, so that when the parent moves or rotates this changes
the world coordinate systemm from the cameras point of view. This is exactly like
having a parent/child relationship between screen objects where the child transform
is applied to the parent's local coordinate system.

There are a few places where parenting a camera is useful.
* You can make the position of the camera relative to something else. For example if this is a driving game, you might want the camera appear as if it is mounted to the car and follows all of its movements.
* You can add an empty `SceneObject` (with no model) as the camera's parent, then
rotating this enpty `SceneObject` will rotate the camera around the position of the empty `SceneObject`.

## Matrix
The [`Matrix`](reference/matrix.md) class provides static methdods for 
performing matrix math such as matrix multiplication, inversion, dot product etc.

The Matrix class can also calculate various projections. These are used by
the built-in cameras and are useful if you want to write your own custom camera.
If you want to use these projections in your game, please study the unit tests
in the [test folder](../test/Matrix.js).

## Location
The [`Location`](reference/location.md) class encapsulates translation, 
rotation and scale as discrete values
and can calculate a matrix from them. Setting the `isModified` flag will
cause the `Location` to recalculate the matrix next time it is required.

The reason that this class exists, and we don't just use a matrix for 
everything is because matricies record the sequence of tranformations. Lets 
say for example that I moved my object in the x direction then rotated it
using a matrix and now I want to change the amount of movement in the x 
direction, I would have to undo the rotation first, apply a new translation
then re-apply the rotation.

The [`Location`](reference/location.md) class always calculates the matrix 
by scaling first, then rotating, and moving last. This is what you want in 
a game, because you can change the location, rotation or scale any time 
without getting perculior effects from the combination of these transformations.

## ScenePosition
The [`ScenePosition`](reference/scene-position.md) class is a wrapper 
around an instance of a [`Location`](reference/location.md) object. It 
provides a collection of helper methods that make it easier to modify
the location. For example if you call the `scale` method of `ScenePosition`
it will change the scale in all 3 axes and set the `isModified` flag on
the `Location` object.

You can get a `ScenePosition` object by calling the `getPosition` method
of anything that can be moved. The methods of `ScenePosition` are fluent
which means that you can chain the calls together to avoid some typing.

## PositionLink
The [`PositionLink`](reference/position-link.md) class creates an invisible
link between two objects so that the second object mimics the movement of
the first. You can use the `PositionLink` to mimic location, scale and/or
rotation on each axis individually, and you can offset the destination from
the source.

## Transform2D and Transform3D
These two classes can be used to create and/or manipulate a 2D or 3D matrix.
They also provide an `Observable` that allows you to subscribe to any changes
in the matrix that they wrap, and an `apply` method to pass the matrix to
a shader uniform.

These are mostly used in the rendering pipeline, but you can also use them
in your own code to encode sequences of transformations into a matrix that
will perform all of those transformations in a single step.

## Parenting and cameras
The camera in your scene is actually just a matrix transformation that
transforms 3D coordinates in your game world to 2D pixel coordinates on
the screen. This matrix is the starting point for rendering the scene.

As each object in your scene is rendered, the camera matrix is multiplied
by the `Location` object's matrix to append any local transformations
defined for the scene object to the transformations defined by the camera.
You can think of this as the scene object's `Location` transforms the
verticies of the mesh into game world space, then the camera transforms them
again into screen pixel coordinates. By multiplying these matricies
together, these two transformations can be done in a single step.

The scene object references a model, and it also has a `Location`, so this
just requires another multiplication to append its transformations to
the list. Similarly models have child models within them and they each have
a `Location`, so it's just matrix multiplication all the way down the
hierarchy.

## Scaling
Notice that location and rotation are pretty straightforward to understand,
if I put something inside of something else then it rotates with the thing
that it's inside of. Just like if I put a book inside a box and rotate
the box then the book will rotate along with the box.

Scale is a bit less intuitive, because if I had a way to enlarge my 
box (maybe it's an inflatable box) then the book would remain the same 
size, but in 3D graphics it's all just matrix multiplication so if I 
double the size of a model then everything within that model will also 
double in size.

The most confusing part is when I parent a weapon to a character's hand.
If the hand has a 3x scaling applied to is then the weapon will become
3x larger if I make the hand it's parent. If some of your characters have
3x hands and others were drawn half the size so you applied a 6x to make
the hands appear the same size, then the weapon would be twice the size
in the hand of one character than in the other.

This situation is a whole lot less confusing in game development if you
just avoid scaling altogether by drawing things in the proper size in
Blender. This is especially true if you parent objects to model components.
My advice is to plan our the scaling of your game and everything in it
beforehand, and draw everything to that scale in Blander, then don't scale
anything in Frag - your life will be a whole lot simpler.

Having said that, there are exceptions. Lets say I have various kinds of
tank and various kinds of guns that I can mount on top. I could parent
the gup to the tank and it will move and rotate with the tank, bt can also
be moved and rotated with respect to the tank.

Now if I wanted to have small, medium and large tanks, setting a scaling
factor on the tank would scale all of it's components, and it would also
scale the size of the gun, which in this case is exactly what we want.