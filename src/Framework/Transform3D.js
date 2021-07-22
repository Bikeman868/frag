// This is a wrapper around a 4x4 matrix. It provides methods to operate on the matrix
// and can apply the matrix to a shader for rendering. It also provides an observable
// that you can subscribe to changes in the matrix
window.frag.Transform3D = function (engine, matrix) {
    const frag = window.frag;
    const _ = 0;

    const private = {
        matrix,
    };

    const public = {
        __private: private,
        observableMatrix: window.frag.Observable(engine, (o) => { o(private.matrix) }),
        is3d: true,
    };

    public.dispose = function () {
        public.observableMatrix.dispose();
    }

    public.clone = function (matrix) {
        return window.frag.Transform3D(engine, matrix || private.matrix);
    }

    public.getMatrix = function () {
        return private.matrix;
    }

    public.setMatrix = function (matrix) {
        private.matrix = matrix;
        public.observableMatrix.notify();
        return public;
    }

    public.transform = function (matrix) {
        if (private.matrix)
            return public.setMatrix(frag.Matrix.m4Xm4(private.matrix, matrix));
        return public.setMatrix(matrix);
    }

    public.identity = function () {
        return public.setMatrix([
            1, _, _, _,
            _, 1, _, _,
            _, _, 1, _,
            _, _, _, 1,
        ]);
    }

    public.scale = function (s) {
        return public.transform([
            s, _, _, _,
            _, s, _, _,
            _, _, s, _,
            _, _, _, 1,
        ]);
    }

    public.scaleX = function (s) {
        return public.transform([
            s, _, _, _,
            _, 1, _, _,
            _, _, 1, _,
            _, _, _, 1,
        ]);
    }

    public.scaleY = function (s) {
        return public.transform([
            1, _, _, _,
            _, s, _, _,
            _, _, s, _,
            _, _, _, 1,
        ]);
    }

    public.scaleZ = function (s) {
        return public.transform([
            1, _, _, _,
            _, 1, _, _,
            _, _, s, _,
            _, _, _, 1,
        ]);
    }

    public.scaleXY = function (x, y) {
        return public.transform([
            x, _, _, _,
            _, y, _, _,
            _, _, 1, _,
            _, _, _, 1,
        ]);
    }

    public.scaleXYZ = function (x, y, z) {
        return public.transform([
            x, _, _, _,
            _, y, _, _,
            _, _, z, _,
            _, _, _, 1,
        ]);
    }

    public.translateX = function (d) {
        return public.transform([
            1, _, _, _,
            _, 1, _, _,
            _, _, 1, _,
            d, _, _, 1,
        ]);
    }

    public.translateY = function (d) {
        return public.transform([
            1, _, _, _,
            _, 1, _, _,
            _, _, 1, _,
            _, d, _, 1,
        ]);
    }

    public.translateZ = function (d) {
        return public.transform([
            1, _, _, _,
            _, 1, _, _,
            _, _, 1, _,
            _, _, d, 1,
        ]);
    }

    public.translateXY = function (x, y) {
        return public.transform([
            1, _, _, _,
            _, 1, _, _,
            _, _, 1, _,
            x, y, _, 1,
        ]);
    }

    public.translateXYZ = function (x, y, z) {
        return public.transform([
            1, _, _, _,
            _, 1, _, _,
            _, _, 1, _,
            x, y, z, 1,
        ]);
    }

    public.rotateX = function (rad) {
        var c = Math.cos(rad);
        var s = Math.sin(rad);
        return public.transform([
            1, _, _, _,
            _, c, s, _,
            _,-s, c, _,
            _, _, _, 1,
        ]);
    }

    public.rotateY = function (rad) {
        var c = Math.cos(rad);
        var s = Math.sin(rad);
        return public.transform([
            c, _,-s, _,
            _, 1, _, _,
            s, _, c, _,
            _, _, _, 1,
        ]);
    }

    public.rotateZ = function (rad) {
        var c = Math.cos(rad);
        var s = Math.sin(rad);
        return public.transform([
            c, s, _, _,
           -s, c, _, _,
            _, _, 1, _,
            _, _, _, 1,
        ]);
    }

    public.rotateXYZ = function (x, y, z) {
        if (x) public.rotateX(x);
        if (y) public.rotateY(y);
        if (z) public.rotateZ(z);
        return public;
    }

    public.apply = function (uniform) {
        if (uniform !== undefined) {
            engine.gl.uniformMatrix4fv(uniform, false, public.getMatrix());
        }
        return public;
    }

    return public;
};

// Unit tests for Transform3D
/*
window.tests = window.tests || {};

window.tests.transform = {
    check: function (name, transform, vector, expected) {
        const result = window.frag.Matrix.m4Xv4(transform.getMatrix(), vector);
        window.tests.expectArray(name, expected, result);
    },
    t1: window.frag.Transform3D(engine).identity(),
    t2: window.frag.Transform3D(engine).scaleXYZ(2, 3, 4).translateXYZ(1, 2, 3),
    t3: window.frag.Transform3D(engine).translateXYZ(1, 2, 3).scaleXYZ(2, 3, 4),

    run: function (test) {
        test.check("Identity matrix", test.t1, [9, 13, 56, 1], [9, 13, 56, 1]);
        test.check("Scale+translate matrix", test.t2, [1, 1, 1, 1], [4, 9, 16, 1]);
        test.check("Translate+scale matrix", test.t3, [1, 1, 1, 1], [3, 5, 7, 1]);
    }
};

window.tests.transform.run(window.tests.transform);
*/