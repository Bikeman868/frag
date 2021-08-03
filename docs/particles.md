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

If you want to create your own particle based effect, you should take a look
at the [`CustomParticleSystem` class documentation](reference/custom-particle-system.md).
For standard effects like fog, we wrote these effects for you. Here is the 
full list:

NO PRE-BUILT PARTICLE EFFECTS YET ... watch this space.
