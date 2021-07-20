# Shader

This class constructs a [CustomShader](custom-shader.md) for you so that you do not
have to learn the WebGL shader language. If you need something more specific than
this class prvides, then you can use the [CustomShader](custom-shader.md) directly
instead, but in the case you will need to write the shader code in the special
shader language.

## Constructor
```javascript
window.frag.Shader(engine: Engine)

```

* `engine` is the game engine for your game. It is an instance of the `Engine` class. You can 
  have more than one on a page but more often there is just one that is constructed at the 
  very beginning.

Note that for any constructor, you can call this function on the `engine` rather than passing
`engine` as a parameter. In this case the call looks like:

```javascript
engine.Shader()
```

## Examples
A great example is the `UiShader` that is part of the Frag framework. Its
source code is reproduced below.

```javascript
window.frag.UiShader = function(engine) {
    if (!engine.uiShader) {
        engine.uiShader = window.frag.Shader(engine)
            .name("UI")
            .verticiesXY(-1)  // Renders in xy plane with z = -1
            .matrix2D()       // Transformation matricies are 2D
            .diffuseTexture() // Adds support for diffuse texture mapping
            .compile();       // Compile the shader
    }
    return engine.uiShader;
}
```

## how to use
Call the constructor, then call methods that customize the features that you want.

Once you features are defined you must call the `compile()` method to build
the shader source and compile it on the GPU. The `compile()` method returns
a shader that you can use to render models.

## Default values
If you simply construct a `Shader` without any customizations then call the 
`compile()` method, it will build a shader with the following characteristics:
* Renders models in 3-dimensions
* Renders all parts of the model in black pixels

You can add more features by calling the methods documented below before calling
the `compile()` method. Note that these method all return the shader so that you 
can chain calls together in what as known as a fluent syntax.

## name(name: string): ShaderBuilder
This method sets the name of the shader. You should call this before calling
the `source()` method.

## verticiesXY(z: float): ShaderBuilder
Builds a 2-dimensional shader that renders in the X,Y plane with the Z value
defined by the `z` parameter that you passed in.

## verticiesXZ(y: float): ShaderBuilder
Builds a 2-dimensional shader that renders in the X,Z plane with the Y value
defined by the `y` parameter that you passed in.

## verticiesYZ(x: float): ShaderBuilder
Builds a 2-dimensional shader that renders in the Y,Z plane with the X value
defined by the `x` parameter that you passed in.

## verticiesXYZ(): ShaderBuilder
Builds a 3-dimensional shader. This is the default.

## verticiesNone(): ShaderBuilder
Builds a shader that renders nothing. It can be useful for debugging to 
temporarily turn off all of the models rendered by a particular shader.

## matrix2D(): ShaderBuilder
Makes all matrix attributes and uniforms 3x3 matricies.

## matrix3D(): ShaderBuilder
Makes all matrix attributes and uniforms 4x4 matricies. This is the default.

## matrixNone(): ShaderBuilder
Disables the matricies so that the identity matrix will be used for all 
vertex transformations. Useful only for debugging.

## normals(): ShaderBuilder
Adds a `normal` uniform that will accept a normal map texture. Vectors are sampled from
the normap map texture and used instead of the normal vectors defined by the mesh allowing
for more detail in the lighting than exists in the mesh. The UV coordinates of the vertex 
define which pixel is sampled from the texture.

## colorsRGB(): ShaderBuilder
Adds support for each vertex in the mesh having a red, green and blue value. If no material
is defined for the model then it will be drawn in these colors, otherwise these colors
will be added to the diffuse texture as the basis for the vertex color.

## colorsRGBA(): ShaderBuilder
Adds support for each vertex having a red, green, blue and alpha value. If no material
is defined for the model then it will be drawn in these colors. The alpha controls
transparency but this will only have effect if the `Engine` has transparency turned on.

## diffuseTexture(): ShaderBuilder
Adds a `diffuse` uniform that will accept a diffuse texture. Colors are sampled from
the diffuse texture and added to the vertex color (if any) to define the final color
of each vertex. The UV coordinates of the vertex define which pixel is samples from the
texture.

## emmissiveTexture(): ShaderBuilder
Adds an `emmissive` uniform that will accept an emmissive texture. This texture defines
how much light emmitted from each vertex. The UV coordinates of the vertex define which
pixel is samples from the texture.

## normalMapStandard(): ShaderBuilder
Adds an `normal` uniform that will accept a normal map texture in "standard" format.
This texture defines overrides the normal vector for each vertex taking vectors from
the normal map instead. The UV coordinates of the vertex define which pixel is samples
from the texture.

## normalMapOpenGL(): ShaderBuilder
Adds an `normal` uniform that will accept a normal map texture in "OpenGL" format.
This texture defines overrides the normal vector for each vertex taking vectors from
the normal map instead. The UV coordinates of the vertex define which pixel is samples
from the texture.

## displacementTextureRaised(): ShaderBuilder
Adds a `height` uniform that will accept a displacement texture. This texture
will deform the mesh by moving verticies in the direction of the normal vector.

Also adds a `displacementScale` function to the shader so that you can control the
amount of deformation of the mesh.

## displacementTextureSunken(): ShaderBuilder
Adds a `height` uniform that will accept a displacement texture. This texture
will deform the mesh by moving verticies in a direction opposite to the direction of
the normal vector.

Also adds a `displacementScale` function to the shader so that you can control the
amount of deformation of the mesh.

## displacementTextureSigned(): ShaderBuilder
Adds a `height` uniform that will accept a displacement texture. This texture
will deform the mesh by moving verticies along the direction of the normal vector.
Pixel values in the texture are treated as signed values that can either raise up
or push down the verticies.

Also adds a `displacementScale` function to the shader so that you can control the
amount of deformation of the mesh.

## tangents(): ShaderBuilder
Adds a `tangent` uniform that will be used to get tangent vectors from a texture.

## bitangents(): ShaderBuilder
Adds a `bitangent` uniform that will be used to get bitangent vectors from a texture.

## directionalLightColor(): ShaderBuilder
Adds directional lighting into the lighting model and adds a `lightColor()` method
and a `lightDirection()` method to the shader to control this aspect of the lighting.

## directionalLightWhite(): ShaderBuilder
Adds white directional lighting into the lighting model and adds a `lightDirection()` 
method to the shader to control this aspect of the lighting.

## directionalLightGrey(): ShaderBuilder
Adds dim white directional lighting into the lighting model and adds a `lightDirection()` 
method to the shader to control this aspect of the lighting.

## directionalLightNone(): ShaderBuilder
Turns off directional lighting. This is the default.

## ambientLightBalanced(): ShaderBuilder
Ensures that the directional lighting and the ambient lighting add up to 100% so that
the scene is fully lit.

## ambientLightNone(): ShaderBuilder
Disables ambient lighting.

## ambientLightFixed(): ShaderBuilder
Fixed amount of ambient lighting. Adds an `ambientLight()` method to the shader so that
the color and intensity of the ambient light can be controlled.

## compile(): Shader
Takes all of the values that were previously set and builds a `CustomShader` for you
that has all of the features that you enabled.

