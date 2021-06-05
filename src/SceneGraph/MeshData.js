// Represents a collection of mesh fragments where each
// fragment is a collection of triangles
window.frag.MeshData = function () {
    const frag = window.frag;
    const gl = frag.gl;

    const private = {
        glBuffer: gl.createBuffer(),
        meshFragments: [],
        finalized: false,
        fromBuffer: false,
        smoothShading: true,
        smoothTexture: false,
        wireframe: false,
    }

    const public = {
        __private: private,
        calcNormals: true,
        calcTangents: true,
        calcBitangents: false,
    };

    public.dispose = function () {
        if (private.glBuffer) {
            gl.deleteBuffer(private.glBuffer);
            private.glBuffer = null;
        }
    }

    public.name = function (value) {
        private.name = value;
        return public;
    }

    public.clear = function () {
        private.meshFragments.length = 0;
        private.finalized = false;
        return public;
    }

    public.shadeSmooth = function () {
        private.smoothShading = true;
        private.finalized = false;
        return public;
    }

    public.shadeFlat = function () {
        private.smoothShading = false;
        private.finalized = false;
        return public;
    }

    public.textureSmooth = function () {
        private.smoothTexture = true;
        private.finalized = false;
        return public;
    }

    public.textureFlat = function () {
        private.smoothTexture = false;
        private.finalized = false;
        return public;
    }

    public.wireframe = function (drawWireframe) {
        private.wireframe = !!drawWireframe;
        private.finalized = false;
        return public;
    }

    private.addFragment = function (vertexData) {
        private.meshFragments.push({
            vertexData,
            renderData: null,
            vertexDataOffset: undefined,
            uvDataOffset: undefined,
            normalDataOffset: undefined,
            tangentDataOffset: undefined,
            bitangentDataOffset: undefined,
        });
        private.finalized = false;
        return public;
    }

    public.addVertexData = function (vertexData) {
        return private.addFragment(vertexData);
    }

    public.addTriangles2D = function (verticies, uvs, normals, tangents, bitangents) {
        const vertexData = frag.VertexData().setTriangles2D(verticies, uvs, normals, tangents, bitangents);
        return private.addFragment(vertexData);
    }

    public.addTriangles = function (verticies, uvs, normals, tangents, bitangents) {
        const vertexData = frag.VertexData().setTriangles(verticies, uvs, normals, tangents, bitangents);
        return private.addFragment(vertexData);
    }

    public.addTriangleStrip = function (verticies, uvs, normals, tangents, bitangents) {
        const vertexData = frag.VertexData().setTriangleStrip(verticies, uvs, normals, tangents, bitangents);
        return private.addFragment(vertexData);
    }

    public.addTriangleFan = function (verticies, uvs, normals, tangents, bitangents) {
        const vertexData = frag.VertexData().setTriangleFan(verticies, uvs, normals, tangents, bitangents);
        return private.addFragment(vertexData);
    }

    public.fromBuffer = function (buffer, size, count, primitiveType, vertexDataOffset, uvDataOffset, normalDataOffset, tangentDataOffset, bitangentDataOffset)
    {
        const vertexData = frag.VertexData();
        vertexData.vertexDimensions = size;
        vertexData.vertexCount = count;
        vertexData.primitiveType = primitiveType;
        vertexData.extractTriangles = function () { };

        private.addFragment(vertexData);
        const fragment = private.meshFragments[private.meshFragments.length - 1];

        fragment.renderData = vertexData;
        fragment.vertexDataOffset = vertexDataOffset;
        fragment.uvDataOffset = uvDataOffset;
        fragment.normalDataOffset = normalDataOffset;
        fragment.tangentDataOffset = tangentDataOffset;
        fragment.bitangentDataOffset = bitangentDataOffset;

        gl.bindBuffer(gl.ARRAY_BUFFER, private.glBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, buffer, gl.STATIC_DRAW);

        private.finalized = true;
        private.fromBuffer = true;

        return public;
    }

    private.finalize = function () {
        private.finalized = true;

        const optimizer = frag.MeshOptimizer()
            .setFragments(private.meshFragments)
            .initialize(private.smoothShading, private.smoothTexture);

        if (public.calcTangents) optimizer.calcTangentsFromUvs();
        if (public.calcBitangents) optimizer.calcBitangentsFromUvs();
        if (public.calcNormals) optimizer.calcNormalsFromCross();
        if (public.calcNormals) optimizer.calcNormalsFromGeometry();
        if (public.calcBitangents) optimizer.calcBitangentsFromCross();

        if (private.wireframe) {
            private.meshFragments.forEach((m) => {
                const verticies = [];
                const uvs = [];
                const normals = [];
                const add = function (i) {
                    const vertex = m.renderData.getVertexVector(i);
                    const uv = m.renderData.getUvVector(i);
                    const normal = m.renderData.getNormalVector(i);
                    if (vertex) vertex.forEach(v => verticies.push(v));
                    if (uv) uv.forEach(t => uvs.push(t));
                    if (normal) normal.forEach(n => normals.push(n));
                };
                m.vertexData.extractTriangles(function (a, b, c) {
                    add(a); add(b);
                    add(b); add(c);
                    add(c); add(a);
                });
                if (m.vertexData.vertexDimensions == 2)
                    m.renderData = frag.VertexData().setLines2D(verticies, uvs, normals);
                else
                    m.renderData = frag.VertexData().setLines(verticies, uvs, normals);
            });
        }

        let length = 0;
        private.meshFragments.forEach((m) => {
            length += m.renderData.verticies.length;
            if (m.renderData.uvs) length += m.renderData.uvs.length;
            if (m.renderData.normals) length += m.renderData.normals.length;
            if (m.renderData.tangents) length += m.renderData.tangents.length;
            if (m.renderData.bitangents) length += m.renderData.bitangents.length;
        });

        const buffer = new Float32Array(length);

        const copy = function (arr) {
            if (!arr) return undefined;

            for (let i = 0; i < arr.length; i++) {
                buffer[offset + i] = arr[i];
            }
            const o = offset;
            offset += arr.length;
            return o * Float32Array.BYTES_PER_ELEMENT;
        };

        let offset = 0;
        private.meshFragments.forEach((m) => {
            m.vertexDataOffset = copy(m.renderData.verticies);
            m.uvDataOffset = copy(m.renderData.uvs);
            m.normalDataOffset = copy(m.renderData.normals);
            m.tangentDataOffset = copy(m.renderData.tangents);
            m.bitangentDataOffset = copy(m.renderData.bitangents);
        });

        gl.bindBuffer(gl.ARRAY_BUFFER, private.glBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, buffer, gl.STATIC_DRAW);

        return public;
    }

    public.draw = function (gl, shader) {
        if (!private.finalized && !private.fromBuffer) private.finalize();

        gl.bindBuffer(gl.ARRAY_BUFFER, private.glBuffer);

        for (let i = 0; i < private.meshFragments.length; i++) {
            const fragment = private.meshFragments[i];

            if (shader.attributes.position >= 0) {
                if (fragment.vertexDataOffset != undefined) {
                    gl.enableVertexAttribArray(shader.attributes.position)
                    gl.vertexAttribPointer(shader.attributes.position, fragment.renderData.vertexDimensions, gl.FLOAT, false, 0, fragment.vertexDataOffset);
                } else {
                    gl.disableVertexAttribArray(shader.attributes.position)
                }
            }

            if (shader.attributes.texture >= 0) {
                if (fragment.uvDataOffset != undefined) {
                    gl.enableVertexAttribArray(shader.attributes.texture);
                    gl.vertexAttribPointer(shader.attributes.texture, fragment.renderData.uvDimensions, gl.FLOAT, false, 0, fragment.uvDataOffset);
                } else {
                    gl.disableVertexAttribArray(shader.attributes.texture)
                }
            }

            if (shader.attributes.normal >= 0) {
                if (fragment.normalDataOffset != null) {
                    gl.enableVertexAttribArray(shader.attributes.normal);
                    gl.vertexAttribPointer(shader.attributes.normal, fragment.renderData.normalDimensions, gl.FLOAT, true, 0, fragment.normalDataOffset);
                } else {
                    gl.disableVertexAttribArray(shader.attributes.normal)
                }
            }

            if (shader.attributes.tangent >= 0) {
                if (fragment.tangentDataOffset != null) {
                    gl.enableVertexAttribArray(shader.attributes.tangent);
                    gl.vertexAttribPointer(shader.attributes.tangent, fragment.renderData.normalDimensions, gl.FLOAT, true, 0, fragment.tangentDataOffset);
                } else {
                    gl.disableVertexAttribArray(shader.attributes.tangent)
                }
            }

            if (shader.attributes.bitangent >= 0) {
                if (fragment.bitangentDataOffset != null) {
                    gl.enableVertexAttribArray(shader.attributes.bitangent);
                    gl.vertexAttribPointer(shader.attributes.bitangent, fragment.renderData.normalDimensions, gl.FLOAT, true, 0, fragment.bitangentDataOffset);
                } else {
                    gl.disableVertexAttribArray(shader.attributes.bitangent)
                }
            }

            gl.drawArrays(fragment.renderData.primitiveType, 0, fragment.renderData.vertexCount);
        }

        return public;
    }

    return public;
};
