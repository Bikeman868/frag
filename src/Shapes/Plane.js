window.frag.Plane = function (engine, facets, options) {
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

        return window.frag.Mesh(engine).fromBuffer(
            data.buffer, 3, 4, engine.gl.TRIANGLE_STRIP,
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

    const add = function (u, v) {
        verticies.push(u * 2 - 1);
        verticies.push(v * 2 - 1);
        verticies.push(0);

        if (options.color)
            options.color.forEach(c => colors.push(c));

        uvs.push(u);
        uvs.push(v);

        normals.push(0);
        normals.push(0);
        normals.push(-1);
    }

    for (let row = 0; row < facets; row++) {
        const v0 = row / facets;
        const v1 = (row + 1) / facets;
        for (let column = 0; column < facets; column++) {
            const u0 = column / facets;
            const u1 = (column + 1) / facets;
            add(u0, v0);
            add(u1, v0);
            add(u1, v1);
            add(u0, v0);
            add(u1, v1);
            add(u0, v1);
        }
    }

    return window.frag.Mesh(engine).addTriangles(verticies, colors, uvs, normals);
};