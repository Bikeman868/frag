window.frag.Cylinder = function (engine, endFacets, options) {
    endFacets = endFacets || 16;
    let sideFacets = 1;
    let topRadius = 1;
    let bottomRadius = 1;
    let drawTop = true;
    let drawBottom = true;
    let color;

    if (options) {
        if (options.sideFacets !== undefined) sideFacets = options.sideFacets;
        if (options.color !== undefined) color = options.color;
        if (options.topRadius !== undefined) topRadius = options.topRadius;
        if (options.bottomRadius !== undefined) bottomRadius = options.bottomRadius;
        if (options.drawTop !== undefined) drawTop = options.drawTop;
        if (options.drawBottom !== undefined) drawBottom = options.drawBottom;
    }

    if (endFacets < 3) endFacets = 3;
    if (topRadius === 0) drawTop = false;
    if (bottomRadius === 0) drawBottom = false;

    const step = Math.PI * 2 / endFacets;
    const mesh = window.frag.Mesh(engine);

    if (sideFacets) {
        const verticies = [];
        const colors = color ? [] : undefined;
        const uvs = [];
        const radiusDelta = topRadius - bottomRadius;

        const push = function(x, y,  z) {
            verticies.push(x);
            verticies.push(y);
            verticies.push(z);
            if (color) color.forEach(c => colors.push(c));
            uvs.push((x + 1) * 0.5);
            uvs.push((y + 1) * 0.5);
        }

        for (let s = 0; s < sideFacets; s++) {
            const f0 = s / sideFacets;
            const f1 = (s + 1) / sideFacets;
            const z0 = 1 - 2 * f0;
            const z1 = 1 - 2 * f1;
            const radius0 = radiusDelta * f0 + bottomRadius;
            const radius1 = radiusDelta * f1 + bottomRadius;
            for (let i = 0; i <= endFacets; i++) {
                const angle = i * step;
                const x = Math.sin(angle);
                const y = Math.cos(angle);

                push(x * radius0, y * radius0, z0);
                push(x * radius1, y * radius1, z1);
            }
            push(0, radius1, z1);
            mesh.addTriangleStrip({ verticies, colors, uvs });
        }
    }

    if (drawTop) {
        const verticies = [0, 0, -1];
        const uvs = [0.5, 0.5];
        const normals = [0, 0, -1];
        const colors = color ? Array.from(color) : undefined;
    
        for (let i = 0; i <= endFacets; i++) {
            const angle = -i * step;
            const x = Math.sin(angle);
            const y = Math.cos(angle);

            verticies.push(x * topRadius);
            verticies.push(y * topRadius);
            verticies.push(-1);

            if (color) color.forEach(c => colors.push(c));

            uvs.push((x + 1) * 0.5);
            uvs.push((y + 1) * 0.5);

            normals.push(x);
            normals.push(y);
            normals.push(-1);
        }
        mesh.addTriangleFan({ verticies, colors, uvs, normals });
    }

    if (drawBottom) {
        const verticies = [0, 0, 1];
        const uvs = [0.5, 0.5];
        const normals = [0, 0, 1];
        const colors = color ? Array.from(color) : undefined;

        for (let i = 0; i <= endFacets; i++) {
            const angle = i * step;
            const x = Math.sin(angle);
            const y = Math.cos(angle);

            verticies.push(x * bottomRadius);
            verticies.push(y * bottomRadius);
            verticies.push(1);

            if (color) color.forEach(c => colors.push(c));

            uvs.push((x + 1) * 0.5);
            uvs.push((y + 1) * 0.5);

            normals.push(x);
            normals.push(y);
            normals.push(1);
        }
        mesh.addTriangleFan({ verticies, colors, uvs, normals });
    }

    return mesh;
};
