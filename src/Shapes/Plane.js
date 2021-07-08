window.frag.Plane = function (facets, options) {
    facets = facets || 1;
    options = options || {};

    if (facets === 1) {
        const c = options.color || [0, 0, 0];
        const data = new Float32Array([
            1, -1, 0, 1, 1, 0, -1, -1, 0, -1, 1, 0, // verticies
            c[0], c[1], c[2], c[0], c[1], c[2], c[0], c[1], c[2], c[0], c[1], c[2],  // colors
            1, 0, 1, 1, 0, 0, 0, 1, // uvs
            0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, // normals 
            1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, // tangents
            0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, // bitangents
        ]);

        return window.frag.MeshData().fromBuffer(
            data.buffer, 3, 4, window.frag.gl.TRIANGLE_STRIP,
            0 * Float32Array.BYTES_PER_ELEMENT,
            12 * Float32Array.BYTES_PER_ELEMENT,
            24 * Float32Array.BYTES_PER_ELEMENT,
            32 * Float32Array.BYTES_PER_ELEMENT,
            44 * Float32Array.BYTES_PER_ELEMENT,
            56 * Float32Array.BYTES_PER_ELEMENT,
        );
    }
 
    const verticies = [];
    const uvs = [];
    const normals = [];
    const colors = options.color ? [] : undefined;

    const add = function (x, y) {
        verticies.push(x);
        verticies.push(y);
        verticies.push(0);

        if (options.color)
            options.color.forEach(c => colors.push(c));

        uvs.push((x + 1) * 0.5);
        uvs.push((y + 1) * 0.5);

        normals.push(0);
        normals.push(0);
        normals.push(-1);
    }

    for (var row = 0; row < facets; row++) {
        const y0 = (facets - row - 1) * 2 / facets - 1;
        const y1 = (facets - row) * 2 / facets - 1;
        const evenRow = (row & 1) === 0;

        if (evenRow) {
            add(1, y0);
            for (var column = 0; column < facets; column++) {
                const x0 = (facets - column - 1) * 2 / facets - 1;
                const x1 = (facets - column) * 2 / facets - 1;
                add(x1, y1);
                add(x0, y0);
            }
            add(-1, y1);
        } else {
            add(-1, y1);
            for (var column = 0; column < facets; column++) {
                const x0 = column * 2 / facets - 1;
                const x1 = (column + 1) * 2 / facets - 1;
                add(x0, y0);
                add(x1, y1);
            }
            add(1, y0);
        }
    }

    return window.frag.MeshData().addTriangleStrip(verticies, colors, uvs, normals);
};