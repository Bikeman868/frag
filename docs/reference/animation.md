# Animation
To construct a new animation object call the `Animation` method, then use
fluent syntax to configure the attributes of the animation.

You can optionally pass an object to the `Animation` method to hold
animation state. The `Animation` function will add methods and properties
to the state that you pass to make it into an animation object. When the
animation object is passed tp animation actions you can access these
properties to maintain animation state and even call you own functions.

This object provides the lowest level access to the animation engine.
This is great is you want to do something very custom, but is harder
to use than the layers that exist on top of it.

## Time
The animation engine keeps time in two ways. Game ticks occur at regular
time intervals and frame ticks increment every time the screen is redrawn.

Frag measures the approximate frame refresh rate. You can read this from
`window.frag.fps`.

Game ticks provide smooth animation and precise timing. If the device
CPU/GPU can't keep up with the demands of the game then Frag will skip
some game ticks, this may result in less smooth animation, but animations
will still run for the correct amount of time from start to finish.

You can change the ratio of game ticks to milliseconds in the
Frag framework by assigning a new value to `window.frag.gameTickMs`. 
By default 1 game tick is 10ms. This should not be changed during the game, 
should match the tick speed of the game engine on the back-end server, 
and must be the same for all players in a multi-player scenario.

If you have a back-end server that is counting game ticks then you will want 
to keep them in sync. To do this call `window.frag.correctClock(serverTick)`
passing the game tick from the server. This will slowly speed up or slow down
the game to keep it in sync with the server game time.

## Examples
This is an example of creating and configuring an animation. This
animation will repeat every 5 game ticks for 200 ticks then stop.

```javascript
const frag = window.frag;

const interval = 5;
const limit = 200;
const myAnimation = frag.Animation({ someCounter: 0 })
  .repeatTicks(function(animation, gameTick, frameTick){
    animation.someCounter++;
  }, interval)
  .stopAfter(limit)
  .start();
```

In this example the numbers for `interval` and `stopAfter` are in game
ticks.

## dispose()
Frees resources consumed by the animation.

## repeatTicks(action: function(animation, gameTick, frameTick), interval: int)
Executes a function at regular time intervals. The function will be passed
the animation object, the current game tick and the current frame tick.

The function can set the following properties of the `animation` parameter before
it returns:
* `nextGameTick` specifies the next game tick where this animation should run
* `nextFrameTick` specifies the next frame tick where this animation should run

## repeatFrames(action: function(animation, gameTick, frameTick), interval: int)
Executes a function at regular frame render intervals. See above for details
of the `action` parameter.

## stopAfter(gameTicks: int)
Causes the animation to stop automatically after the specified number of game ticks
the next time it is started.

If you want the animation to stop automatically every time it is started, then
you need to call `stopAfter()` before each call to `start()`.

If the animation is already running when you call the `stopAfter()` method then
it will continue to run, but stop after the specified number of game ticks.

This is good for things like weapon firing actions, explosions etc that have a
limited duration.

## sequence(actions: AnimationAction[], loop: bool)
Configures the animation to run a sequence of animation actions when the animation
is started, and optionally repeat this sequence until the animation is stopped.

The actions that you pass are Javascript objects that have the following shape:
```javascript
{
  duration: 100,
  interval: 10,
  start: function(animation, gameTick),
  stop: function(animation, gameTick),
  action: function(animation, gameTick)
}
```

Every element of this structure is optional.

If the action has a `duration` property this defines how long this step it in the
sequence. If the `duration` property is not provied then it defaults to 100 game ticks.

If the action has an `interval` property this defines how frequently the `action` function
is called during this step in the animation sequence. If the `interval` property is not 
provied then it defaults to 5 game ticks.

If the action has a `start()` function then it is called at the start of this step in the
animation sequence.

If the action has a `stop()` function then it is called at the end of this step in the
animation sequence.

If the action has an `action()` function then it is called repeatedly at `interval` game
ticks whilst this is the active step in the animation sequence.

Note that `Animation` itself has a `start()`, `stop()` and `action()` function, so you can 
take any `Animation` and pass it as one of the steps in the sequence list of some other
`Animation` allowing for nested sequences of actions with sub-sequences. 

The Frag framework contains a number of action objects that you can construct and
pass to the `sequence()` function including `ValueAnimationAction`,
`ParallelAnimationAction` and `KeyframeAnimationAction`.

## perform(action: AnimationAction, loop: bool)
This is exactly like calling the `sequence()` function passing an array of just one action.

## start()
Starts the animation if it is currently stopped.

## stop()
Stops the animation if it is currently running.

