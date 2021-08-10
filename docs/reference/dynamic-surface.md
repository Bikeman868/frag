# Dynamic Surface

Constructs a mesh that adapts dynamically to the contents of a 
[`DynamicData`](dynamic-data.md) object. This is most often used to represent terrain,
but has other uses.

## Constructor
```javascript
window.frag.DynamicSurface(engine: Engine, data: DynamicData): DynamicSurface
```

* `engine` is the game engine for your game. It is an instance of the `Engine` class. You can 
  have more than one on a page but more often there is just one that is constructed at the 
  very beginning.
* `data` an instance of the [`DynamicData`](dynamic-data.md) class.

Note that for any constructor, you can call this function on the `engine` rather than passing
`engine` as a parameter. In this case the call looks like:

```javascript
engine.DynamicSurface(data: DynamicData): DynamicSurface
```
## Example
See the [terrain sample](../../samples/terrain.html) for an example of how to make dynamic terrain.

## getPosition(): ScenePosition
Call this method to get a scene position object that can be used to scale, rotate and move
the dynamic surface.

## getMesh(): Mesh
Call this method to get a reference to the managed mesh within the dynamic surface. You might
want to do this to alter the mesh characteristics such as smoothing options.

## shader(shader: Shader): DynamicSurface
You must call this method to define the shader to use to draw this surface.

## setOrigin(x: int, z: int): DynamicSurface
Specifies which map tile from the `DynamicData` will be drawn in the bottom left hand corner
of the surface.

## dataModified(): DynamicSurface
You can call this method to make changes in the attached `DynamicData` reflected in the
surface the next time it is drawn. If you don't call this method then these changes
will not be apparent until you set the origin.

## createSquares(width: int, depth: int): DynamicSurface
Creates a mesh of squares with the specified width and depth. This would typically be smaller
than the size of the `DynamicData`. You cannot create a mesh of 1000x1000 map tiles, because
that would be 1,000,000 tiles, or 2,000,000 triangles to render on each screen refresh. You can
however create a 1000x1000 `DynamicData` instance and display a small portion of it at a time
on a `DynamicSurface`.

## createHorizontalHexagons(width: int, depth: int): DynamicSurface
This is similar to the createSquares method except that the grid is of hexagons with their
pointy ends oriented left and right.

## createVerticalHexagons(width: int, depth: int): DynamicSurface
This is similar to the createSquares method except that the grid is of hexagons with their
pointy ends oriented up and down.

