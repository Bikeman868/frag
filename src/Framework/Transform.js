window.frag.Transform = function (engine, matrix) {
    if (matrix && matrix.length === 9)
        return window.frag.Transform2D(engine, matrix)
    return window.frag.Transform3D(engine, matrix);
};
