# SceneObject

Scene objects are the things that you can add and remove from a scene to define
what should be rendered when the scene is drawn. A scene object is usually be based on
a model. The model defines exactly what this scene object will look like in terms
of shape and surface appearence. The scene object defines its size, position and orientation 
within the scene.

Scene objects have an animation state that is specific to each scene object, so 
each scene object can be animated independently from other scene objects. The animations
that are available and the ways in which the animations affect the appearence is
defined by the model that this scene object is based on.

## Constructor
```javascript
window.frag.SceneObject(engine: Engine, model: Model | undefined)
```

* `engine` is the game engine for your game. It is an instance of the `Engine` class. You can 
  have more than one on a page but more often there is just one that is constructed at the 
  very beginning.
* `model` an instance of the [`Model`](model.md) class that defines the shape and surface appearence
  of the new scene object. The size, position, orientation and animation state is
  defined by the scene object, so that scene objects constructed from the same model
  can be different from each other in these respects. Omiting this parameter creates
  an empty scene object that does not draw to the screen, but can be used as an anchor
  for other objects in the scene, for example using a [`PositionLink`](position-link.md).

Note that for any constructor, you can call this function on the `engine` rather than passing
`engine` as a parameter. In this case the call looks like:

```javascript
engine.SceneObject(model: Model)
```

## Examples
This is an example of creating a scene object from a model and adding that scene
object to a scene.

```javascript
const engine = window.frag.Engine().start();

const model = engine.Model();
const scene = engine.Scene();

const sceneObject = engine.SceneObject(model);
sceneObject.getPosition().scale(40);
scene.addObject(sceneObject);
```

## dispose()
Frees resources consumed by the Scene Object.

## getPosition(): ScenePosition
Returns the [`ScenePosition`](scene-positoin.md) object for this scene object. 
The `ScenePosition` object can be used to move, scale and orient the scene 
object within the scene.

`ScenePosition` objects are wrappers that provide convenient methods for manipulating
a `Location` object. If you modify the location of the scene object 
directly, then these changes will be overwritten the next time any changes are made via
the Scene Position. Similarly, if you change the `Location` that the Scene Position is
manipulating then it will no longer affect the scene object.

## deleteAnimationPosition(): SceneObject
This deletes the animation state of the scene object and makes it build a new one from
the model. Although it is technaically possible to modify the animations defined on the
model and then refresh scene obejcts by calling this method, this is not a recommended
way to structure your code.

## disable(): SceneObject
Temporarily disables this scene object within the scene to make the scene render faster.

You would typically use this to remove invisible objects from the render pipeline. For example
if a game object enters a building where it cannot be seen by the player, or the object moves
outside of the players field of view, then you can disable it to save render cycles and increase
frame rate.

## enable(): SceneObject
Call this method to re-enable scene objects that were previously disabled.

