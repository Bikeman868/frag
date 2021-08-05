# Mine Explosion Emitter

Objects of this type can be added to a Particle System to generate
particles that erupt from the ground as if a mine has been detonated.

## Constructor
```javascript
window.frag.MineExplosionEmitter(engine: Engine, position: Array<float>, size: float)

```

* `engine` is the game engine for your game. It is an instance of the `Engine` class. You can 
  have more than one on a page but more often there is just one that is constructed at the 
  very beginning.
* `position` is the position of the explosion relative to the particle system.
* `size` is the size of the explosion expressed as the velocity of particles in the center of the explosion.

Note that for any constructor, you can call this function on the `engine` rather than passing
`engine` as a parameter. In this case the call looks like:

```javascript
engine.MineExplosionEmitter(position: Array<float>, size: float)
```

Note that this emmitter expects that the y-axis is up and that the particle system
defines gravity as a negative acceleration on the y-axis. If you want this effect
in a different orientation then you can rotate the entire particle system to any
orientation you like.

## Customization
This emitter constructor actually returns an instance of [`CustomParticleEmitter`](custom-particle-emitter.md)
that has been customized. You can call any of the methods of `CustomParticleEmitter` 
on the returned emitter to make additional customizations or override the default
behavior.

## fire(particleSystem: ParticleSystem, duration: int | undefined)
Simulates a mortar explosion. The effect lasts 0.5 seconds unless you pass a duration 
in ms to the second parameter.
