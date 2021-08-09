// This cube consists of a single sub-mesh so that smooth shading works correctly
window.frag.Cube = function (engine, frontFacets, options) {
    let backFacets = frontFacets;
    let topFacets = frontFacets;
    let bottomFacets = frontFacets;
    let leftFacets = frontFacets;
    let rightFacets = frontFacets;

    let color;
    let duplicateTexture = false;

    if (options) {
        if (options.frontFacets !== undefined) frontFacets = options.frontFacets;
        if (options.backFacets !== undefined) backFacets = options.backFacets;
        if (options.topFacets !== undefined) topFacets = options.topFacets;
        if (options.bottomFacets !== undefined) bottomFacets = options.bottomFacets;
        if (options.leftFacets !== undefined) leftFacets = options.leftFacets;
        if (options.rightFacets !== undefined) rightFacets = options.rightFacets;

        if (options.color !== undefined) color = options.color;
        if (options.duplicateTexture !== undefined) duplicateTexture = options.duplicateTexture;
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

    const corners = [
        [-1, -1, -1],
        [+1, -1, -1],
        [+1, +1, -1],
        [-1, +1, -1],
        [+1, -1, +1],
        [-1, -1, +1],
        [-1, +1, +1],
        [+1, +1, +1],
    ];

    const verticies = [];
    const uvs = [];
    const colors = color ? [] : undefined;

    const addVertex = function(v) {
        verticies.push(v[0]);
        verticies.push(v[1]);
        verticies.push(v[2]);
        if (color) {
            color.forEach(c => { colors.push(c); });
        }
    }

    const addUv = function (u, v) {
        uvs.push(u);
        uvs.push(v);
    }

    const addFacetVerticies = function (bottomRight, topRight, bottomLeft, topLeft){
        addVertex(bottomRight);
        addVertex(topRight);
        addVertex(bottomLeft);
        addVertex(topLeft);
        addVertex(bottomLeft);
        addVertex(topRight);
    }

    const addFacetUvs = function (uLeft, vBottom, uRight, vTop) {
        addUv(uRight, vBottom);
        addUv(uRight, vTop);
        addUv(uLeft, vBottom);
        addUv(uLeft, vTop);
        addUv(uLeft, vBottom);
        addUv(uRight, vTop);
    }

    const addFace = function (facets, bottomRight, bottomLeft, topLeft, uLeft, vBottom, uRight, vTop) {
        for (var vFacet = 0; vFacet < facets; vFacet++) {
            const vFracLow = vFacet / facets;
            const vFracHigh = (vFacet + 1) / facets;

            const vFacetBottom = (vTop - vBottom) * vFracLow + vBottom;
            const vFacetTop = (vTop - vBottom) * vFracHigh + vBottom;

            for (hFacet = 0; hFacet < facets; hFacet++) {
                const hFracLow = hFacet / facets;
                const hFracHigh = (hFacet + 1) / facets;

                const Vector = window.frag.Vector;
                const up = Vector.sub(corners[topLeft], corners[bottomLeft]);
                const right = Vector.sub(corners[bottomRight], corners[bottomLeft]);

                const facetBottomLeft = Vector.add(Vector.add(corners[bottomLeft], Vector.mult(right, hFracLow)), Vector.mult(up, vFracLow));
                const facetBottomRight = Vector.add(Vector.add(corners[bottomLeft], Vector.mult(right, hFracHigh)), Vector.mult(up, vFracLow));
                const facetTopLeft = Vector.add(Vector.add(corners[bottomLeft], Vector.mult(right, hFracLow)), Vector.mult(up, vFracHigh));
                const facetTopRight = Vector.add(Vector.add(corners[bottomLeft], Vector.mult(right, hFracHigh)), Vector.mult(up, vFracHigh));

                addFacetVerticies(facetBottomRight, facetTopRight, facetBottomLeft, facetTopLeft);

                const uFacetLeft = (uRight - uLeft) * hFracLow + uLeft;
                const uFacetRight = (uRight - uLeft) * hFracHigh + uLeft;

                addFacetUvs(uFacetLeft, vFacetBottom, uFacetRight, vFacetTop);
            }
        }
    }

    if (duplicateTexture) {
        if (frontFacets) addFace(frontFacets, 1, 0, 3, u4, v3, u0, v0); // front
        if (bottomFacets) addFace(bottomFacets, 4, 5, 0, u4, v3, u0, v0); // bottom
        if (leftFacets) addFace(leftFacets, 0, 5, 6, u4, v3, u0, v0); // left
        if (rightFacets) addFace(rightFacets, 4, 1, 2, u4, v3, u0, v0); // right
        if (backFacets) addFace(backFacets, 5, 4, 7, u4, v3, u0, v0); // back
        if (topFacets) addFace(topFacets, 6, 7, 2, u4, v3, u0, v0); // top
    } else {
        if (frontFacets) addFace(frontFacets, 1, 0, 3, u1, v2, u0, v1); // front
        if (bottomFacets) addFace(bottomFacets, 4, 5, 0, u2, v2, u1, v1); // bottom
        if (leftFacets) addFace(leftFacets, 0, 5, 6, u2, v2, u1, v3); // left
        if (rightFacets) addFace(rightFacets, 4, 1, 2, u1, v1, u2, v0); // right
        if (backFacets) addFace(backFacets, 5, 4, 7, u2, v1, u3, v2); // back
        if (topFacets) addFace(topFacets, 6, 7, 2, u3, v1, u4, v2); // top
    }

    const mesh = window.frag.Mesh(engine);
    mesh.addTriangles({ verticies, colors, uvs });
    return mesh;
};