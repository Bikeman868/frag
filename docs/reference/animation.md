# Animation

This object provides the lowest level access to the animation engine.
This is great if you want to do something very custom, but is harder
to use than the layers that exist on top of it.

## Constructor
```javascript
window.frag.Animation(engine: Engine, state: Object | undefined)

```

* `engine` is the game engine for your game. It is an instance of the `Engine` class. You can 
  have more than one on a page but more often there is just one that is constructed at the 
  very beginning.
* `state` is an optional object that you can use to maintain state associated with the
  animation. The constructor will add methods and properties to the state that you pass 
  to make it into an animation object. When the animation object is passed to animation 
  actions you can use its properties and methods to maintain animation state.

Note that for any constructor, you can call this function on the `engine` rather than passing
`engine` as a parameter. In this case the call looks like:

```javascript
engine.Animation(state: Object | undefined)
```

## Time
The animation engine keeps time in two ways. Game ticks occur at regular
time intervals and frame ticks increment every time the screen is redrawn.

Frag measures the approximate frame refresh rate. You can read this from
`engine.fps`.

Game ticks provide smooth animation and precise timing. If the device
CPU/GPU can't keep up with the demands of the game then Frag will skip
some game ticks, this may result in less smooth animation, but animations
will still run for the correct amount of time from start to finish.

You can change the ratio of game ticks to milliseconds in the
Frag framework by assigning a new value to `engine.gameTickMs`. 
By default 1 game tick is 10ms. This should not be changed during the game, 
should match the tick speed of the game engine on the back-end server, 
and must be the same for all players in a multi-player scenario.

If you have a back-end server that is counting game ticks then you will want 
to keep them in sync. To do this call `engine.correctClock(serverTick)`
passing the game tick from the server. This will slowly speed up or slow down
the game to keep it in sync with the server game time.

## Examples
This is an example of creating and configuring an animation. This
animation will repeat every 5 game ticks for 200 ticks then stop.

```javascript
const engine = window.frag.Engine().start();

const interval = 5;
const limit = 200;
const myAnimation = engine.Animation({ someCounter: 0 })
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

## repeatTicks(action: function(animation, gameTick, frameTick), interval: int): Animation
Executes a function at regular time intervals. The function will be passed
the animation object, the current game tick and the current frame tick.

The function can set the following properties of the `animation` parameter before
it returns:
* `nextGameTick` specifies the next game tick where this animation wants to run
* `nextFrameTick` specifies the next frame tick where this animation wants to run

## repeatFrames(action: function(animation, gameTick, frameTick), interval: int): Animation
Executes a function at regular frame render intervals. See above for details
of the `action` parameter.

## stopAfter(gameTicks: int): Animation
Causes the animation to stop automatically after the specified number of game ticks.
This comes into effect the next time it is started.

If you want the animation to stop automatically every time it is started, then
you need to call `stopAfter()` before each call to `start()`.

If the animation is already running when you call the `stopAfter()` method then
it will continue to run, but stop after the specified number of game ticks.

This is good for things like weapon firing actions, explosions etc that have a
limited duration.

## sequence(actions: AnimationAction[], loop: bool): Animation
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

Everything in this object is optional, so for example you can just pass the `action` 
function if that's all you want.

If the action has a `duration` property this defines how long this step it in the
sequence. If the `duration` property is not provied then it defaults to 100 game ticks.
The `start()` function can set the `duration` property before it returns.

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
`ParallelAnimationAction`, `PositionAnimationAction`, `RepeatAnimationAction` and
`KeyframeAnimationAction`.

## perform(action: AnimationAction, loop: bool): Animation
This is exactly like calling the `sequence()` function passing an array of just one action.

## start(): Animation
Starts the animation if it is currently stopped.

## stop(): Animation
Stops the animation if it is currently running.

## disposeOnStop(dispose: bool): Animation
Calling this method on an animation will make the animation dispose of itself as soon as
the animation has completed. This is useful in situations where we want a vehicle to move
to a specific location and stop when it gets there. It's unlikely that we will need that
exact same animation again in the future, so we can just fire and forget by setting the
auto-dispose.