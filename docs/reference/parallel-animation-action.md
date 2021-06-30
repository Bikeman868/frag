# Parallel Animation Action
To construct a new parallel animation action call the `ParallelAnimationAction` 
method passing an array of actions to execute in parallel, then use fluent syntax 
to configure the attributes of the action.

This object provides a mechanism for executing multiple actions in parallel
as part of an animation sequence.

This object is an animation action, which means that you must pass it
to the `sequence()` function of an `Animation` object. The `Animation` 
object that you pass it to will invoke this action as part of the sequence.

## Examples
This is an example of moving an object along the Y axis and rotating it around
the Z axis at the same time, then rotating it about the X axis.

```javascript
const frag = window.frag;
frag.init();

const model = frag.Model();
const obj = frag.SceneObject(model);
const pos = obj.getPosition();

const animation = frag.Animation()
  .sequence([
    frag.ParallelAnimationAction([
      frag.ValueAnimationAction().onStep((a, r) => { pos.rotateZ(r * Math.PI); }),
      frag.ValueAnimationAction().onStep((a, r) => { pos.locationY(r * 100); })
    ]),
    frag.ValueAnimationAction().onStep((a, r) => { pos.rotateX(r * Math.PI); })
  ]);
```

Note that you should not need the `ParallelAnimationAction` very often. The
example above can be rewritten more efficiently as:

```javascript
const frag = window.frag;

const model = frag.Model();
const obj = frag.SceneObject(model);
const pos = obj.getPosition();

const animation = frag.Animation()
  .sequence([
    frag.ValueAnimationAction().onStep((a, r) => { 
      pos.rotateZ(r * Math.PI);
      pos.locationY(r * 100);
    }),
    frag.ValueAnimationAction().onStep((a, r) => { pos.rotateX(r * Math.PI); })
  ]);
```

## setDuration(gameTicks: int)
Specifies how long this animation will take in game ticks. If you don't call this
function then the duration defaults to 30 game ticks.

## setInterval(gameTicks: int)
Specifies how often the value is updated in game ticks. A lower number will produce
smoother animation at the cost of higher CPU load. If you don't call this function
then the default is 5 ticks.
