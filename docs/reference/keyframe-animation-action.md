# Keyframe Animation Action

This object provides a mechanism for defining a set of frames like the
frames in a movie, then defining key frames (important or significant frames)
where something happens.

Lets say you create a keyframe animation that has 240 frames and runs at 
24 frames per second. This means that the animation will play for 10 seconds.
Within this animation if you define key points in time (frames) where you want
something to happen, and you can pass a function that will execute at that
time.

This object is an animation action, which means that you must pass it
to the `sequence()` function of an `Animation` object. If you don't
have a sequence, then you can also call the `perform()` function of the
`Animation` to just perform one action.

## Constructor
```javascript
window.frag.KeyframeAnimationAction(engine: Engine)
```

* `engine` is the game engine for your game. It is an instance of the `Engine` class. You can 
  have more than one on a page but more often there is just one that is constructed at the 
  very beginning.

Note that for any constructor, you can call this function on the `engine` rather than passing
`engine` as a parameter. In this case the call looks like:

```javascript
engine.KeyframeAnimationAction()
```

## Examples
This is an example of describing a keyframe animation in which two objects
are moved within the scene to create an animation effect.

Note that this example does not configure the model or the scene object, but
focuses on the `KeyframeAnimationAction` class.

```javascript
const engine = window.frag.Engine().start();

const model = engine.Model();
const objectA = engine.SceneObject(model);
const objectB = engine.SceneObject(model);

const moveUp = function(frame, obj, tick){
  obj.getPosition().moveBy(0, 10, 0);
}

const moveDown = function(frame, obj, tick){
  obj.getPosition().moveBy(0, -10, 0);
}

const animation = engine.Animation()
  .perform(
    engine.KeyframeAnimationAction()
      .setFrames(5, 300)
      .add(0, moveUp, objectA)
      .add(50, moveUp, objectB)
      .add(299, moveDown, objectB)
      .add(299, moveDown, objectA)
  );
```

## setFrames(tickInterval: int, frameCount: int)
Specifies how many game ticks will elapse between animation frames, and how
many frames there are in your animation. Geme ticks detault to 10ms each but 
you can customize this for your game to balance hardware requirements against 
the smoothness of the animations.

tickInterval x frameCount is the number of game ticks that the animation will
run for.

## add(frame: int, action: function(frame, data, tick), data: any)
Adds an action to a specific frame in the animation. You can add multiple
actions to the same frame if you like.

The frame number passed should be in the range 0 to the frame count - 1.

The action function that you pass will be executed on the relevant frame of the
animation. It will be passed the frame number in case you want to attach the
same function to multiple frames, some arbitary data and the current game
tick counter.

The data to pass to the action is whatever you pass as the third argument.
