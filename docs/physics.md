# Physics engine integration
Integrating a physics engine with Frag is actually pretty simple. 
The [simple game sample](../samples/simple-game.html) is an example of 
how to integrate a physics engine if you want to dive right into some code.

## What is a physics engine
Physics engines simulate the movement of objects in the real world. For 
example if you drop something it will fall to the ground, and if two objects
collide they will bounce off each other and change direction.

## How do physics engines work
The first thing to know is that physics engines approximate real world movement
in order to get the calculations done in real time. Trying to take two complicated
meshes with thousands of verticies and figure out if they are touching is extremely
CPU intensive and not necessary to make the game realistic enough to be fun to play.

The ultimate goal here is making the game fun, and realism is part of that, but
rough approximations to collisions are definitely close enough for the fun factor.

Frag cheats too, instead of using extremely detailed meshes, we use simplified mesh
and apply textures and normal maps to make the models in our games appear a lot more
detailed than they really are.

Physics engines cheat by approximating complex meshes using simple geometrix shapes
like spheres, boxes and cylinders. Spheres are especially fast for computing
collisions, because two spheres overlap if the distance between them is less
that the sum of their radii.

Physics engines detect collisions in two phases. The first phase is called the broad 
phase, and its purpose is to find pairs of objects in the scene that are close
enough that they could possibly overlap. This phase uses an AABB (axis aligned bounding
box) for each object in the scene sorted by location within the scene. The second
phase compares pairs of objects with overlapping AABBs by looking at their geometry
to see if there is an overlap.

As well as detecting collisions, physics engines use laws of motion to calculate
position, velocity and acceleration from force, mass and friction, and maintains 
the position and orientation of each object in the scene.

## What is involved in integrating a physics engine
First of all you need to decide which elements of your game will move, collide
and bounce according to the laws of motion and which will move according to
animation effects triggered by events within the game.

For objects that you add to the physics engine, the physics engine becomes
the source of truth for position and orientation, and on each screen refresh
you need to update the position and orientation of the object in Frag from
the position and orientation in the physics engine.

For objects that are moved by animation effects, if objects in the physics
engine can collide with them and bounce off etc, then you need to add them
to the physics engine as immovable objects.

The steps to integrating a physics engine are:
1. Determine if you actually need a physics engine, they consume lots of CPU cycles.
2. Choose the physics engine you want to use based on features and download file size.
3. Call the physics engine frequently and at regular intervals so that it can simulate real world effects.
4. Copy the position and orientation of objects from the physics engine into the `SceneObject` to update the graphics.
5. When you add objects to your scene add them to the physics engine as well.
6. When you remove objects from your scene remove them from the physics engine as well.

This is the class from the [simple game sample](../samples/simple-game.html) that
performs these steps. It also checks to see of game objects fell of the floor and
need to be removed from the game. You may or may not need functionallity similar
to this.

```javascript
class PhysicsEngine {
    constructor(game) {
        this.objects = [];
        this.physics = new window.OIMO.World({
            timestep: 1/50,
            iterations: 8,
            broadphase: 2,
            worlscale: 1,
            random: false,
            info: false,
            gravity: [0, -9.8, 0]
        });
        this.animation = game.engine.Animation()
            .repeatTicks(() => {
                this.physics.step();
                for (var i = 0; i < this.objects.length; i++) {
                    const object = this.objects[i];
                    this.updatePosition(object);

                    if (this.checkFellOff(object.element)) {
                        this.objects.splice(i, 1);
                        i--;
                    }
                }
                this.checkCollisions();
            }, 2)
            .start();
    }

    add(element, bodyData) {
        const rigidBody = this.physics.add(bodyData);
        this.objects.push({
            element,
            rigidBody
        });
        return rigidBody;
    }

    remove(rigidBody) {
        this.physics.removeRigidBody(rigidBody);
    }

    updatePosition(object) {
        this.copyPosition(
            object.rigidBody, 
            object.element.sceneObject.getPosition());
    }

    copyPosition(rigidBody, scenePosition) {
        const pos = rigidBody.getPosition();
        scenePosition.locationXYZ(pos.x, pos.y, pos.z);

        // const quad = rigidBody.getQuaternion();
        // scenePosition.rotate([quad.w, quad.x, quad.y, quad.z]);
    }

    checkCollisions() {
        for (var i = 0; i < this.objects.length; i++) {
            const obj1 = this.objects[i];
            if (!obj1.element.collision) continue;
            for (var j = 0; j < this.objects.length; j++) {
                if (j === i) continue;
                const obj2 = this.objects[j];
                const contact = this.physics.getContact(obj1.rigidBody, obj2.rigidBody);
                if (contact && !contact.close) {
                    obj1.element.collision(obj2.element);
                }
            }
        }
    }

    checkFellOff(element) {
        if (element.sceneObject.getPosition().getLocationY() < floorHeight - 10) {
            element.dispose();
            return true;
        }
        return false;
    }

    dispose() {
        this.animation.dispose();
    }
}
```

This code is specific to the Oimo.js physics engine, but the code needed for other
physics engines is very similar. The important aspects are:

```javascript
this.animation = game.engine.Animation()
    .repeatTicks(() => {
        this.physics.step();
        for (var i = 0; i < this.objects.length; i++) {
            this.updatePosition(this.objects[i]);
        }
    }, 2)
    .start();
```

This snippet installs an animation into the Frag animation engine that will
update the physics engine on every other game tick. Since there are 100
game ticks in a second by default this means that the real-world simulation
will update 50 times per second.

After stepping the physics simulation this code calls a method that copies the 
position and orientation of each object from the physics engine to the graphics.
This method looks like this:

```javascript
copyPosition(rigidBody, scenePosition) {
    const pos = rigidBody.getPosition();
    scenePosition.locationXYZ(pos.x, pos.y, pos.z);

    const quad = rigidBody.getQuaternion();
    scenePosition.rotate([quad.w, quad.x, quad.y, quad.z]);
}
```

These two pieces are the integration that you need to get started. Take a look
at the [simple game sample](../samples/simple-game.html) for a fully
working game example.