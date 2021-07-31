// This sphere consists of a single sub-mesh so that smooth shading works correctly
window.frag.Sphere = function (engine, facets, options) {
    if (facets === undefined) facets = 12;
    if (facets < 2) facets = 2;

    options = options || {};
    if (options.startLatitude === undefined) options.latitudeStart = 0;
    if (options.endLatitude === undefined) options.latitudeLength = Math.PI;
    if (options.startLongitude === undefined) options.longitudeStart = 0;
    if (options.endLongitude === undefined) options.longitudeLength = 2 * Math.PI;
    if (options.longitudeFacets === undefined) options.longitudeFacets = facets;
    if (options.longitudeFacets < 3) options.longitudeFacets = 3;

    const verticies = [];
    const uvs = [];

    for (let iy = 0; iy <= facets; iy++) {
        const v = iy / facets;
        let uOffset = 0;
        if (iy === 0 && options.latitudeStart === 0)
            uOffset = 0.5 / options.longitudeFacets;
        else if (iy === facets && (options.latitudeStart + options.latitudeLength) === Math.PI)
            uOffset = -0.5 / options.longitudeFacets;

        for (ix = 0; ix <= options.longitudeFacets; ix++) {
            const u = ix / options.longitudeFacets;
            vertex = {
                x: Math.cos(options.longitudeStart + u * options.longitudeLength) * Math.sin(options.latitudeStart + v * options.latitudeLength),
                y: Math.cos(options.latitudeStart + v * options.latitudeLength),
                z: Math.sin(options.longitudeStart + u * options.longitudeLength) * Math.sin(options.latitudeStart + v * options.latitudeLength)
            };
            verticies.push(vertex);
            uvs.push({ u, v });
        }
    }

    const triangleVerticies = [];
    const triangleColors = options.color ? [] : undefined;
    const triangleUvs = [];

    const addVertex = function(index) {
        const vertex = verticies[index];
        triangleVerticies.push(vertex.x);
        triangleVerticies.push(vertex.y);
        triangleVerticies.push(vertex.z);

        const uv = uvs[index];
        triangleUvs.push(uv.u);
        triangleUvs.push(uv.v);

        if (options.color) options.color.forEach(c => { triangleColors.push(c); });
    }

    const addTriangle = function(ia, ib, ic) {
        addVertex(ia);
        addVertex(ib);
        addVertex(ic);
    }

    for (let iy = 0; iy < facets; iy++) {
        const r0 = iy * (facets + 1);
        const r1 = (iy + 1) * (facets + 1);
        for (let ix = 0; ix < options.longitudeFacets; ix++) {
            if (iy !== 0 || options.latitudeStart > 0)
                addTriangle(r0 + ix + 1, r0 + ix, r1 + ix + 1);
            if (iy !== facets - 1 || (options.latitudeStart + options.latitudeLength) < Math.PI)
                addTriangle(r0 + ix, r1 + ix, r1 + ix + 1);
        }
    }

    return window.frag.Mesh(engine).addTriangles(triangleVerticies, triangleColors, triangleUvs);
};