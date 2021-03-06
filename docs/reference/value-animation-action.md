# Value Animation Action
This class provides a mechanism for changing a value smoothly over time.
For example you might want to transition gradually from one color to another
or smoothly rotate an object in the scene.

This object is an animation action, which means that you must pass it
to the `sequence()` function of an [`Animation`](animation.md) object.

## Constructor
```javascript
window.frag.ValueAnimationAction(engine: Engine)
```

* `engine` is the game engine for your game. It is an instance of the `Engine` class. You can 
  have more than one on a page but more often there is just one that is constructed at the 
  very beginning.

Note that for any constructor, you can call this function on the `engine` rather than passing
`engine` as a parameter. In this case the call looks like:

```javascript
engine.ValueAnimationAction()
```

## Examples
This is an example of enabling a scene object, then slowly rotating it on
the Z axis from 0 to 2 x pi radians, then slowly rotating it on the X axis
from 0 to 2 x pi radians, then disabling the object.

Note that this example does not configure the model or the scene object, but
focuses on the `ValueAnimationAction` class.

```javascript
const engine = window.frag.Engine().start();

const model = engine.Model();
const sceneObject = engine.SceneObject(model);

const animation = engine.Animation({ 
    obj: sceneObject, 
    pos: sceneObject.getPosition() 
  })
  .sequence([
    engine.ValueAnimationAction()
      .setDuration(500)
      .setInterval(20)
      .onStart((animation) => { animation.obj.enable(); } )
      .onStep((animation, ratio) => { animation.pos.rotateZ(ratio * Math.PI); }),
    engine.ValueAnimationAction()
      .setDuration(1000)
      .setInterval(50)
      .onStep((animation, ratio) => { animation.pos.rotateX(ratio * Math.PI); })
      .onStop((animation) => { animation.obj.disable(); } )
  ]);
```

## setDuration(gameTicks: int): ValueAnimationAction
Specifies how long this animation will take in game ticks. If you don't call this
function then the duration defaults to 30 game ticks.

## setInterval(gameTicks: int): ValueAnimationAction
Specifies how often the value is updated in game ticks. A lower number will produce
smoother animation at the cost of higher CPU load. If you don't call this function
then the default is 5 ticks.

## onStart(start: function(animation, valueAnimation, gameTick)): ValueAnimationAction
Supplies a function that will be executed at the start of the animation.

The `animation` parameter is the animation that this action was added to.
This is provided so that you can access any state associated with the animation.

The `valueAnimation` parameter it this value animation action.

The `gameTick` parameter is the current game time in ticks.

## onStop(stop: function(animation, valueAnimation, gameTick)): ValueAnimationAction
Supplies a function that will be executed at the end of the animation.

The `animation` parameter is the animation that this action was added to.
This is provided so that you can access any state associated with the animation.

The `valueAnimation` parameter it this value animation action.

The `gameTick` parameter is the current game time in ticks.

## onStep(step: function(animation, ratio, valueAnimation, gameTick)): ValueAnimationAction
Supplies a function that will be executed each time the animated value needs to
be updated.

The `ratio` parameter that is passed in is a floating point value 
between 0 and 1. The value is zero at the start of the animation and 
gradually increases to a value of 1 at the end of the animation.

The `animation` parameter is the animation that this action was added to.
This is provided so that you can access any state associated with the animation.

The `valueAnimation` parameter it this value animation action.

The `gameTick` parameter is the current game time in ticks.
