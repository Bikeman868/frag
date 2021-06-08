# SceneObject
To construct a new scene object call the `SceneObject` method passing the
model that this should be an instance of, then use fluent syntax to configure
 the attributes of the scene object.

Scene objects are the things that you can add and remove from a scene to define
what should be rendered when the scene is drawn. A scene object must be based on
a model. The model defines exactly what this scene object will look like. The
scene object itself defines its size, position and orientation within the scene.

Scene objects have an animation state that is specific to each scene object so that
each scene object can be animated independently from other scene objects. The animations
that are available and the ways in which the animations affect the appearence is
defined by the model that this scene object is based on.

## Examples
This is an example of creating a scene object from a model and adding that scene
object to a scene.

```javascript
const frag = window.frag;
const model = frag.Model();
const scene = grag.Scene();

const sceneObject = frag.SceneObject(model);
sceneObject.getPosition().scale(40);
scene.addObject(sceneObject);
```

## dispose()
Frees resources consumed by the Scene Object.

## getPosition(): ScenePosition
Returns the `ScenePosition` object for this scene object. The `ScenePosition` object
can be used to move, scale and orient the scene object within the scene.

`ScenePosition` objects are wrappers that provide convenient methods for manipulating
a `Transform` or`Transform2D` object. If you modify the transform of the scene object 
directly, then these changes will be overwritten the next time any changes are made via
the Scene Position. Similarly, if you change the transform that the Scene Position is
manipulating then it will no longer affect the scene object.

## deleteAnimationPosition()
This deletes the animation state of the scene object and makes it build a new one from
the model. Although it is technaically possible to modify the animations defined on the
model and then refresh scene obejcts by calling this method, this is not a recommended
way to structure your code.

## disable()
Temporarily disables this scene object within the scene to make the scene render faster.

You would typically use this to remove invisible objects from the render pipeline. For example
if a game object enters a building where it cannot be seen by the player, or the object moves
outside of the players field of view, then you cn disable it to save render cycles and increase
frame rate.

## enable()
Call this method to re-enable scene objects that were previously disabled.

