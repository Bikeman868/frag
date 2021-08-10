# CustomShader

This object provides a way to execute code on the GPU instead of the CPU.
The GPU does not understand Javascript, so you must write the code in 
the [WebGL shader language](http://learnwebgl.brown37.net/12_shader_language/documents/_GLSL_ES_Specification_1.0.17.pdf).

To create a shader you need to write two programs in the WebGL shader language. The 
vertex shader runs for each vertex in each mesh that is visible in your scene. The
fragment shader runs for every pixel that is drawn onto the screen. This whole thing
repeats for every screen refresh.

To make you game have a high refresh rate you need to minimize the number of vertexes
in the model (the number of times the vertex shader has to run), minimize the number
of pixels that are drawn to the screen (the number of times the fragment shader has to 
run), or reduce the complexity of the vertex shader and fragment shader code.

Other factors that greatly impact frame rate are the number of textures and the size of
those textures. To accomodate low end devices like older phones, you will have to 
compromise on the graphics. You could also use different shaders and different asset
packages for low-end and high-end devices.

## Constructor
```javascript
window.frag.CustomShader(engine: Engine, is3d: bool | undefined)

```

* `engine` is the game engine for your game. It is an instance of the `Engine` class. You can 
  have more than one on a page but more often there is just one that is constructed at the 
  very beginning.
* `is3d` pass `false` if this shader code is designed to work with 2-dimensional models.
  For 3-dimentional models you can pass `true` or omit this parameter.

Note that for any constructor, you can call this function on the `engine` rather than passing
`engine` as a parameter. In this case the call looks like:

```javascript
engine.CustomShader(is3d: bool | undefined)
```

## Examples
A great example is the `FontShader` that is part of the Frag framework. Its
source code is reproduced below.

```javascript
window.frag.FontShader = function(engine) {
    if (engine.fontShader) return engine.fontShader;
    
    const vertexShader = 
        "attribute vec4 a_position;\n" +
        "attribute vec2 a_texcoord;\n" +
        "uniform mat4 u_clipMatrix;\n" +
        "varying vec2 v_texcoord;\n" +
        "void main() {\n" +
        "  gl_Position = u_clipMatrix * a_position;\n" +
        "  v_texcoord = a_texcoord;\n" +
        "}";

    const fragmentShader = 
        "precision mediump float;\n" +
        "uniform sampler2D u_diffuse;\n" +
        "uniform vec4 u_fgcolor;\n" +
        "uniform vec4 u_bgcolor;\n" +
        "varying vec2 v_texcoord;\n" +
        "void main() {\n" +
        "  vec4 texture = texture2D(u_diffuse, vec2(v_texcoord.x, 1.0 - v_texcoord.y));\n" +
        "  gl_FragColor = mix(u_bgcolor, u_fgcolor, length(texture.rgb));\n" +
        "}\n";

    engine.fontShader = frag.CustomShader(engine)
        .name("Font")
        .source(vertexShader, fragmentShader)
        .attribute("position")
        .attribute("texcoord")
        .uniform("clipMatrix")
        .uniform("bgcolor", "4fv", [1, 1, 1, 1])
        .uniform("fgcolor", "4fv", [0, 0, 0, 1])
        .uniform("diffuse");
    return engine.fontShader;
}
```

## name(name: string): CustomShader
This method sets the name of the shader. You should call this before calling
the `source()` method.

## getName(): string
Returns the name of this shader

## source(vertexShaderSource: string, fragmentShaderSource: string): CustomShader
You must call this method to pass the source code for the vertex shader
and fragment shader before defining attributes and uniforms.

## onBind(function: Function(gl)): CustomShader
Specifies a function to call whenver this shader is bound to the graphics pipeline.
This happens just before the shader is used to draw a model. The WebGL context is
passed to your function so that you can work with the graphics pipeline prior to
the render operation.

## onUnbind(function: Function(gl)): CustomShader
Specifies a function to call whenever this shader is unbound from the graphics
pipeline. This happens right after completion of drawing a model. The WebGL context is
passed to your function so that you can clean up and changes to graphics pipeline.

## attribute(name: string): CustomShader
Adds a property to the `attributes` property of the shader that provides access to
an attribute variable within the vertex shader program. This variable within your
shader code must match the `name` parameter with an `a_` prefix. See the example
above to see how this works.

Other parts of the Frag framework look for attributes with specific names and bind
certain kinds of information to them. If you want your shader to work with the 
framework you must use this naming convention.

Attributes are bound to data buffers which supply a different value to the vertex
shader for every vertex in the model that is being drawn.

The standard attribute names are:
* `position` the x, y and z position of the vertex
* `color` the r, g, b and a color of the vertex. Range 0..1
* `texcoord` the u and v coordinate on all texture bitmaps for this vertex. Range 0..1
* `normal` the x, y and z direction of the normal vector at this vertex
* `tangent` the x, y and z direction of the tangent vector at this vertex
* `bitangent` the x, y and z direction of the bi-tangent vector at this vertex

## uniform(name: string, glType: string | undefined, initialValue: any | undefined): CustomShader
Adds a property to the `uniforms` property of the shader that provides access to
a uniform variable within the vertex shader or fragment shader program. This variable
within your shader code must match the `name` parameter with a `u_` prefix. See the 
example above to see how this works.

If you pass a `glType` parameter then a set of functions will be added to the shader
based on the name of the uniform as follows:
* `{uniform}(value)` sets the value of this uniform. The `glType` string defines a 
  data type that must match the data type of the uniform variable in your shader code.
  The value that you pass here will be sent to the GPU whenever this shader is used
  to draw mesh fragments.
* `override{Uniform}(value)` is used by the drawing pipeline to override the value of
  the uniform for a specific fragment. If you want to override uniforms per fragment
  and did not set the `glType` property here, then you must specify the data type
  in the fragment override.
* `restore{Uniform}()` is used by the drawing pipeline to restore the original value
  of the uniform if there was a fragment override in effect. If you do not specify
  the `glType` of the uniform then this restore method will be unavailable and the
  drawing pipeline will not restore the uniform after rendering the fragment.

For example if your uniform is called "color" then the GLSL variable must be called
`u_color` and the shader will have functions called `color()`, `overrideColor` and
`restoreColor`.

The first character of `glType` is a number between 1 and 4 that specifies how many 
dimensions there are to the value. For example if this was a r, g, b color value you
would use a value of 3.

The second letter of `glType` is the letter `i` for integer or `f` for floating point.

The `glType` string can optionally have a `v` suffix indicating that the value is
passed as an array rather than discrete parameters.

If you passed a `glType` parameter then you can also pass `initialValue` that
defines the value of this uniform to begin with. The type and format of this
parameter must match `glType`.

Other parts of the Frag framework look for uniforms with specific names and bind
certain kinds of information to them. If you want your shader to work with the 
framework you must use this naming convention.

Uniforms are bound to static values that are the same for every vertex
in the model and every pixel that that is drawn to the screen.

The standard uniform names are:
* `clipMatrix` a matrix that transforms points from model space to screen pixels
* `modelMatrix` a matrix that transforms points from model space to world coordinates

In addition to these standard names, you can define a uniform that has the same 
name as a texture, and that texture will be bound to that uniform during render
operations.
