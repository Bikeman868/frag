# Disc

Constructs a mesh that is circular in the XY plane. The disc will have its center
 at (0, 0, 0) and extend to +/-1 in the X and Y direction. All verticies will have Z=0.

## Constructor
```javascript
window.frag.Disc(engine: Engine, facets: int | undefined, options: object | undefined)
```

* `engine` is the game engine for your game. It is an instance of the `Engine` class. You can 
  have more than one on a page but more often there is just one that is constructed at the 
  very beginning.
* `facets` the number of pieces to break the shape into. More pieces will give you smoother
  curves but more verticies. The vertex shader code is executed for every vertex in the scene
  so the number of verticies directly impacts rendering speed and frame rate.
* `options` this object can have properties to configure the options on this shape. See below.

Note that for any constructor, you can call this function on the `engine` rather than passing
`engine` as a parameter. In this case the call looks like:

```javascript
engine.Disc(facets: int | undefined, options: object | undefined): Mesh
```

## Options
* `color` an array of RGB or RGBA values for the color to assign to each vertex. If
  you don't set this option, the default is to not pass any color data to the shader.
  