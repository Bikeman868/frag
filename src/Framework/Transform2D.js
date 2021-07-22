// This is a wrapper around a 3x3 matrix. It provides methods to operate on the matrix
// and can apply the matrix to a shader for rendering. It also provides an observable
// that you can subscribe to changes in the matrix
window.frag.Transform2D = function (engine, matrix) {
    const frag = window.frag;
    const _ = 0;

    const private = {
        matrix
    }

    const public = {
        __private: private,
        observableMatrix: window.frag.Observable(engine, (o) => { o(private.matrix) }),
        is3d: false,
    };

    public.dispose = function () {
        public.observableMatrix.dispose();
    }

    public.clone = function (matrix) {
        return window.frag.Transform2D(engine, matrix || private.matrix);
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
            return public.setMatrix(frag.Matrix.m3Xm3(private.matrix, matrix));
        return public.setMatrix(matrix);
    }

    public.identity = function () {
        return public.setMatrix([
            1, _, _,
            _, 1, _,
            _, _, 1,
        ]);
    }

    public.scale = function (s) {
        return public.transform([
            s, _, _,
            _, s, _,
            _, _, 1,
        ]);
    }

    public.scaleXY = function (x, y) {
        return public.transform([
            x, _, _,
            _, y, _,
            _, _, 1,
        ]);
    }

    public.translateX = function (d) {
        return public.transform([
            1, _, _,
            _, 1, _,
            d, _, 1,
        ]);
    }

    public.translateY = function (d) {
        return public.transform([
            1, _, _,
            _, 1, _,
            _, d, 1,
        ]);
    }

    public.translateXY = function (x, y) {
        return public.transform([
            1, _, _,
            _, 1, _,
            x, y, 1,
        ]);
    }

    public.rotate = function (rad) {
        var c = Math.cos(rad);
        var s = Math.sin(rad);
        return public.transform([
            c,-s, _,
            s, c, _,
            _, _, 1,
        ]);
    }

    public.apply = function (uniform) {
        if (uniform !== undefined) {
            engine.gl.uniformMatrix3fv(uniform, false, public.getMatrix());
        }
        return public;
    }

    return public;
};
