# Value Animation Action
To construct a new value animation action call the `ValueAnimationAction` 
method, then use fluent syntax to configure the attributes of the action.

This object provides a mechanism for changing a value smoothly over time.
For example you might want to transition gradually from one color to another
or smoothly rotate an object in the scene.

This object is an animation action, which means that you must pass it
to the `sequence()` function of an `Animation` object. The `Animation` 
object that you pass it to will invoke this action as part of the sequence.

## Examples
This is an example of moving an object then rotating it.

```javascript
const frag = window.frag;

const model = frag.Model();
const obj = frag.SceneObject(model);
const pos = obj.getPosition();

const animation = frag.Animation()
  .sequence([
    frag.ValueAnimationAction().onStep((a, r) => pos.rotateZ(r * Math.PI)),
    frag.ValueAnimationAction().onStep((a, r) => pos.positionY(r * 100))
  ]);
```

## setDuration(gameTicks: int)
Specifies how long this animation will take in game ticks. If you don't call this
function then the duration defaults to 30 game ticks.

## setInterval(gameTicks: int)
Specifies how often the value is updated in game ticks. A lower number will produce
smoother animation at the cost of higher CPU load. If you don't call this function
then the default is 5 ticks.

## onStart(start: function(animation, valueAnimation, gameTick))
Supplies a function that will be executed at the start of the animation.

The `animation` parameter is the animation that this action was added to.
This is provided so that you can access any state associated with the animation.

The `valueAnimation` parameter it this value animation action.

The `gameTick` parameter is the current game time in ticks.

## onStop(stop: function(animation, valueAnimation, gameTick))
Supplies a function that will be executed at the end of the animation.

The `animation` parameter is the animation that this action was added to.
This is provided so that you can access any state associated with the animation.

The `valueAnimation` parameter it this value animation action.

The `gameTick` parameter is the current game time in ticks.

## onStep(step: function(animation, ratio, valueAnimation, gameTick))
Supplies a function that will be executed each time the animated value needs to
be updated.

The `ratio` parameter that is passed in is a floating point value 
between 0 and 1. The value is zero at the start of the animation and 
gradually increases to a value of 1 at the end of the animation.

The `animation` parameter is the animation that this action was added to.
This is provided so that you can access any state associated with the animation.

The `valueAnimation` parameter it this value animation action.

The `gameTick` parameter is the current game time in ticks.
