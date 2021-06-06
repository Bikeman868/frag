// This cube has the minimum vertex count but only texture maps correctly on 4 sides
// http://www.cs.umd.edu/gvil/papers/av_ts.pdf
window.frag.BasicCube = function (options) {
    const u0 = 0;
    const u1 = 1;

    const v0 = 0;
    const v1 = 1 / 3;
    const v2 = 2 / 3;
    const v3 = 1;

    const verticies = [
        +1, +1, -1,
        -1, +1, -1,
        +1, -1, -1,
        -1, -1, -1,
        +1, +1, +1,
        -1, +1, +1,
        -1, -1, +1,
        +1, -1, +1,
    ];

    const uvs = [
        u0, v3,
        u0, v0,
        u0, v2,
        u0, v1,
        u1, v3,
        u1, v0,
        u1, v1,
        u1, v2,
    ];

    const draw = function (indexes) {
        const v = [];
        const u = [];
        const c = options.color ? [] : undefined;
        for (var i = 0; i < indexes.length; i++) {
            const corner = indexes[i];
            v.push(verticies[corner * 3 + 0]);
            v.push(verticies[corner * 3 + 1]);
            v.push(verticies[corner * 3 + 2]);

            if (options.color) {
                options.color.array.forEach(e => { c.push(e); });
            }

            u.push(uvs[corner * 2 + 0]);
            u.push(uvs[corner * 2 + 1]);
        }
        return window.frag.MeshData().addTriangleStrip(v, c, u, v);
    }

    return draw([3, 2, 6, 7, 4, 2, 0, 3, 1, 6, 5, 4, 1, 0]);
};