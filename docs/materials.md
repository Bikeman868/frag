# Materials, textures and shaders
To define how your models look inside the game you have two options:
1. Assign color values to the vertexes in your mesh and enable support
   for colored vertexes in the shader. Tihs will render as a smooth 
   gradient fill between vertexes.
2. Attach a material to each model. Models can be root-level models 
   used to create scene objects or children of these models that
   define the components of the model. How these render depends on the
   textures defined within the material and the shader used to darw them.
   This is the subject of this page.

## Materials
A material is a collection of textures, where a texture is a bitmap. The
textures have names that identify how they were intended to be used.

When materials are applied to models, the texture bitmaps of the material
are sampled at the UV coordinates. UV coordinates can be assigned to 
each vertex in the mesh. UV coordinates are values between 0 and 1 where
(0,0) is the bottom left corner of the texture and (1,1) is the top
right corner of the texture.

## Texture names
You can use any texture names that you like, and define how these affect
the rendered result by writing a custom shader. You can also avoid
writing a shader and use the shader builder in Frag, in which case 
your textures should have these names:
* `roughness` defines how dispersed light is as it reflects of the surface
  of the model. Rough surfaces bounce light in all directions whereas
  smooth surfaces bounce light like a pool ball bouncing off the cushion.
* `glossiness` defines how focussed the light is that is reflected off
  the surface of the model.
* `diffuse` defines the base color or pattern of the material. You can 
  think of this as how you might draw the pattern on a piece of paper.
* `ambient` defines how much of the ambient light is reflected by the
  surface of the model. Typically deep folds or creases should be dark
  because not much light can get down into the fold.
* `emmissive` defines how much light is emmitted from the surface. In
  other words if you put this model in a completely dark room, what
  would you be able to see.
* `normal` defines the angle at which light bounces off the surface. If
  this texture is not supplied, then the surface normal will be perpendicular
  to the curvature of the mesh.
* `height` causes a deformation of the underlying mesh, raising or lowering
  verticies along the direction of the surface normal. This is useful
  when applied to calculated geometries such as cubes or spheres that
  would otherwise be completely smooth.

## Custom textures
If you wan to create your own special effects, you can write your own
shader as described on the [page on the `CustomShader` class](reference/custom-shader.md). In this case you should add a uniform to your shader with the same
name as your texture, and a uniform variable in your shader code that
is the name of the texture prefixed with `u_`.

For example if I wanted to have a stickiness texture, I could add
a uniform variable to my shader program called `u_stickiness` and
add a uniform to the `CustomShader` instance called `stickiness` 
then add a texture to my material called `stickiness`. Rendering a
model with this material and this shader will result in the texture
being passed to the shader when then model was rendered. 