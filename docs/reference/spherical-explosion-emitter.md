# Spherical Explosion Emitter

Objects of this type can be added to a Particle System to generate
particles that burst outward in a sphere from the point of detonation.

## Constructor
```javascript
window.frag.SphericalExplosionEmitter(engine: Engine, position: Array<float>, size: float)

```

* `engine` is the game engine for your game. It is an instance of the `Engine` class. You can 
  have more than one on a page but more often there is just one that is constructed at the 
  very beginning.
* `position` is the position of the explosion relative to the particle system.
* `size` is the size of the explosion expressed as the velocity of particles.

Note that for any constructor, you can call this function on the `engine` rather than passing
`engine` as a parameter. In this case the call looks like:

```javascript
engine.SphericalExplosionEmitter(position: Array<float>, size: float)
```

## Customization
This emitter constructor actually returns an instance of [`CustomParticleEmitter`](custom-particle-emitter.md)
that has been customized. You can call any of the methods of `CustomParticleEmitter` 
on the returned emitter to make additional customizations or override the default
behavior.

## fire(particleSystem: ParticleSystem, duration: int | undefined)
Simulates a spherical explosion. Particles are emitted for 150ms unless you pass a duration 
in ms to the second parameter. Particles live for 3 seconds by default.
