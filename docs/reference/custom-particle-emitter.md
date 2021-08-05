# Custom particle emitter

This class is a very flexible particle emitter that is used to create all of the
various particle effects that are available in the framework. If one of the build-in
particle emitters does not provide what you need then you can use the `CustomParticleEmitter`
directly. See the [fireworks sample](../../samples/fireworks.html) for a working example 
to study.

Note that the other particle emitters return a customized instance of `CustomParticleEmitter`
hence all of the methods described here can be used on any particle emitter to slightly
alter its default behavior.

## Constructor
```javascript
window.frag.CustomParticleEmitter(engine: Engine)
```

* `engine` is the game engine for your game. It is an instance of the `Engine` class. You can 
  have more than one on a page but more often there is just one that is constructed at the 
  very beginning.

Note that for any constructor, you can call this function on the `engine` rather than passing
`engine` as a parameter. In this case the call looks like:

```javascript
engine.CustomParticleEmitter()
```

## dispose(): void
Call the `dispose` method to release any resources consumed by the particle emitter.

## name(name: string): CustomParticleEmitter
You can call the `name` method to set the name of the particle emitter. This is useful
for debugging, especially when you set the `debugParticles` property of the `engine`
to `true`.

You can also call the `getName()` method to retrieve the current name.

## adjust(function: Function(particle: Particle))
You can call the `adjust` method of `CustomParticleEmitter` passing a function. Whenever
a new particle is birthed it will be passed to this function for any last minute
calculations on the particle properties - for example adjusting the velocity based on
the size.

## createParticle(): Particle
You can use this function to create particles using the configuration of this `CustomParticleEmitter`.
This is particularly useful of you want to override the `birthParticles` method and take over
how particles are birthed. For an example of this see the source code for the
`SphericalExplosionEmitter` class.

## birthRate(min: int, max: int)
Call this method to specify how many particles will be birthed on each lifetime cycle of the
particle system. The frequency of lifetime cycles can be configured in the particle system.

## Naming conventions
The `CustomParticleEmitter` has a large number of methods that you can call to customize
how particles are created. These methods for setting particle behaviours are in pairs, and
are named the same as the particle property that they set.

For example particles have a `lifetime` property which contains their lifetime in seconds.
The `CustomParticleEmitter` has a corresponding `lifetime` method and a `lifetimeRange`
method. The `lifetimeRange` method takes two parameters which are the minimim value and
the maximum value for this property. For example calling `lifetimeRange(10, 15)` means that
particles will randomly live for between 10 and 15 seconds. The `lifetime` method of
`CustomParticleEmitter` must be passed a function that will return the lifetime of
newly birthed particles; which allows you to define whatever particle lifetime algorithm
you want.

This pattern is repeated for the following particle properties:
* `lifetime` defines the particle lifetime in seconds.
* `frameStart` defines the frame from the particle system texture that is painted onto
  the surface of the particle at the start of its lifetime.
* `spinStart` the initial rotation of the particle around its normal vector
* `spinSpeed` the rate at which the particle spins around its normal vector
* `startSize` the initial size of the particle.

There is a similar pattern for particle properties that are arrays. The only difference
is that the method that sets the range takes two arrays for the min and max value. For 
example patricles have a position property that is an array containing x, y and z values.
The `positionRange` method of `CustomParticleEmitter` takes a minimum and maximum
position each of which are arrays.

This pattern is repeated for the following particle properties:
* `position` the starting position of the particle as a 3 element array.
* `velocity` the initial speed and direction of the particle as a 3 element array.
* `acceleration` the acceleration of the particle as a 3 element array.
* `orientation` the initial orientation of the particle as a quaternion in a 4 element array.
* `color` the particle color is multiplied by the ramp and texture colors defined for the
  paticle system. Color is a 4 element array of floats between 0 and 1.

The `endSize` property is the odd one out, because the `endSize` function that you supply
will be passed the value of the particles `startSize` so that you can have a consistent
amount of growth in the size of the particle if you like. Also, instead of having a
`startSizeRange` and `endSizeRange`, there is just a `sizeRange` method that takes
4 parameters, the min start size, max start size, min increase in size and the max
increase in size. 

## Random numbers
The `CustomParticleEmitter` has a `random` function that sets the random number
generator for this particle emitter. By default it is set to `Math.random`.

The `CustomParticleEmitter` also has a `distribution` function that sets the
probability distribution function. By default the probability distribution is
linear, in other words all values between the minimum and maximum value are
equally likely.

If you set a custom distribution function then it will be passed the following
parameters:
* `random` the output of the random number generator. Floating point value between 0 and 1.
* `range` the span of values from minimum to maximum.
* `middle` the mid point value.
* `kind` the type of particle property. This can be one of the following strings: 
  `lifetime`, `position`, `velocity`, `acceleration`, `orientation`, `color`, `alpha`, 
  `size`, `frame`, `spin` or `rate`.

Your distribution function must return a value between `(middle - range / 2)` 
and `(middle + range / 2)`

The `CustomParticleEmitter` also has a `randomValue` function that returns a random
value using the random number generator and the distribution function. It takes the
following parameters:
* `range` the span of values from min to max.
* `middle` the mid point of the span of values.
* `kind` as defined for the distribution function.

You can use this `randomValue` function in your custom emitter functions.
