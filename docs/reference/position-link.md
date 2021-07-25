# PositionLink

Creates an invisible link between two objects in your scene so that one mimics the
actions of the other. You can choose exactly which attributes are mimiced and you
can add an offset.

## Constructor
```javascript
window.frag.PositionLink(engine: Engine)
```

* `engine` is the game engine for your game. It is an instance of the `Engine` class. You can 
  have more than one on a page but more often there is just one that is constructed at the 
  very beginning.

Note that for any constructor, you can call this function on the `engine` rather than passing
`engine` as a parameter. In this case the call looks like:

```javascript
engine.PositionLink()
```

## Examples
This is an example of linking two objects together so that the second hovers
50 units above the first.

```javascript
const engine = window.frag.Engine().start();
const scene = engine.Scene();
const model = engine.Model();

const object1 = engine.SceneObject(model);
const object2 = engine.SceneObject(model);

scene.addObject(object1);
scene.addObject(object2);

const link = engine.PositionLink()
    .locationOffset([0, 50, 0])
    .dest(object2)
    .source(object1);

```

Note that if you do not call any of the offset functions then no 
position information will be transferred

## dispose()
Frees resources consumed by the Position Link and disconnects the objects.

## source(source: SceneObject | ScenePosition | Camera | undefined): PositionLink
Specifies where to copy position information from. The link will subscribe
to changes in position and only update the destinatino when the source
position changes.

You can change the source any time to start getting position information
from a different object. You can also call this function with no parameters 
to stop propogating position changes.

## dest(source: SceneObject | ScenePosition | Camera | undefined): PositionLink
Specifies what to update with changes in position.

You can change the destination any time to push position changes to a different
object. You can also call this function with no parameters to stop propogating
position changes.

## locationOffset(offset: Array<float | undefined> | undefined): PositionLink
Tells the position link to copy location data from source to destination, adding
an offset along the way. You can also omit the `source` parameter to stop
copying location data.

The offset parameter must be an array of 3 elements for the X, Y and Z axes
respectively. Each array element can be a floating point number or `undefined`
where `undefined` means do not copy this axis location.

For example:
```javascript
link.locationOffset([10, undefined, undefined]);
```
Means take the X location of the source, add 10 and store this in the X location
of the destination. Do not change the Y or Z axes in the destination.

The location offset defaults to `undefined` so no location data is copied
across by default.

## scaleOffset(offset: Array<float | undefined> | undefined): PositionLink
Tells the position link to copy scale data from source to destination, multiplying
by an offset along the way. You can also omit the `source` parameter to stop
copying scale data.

The offset parameter must be an array of 3 elements for the X, Y and Z axes
respectively. Each array element can be a floating point number or `undefined`
where `undefined` means do not copy this axis scale.

For example:
```javascript
link.scaleOffset([1.5, undefined, undefined]);
```
Means take the X scale of the source, multiply it by 1.5 and store this in the X scale
of the destination. Do not change the Y or Z axes in the destination.

The scale offset defaults to `undefined` so no scale data is copied
across by default.

## rotationOffset(offset: Array<float | undefined> | undefined): PositionLink
Tells the position link to copy rotation data from source to destination, adding
an offset along the way. You can also omit the `source` parameter to stop
copying rotation data.

The offset parameter must be an array of 3 elements for the X, Y and Z axes
respectively. Each array element can be a floating point number or `undefined`
where `undefined` means do not copy this axis rotation.

For example:
```javascript
link.locationOffset([undefined, Math.PI / 2, undefined]);
```
Means take the Y axis rotation of the source, add a quarter turn and store this
in the Y rotation of the destination. Do not change the X or Z axes in the 
destination.

The rotation offset defaults to `undefined` so no rotation data is copied
across by default.
