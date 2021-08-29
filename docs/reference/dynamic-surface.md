# Dynamic Surface

Constructs a mesh that adapts dynamically to the contents of a [`DynamicData`](dynamic-data.md) 
object. This is most often used to represent terrain, but has other uses.

Note that the dynamic surface is optimized for drawing and scrolling performance. When you
construct a dynamic surface it does as much work as possible in the constructor to minimize
the work needed to scroll, draw and and update the underlying data. The amount of time to
construct, and the amount of memory used by the dynamic surface is proportional to the number
of tiles that are drawn, and is not affected by the amount of data in the `DynamicData` object.

Note that hexagons take up 3x memory and take 3x longer to build because each square is a
paralellogram (2 triangles) and a hexagon is comprised of 3 paralellograms (6 triangles).

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

## Hit testing
To perform a hit test on your scene, you can call the `hitTest()` method of the [`Engine`](engine.md) 
class. If an object is returned by `hitTest`, it has two properties `sceneObject` and `fragment`. When
scene objects are hit, the `sceneObject` property contains the `SceneObject` that was hit, and
`fragment` contains the child object within the model indicating which part of the model was hit.

In the case of `DynamicSurface`, the `sceneObject` property contains the `DynamicSurface` and 
the `fragment` property contains the `DynamicTile` within the surface that was hit. You can tell
what kind of object was hit because dynamic surfaces have a `isDynamicSurface` property that is
always `true`, and dynamic tiles have an `isDynamicTile` property that is always `true`.

## shader(shader: Shader): DynamicSurface
You must call this method to define the shader to use to draw this surface.

## getPosition(): ScenePosition
Call this method to get a scene position object that can be used to scale, rotate and move
the dynamic surface.

## getMesh(): Mesh
Call this method to get a reference to the managed mesh within the dynamic surface. You might
want to do this to alter the mesh characteristics such as smoothing options.

## setOrigin(x: int, z: int): DynamicSurface
Specifies which map tile from the `DynamicData` will be drawn in the bottom left hand corner
of the surface. Defaults to (0, 0) which means that the bottom left corner of the dynamic data
will be drawn at the bottom left corner of the dynamic surface.

## tileAt(x: int, z: int): DynamicTile
You can call this method to access the tiles within the surface. It is very rare that you will want
to do this, because your game should work with the underlying `DynamicData`, and the `DyanmicSurface`
just provides a scrollable view onto this data.

The returned `DynamicTile` has these methods:
* `dynamicData(data: DynamicData)` - change the source of data.
* `x(x: int)` - change the x-coordinate in the underlying data.
* `z(z: int)` - change the z-coordinate in the underlying data.
* `getX(): int` - get the x-coordinate
* `getZ(): int` - get the z-coordinate
* `getData(): object` - returns an element from the  underlying data.
* `getMaterial(): Material` - returns the material used to render this tile.
* `getHeight(): float` - returns the height of this tile.
* `getUniforms()` - returns the custom uniforms for this tile.

## dataModified(): DynamicSurface
Call this method after you make changes in the attached `DynamicData` to have these changes 
reflected in the surface the next time it is drawn. If you don't call this method then these changes
will not be apparent until you call `setOrigin()`.

## createSquares(width: int, depth: int): DynamicSurface
Creates a mesh of squares with the specified width and depth. This would typically be smaller
than the size of the `DynamicData`. You cannot create a mesh of 1000x1000 squares, because
that would be 1,000,000 squares, or 2,000,000 triangles to render on each screen refresh. You can
however create a 1000x1000 `DynamicData` instance and display a small portion of the data at a time
on a `DynamicSurface`. Use the `setOrigin()` method to choose which part of the data is displayed.

Note that squares can also be rectangles, you just need to scale the surface by different scaling
factors in the X and Z directions. The squares extend +/-1 from the center and are therefore width
2 and height 2 before scaling.

## createHexagons(width: int, depth: int, vertical: bool): DynamicSurface
This is similar to the `createSquares` method except that the grid is of hexagons. The `vertical`
parameter switches between alternate columns being offset by half a row, or alternate rows being
offset by half a column. Try both options until you get the kind of hexagons you want.

You cannot create a mesh of 1000x1000 hexagons, because that would be 1,000,000 hexagons, or 6,000,000 triangles to render on each screen refresh. You can however create a 1000x1000 `DynamicData` instance
and display a small portion of the data at a time on a `DynamicSurface`. Use the `setOrigin()` method
to choose which part of the data is displayed.

The hexagons have a radius of 1. This means that horizontally oriented hexagons have a width of 2 and
a height of the square root of 3. For vertically oriented hexagone the width and height are the
other way around.