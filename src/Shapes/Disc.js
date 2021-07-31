window.frag.Disc = function (engine, facets, options) {
    facets = facets || 32;
    let color;

    if (options) {
        if (options.color !== undefined) color = options.color;
    }

    const verticies = [0, 0, 0];
    const uvs = [0.5, 0.5];
    const normals = [0, 0, -1];
    const colors = color ? Array.from(color) : undefined;

    const step = Math.PI * 2 / facets;

    for (var i = 0; i <= facets; i++) {
        const angle = -i * step;
        const x = Math.sin(angle);
        const y = Math.cos(angle);

        verticies.push(x);
        verticies.push(y);
        verticies.push(0);
        
        if (color) color.forEach(c => colors.push(c));

        normals.push(0);
        normals.push(0);
        normals.push(-1);

        uvs.push((x + 1) * 0.5);
        uvs.push((y + 1) * 0.5);
    }

    return window.frag.Mesh(engine).addTriangleFan(verticies, colors, uvs, normals);
};