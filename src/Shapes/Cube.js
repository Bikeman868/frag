// This cube consists of a single sub-mesh so that smooth shading works correctly
window.frag.Cube = function (engine, frontFacets, options) {
    let backFacets = frontFacets;
    let topFacets = frontFacets;
    let bottomFacets = frontFacets;
    let leftFacets = frontFacets;
    let rightFacets = frontFacets;

    let color;
    let duplicateTexture = false;
    let skyBox = false;

    if (options) {
        if (options.frontFacets !== undefined) frontFacets = options.frontFacets;
        if (options.backFacets !== undefined) backFacets = options.backFacets;
        if (options.topFacets !== undefined) topFacets = options.topFacets;
        if (options.bottomFacets !== undefined) bottomFacets = options.bottomFacets;
        if (options.leftFacets !== undefined) leftFacets = options.leftFacets;
        if (options.rightFacets !== undefined) rightFacets = options.rightFacets;

        if (options.color !== undefined) color = options.color;
        if (options.duplicateTexture !== undefined) duplicateTexture = options.duplicateTexture;
        if (options.skyBox !== undefined) skyBox = options.skyBox;
    }

    let u0 = 0;
    let u1 = 1 / 4;
    let u2 = 2 / 4;
    let u3 = 3 / 4;
    let u4 = 1;

    let v0 = 0;
    let v1 = 1 / 3;
    let v2 = 2 / 3;
    let v3 = 1;

    const cornerVerticies = [
        [-1, -1, -1], //  0 - Front bottom left
        [+1, -1, -1], //  1 - Front bottom right
        [+1, +1, -1], //  2 - Front top right
        [-1, +1, -1], //  3 - Front top left
        [+1, -1, +1], //  4 - Back bottom right
        [-1, -1, +1], //  5 - Back bottom left
        [-1, +1, +1], //  6 - Back top left
        [+1, +1, +1], //  7 - Back top right
        [-1, +1, -1], //  8 - Top front left
        [+1, +1, -1], //  9 - Top front right
        [-1, +1, -1], // 10 - Left top front
        [-1, +1, +1], // 11 - Left top back
        [+1, +1, -1], // 12 - Right top front
        [+1, +1, +1], // 13 - Right top back
    ];

    const cornerUvs = [
        [u1, v2], //  0 - Front bottom left
        [u1, v1], //  1 - Front bottom right
        [u0, v1], //  2 - Front top right
        [u0, v2], //  3 - Front top left
        [u2, v1], //  4 - Back bottom right
        [u2, v2], //  5 - Back bottom left
        [u3, v2], //  6 - Back top left
        [u3, v1], //  7 - Back top right
        [u4, v2], //  8 - Top front left
        [u4, v1], //  9 - Top front right
        [u1, v3], // 10 - Left top front
        [u2, v3], // 11 - Left top back
        [u1, v0], // 12 - Right top front
        [u2, v0], // 13 - Right top back
    ];

    const verticies = [];
    const uvs = [];
    const colors = color ? [] : undefined;

    const addVertex = function(v) {
        verticies.push(v[0]);
        verticies.push(v[1]);
        verticies.push(v[2]);
        if (color) color.forEach(c => { colors.push(c); });
    }

    const addUv = function (uv) {
        uvs.push(uv[0]);
        uvs.push(uv[1]);
    }

    const addFacetVerticies = function (bottomRight, topRight, bottomLeft, topLeft){
        if (skyBox) {
            addVertex(topRight);
            addVertex(bottomLeft);
            addVertex(topLeft);
            addVertex(bottomLeft);
            addVertex(topRight);
            addVertex(bottomRight);
        } else {
            addVertex(bottomRight);
            addVertex(topRight);
            addVertex(bottomLeft);
            addVertex(topLeft);
            addVertex(bottomLeft);
            addVertex(topRight);
        }
    }

    const addFacetUvs = function (bottomRight, topRight, bottomLeft, topLeft) {
        if (skyBox) {
            addUv(topRight);
            addUv(bottomLeft);
            addUv(topLeft);
            addUv(bottomLeft);
            addUv(topRight);
            addUv(bottomRight);
        } else {
            addUv(bottomRight);
            addUv(topRight);
            addUv(bottomLeft);
            addUv(topLeft);
            addUv(bottomLeft);
            addUv(topRight);
        }
    }

    const addFace = function (facets, bottomRight, bottomLeft, topLeft,) {
        const Vector = window.frag.Vector;

        vOrigin = cornerVerticies[bottomLeft];
        tOrigin = duplicateTexture ? [0, 0] : cornerUvs[bottomLeft];

        const vU = Vector.sub(cornerVerticies[topLeft], cornerVerticies[bottomLeft]);
        const vR = Vector.sub(cornerVerticies[bottomRight], cornerVerticies[bottomLeft]);

        const tU = duplicateTexture ? [0, 1] : Vector.sub(cornerUvs[topLeft], cornerUvs[bottomLeft]);
        const tR = duplicateTexture ? [1, 0] : Vector.sub(cornerUvs[bottomRight], cornerUvs[bottomLeft]);

        for (var vFacet = 0; vFacet < facets; vFacet++) {
            const vFracLo = vFacet / facets;
            const vFracHi = (vFacet + 1) / facets;

            for (hFacet = 0; hFacet < facets; hFacet++) {
                const hFracLo = hFacet / facets;
                const hFracHi = (hFacet + 1) / facets;

                const vBL = Vector.add(Vector.add(vOrigin, Vector.mult(vR, hFracLo)), Vector.mult(vU, vFracLo));
                const vBR = Vector.add(Vector.add(vOrigin, Vector.mult(vR, hFracHi)), Vector.mult(vU, vFracLo));
                const vTL = Vector.add(Vector.add(vOrigin, Vector.mult(vR, hFracLo)), Vector.mult(vU, vFracHi));
                const vTR = Vector.add(Vector.add(vOrigin, Vector.mult(vR, hFracHi)), Vector.mult(vU, vFracHi));

                addFacetVerticies(vBR, vTR, vBL, vTL);

                const tBL = Vector.add(Vector.add(tOrigin, Vector.mult(tR, hFracLo)), Vector.mult(tU, vFracLo));
                const tBR = Vector.add(Vector.add(tOrigin, Vector.mult(tR, hFracHi)), Vector.mult(tU, vFracLo));
                const tTL = Vector.add(Vector.add(tOrigin, Vector.mult(tR, hFracLo)), Vector.mult(tU, vFracHi));
                const tTR = Vector.add(Vector.add(tOrigin, Vector.mult(tR, hFracHi)), Vector.mult(tU, vFracHi));

                addFacetUvs(tBR, tTR, tBL, tTL);
            }
        }
    }

    if (frontFacets)  addFace(frontFacets,  1, 0, 3);  // front
    if (bottomFacets) addFace(bottomFacets, 4, 5, 0);  // bottom
    if (leftFacets)   addFace(leftFacets,   0, 5, 11); // left
    if (rightFacets)  addFace(rightFacets,  4, 1, 12); // right
    if (backFacets)   addFace(backFacets,   5, 4, 7);  // back
    if (topFacets)    addFace(topFacets,    6, 7, 9);  // top

    const mesh = window.frag.Mesh(engine);
    mesh.addTriangles({ verticies, colors, uvs });
    if (skyBox) mesh.shadeSmooth();
    return mesh;
};