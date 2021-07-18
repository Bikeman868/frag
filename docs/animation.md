# Animation in Frag
Animation is a big topic with many options available, so this document
is provided to give you an overview of what's available and where
you should use one animation technique over another.

The first thing to say about animation is that if you import models
from Blender then the animations that you created in Blender will
be available within your game. This is the best way to make a model
that has moving parts.

## Animation options
Starting with the lowest level and moving up, the options available are
* [`Animation`](reference/animation.md) - is the base engine that everything 
  else is built on. It provides repeatable timing of events and animation
  sequences. Sequences can also be nested, i.e you can add instances of
  `Animation` to another `Animation`.
* [`ValueAnimationAction`](reference/value-animation-action.md) - can be 
  included in an animation sequence and lets you write a function that will
  change something over time
* [`KeyframeAnimationAction`](reference/keyframe-animation-action.md) - can
  be included in an animation sequence and lets you execute specific functions
  at specific keyframes within the animation.
* [`PositionAnimationAction](reference/position-animation-action.md) - can be
  included in an animation sequence and lets you move and rotate scene objects
  and cameras with defined linear speed or angular speed.
* [`ModelAnimation`](reference/model-animation.md) - allows you to add names
  animations to models. Any scene objects that are based in this model will
  have these animations available. This is the type of animation that is
  generated when a model is imported from Blender.

## Animation principals
Time in Frag s mesured in game ticks. The duration of a game tick is configurable
and defaults to 10ms. The fastest animation you can define will update the scene
on every game tick, which is every 10ms, or 100 times per second. This is faster
than you can see with your eyes, and faster than your screen will refresh the image.
You could set game ticks to 1ms and animations change every game tick but that
would hammer the hardware to death and not look any different than if you used
a slower rate. If you have a complex scene running on a small device (like an
older phone) then you should consider trading off some smoothness for some
CPU/GPU cycles and turn down the frequency of the animation updates.

The number of ms per game tick is in `engine.gameTickMs` assuming you created
your game engine with `const engine = window.frag.Engine();`.

Don't use `setInterval` and `setTimeout` if you want the timing to be accurate and
syncrhronized accross the whole game. The `Animation` class will ensure that
animations complete on time even if some steps have to be skipped because
the hardware was overloaded.

## How to schedule something to happen in the future
The best way to do this is with a `KeyframeAnimationAction`. With this class
you can define an interval and actions that occur at those intervals. For
example you can set the interval to 1 second, then specify functions to execute
on the 11th second, 15th second, and 20th second. Since this is an animation action
it can be added into an animation sequence.

If you want this to happen only once (similar to `setTimeout`) then you should
call the `disposeOnStop()` function on the `Animation` instance to avoid having
to manage the lifetime of the animation.

## How do I make something happen at regular intervals
The best way to do this is with the `repeatTicks` function on an `Animation`
instance. Whilst the animation is running your method will be called at
regular intervals.

## How do I make something happen at irregular intervals
The best way to do this is with the `repeatTicks` function on an `Animation`
instance, but assign a value to the animation object's `nextGameTick` property
before returning from your method. In this way your function can decide
when it next wants to run on a call by call basis.

## How do I make a value change smoothly over time
The best way to do this is with the `ValueAnimationAction`. This action can
be added to an animation sequence, and when it runs it will call your function
passing a floating point ratio that is 0 at the start of the animation and
1 at the end of the animation. You can multiply this ratio by the range you
want to transition over and add the offset to get a value to set. For example
if you are setting a color and you calculate `Math.floor(ratio * 128) + 127` 
this will yield a number between 127 and 255.