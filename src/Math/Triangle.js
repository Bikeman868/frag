window.frag = window.frag || {};
window.frag.Triangle = {
    makeTriangleFromVectors: function (a, b, c) {
        return { a, b, c };
    },

    makeTriangleFromArray2D: function (array, offsetA, offsetB, offsetC) {
        if (!array) return null;
        return {
            a: [array[offsetA], array[offsetA + 1]],
            b: [array[offsetB], array[offsetB + 1]],
            c: [array[offsetC], array[offsetC + 1]],
        };
    },

    makeTriangleFromArray3D: function (array, offsetA, offsetB, offsetC) {
        if (!array) return null;
        return {
            a: [array[offsetA], array[offsetA + 1], array[offsetA + 2]],
            b: [array[offsetB], array[offsetB + 1], array[offsetB + 2]],
            c: [array[offsetC], array[offsetC + 1], array[offsetC + 2]],
        };
    },

    normal: function (triangle) {
        const Vector = window.frag.Vector;
        const v1 = Vector.sub(triangle.a, triangle.b);
        const v2 = Vector.sub(triangle.c, triangle.b);
        return Vector.normalize(Vector.cross(v1, v2));
    },
}
