# Model Animation

This object provides a mechanism for defining an animation effect that
can be applied to models. The same model animation can be applied to
many models and only the parts of the animation that apply to that
model will be used.

When you attach one or more `ModelAnimation` objects to a model, all of the
[`SceneObject`](scene-object.md) objects that are created based on that model 
will have animations available. These animations will be properties of 
the `animations` property of the scene object, and they will be instances of the 
[`Animation` class](animation.md). This is made clearer by the example below.

Each `ModelAnimation` comprises a number of channels, where a channel affects
a property of all contained models whose names match the regular expression
defined for the channel. For example you can add a channel to the model animation
that continuously rotates all contained models called `/wheel/`. You could then
attach this animation to a car model that contains 4 wheel models and all of the
wheels will rotate whilst the animation is running.

## Constructor
```javascript
window.frag.ModelAnimation(engine: Engine)
```

* `engine` is the game engine for your game. It is an instance of the `Engine` class. You can 
  have more than one on a page but more often there is just one that is constructed at the 
  very beginning.

Note that for any constructor, you can call this function on the `engine` rather than passing
`engine` as a parameter. In this case the call looks like:

```javascript
engine.ModelAnimation()
```

## Examples
This example defines a car that has 4 wheels. The car has two animations, one
animation is called "moving" that rotates all of the wheels on the car, the
other is called "bumping" that makes the car look like it drove over a bump
in the road with the front wheels moving up and back down again first followed 
by the back wheels doin the same.

Note that I didn't make this look like a car to keep the code simple, the example
just demostrates how to build animation sequences.

Note that you do not have to build animations sequences in code like this, you
can define ans test them in Blender NLA Strips and they will be imported when
you import the model from Blender.

```javascript
const engine = window.frag.Engine().start();

// Set these up any way you want
const scene = engine.Scene();
const carMaterial = engine.Material();
const wheelMaterial = engine.Material();
const shader = engine.Shader().compile();

// Use a simple cube mesh for the car body
const carBodyMesh = engine.Cube(1).name("car body");

// Use a simple cylinder mesh for a wheel
const carWheelMesh = engine.Cylinder(6).name("car wheel");

// The car model is just a placeholder for the position of the
// car in the scene. It has no mesh and draws nothing to the viewport
const carModel = engine.Model()
    .name('car')
    .shader(shader);

// Add the car body to the car
carModel.addChild()
    .name("body")
    .data(carBodyMesh)
    .material(carMaterial);

// Add the wheels to the car - note that the wheel names have a pattern so that
// we can target them with regex in the model animation
carModel.addChild()
    .name("wheel-fl")
    .data(carWheelMesh)
    .getPosition()
        .translateXYZ(14, -11, 5)
        .scaleXYZ(4, 4, 1));

carModel.addChild()
    .name("wheel-fr")
    .data(carWheelMesh)
    .material(wheelMaterial);
    .getPosition()
        .translateXYZ(14, -11, -5)
        .scaleXYZ(4, 4, 1));

carModel.addChild()
    .name("wheel-bl")
    .data(carWheelMesh)
    .material(wheelMaterial);
    .getPosition()
        .translateXYZ(-16, -11, 5)
        .scaleXYZ(4, 4, 1));
        
carModel.addChild()
    .name("wheel-br")
    .data(carWheelMesh)
    .material(wheelMaterial);
    .getPosition()
        .translateXYZ(-16, -11, -5)
        .scaleXYZ(4, 4, 1));

// Define a "moving" animation that turns all of the wheels and add this to the car model
const wheelTurning = engine.ModelAnimation()
    .name("moving")
    .loop(true)
    .frames(50)
    .interval(10);
wheelTurning.addChannel({
    channel: "rotate-z",
    pattern: /^wheel/,
    keyframes: {
        0: { value: 352.8 * degToRad, transition: "step" },
        49: { value: 0, transition: "linear" }
    }
});
carModel.addAnimation(wheelTurning);

// Define a "bump" animation that makes the car go over a bump in the road
// Note that the front and back wheels go over the bump at different times
const wheelBumping = engine.ModelAnimation()
    .name("bump")
    .loop(false)
    .frames(20)
    .interval(10);
wheelBumping.addChannel({
    channel: "translate-y",
    pattern: /^wheel-f/,
    keyframes: {
        0: { value: 0, transition: "step" },
        5: { value: 0.5, transition: "step" },
        7: { value: 0, transition: "step" },
    }
});
wheelBumping.addChannel({
    channel: "translate-y",
    pattern: /^wheel-b/,
    keyframes: {
        0: { value: 0, transition: "step" },
        8: { value: 0.5, transition: "step" },
        10: { value: 0, transition: "step" },
    }
});
carModel.addAnimation(wheelBumping);

// Create a car based on the car model and add it to the scene
const car = engine.SceneObject(carModel);
car.getPosition().moveBy(-25, 25, 0).rotateY(40 * degToRad);
scene.addObject(car);

// Start the moving animation on the car so that the wheels will turn
car.animations.moving.start();

// After a few seconds have the car go over a bump in the road
setTimeout(car.animations.bump.start, 5000);
```

## name(name: string)
Sets the name of the animation. This name will become the name of a
property on `SceneObject` instances that are based on a model that
has this model animation attached to it.

## loop(loop: bool)
Defines whether the animation begins again at the start after the
animation reaches the end.

## interval(tickInterval: int)
Specifies how many game ticks will elapse between animation frames .Geme 
ticks detault to 10ms each but you can customize this for your game to 
balance hardware requirements against the smoothness of the animations.

## frames(frameCount: int)
Specifies how many frames there are in your animation. When adding keyframes
to the animation channels only keyframes in the range 0 to frameCount-1 will
be used.

## addChannel(channel: any)
Adds an animation channel to the model animation. The channel defines
which child models to affect and which attributes of those models should
be changed, plus a graph of how that value should vary over time.

The `channel` object that you pass must have the following properties:
* `channel` - the name of the model attribute to change
* `pattern` - a regular expression that matches the `name` properties of
  the child models that you want to be affected by this animation channel.
* `keyframes` - a map of the keyframes that define a graph.

The `channel` property can be any of the following:
* "translate-x"
* "translate-y"
* "translate-z"
* "scale-x"
* "scale-y"
* "scale-z"
* "rotate-x"
* "rotate-y"
* "rotate-z"

It is anticipated that this list will increase over time to include
things like materials and shader uniforms, but for now you can only
animate the size, position and orientation of child models.

The `keyframes` property is a Javascript map with frame numbers as
the keys and a keyframe definition as the value. Keyframe definitions
are objects that can have the following properties:
* `value` defines the value that this channel must have at this fame number
* `transition` defines how the value should change over time between
  the prior keyframe and this one.

The currently supported values for `transition` are:
* "step" means the value abruptly changes on this keyframe from its prior value
* "linear" means the value changes linearly over time from its prior value

It is anticipated that other transition types will be supported in
future including acceleration, deceleration and smoothing of the motion.