# Sphere

Constructs a cube mesh centered at (0, 0, 0) and extending +/-1 along each axis.

## Constructor
```javascript
window.frag.Sphere(engine: Engine, latitudeFacets: int | undefined, options: object | undefined)
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
engine.Cube(latitudeFacets: int | undefined, options: object | undefined): Mesh
```

## Options
* `color` an array of RGB or RGBA values for the color to assign to each vertex. If
  you don't set this option, the default is to not pass any color data to the shader.
* `longitudeFacets` the number of pieces to break the sphere into in the longitudinal direction.
  The default is double the number of latitude facets.
* `latitudeFacets` overides the `latitudeFacets` parameter just for consistency.
* `longitudeStart` the start angle of the mesh in the longitude direction. Default is 0.
* `latitudeStart` the start angle of the mesh in the latitude direction. Default is 0.
* `longitudeLength` the angular length of the mesh in the longitude direction. Default is 2*PI.
* `latitudeLength` the angular length of the mesh in the latitude direction. Default is PI.
