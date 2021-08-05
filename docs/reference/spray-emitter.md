# Spray Emitter

Objects of this type can be added to a Particle System to generate
particles that burst outward in a sphere from the point of detonation.

## Constructor
```javascript
window.frag.SprayEmitter(engine: Engine, position: Array<float>, axis: Array<float>, width: float)

```

* `engine` is the game engine for your game. It is an instance of the `Engine` class. You can 
  have more than one on a page but more often there is just one that is constructed at the 
  very beginning.
* `position` is the position of the explosion relative to the particle system.
* `axis` defines the direction of the spray and is designed for the case where
  one axis has a positive value and the other 2 axes are zero. You can also experiment
  with non-zero values on the other axes to see what effects you can achieve. The non-zero
  axis value defines the speed of the particles that are sprayed.
* `width` defines how narrow or wide the spray of particles is, and is defined as the sideways
  velocity of the particles.

Note that for any constructor, you can call this function on the `engine` rather than passing
`engine` as a parameter. In this case the call looks like:

```javascript
engine.SprayEmitter(position: Array<float>, axis: Array<float>, width: float)
```

## Customization
This emitter constructor actually returns an instance of [`CustomParticleEmitter`](custom-particle-emitter.md)
that has been customized. You can call any of the methods of `CustomParticleEmitter` 
on the returned emitter to make additional customizations or override the default
behavior.

## start(particleSystem: ParticleSystem, duration: int | undefined)
Starts spraying particles. If a `duration` is passed then the spray will stop automatically
after this many ms, otherwise it will continue until you call the `stop()` method.

## stop()
Stops spraying particles.