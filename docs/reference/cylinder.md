# Cylinder

Constructs a cylinder mesh with its axis aligned with the Z-axis.

## Constructor
```javascript
window.frag.Cylinder(engine: Engine, facets: int | undefined, options: object | undefined)
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
engine.Cylinder(facets: int | undefined, options: object | undefined): Mesh
```

## Options
* `color` an array of RGB or RGBA values for the color to assign to each vertex. If
  you don't set this option, the default is to not pass any color data to the shader.
* `sideFacets` is the number of pieces to break the length of the cylinder into. This
  is only really useful if you are distorting the mesh with an armature or height texture.
  Defaults to 1.
* `topRadius` defaults to 1. Set to another value to create a truncated cone. Set to
  0 to create a pointed cone.
* `bottomRadius` defaults to 1. Set to another value to create an inverted truncated 
  cone. Set to 0 to create an inverted pointed cone.
* `drawTop` set to false to omit the end cap on the top of the cylinder.
* `drawBottom` set to false to omit the end cap on the bottom of the cylinder.
