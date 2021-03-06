window.frag.VertexData = function(engine) {
    const frag = window.frag;
    const gl = engine.gl;

    const private = {
    };

    const public = {
        __private: private,
        primitiveType: gl.TRIANGLES,
        vertexCount: 0,
        verticies: undefined,
        vertexDimensions: 3,
        colors: undefined,
        colorDimensions: 3,
        uvs: undefined,
        uvDimensions: 2,
        normals: undefined,
        normalDimensions: 3,
        tangents: undefined,
        bitangents: undefined,
    };

    public.dispose = function () {
    }

    public.clone = function () {
        const clone = frag.VertexData(engine);

        clone.primitiveType = public.primitiveType;
        clone.vertexCount = public.vertexCount;
        clone.vertexDimensions = public.vertexDimensions;
        clone.colorDimensions = public.colorDimensions;
        clone.uvDimensions = public.uvDimensions;
        clone.normalDimensions = public.normalDimensions;

        clone.verticies = public.verticies;

        if (public.colors) clone.colors = Array.from(public.colors);
        if (public.uvs) clone.uvs = Array.from(public.uvs);
        if (public.normals) clone.normals = Array.from(public.normals);
        if (public.tangents) clone.tangents = Array.from(public.tangents);
        if (public.bitangents) clone.bitangents = Array.from(public.bitangents);

        return clone;
    }

    public.vertexIndex = function (index, coord) { return index * public.vertexDimensions + (coord || 0); };
    public.colorIndex = function (index, coord) { return index * public.colorDimensions + (coord || 0); };
    public.uvIndex = function (index, coord) { return index * public.uvDimensions + (coord || 0); };
    public.normalIndex = function (index, coord) { return index * public.normalDimensions + (coord || 0); };
    public.tangentIndex = function (index, coord) { return index * public.normalDimensions + (coord || 0); };
    public.bitangentIndex = function (index, coord) { return index * public.normalDimensions + (coord || 0); };

    private.getVector = function (array, index, dimensions) {
        if (dimensions === 2) return frag.Vector.extract2D(array, index);
        return frag.Vector.extract3D(array, index);
    };

    private.setVector = function (array, index, v) {
        for (i = 0; i < v.length; i++)
            array[index + i] = v[i];
    };

    public.getVertexVector = function (index) {
        return private.getVector(public.verticies, public.vertexIndex(index), public.vertexDimensions);
    };

    public.setVertexVector = function (index, v) {
        return private.setVector(public.verticies, public.vertexIndex(index), v);
    };

    public.getColor = function (index) {
        return private.getVector(public.colors, public.colorIndex(index), public.colorDimensions);
    };

    public.setColor = function (index, v) {
        return private.setVector(public.colors, public.colorIndex(index), v);
    };

    public.getUvVector = function (index) {
        return private.getVector(public.uvs, public.uvIndex(index), public.uvDimensions);
    };

    public.setUvVector = function (index, v) {
        return private.setVector(public.uvs, public.uvIndex(index), v);
    };

    public.getNormalVector = function (index) {
        return private.getVector(public.normals, public.normalIndex(index), public.normalDimensions);
    };

    public.setNormalVector = function (index, v) {
        return private.setVector(public.normals, public.normalIndex(index), v);
    };

    public.getTangentVector = function (index) {
        return private.getVector(public.tangents, public.tangentIndex(index), public.normalDimensions);
    };

    public.setTangentVector = function (index, v) {
        return private.setVector(public.tangents, public.tangentIndex(index), v);
    };

    public.getBitangentVector = function (index) {
        return private.getVector(public.bitangents, public.bitangentIndex(index), public.normalDimensions);
    };

    public.setBitangentVector = function (index, v) {
        return private.setVector(public.bitangents, public.bitangentIndex(index), v);
    };

    public.setTriangles2D = function (data) {
        public.primitiveType = gl.TRIANGLES;

        public.vertexDimensions = 2;
        public.verticies = data.verticies;
        public.vertexCount = data.verticies.length / public.vertexDimensions;

        public.colorDimensions = 3;
        public.colors = data.colors;

        public.uvDimensions = 2;
        public.uvs = data.uvs;

        public.normalDimensions = 3;
        public.normals = data.normals;
        public.tangents = data.tangents;
        public.bitangents = data.bitangents;

        public.extractTriangles = function (addTriangle) {
            for (let i = 0; i < public.vertexCount; i += 3) {
                addTriangle(i, i + 1, i + 2);
            }
        };

        return public;
    }

    public.setTriangles = function (data) {
        public.primitiveType = gl.TRIANGLES;

        public.vertexDimensions = 3;
        public.verticies = data.verticies;
        public.vertexCount = data.verticies.length / public.vertexDimensions;

        public.colorDimensions = 3;
        public.colors = data.colors;

        public.uvDimensions = 2;
        public.uvs = data.uvs;

        public.normalDimensions = 3;
        public.normals = data.normals;
        public.tangents = data.tangents;
        public.bitangents = data.bitangents;

        public.extractTriangles = function (addTriangle) {
            for (let i = 0; i < public.vertexCount; i += 3) {
                addTriangle(i, i + 1, i + 2);
            }
        };

        return public;
    }

    public.setTriangleStrip = function (data) {
        public.primitiveType = gl.TRIANGLE_STRIP;

        public.vertexDimensions = 3;
        public.verticies = data.verticies;
        public.vertexCount = data.verticies.length / public.vertexDimensions;

        public.colorDimensions = 3;
        public.colors = data.colors;

        public.uvDimensions = 2;
        public.uvs = data.uvs;

        public.normalDimensions = 3;
        public.normals = data.normals;
        public.tangents = data.tangents;
        public.bitangents = data.bitangents;

        public.extractTriangles = function (addTriangle) {
            const triangleCount = public.vertexCount - 2;
            for (let i = 0; i < triangleCount; i++) {
                if ((i & 1) === 0) addTriangle(i, i + 1, i + 2);
                else addTriangle(i + 2, i + 1, i);
            }
        };

        return public;
    }

    public.setTriangleFan = function (data) {
        public.primitiveType = gl.TRIANGLE_FAN;

        public.vertexDimensions = 3;
        public.verticies = data.verticies;
        public.vertexCount = data.verticies.length / public.vertexDimensions;

        public.colorDimensions = 3;
        public.colors = data.colors;

        public.uvDimensions = 2;
        public.uvs = data.uvs;

        public.normalDimensions = 3;
        public.normals = data.normals;
        public.tangents = data.tangents;
        public.bitangents = data.bitangents;

        public.extractTriangles = function (addTriangle) {
            const triangleCount = public.vertexCount - 2;
            for (let i = 0; i < triangleCount; i++) {
                addTriangle(0, i + 1, i + 2);
            }
        };

        return public;
    }

    public.setLines2D = function () {
        public.primitiveType = gl.LINES;

        public.vertexDimensions = 2;
        public.verticies = data.verticies;
        public.vertexCount = data.verticies.length / public.vertexDimensions;

        public.colorDimensions = 3;
        public.colors = data.colors;

        public.uvDimensions = 2;
        public.uvs = data.uvs;

        public.normalDimensions = 3;
        public.normals = data.normals;
        public.tangents = null;
        public.bitangents = null;

        public.extractTriangles = function () { };

        return public;
    }

    public.setLines = function (data) {
        public.primitiveType = gl.LINES;

        public.vertexDimensions = 3;
        public.verticies = data.verticies;
        public.vertexCount = data.verticies.length / public.vertexDimensions;

        public.colorDimensions = 3;
        public.colors = data.colors;

        public.uvDimensions = 2;
        public.uvs = data.uvs;

        public.normalDimensions = 3;
        public.normals = data.normals;
        public.tangents = null;
        public.bitangents = null;

        public.extractTriangles = function () { };

        return public;
    }

    public.setLineStrip = function (data) {
        public.primitiveType = gl.LINE_STRIP;

        public.vertexDimensions = 3;
        public.verticies = data.verticies;
        public.vertexCount = data.verticies.length / public.vertexDimensions;

        public.colorDimensions = 3;
        public.colors = data.colors;

        public.uvDimensions = 2;
        public.uvs = data.uvs;

        public.normalDimensions = 3;
        public.normals = data.normals;
        public.tangents = null;
        public.bitangents = null;

        public.extractTriangles = function () { };

        return public;
    }

    return public;
};
