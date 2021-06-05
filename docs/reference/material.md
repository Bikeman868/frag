# Material
To construct a new material object call the `Material` method, then use
fluent syntax to configure the attributes of the material.

Materials are a collection of textures

## Examples
This is an example of creating a new material and assigning some new
textures to it. You can also share textures accross materials, but in
this case you should take care to ensure that marerials are configures
to not dispose of the textures.

```javascript
const frag = window.frag;

const material = frag.Material()
  .name('My material')
  .setTexture("diffuse", Texture().fromUrl(0, 'diffuse.jpg'))
  .setTexture("emmissive", Texture().fromUrl(0, 'emmissive.jpg')
  .setTexture("normal", Texture().fromUrl(0, 'normal.jpg')
  .disposeTextures(true);
```

## dispose()
Frees resources consumed by the material. If the material is configured
to displse of textures, then all textures referenced by the material will
be disposed.

## disposeTextures(dispose: bool)
If the material is configured to dispose of textures then it will
dispose any textures that are no longer used by the material.

## name(name: string)
The name function sets the name of the material. This is only useful for
debugging purposes, the framework does not use the material name.

## setTexture(type: string, texture: Texture)
Assigns a texture to the material. If there is already a texture of this
type bound to the material then it is replaced. When textures are replaced
like this, if the material is configured to dispose textures then the
textures that are no longer in use are disposed.

The `type` parameter should match the name of a uniform on the shader
that will be used to draw models painted with this texture. You can
write your own shaders with whatever uniforms that you like, and bind
textures to those uniforms for each model by assigning textures to the
materials.

For example if I write a shader that has a `diffuse` uniform, and I
add 'diffuse' textures to my materials, then those textures will be bound
to the `diffuse` uniform on the shader when model painted with this
material are drawn.

For a list of the uniforms supported by each of the built-in shaders, consult
the shader's documentation.

Binding additional textures to the material that are not supported by
the shader is allowed. Failing to bind textures to materials that are 
implemented by the shader can cause strage side-effects because the
uniform will retain the value set by the prior draw operation.