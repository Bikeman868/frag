# Vector
The `Vector` class provides static methods for manipulating vectors. You 
cannot construct an instance of the Vector class, vectors in Frag are just
Javascript arrays.

## extract2D(a: Array, offset: int): Vector
Constructs a 2D vector by copying values from a larger array starting at the 
specified offset. This allows you to pack many vectors into a single array.
The offset parameter is the array index of the X value. The Y value will
be copied from array offset+1

## extract3D(a: Array, offset: int): Vector
Constructs a 3D vector by copying values from a larger array starting at the 
specified offset. This allows you to pack many vectors into a single array.
The offset parameter is the array index of the X value. The Y value will
be copied from array offset+1 and the Z value from offset+2.

## zero(dimensions: int): Vector
Returns a new vector containing all zero values. The `dimensions` parameter
must be a number between 1 and 5.

## add(a: Vector, b: Vector): Vector
Returns a new vector that is `a + b`. The two vectors can have any number 
of dimensions, but the number of dimensions in a and b must be the same.

## sub(a: Vector, b: Vector): Vector
Returns a new vector that is `a - b`. The two vectors can have any number 
of dimensions, but the number of dimensions in a and b must be the same.

## mult(a: Vector, b: Vector): Vector
Returns a new vector that is `a * b`. The two vectors can have any number 
of dimensions, but the number of dimensions in a and b must be the same.

## div(a: Vector, b: Vector): Vector
Returns a new vector that is `a / b`. The two vectors can have any number 
of dimensions, but the number of dimensions in a and b must be the same.

## length(v: Vector): int
Returns the length of the vector, i.e. the distance travelled in N-dimensional
space by the vector. The vector can have any number of dimensions.

## average(a: Vector, b: Vector): Vector
Returns the mid point. This is the same as adding the two vectors then dividing
by two.

## cross(a: Vector, b: Vector): Vector
Returns a vew vector containing the cross product of the two vectors passed in.
The vectors must be 3-dimensional.

## dot(a: Vector, b: Vector): float
Returns the dot product of two vectors.

## normalize(v: Vector): Vector
Returns a new vector containing the normalized version of `a`. A normalized
vector points in the same direction but has a length of 1. The vector can have 
any number of dimensions.

## append(a: Array, v: Vector): void
Appends a vector to the end of an array. The vector can have any number of
dimensions.

## eulerAngles(directionVector: Vector, upVector?: Vector): Vector
Calculates how to rotate a model in the scene so that it faces a specific
direction. `directionVector` represents a direction in x, y and z. `upVector`
defines which way is up and is optional. If you don't pass `upVector` then
it defaults to Y+ as up.

The vector returned contains `[roll, yaw, pitch]` as defined by the aircraft
industry. You can pass this array directly to the `rotation` method of `ScenePosition`
to orient your model. You may need to adjust the value of `yaw` according to which
direction the "front" of your model is facing.

For an example of how to use this function see the 
[Truck on a track sample](../../samples/truck-on-track.html).