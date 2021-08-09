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

        const mesh = window.frag.Mesh(engine);
        mesh.fromBuffer({
            buffer: data.buffer, 
            size: 3, 
            count: 4, 
            primitiveType: engine.gl.TRIANGLE_STRIP,
            vertexDataOffset: 0 * Float32Array.BYTES_PER_ELEMENT,
            colorDataOffset: 12 * Float32Array.BYTES_PER_ELEMENT,
            uvDataOffset: 24 * Float32Array.BYTES_PER_ELEMENT,
            normalDataOffset: 32 * Float32Array.BYTES_PER_ELEMENT,
            tangentDataOffset: 44 * Float32Array.BYTES_PER_ELEMENT,
            bitangentDataOffset: 56 * Float32Array.BYTES_PER_ELEMENT,
        });
        return mesh;
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

    const mesh = window.frag.Mesh(engine);
    mesh.addTriangles({ verticies, colors, uvs, normals });
    return mesh;
};