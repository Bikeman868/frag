# Position, scale, orientation and parenting
This article provides an overview of how to manage the size, location and 
orientation of the various elements within your scene.

## The basics
Like all 3D graphics frameworks Frag uses matricies for transformations.
Matricies are cool because any sequence of movements, rotations and scaling 
no matter how complex can be represented as a matrix, and multiplying the
matrix by the coordinates of a point in space calculates the transformed
location of that point.

Even more cool is that you can take any two matricies and multiply them
together, and the result is the same as joining the two sequences of
operations no matter how many steps were involved in producing each matrix.

Also like other 3D graphics frameworks Frag uses 4x4 matricies for 3D
spaces and 3x3 matricies for 2D spaces. The reason for the extra row and
column is that it makes it possible to create a perspective effect via
the matrix multiplication, and since perspective is so commonly used in
3D graphics this is built into the WebGl pipeline.

## Matrix
The `Matrix` class provides static methdods for performing matrix math
such as matrix multiplication, inversion, dot product etc.

## Location
This class encapsulates translation, rotation and scale as discrete values
and can calculate a matrix from them. Setting the `isModified` flag will
cause the `Location` to recalculate the matrix next time it is required.

The reason that this class exists, and we don't just use a matrix for 
everything is because matricies record the sequence of tranformations. Lets 
say for example that I moved my object in the x direction then rotated it
using a matrix and now I want to change the amount of movement in the x 
direction, I would have to undo the rotation first, apply a new translation
then re-apply the rotation.

The `Location` class always calculates the matrix by scaling first, then
rotating, and moving last. This is what you want in a game, because you
can change the location, rotation or scale any time without getting perculior
effects from the combination of these transformations.

## ScenePosition
This class is a wrapper around an instance of a `Location` object. It
provides a collection of helper methods that make it easier to modify
the location. For example if you call the `scale` method of `ScenePosition`
it will change the scale in all 3 axes and set the `isModified` flag on
the `Location` object.

You can get a `ScenePosition` object by calling the `getPosition` method
of anything that can be moved. The methods of `ScenePosition` are fluent
which means that you can chain the calls together to avoid some typing.

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