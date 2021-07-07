# Matrix
The `Matrix` class provides static methods for manipulating matricies. You 
cannot construct an instance of the `Matrix` class, matricies in Frag are just
Javascript arrays.

## m3Identity(): Matrix
Constructs a 3x3 identity matrix

## m3Invert(m: Matrix): Matrix
Returns a new 3x3 matrix containing the inverse of the 3x3 matrix that was passed in.

## m3Transpose(m: Matrix): Matrix
Returns a new 3x3 matrix containing the transposition of the 3x3 matrix that was passed in.

## m3xm3(a: Matrix, b: Matrix): Matrix
Returns a new 3x3 matrix containing `a * b` where `a` and `b` are 3x3 matricies.

## m3xv3(a: Matrix, b: Vector): Matrix
Returns a new 3x3 matrix containing `a * b` where `a` is a 3x3 matrix and `b` is
a 3-dimensional vector.

## m4Identity(): Matrix
Constructs a 4x4 identity matrix

## m4Invert(m: Matrix): Matrix
Returns a new 4x4 matrix containing the inverse of the 4x4 matrix that was passed in.

## m4Transpose(m: Matrix): Matrix
Returns a new 4x4 matrix containing the transposition of the 4x4 matrix that was passed in.

## m4xm4(a: Matrix, b: Matrix): Matrix
Returns a new 4x4 matrix containing `a * b` where `a` and `b` are 4x4 matricies.

## m4xv4(a: Matrix, b: Vector): Matrix
Returns a new 4x4 matrix containing `a * b` where `a` is a 4x4 matrix and `b` is
a 4-dimensional vector.
