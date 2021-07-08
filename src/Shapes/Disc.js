window.frag.Disc = function (facets, options) {
    facets = facets || 32;
    options = options || {};

    const verticies = [0, 0, 0];
    const uvs = [0.5, 0.5];
    const normals = [0, 0, -1];

    const step = Math.PI * 2 / facets;

    for (var i = 0; i <= facets; i++) {
        const angle = -i * step;
        const x = Math.sin(angle);
        const y = Math.cos(angle);

        verticies.push(x);
        verticies.push(y);
        verticies.push(0);

        normals.push(0);
        normals.push(0);
        normals.push(-1);

        uvs.push((x + 1) * 0.5);
        uvs.push((y + 1) * 0.5);
    }

    return window.frag.MeshData().addTriangleFan(verticies, uvs, normals);
};