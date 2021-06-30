# ScenePosition
To construct a new scene position object call the `ScenePosition` method, passing
a `Location` object as a paremeter, then use fluent syntax to configure the attributes 
of the scene position object.

`ScenePosition` objects are wrappers that provide convenient methods for manipulating
a `Location` object. The Scene Position lets you modify the translation, scale and
orientation easily, and flags the `Location` as modified to that the next time the
`getMatrix()` funtion is called hte matrix will be rebuilt.

The `Location` always constructs the transformation matrix by applying scaling first,
then rotation, then translation last. This means that for example you cannot rotate about
an arbitary point in space (which requires translating, rotating and translating back again).
The scale and rotate will always occur around the origin of the model and the translation 
will place it within the scene. This is the behaviour you want for scene positioning.

## Examples
You would not normally construct scene positions in your code, but you can if you want
to have convenient syntax for updating the matrix in a `Location` object.

The most common use of a Scene Position is to use the `getPosition()` function of a
`Model` or `SceneObject` which returns a Scene Position that can be used to manipulate 
the scale, position and orientation of the object within the scene.

This is an example of getting a scene object's position and using that to scale the
object to 40x its original size.

```javascript
const frag = window.frag;
frag.init();

const model = frag.Model();
const scene = grag.Scene();

const sceneObject = frag.SceneObject(model);
sceneObject.getPosition().scale(40);
scene.addObject(sceneObject);
```

## setLocation(location: Location)
Changes the location that will be updated by this scene position object.

## getMatrix()
Calls the `getMatrix()` function of the enclosed `Location` object. This matrix can be
used to transform coordinates according to the translation, rotation and scale defined
by the location.

If you use the `ScenePosition` to manipulate the `Location` then the matrix will be
updated only when necessary.

## Scaling
Scaling is a multipier, so a scaling factor of 1 means leave it at its current size.

These method affect the scaling effect of the matrix transform:
* `getScaleX()` returns the scaling factor in the X direction
* `getScaleY()` returns the scaling factor in the Y direction
* `getScaleZ()` returns the scaling factor in the Z direction
* `scaleX(factor: float)` sets the scale factor in the X direction
* `scaleY(factor: float)` sets the scale factor in the Y direction
* `scaleZ(factor: float)` sets the scale factor in the Z direction
* `scaleXYZ(xFactor: float, yFactor: float, zFactor: float)` sets the scale factor in all 3 axes indepenently
* `scale(factor: float)` sets the scale factor in all 3 axes to the same value
* `scaleBy(factor: float[])` scales the object in all 3 axes relative to its current size
* `scaleByXYZ(xFactor: float, yFactor: float, zFactor: float)` scales the object in all 3 axes relative to its current size

## Rotating
Rotations are defined in radians. To convert degrees to radians multiply by 
`Math.PI` and divide by `180`.

Rotations are specified as an anti-clockwise rotation around an axis, where 
anti-clockwise is defined by the axis positive direction coming towards you.
In other words if you orient the scene so that the positive direction of the 
x-axis is pointing towards your eye, then a positive rotation will turn the
object in the opposite direction to how the hands on a clock move.

You can use rotation angles that are greater than 2 x pi or less than -2 x pi.

These methods affect the rotating effect of the matrix transform:
* `getRotateX()` returns the amount of rotation around the X axis
* `getRotateY()` returns the amount of rotation around the Y axis
* `getRotateZ()` returns the amount of rotation around the Z axis
* `rotateX(angle: float)` sets the amount of rotation around the X axis
* `rotateY(angle: float)` sets the amount of rotation around the Y axis
* `rotateZ(angle: float)` sets the amount of rotation around the Z axis
* `rotateXYZ(xAngle: float, yAngle: float, zAngle: float)` sets the amount of rotation around all 3 axes indepenently
* `rotateBy(angles: float[])` adds some rotation around all 3 axes
* `rotateByXYZ(xAngle: float, yAngle: float, zAngle: float)` rotates the object in all 3 axes relative to its current orientation

## Location
These methods affect the translating effect of the matrix transform:
* `getLocationX()` returns the position along the X axis
* `getLocationY()` returns the position along the Y axis
* `getLocationZ()` returns the position along the Z axis
* `locationX(value: float)` sets the position along the X axis
* `locationY(value: float)` sets the position along the Y axis
* `locationZ(value: float)` sets the position along the Z axis
* `locationXYZ(x: float, y: float, z: float)` sets the position along all 3 axes indepenently
* `moveBy(angles: float[])` moves the object on all 3 axes
* `moveByXYZ(x: float, y: float, z: float)` moves the object along all 3 axes
