# Dynamic Data

Constructs a set of data that can be realized on a [`DynamicSurface`](dynamic-surface.md). This
is most often used to represent terrain, but has other uses.

## Constructor
```javascript
window.frag.DynamicData(engine: Engine, width: int, depth: int)
```

* `engine` is the game engine for your game. It is an instance of the `Engine` class. You can 
  have more than one on a page but more often there is just one that is constructed at the 
  very beginning.
* `width` the number of map tiles in the X direction.
* `depth` the number of map tiles in the Z direction.

Note that for any constructor, you can call this function on the `engine` rather than passing
`engine` as a parameter. In this case the call looks like:

```javascript
engine.DynamicData(width: int, depth: int): DynamicData
```

## get(x: int, z: int): TileData
Use the `get` method to get the data in a specific map tile. This method returns an object
that you can add properties to to represent the state of the map tiles - for example if the
tile has a building on it.

The tile data has the following standard properties:
* `height` is the position of this tile in the Y direction.
* `material` is an instance of the [`Material`](material.md) class.
* `uniforms` is an array of objects having `name`, `type` and `value` properties that you
  can use to set shader uniforms to a different value for each tile. This is useful for
  things like showing map tiles in a selected state, fog of war etc. Using this property
  usually involves creating a [`CustomShader`](custom-shader.md) which is an advanced topic.