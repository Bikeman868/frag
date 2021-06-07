# MeshData
To construct a new mesh call the `MeshData` method, then use
fluent syntax to configure the attributes of the mesh.

Meshes are collections of drawing primitives such as triangles,
triangle strips, triangle fans, lines, line strips and line fans.

After you construct and configure a mesh you can reuse it on many
models with different scaling, positioning and surface appearence.
The mesh itself only defines the shaps of an object in the scene,
and not the color, lighting or texture detail.

## Examples
This is an example of creating a new mesh adding a triangle to it.

```javascript
const frag = window.frag;

const vertices = [
  0, 0, 0, 
  1, 0, 0,
  1, 1, 0];

const mesh = frag.MeshData()
  .name('My mesh')
  .addTriangles(vertices);
```

In this case we only added a single triangle by passing 3 vertex 
coordinates each with an x, y and z value. That's already 9 array
elements just to make one triangle! Don't try to define your meshes
like this.

`MeshData` objects are returned by the various shape building methods
in the framework (for example `window.frag.Cube()`). After calling 
one of these methods, you can change the behaviour of the mesh by 
calling functions like `smoothShading()`

The most common way to get meshes into your game is to draw them
in Blender and load them using a model loader. This not only bring
in the mesh, but also imports all of the animations for each model.

## Mesh data
A mesh must have a set of vertex positions. Everything else is
optional. Methods like `addTriangles` take a variable number of
parameters so that you can pass as much or as little information as 
you like about your mesh.

The other kinds of data are:
* The color of each vertex. You must provide the same number of colors 
  as there are verticies, and each color must be 3 floating point values
  between 0 and 1. If you do not pass any color data then the vertices
  will only be colored by the diffuse texture in the applied material.
  If you set vertex colors and apply a diffuse texture then these will
  add together.
* A UV coordinate for wach vertex. You must provide the same number of 
  UV coordinates as there are verticies. UV coordinates are 2D indexes
  into texture maps. These texture maps can contain colors, depth
  information, attributes that affect lighting etc. If you do not supply
  UV coordinates then the bottom left pixel of the textures will be used
  for all verticies on the mesh.
* A normal vector for each vertex. You must provide the same number of 
  normals as there are verticies. Each normal has an x, y and z component.
  The length of the normal vector should be 1.0. Normal vectors can be
  used in lighting calculations and for displacement maps. If you do not
  supply normals then they can be calculated by the framework as vectors
  that are perpendicular to the surface of the rectangle.
* A tangent vector for each vertex. Tangents are required to perform
  normal map calculations that make the surface appear to have more
  texture detail than it actually has. If you don't provide tangents then
  they will be calculated from the UV coordinates.
* A bitangent vector for each vertex. These can redily be calculated from
  the normal vector and the tangent, or you can supply the values to
  avoid some calculations.

The `MeshData` objects have properties that control which of the missing
data is added by calculation. These properties are all booleans as follows:
* `calcNormals` is true by default but you can turn it off
* `calcTangents` is true by default but needs UV coordinates to work
* `calcBitangents` is false by default on the assumption that bitangemts 
  will be computed in the shader. The Frag shader builder does build shaders
  that compute bitangebts only when needed.


## dispose()
Frees resources consumed by the mesh.

## name(name: string)
Sets the name of the mesh. This is only useful for debugging.

## clear()
Deletes all of the mesh fragments but keeps retains the draw buffer so
that the mesh can still be rendered, it just won't draw anything until
you add some more mesh fragments to it.

## shadeSmooth()
Instructs the mesh to adjust the mesh normals so that coincident vertices
have the same normal vector. This ensures that two verticies in the same
location on the surface of the mesh will be lit the same way making the
obect appear to have a smooth surface.

## shadeFlat()
Instructs the mesh to adjust mesh normals to be perpendicular to the face
of the triangle that they are part of. For trangle strips and triangle fans
this works less well because one vertex can be part of more than one triangle.

The effect of this setting is to make the surface of the object have sudden
changes in lighting at the edge of triangles so that the triangles are more
visible and the surface looks angular.

## textureSmooth()
Instructs the mesh to adjust the mesh UV coordinates so that coincident vertices
have the same UVs. This ensures that two verticies in the same
location on the surface of the mesh will have the same texture.

## textureFlat()
Instructs the mesh to use the original UV coordinates. This can lead to jarring
changes in texture at triangle boundaries, which of course maybe what you want.

## wireframe(wireframe: bool)
This is a useful debugging tool. It makes the mesh draw as lines connecting
the verticies instead of flat surfaces. This allows you to see inside the model,
allows you to see faces that might otherwise be hidden, and can reveal issues
with you mesh geometries.

## drawNormals(length: float, color?: float[])
This is another useful debugging tool. It adds short lines to the mesh that start
at a vertex and go outwards in the direction of the normal vector. This can
be very useful if you are seeing strange lighting effects and you want to
visually check the normal vectors for your model. You can also enable this mode
to see the effect of smooth and flat shading on the normal vectors.

The `length` parameter is the length of the line to draw. If you use the convention
of building models that are 1x1x1 in size and scaling them up to the size required
by the scene, then a value of `0.2` works well.

The optional `color` parameter should be passed as an array of 3 floats for red,
green and blue components of the color. As usual with WebGL floating point colors
are always expressed in the range 0 to 1, i.e. [1,0,0] is bright red.

## addVertexData(vertexData: VertexData)
Adds a fragment of mesh from a pre-prepared `VertexData` object. `VertexData` objects
allow you to define the data needed to create a mesh. It also allows you to 
modify individual verticies, colors, UV coordinates etc and then re-create or
re-populate the mesh.

## addTriangles2D()
Takes function the following parameters:
* verticies: float[]
* colors?: float[]
* uvs?: float[]
* normals?: float[]
* tangents?: float[]
* bitangents?: float[]
Adds a mesh fragment defined by a set of discrete 2-dimensional triangles

## addTriangles()
Takes function the following parameters:
* verticies: float[]
* colors?: float[]
* uvs?: float[]
* normals?: float[]
* tangents?: float[]
* bitangents?: float[]
Adds a mesh fragment defined by a set of discrete 3-dimensional triangles

## addTriangleStrip()
Takes function the following parameters:
* verticies: float[]
* colors?: float[]
* uvs?: float[]
* normals?: float[]
* tangents?: float[]
* bitangents?: float[]

Adds a mesh fragment defined by a set of 3-dimensional triangles where the
first 3 vertices define the first triangle, then each subsequent vertex
adds one more triangle to the strip of triangles.

## addTriangleFan()
Takes function the following parameters:
* verticies: float[]
* colors?: float[]
* uvs?: float[]
* normals?: float[]
* tangents?: float[]
* bitangents?: float[]

Adds a mesh fragment defined by a set of 3-dimensional triangles where the
first vertex defined the center of the fan, the next 2 vertices form a triangle, 
then each subsequent vertex adds one more triangle to the fan of triangles
which all share the first vertex.

## fromBuffer()

Takes function the following parameters:
* buffer: ArrayBuffer - contains binary floating point data
* size: int - pass 2 for 2D and 3 for 3D meshes
* count: int - the number of verticies in the mesh
* primitiveType: int - the WebGL primitive type
* vertexDataOffset: int - offset into the buffer where vertex data starts
* colorDataOffset: int - offset into the buffer where color data starts
* uvDataOffset: int - offset into the buffer where Uv data starts
* normalDataOffset: int - offset into the buffer where normal data starts
* tangentDataOffset: int - offset into the buffer where tangent data starts
* bitangentDataOffset: int - offset into the buffer where bitangent data starts

This is a low-level interface that allows you to supply raw data for the mesh.
This is most suited to loading pre-prepared meshes in binary format and
dumping them directly into the graphics card.