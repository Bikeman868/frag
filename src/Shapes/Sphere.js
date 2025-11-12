// This sphere consists of a single sub-mesh so that smooth shading works correctly
window.frag.Sphere = function (engine, latitudeFacets, options) {
    if (latitudeFacets === undefined) latitudeFacets = 12;
    let longitudeFacets = latitudeFacets * 2;

    let latitudeStart = 0;
    let latitudeLength = Math.PI;
    let latitudeTextureStart = 0
    let latitudeTextureEnd = Math.PI
    let latitudeTextureRepeat = 1;
    
    let longitudeStart = 0;
    let longitudeLength = 2 * Math.PI;
    let longitudeTextureStart = 0
    let longitudeTextureEnd = 2 * Math.PI
    let longitudeTextureRepeat = 1;

    let color;
    let skyBox = false;
    let textureRepeatU = 1;

    if (options) {
        if (options.latitudeStart !== undefined) latitudeStart = options.latitudeStart;
        if (options.latitudeLength !== undefined) latitudeLength = options.latitudeLength;
        if (options.latitudeFacets !== undefined) latitudeFacets = options.latitudeFacets;

        if (options.latitudeTextureStart !== undefined) latitudeTextureStart = options.latitudeTextureStart;
        if (options.latitudeTextureEnd !== undefined) latitudeTextureEnd = options.latitudeTextureEnd;
        if (options.latitudeTextureRepeat !== undefined) latitudeTextureRepeat = options.latitudeTextureRepeat;

        if (options.longitudeStart !== undefined) longitudeStart = options.longitudeStart;
        if (options.longitudeLength !== undefined) longitudeLength = options.longitudeLength;
        if (options.longitudeFacets !== undefined) longitudeFacets = options.longitudeFacets;

        if (options.longitudeTextureStart !== undefined) longitudeTextureStart = options.longitudeTextureStart;
        if (options.longitudeTextureEnd !== undefined) longitudeTextureEnd = options.longitudeTextureEnd;
        if (options.longitudeTextureRepeat !== undefined) longitudeTextureRepeat = options.longitudeTextureRepeat;

        if (options.color !== undefined) color = options.color;
        if (options.skyBox !== undefined) skyBox = options.skyBox;
    }

    if (latitudeFacets < 2) latitudeFacets = 2;
    if (longitudeFacets < 3) longitudeFacets = 3;
    if (latitudeStart < 0) latitudeStart = 0;
    if (latitudeStart + latitudeLength > Math.PI) latitudeLength = Math.PI - latitudeStart;
    if (longitudeLength > 2 * Math.PI) longitudeLength = 2 * Math.PI;
    if (textureRepeatU < 1) textureRepeatU - 1
    if (latitudeTextureRepeat < 1) latitudeTextureRepeat - 1

    const verticies = [];
    const uvs = [];

    for (let iy = 0; iy <= latitudeFacets; iy++) {
        const latitude = latitudeStart + iy / latitudeFacets * latitudeLength

        let v;
        if (latitude < latitudeTextureStart) v = 0;
        else if (latitude > latitudeTextureEnd) v = 1;
        else v = ((latitude - latitudeTextureStart) / (latitudeTextureEnd - latitudeTextureStart) * latitudeTextureRepeat) % 1;

        for (ix = 0; ix <= longitudeFacets; ix++) {
            const longitude = longitudeStart + ix / longitudeFacets * longitudeLength

            vertex = {
                x: Math.cos(longitude) * Math.sin(latitude),
                y: Math.cos(latitude),
                z: Math.sin(longitude) * Math.sin(latitude)
            };
            verticies.push(vertex);

            let u;
            if (longitude < longitudeTextureStart) u = 0
            else if (longitude > longitudeTextureEnd) u = 1
            else u = ((longitude - longitudeTextureStart) / (longitudeTextureEnd - longitudeTextureStart) * longitudeTextureRepeat) % 1;
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