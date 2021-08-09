// This sphere consists of a single sub-mesh so that smooth shading works correctly
window.frag.Sphere = function (engine, latitudeFacets, options) {
    if (latitudeFacets === undefined) latitudeFacets = 12;
    let longitudeFacets = latitudeFacets * 2;

    let latitudeStart = 0;
    let latitudeLength = Math.PI;
    
    let longitudeStart = 0;
    let longitudeLength = 2 * Math.PI;

    let color;

    if (options) {
        if (options.latitudeStart !== undefined) latitudeStart = options.latitudeStart;
        if (options.latitudeLength !== undefined) latitudeLength = options.latitudeLength;
        if (options.latitudeFacets !== undefined) latitudeFacets = options.latitudeFacets;

        if (options.longitudeStart !== undefined) longitudeStart = options.longitudeStart;
        if (options.longitudeLength !== undefined) longitudeLength = options.longitudeLength;
        if (options.longitudeFacets !== undefined) longitudeFacets = options.longitudeFacets;

        if (options.color !== undefined) color = options.color;
    }

    if (latitudeFacets < 2) latitudeFacets = 2;
    if (longitudeFacets < 3) longitudeFacets = 3;
    if (latitudeStart < 0) latitudeStart = 0;
    if (latitudeStart + latitudeLength > Math.PI) latitudeLength = Math.PI - latitudeStart;
    if (longitudeLength > 2 * Math.PI) longitudeLength = 2 * Math.PI;

    const verticies = [];
    const uvs = [];

    for (let iy = 0; iy <= latitudeFacets; iy++) {
        const v = iy / latitudeFacets;
        let uOffset = 0;
        if (iy === 0 && latitudeStart === 0)
            uOffset = 0.5 / longitudeFacets;
        else if (iy === latitudeFacets && (latitudeStart + latitudeLength) === Math.PI)
            uOffset = -0.5 / longitudeFacets;

        for (ix = 0; ix <= longitudeFacets; ix++) {
            const u = ix / longitudeFacets;
            vertex = {
                x: Math.cos(longitudeStart + u * longitudeLength) * Math.sin(latitudeStart + v * latitudeLength),
                y: Math.cos(latitudeStart + v * latitudeLength),
                z: Math.sin(longitudeStart + u * longitudeLength) * Math.sin(latitudeStart + v * latitudeLength)
            };
            verticies.push(vertex);
            uvs.push({ u, v });
        }
    }

    const triangleVerticies = [];
    const triangleColors = color ? [] : undefined;
    const triangleUvs = [];

    const addVertex = function(index) {
        const vertex = verticies[index];
        triangleVerticies.push(vertex.x);
        triangleVerticies.push(vertex.y);
        triangleVerticies.push(vertex.z);

        const uv = uvs[index];
        triangleUvs.push(uv.u);
        triangleUvs.push(uv.v);

        if (color) color.forEach(c => { triangleColors.push(c); });
    }

    const addTriangle = function(ia, ib, ic) {
        addVertex(ia);
        addVertex(ib);
        addVertex(ic);
    }

    for (let iy = 0; iy < latitudeFacets; iy++) {
        const r0 = iy * (longitudeFacets + 1);
        const r1 = (iy + 1) * (longitudeFacets + 1);
        for (let ix = 0; ix < longitudeFacets; ix++) {
            if (iy !== 0 || latitudeStart > 0)
                addTriangle(r0 + ix + 1, r0 + ix, r1 + ix + 1);
            if (iy !== latitudeFacets - 1 || (latitudeStart + latitudeLength) < Math.PI)
                addTriangle(r0 + ix, r1 + ix, r1 + ix + 1);
        }
    }

    const mesh = window.frag.Mesh(engine)
    mesh.addTriangles({ verticies: triangleVerticies, colors: triangleColors, uvs: triangleUvs });
    return mesh;
};