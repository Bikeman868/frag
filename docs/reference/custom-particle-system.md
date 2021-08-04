# Custom particle system

This class implements the particle system and it can be used to create custom
particle effects. See the [fireworks sample](../../samples/fireworks.html) for
a working example to study.

## Constructor
```javascript
window.frag.CustomParticleSystem(engine: Engine, is3d: bool | undefined, shader: Shader | undefined)
```

* `engine` is the game engine for your game. It is an instance of the `Engine` class. You can 
  have more than one on a page but more often there is just one that is constructed at the 
  very beginning.
* `is3d` pass false here to get a 2-dimensional particle system.
* `shader` creating a shader to work with the particle system is an advanced topic. If you
  are determined to do this then start from a copy of `ParticleShader2D` or `ParticleShader3D`.
  In the non-minified version of Frag there is a `ParticleShaderDebug` class that you can pass
  here. This draws all particles in red, and helps to isolate issues with birthing and positioning
  particles from issues with color and transparency.

Note that for any constructor, you can call this function on the `engine` rather than passing
`engine` as a parameter. In this case the call looks like:

```javascript
engine.CustomParticleSystem(is3d: bool | undefined, shader: Shader | undefined)
```

## dispose(): void
Call the `dispose` method to release any resources consumed by the particle system.

## name(name: string): CustomParticleSystem
You can call the `name` method to set the name of the particle system. This is useful
for debugging, especially when you set the `debugParticles` property of the `engine`
to `true`.

You can also call the `getName()` method to retrieve the current name.

## getPosition(): ScenePosition
Call this method to obtain a [`ScenePosition`](scene-position.md) instance that you
can use to move, scale and rotate the particle system. All emitters within the 
particle system are children, so their position, size and orientations are relative
to the particle system itself.

## disable(): CustomParticleSystem
Call this method to temporarily remove the particle system from the rendered output
in the case where the particles are not visible from the camera perspective.

## enable(): CustomParticleSystem
Call this to re-enable the particle system after having disabled it.

## rampTexture(texture: Texture): CustomParticleSystem
The ramp texture defines how particle colors (including transparency) varies over the
lifetime of the particle. The width of the texture should be a power of 2 and the
height of the texture should be 1 pixel.

When each particle is newly birthed it will take values from the left end of the
ramp texture and as it dies it will take values from the right side of the texture.
The result of sampling this texture is multiplied by the `color` property of the
particle and the value sampled from the `colorTexture` to get the final pixel color.

If you do not call this method then a default texture will be used that fades
the particle to transparent over its lifetime.

## colorTexture(texture: Texture): CustomParticleSystem
The color texture defines the visual appearence of the particle. If you only have
1 frame, then this texture should be square. Using a single pixel will make the
particle be the same color all over.

If you define multiple frames in the particle system then you should place the
image you want to draw on the particle for each frame next to each other horizontally
within the texture bitmap. The width of each frame tile within the texture
should be the same as the height of the texture, and the overall width and height
should be a power of 2.

If you do not call this method then a default texture will be used that draws
the particles in opaque white. Note that this is not the final color of the particle
because this color value is multiplied by a sample from the ramp texture and the
`color` property of the particle.

## lifetimeGameTickInterval(interval: int): CustomParticleSystem
Configures how frequently the particle system will manage particle lifetimes. Using
a lower value will make particles create more smoothly as the cost of higher
CPU utilization. The default is 10 game ticks, which is 100ms with the default
configuration.

## velocity(value: float[]): CustomParticleSystem
Adds a velocity to all particles making them all move in a particular direction.
The value is in world units per second.

## acceleration(value: float[]): CustomParticleSystem
Adds acceleration to all of the particles. This is often used to simulate the
effect of gravity. The value is in world units per second squared.

## timeRange(seconds: float): CustomParticleSystem
The particle animation effect will be repeated every this many seconds. To disable
repeating set this to a large number. The default is 99999999 seconds.

## timeOffset(seconds: float): CustomParticleSystem
Delays the start of the particle's lifetime after it is birthed.

## numFrames(frameCount: int): CustomParticleSystem
Breaks the `colorTexture` into tiles aranged horizontally and plays them
sequentially on the surface of the particle throughout its lifetime.

## frameDuration(seconds: float): CustomParticleSystem
Defines how long each frame plays for on the surface of the particle.

## addEmitter(emitter: object): CustomParticleSystem
Adds a particle emitter to the particle system. The emitter will be called
periodially to see if it wants to birth some new particles, and it can
be involved in killing particles before the end of their lifetime if it wants.

The particle emitter can be any object with the following methods:

### isDead(particle: Particle) bool
The emitter can optionally implement this method to allow it to kill
particles early, for example if they go outside a prescribed area.

### birthParticles(particleSystem: CustomParticleSystem, time: float): Particle[] | null | undefined
The emitter must implement this method and return an array of newly created
particles. Each particle can have any of the following properties:
* `lifetime` is how long the particle will live in seconds. The default is 5.
* `position` is an array of x, y and z coordinates ralative to the position of the
  particle system. The dafault value is `[0, 0, 0]`.
* `velocity` is an array of x, y and z initial velocity of the particle. The
  velocity of the particle system will be added to this value, and the particle
  might accelerate over its lifetime. The default is `[0, 0, 0]`.
* `acceleration` is an array of x, y and z acceleration of the particle. The
  acceleration of the particle system will be added to this value. The default 
  is `[0, 0, 0]`.
* `orientation` is an array of x, y, z and w direction expressed as a Quaternion.
  The [`window.frag.Quaternion`](quaternion.md) class can help you to construct
  the Quaternion you need. The default is `[0, 0, 0, 0]`.
* `color` is the color of the particle. This color value is multiplied by a
  sample from the `rampColor` and a sample from the `colorTexture` to arrive
  at the final color for each pixel drawn for the particle.
* `startSize` is the size of the particle at the start of it's lifetime.The
  default value is 1.0.
* `endSize` is the size of the particle at the end of it's lifetime. The
  default value is `startSize`.
* `frameStart` defines which frame from the `colorTexture` will be drawn
  on the particle at the start of it's life. The default is 0.
* `spinStart` is the angle of rotation at the start of the particle's life.
  The particle will rotate around its normal vector. The default is 0.
* `spinSpeed` is the rate of rotation about the normal vector in radians
  per second. The default is 0.

## removeEmitter(emitter: object): CustomParticleSystem
Removes an emitter from the particle system so that it will not birth any
new particles. Existing particle birthed by this emitter will continue to
exist until the end of their lifetime.
