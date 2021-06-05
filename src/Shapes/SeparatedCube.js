// This cube has a separate sub-mesh for each face of the cube.
window.frag.SeparatedCube = function (facets, options) {
    facets = 1;
    const mesh = window.frag.MeshData();
    
    const u0 = 0;
    const u1 = 1 / 4;
    const u2 = 2 / 4;
    const u3 = 3 / 4;
    const u4 = 1;

    const v0 = 0;
    const v1 = 1 / 3;
    const v2 = 2 / 3;
    const v3 = 1;

    const corners = [
        -1, -1, -1,
        +1, -1, -1,
        +1, +1, -1,
        -1, +1, -1,
        +1, -1, +1,
        -1, -1, +1,
        -1, +1, +1,
        +1, +1, +1,
    ];

    const addFace = function (indexes, t0, t1, normal) {
        for (var vFacet = 0; vFacet < facets; vFacet++) {
            const uvs = [t1[0], t0[1], t1[0], t1[1], t0[0], t0[1], t0[0], t1[1]];
            const verticies = [];
            const normals = [];
            for (hFacet = 0; hFacet < facets; hFacet++) {
                for (var i = 0; i < 4; i++) {
                    verticies.push(corners[indexes[i] * 3 + 0]);
                    verticies.push(corners[indexes[i] * 3 + 1]);
                    verticies.push(corners[indexes[i] * 3 + 2]);
                    normals.push(normal[0]);
                    normals.push(normal[1]);
                    normals.push(normal[2]);
                }
            }
            mesh.addTriangleStrip(verticies, uvs, verticies);
        }
    }

    // TODO: Normals at the corners must be the same for all 3 verticies at the corner
    //       otherwise the displacement texture will move the verticies away from each
    //       other resulting in gaps at the corners of the cube

    addFace([1, 2, 0, 3], [u1, v2], [u0, v1], [0, 0, -1]); // front
    addFace([4, 1, 5, 0], [u2, v2], [u1, v1], [0, -1, 0]); // bottom
    addFace([0, 3, 5, 6], [u2, v2], [u1, v3], [-1, 0, 0]); // left
    addFace([4, 7, 1, 2], [u1, v1], [u2, v0], [+1, 0, 0]); // right
    addFace([5, 6, 4, 7], [u2, v1], [u3, v2], [0, 0, +1]); // back
    addFace([6, 3, 7, 2], [u3, v1], [u4, v2], [0, +1, 0]); // top

    return mesh;
};