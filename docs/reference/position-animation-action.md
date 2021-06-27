# Position Animation Action
To construct a new position animation action call the `PositionAnimationAction` 
function, then use fluent syntax to configure the attributes of the model animation.
This function takes 3 parameters as follows:

* `scenePosition` is required, amd is the `ScenePosition` object that will be animated.
One way to obtain a `ScenePosition` object is by calling the `getPosition()` method of a
scene object.
* `invLinearVelocity` is optional. This defines the speed at which the object will be
moved through the scene in game ticks per unit length. For example if you move an
object from (0,0,0) to (100,0,0) which is a distance of 100, and you pass 5.0 as the
`invLinearVelocity` then the movement will take 100 x 5 game ticks.
* `invAngularVelocity` is optional. This defines the rate at which the object will
roatate in game ticks per radian. For example if you rotate an object through `Math.PI`
radians, and you pass 30 as the `invAngularVelocity` then the rotation will take 
pi x 30 game ticks.

This object provides a mechanism for defining an animation action that moves and 
rotates objects in the scene at a defined speed. You can include this action in
a sequence of actions - see the [`Animation`](animation.md) class for details.

## Examples
This example is taken from the model loader sample. Please refer to the sample for
the context in which this code runs.

```javascript
const invLinearVelocity = 1.5;
const position = excavator.getPosition();

const step1 = frag.PositionAnimationAction(position, invLinearVelocity)
    .moveBy([-80, 0, 0])
    .onStart(excavator.animations.moving.start)
    .onStop(excavator.animations.moving.stop);

const step2 = frag.RepeatAnimationAction(excavator.animations.excavating, 4)

const step3 = frag.PositionAnimationAction(position, invLinearVelocity)
    .moveBy([100, 0, 0])
    .onStart(excavator.animations.moving.start)
    .onStop(excavator.animations.moving.stop);

const step4 = excavator.animations.tipping;

const step5 = frag.PositionAnimationAction(position, invLinearVelocity)
    .moveBy([-20, 0, 0])
    .onStart(excavator.animations.moving.start)
    .onStop(excavator.animations.moving.stop);

frag.Animation().sequence([step1, step2, step3, step4, step5], true)
    .start();
```

## moveBy(vector: float[], invLinearVelocity: float)
Configures the position animation action to move the object by a vector
relative to the position at the start of the animation. The 
`invLinearVelocity` parameter is optional and defaults to the value passed
to the constructor.

## moveTo(location: float[], invLinearVelocity: float)
Configures the position animation action to move the object to an absolute
position within the scene. The `invLinearVelocity` parameter is optional and 
defaults to the value passed to the constructor.

## rotateBy(vector: float[], invAngularVelocity: float)
Configures the position animation action to rotate the object by a euler vector
relative to the orientation at the start of the animation. The 
`invAngularVelocity` parameter is optional and defaults to the value passed
to the constructor.

## rotateTo(eulerAngles: float[], invAngularVelocity: float)
Configures the position animation action to rotate the object to an absolute
orientation. The `invAngularVelocity` parameter is optional and defaults to the 
value passed to the constructor.

## moveByXYZ(x, y, z, invLinearVelocity)
This is another way of calling `moveBy`

## moveByXY(x, y, invLinearVelocity)
This is another way of calling `moveBy`

## moveToXYZ(x, y, z, invLinearVelocity)
This is another way of calling `moveTo`

## moveToXY(x, y, invLinearVelocity)
This is another way of calling `moveTo`

## rotateByXYZ(x, y, z, invLinearVelocity)
This is another way of calling `rotateBy`

## rotateByXY(x, y, invLinearVelocity)
This is another way of calling `rotateBy`

## rotateToXYZ(x, y, z, invLinearVelocity)
This is another way of calling `rotateTo`

## rotateToXY(x, y, invLinearVelocity)
This is another way of calling `rotateTo`
