window.frag.Cylinder = function (facets, options) {
    facets = facets || 32;

    const top = [0, 0, -1];
    const topUvs = [0.5, 0.5];
    const topNormals = [0, 0, -1];
    const topColors = options.color ? Array.from(options.color) : undefined;

    const bottom = [0, 0, 1];
    const bottomUvs = [0.5, 0.5];
    const bottomNormals = [0, 0, 1];
    const bottomColors = options.color ? Array.from(options.color) : undefined;

    const side = [];
    const sideColors = options.color ? [] : undefined;
    const sideUvs = [];
    const sideNormals = [];

    const step = Math.PI * 2 / facets;

    for (var i = 0; i <= facets; i++) {
        const angle = -i * step;
        const x = Math.sin(angle);
        const y = Math.cos(angle);

        top.push(x);
        top.push(y);
        top.push(-1);

        if (options.color) 
            options.color.forEach(c => topColors.push(c));

        topUvs.push((x + 1) * 0.5);
        topUvs.push((y + 1) * 0.5);

        topNormals.push(x);
        topNormals.push(y);
        topNormals.push(-1);

        side.push(x);
        side.push(y);
        side.push(-1);
        side.push(x);
        side.push(y);
        side.push(1);

        if (options.color) {
            options.color.forEach(c => sideColors.push(c));
            options.color.forEach(c => sideColors.push(c));
        }

        sideUvs.push((x + 1) * 0.5);
        sideUvs.push((y + 1) * 0.5);
        sideUvs.push((x + 1) * 0.5);
        sideUvs.push((y + 1) * 0.5);

        sideNormals.push(x);
        sideNormals.push(y);
        sideNormals.push(0);
        sideNormals.push(x);
        sideNormals.push(y);
        sideNormals.push(0);
    }

    for (var i = 0; i <= facets; i++) {
        const angle = i * step;
        const x = Math.sin(angle);
        const y = Math.cos(angle);

        bottom.push(x);
        bottom.push(y);
        bottom.push(1);

        if (options.color) 
            options.color.forEach(c => bottomColors.push(c));

        bottomUvs.push((x + 1) * 0.5);
        bottomUvs.push((y + 1) * 0.5);

        bottomNormals.push(x);
        bottomNormals.push(y);
        bottomNormals.push(1);
    }

    side.push(0);
    side.push(1);
    side.push(1);
    
    if (options.color) 
        options.color.forEach(c => sideColors.push(c));

    sideUvs.push(0.5);
    sideUvs.push(1);

    sideNormals.push(0);
    sideNormals.push(1);
    sideNormals.push(0);

    return window.frag.MeshData()
        .addTriangleFan(top, topColors, topUvs, topNormals)
        .addTriangleFan(bottom, bottomColors, bottomUvs, bottomNormals)
        .addTriangleStrip(side, sideColors, sideUvs, sideNormals);
};