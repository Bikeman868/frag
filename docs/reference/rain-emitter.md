# Rain Emitter

Objects of this type can be added to a Particle System to generate
particles that fall from an area of the sky towards the ground with
similar velocity.

## Constructor
```javascript
window.frag.RainEmitter(engine: Engine, width: float, height: float, velocity: Array, density: int)

```

* `engine` is the game engine for your game. It is an instance of the `Engine` class. You can 
  have more than one on a page but more often there is just one that is constructed at the 
  very beginning.
* `width` is the width of the area that will be rained uponon the x-axis.
* `depth` is the depth of the area that will be rained uponon the z-axis.
* `height` is actually the lifetime of the raindrops in seconds.
* `velocity` is the velocity of rain drops in the x, y and z axes. The y-axis velocity should be negative.
* `density` is the number of raindrops to create on each lifetime cycle defined for the particle system

Note that for any constructor, you can call this function on the `engine` rather than passing
`engine` as a parameter. In this case the call looks like:

```javascript
engine.RainEmitter(width: float, height: float, velocity: Array, density: int)
```

## Customization
This emitter constructor actually returns an instance of [`CustomParticleEmitter`](custom-particle-emitter.md)
that has been customized. You can call any of the methods of `CustomParticleEmitter` 
on the returned emitter to make additional customizations or override the default
behavior.

## start(particleSystem: ParticleSystem, duration: int | undefined)
Starts the rain falling in a particle system and optionally stops after `duration` ms.

## stop()
Stops the rain falling.