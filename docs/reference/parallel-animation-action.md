# Parallel Animation Action

This class provides a mechanism for executing multiple actions in parallel
as part of an animation sequence.

This object is an animation action, which means that you must pass it
to the `sequence()` function of an [`Animation`](animation.md) object. The `Animation` 
object that you pass it to will invoke this action as part of the sequence.

## Constructor
```javascript
window.frag.ParallelAnimationAction(engine: Engine, actions: Action[])
```

* `engine` is the game engine for your game. It is an instance of the `Engine` class. You can 
  have more than one on a page but more often there is just one that is constructed at the 
  very beginning.

Note that for any constructor, you can call this function on the `engine` rather than passing
`engine` as a parameter. In this case the call looks like:

```javascript
engine.ParallelAnimationAction(actions: Action[])
```

## Examples
This is an example of moving an object along the Y axis and rotating it around
the Z axis at the same time, then rotating it about the X axis.

```javascript
const engine = window.frag.Engine().start();

const model = engine.Model();
const obj = engine.SceneObject(model);
const pos = obj.getPosition();

const animation = engine.Animation()
  .sequence([
    engine.ParallelAnimationAction([
      engine.ValueAnimationAction().onStep((a, r) => { pos.rotateZ(r * Math.PI); }),
      engine.ValueAnimationAction().onStep((a, r) => { pos.locationY(r * 100); })
    ]),
    engine.ValueAnimationAction().onStep((a, r) => { pos.rotateX(r * Math.PI); })
  ]);
```

Note that you should not need the `ParallelAnimationAction` very often. The
example above can be rewritten more efficiently as:

```javascript
const engine = window.frag.Engine().start();

const model = engine.Model();
const obj = engine.SceneObject(model);
const pos = obj.getPosition();

const animation = engine.Animation()
  .sequence([
    engine.ValueAnimationAction().onStep((a, r) => { 
      pos.rotateZ(r * Math.PI);
      pos.locationY(r * 100);
    }),
    engine.ValueAnimationAction().onStep((a, r) => { pos.rotateX(r * Math.PI); })
  ]);
```

## setDuration(gameTicks: int): ParallelAnimationAction
Specifies how long this animation will take in game ticks. If you don't call this
function then the duration defaults to 30 game ticks.

## setInterval(gameTicks: int): ParallelAnimationAction
Specifies how often the value is updated in game ticks. A lower number will produce
smoother animation at the cost of higher CPU load. If you don't call this function
then the default is 5 ticks.
