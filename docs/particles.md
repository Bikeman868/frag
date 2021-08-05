# Particle systems
The particle system allows you to create a large number of meshes dynamically
and have those meshes move according to simple rules of physics and die at the
end of their lifetime.

The particle system is useful for creating effects like fog, smoke, explosions,
and dust thrown up from vehicle wheels. It is very flexible and powerful so many
more unusual effects are also possible. You can also use the particle system
with your own custom shader for virtually unlimited possibilities.

Note that due to limitations in WebGL each particle system can only display
a maximum of 16,384 particles because each particle is defined using 4 verticies
and you can only draw a maximum of 65,536 verticies in each draw call. You can
however add as many particle systems to your scene as your graphics hardware
can handle.

To see the particle system in action, check out the [fireworks sample](../samples/fireworks.html).
It comes close to the 16,384 particle limit and you can easily modify it
to see what happens whent the limit is exceeded.

## Components
To create a particle effect in your game you need these components:
* A particle system object that defines most aspects of the particle appearence.
  The particle system must be added to a scene to display the particles.
* One or more particle emitters. These define quantity of particles as well
  as the speed, direction, spin speed, and color of each particle.
* A shader that is specifically coded to draw particles must be attached to the
  particle system. The Frag framework comes with a 3D and a 2D version of a
  very flexible particle shader. If you have specific needs you can create
  a copy of the built-in shader and customize it to make it more efficient for 
  your specific needs.

## Particle emitters
The Frag framework comes with the following particle emitters out of the box:
* [`MineExplosionEmitter`](reference/mine-explosion-emitter.md) short blast of material shoots up from the ground.
* [`SphericalExplosionEmitter`](reference/spherical-explosion-emitter.md) like a firework bursting in the sky.
* [`SprayEmitter`](reference/spray-emitter.md) sprays particles like a garden hose.
* [`RainEmitter`](reference/rain-emitter.md) produces particles with similar velocity and direction over a horizontal area.

There is also a [`CustomParticleSystem` class](reference/custom-particle-system.md)
that allows you to create many different particle effects without writing 
a particle emitter from scratch. To see how to use the `CustomParticleEmitter` 
take a look at the source code for the other emitter types, they are use
`CustomParticleEmitter` under the hood.

Note that the current position of each particle is calculated by the GPU, so this information
is not available to your JavaScript code. The GPU calculates particle position dynamically from the 
starting position, velocity, acceleration and elapsed time.
