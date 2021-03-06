// Represents a collection of mesh fragments where each
// fragment is a collection of triangles
window.frag.Mesh = function (engine) {
    const frag = window.frag;
    const gl = engine.gl;

    const private = {
        glBuffer: gl.createBuffer(),
        meshFragments: [],
        debugFragments: [],
        finalized: false,
        fromBuffer: false,
        smoothShading: true,
        smoothTexture: false,
        wireframe: false,
        normalLength: 0,
        normalColor: [0, 0, 255],
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

    public.fragmentsUpdated = function() {
        if (!private.fromBuffer)
            private.finalized = false;
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

    public.drawNormals = function (length, color) {
        private.normalLength = length;
        if (color !== undefined) private.normalColor = color;
        private.finalized = false;
        return public;
    }

    private.Fragment = function(vertexData, material, uniforms) {
        return {
            vertexData,
            renderData: null,
            material,
            uniforms,
            vertexDataOffset: undefined,
            colorDataOffset: undefined,
            uvDataOffset: undefined,
            normalDataOffset: undefined,
            tangentDataOffset: undefined,
            bitangentDataOffset: undefined,
        };
    }

    private.addFragment = function (vertexData, material, uniforms) {
        const fragment = private.Fragment(vertexData, material, uniforms);
        private.meshFragments.push(fragment);
        private.finalized = false;
        return fragment;
    }

    public.addVertexData = function (vertexData, material, uniforms) {
        return private.addFragment(vertexData, material, uniforms);
    }

    public.addTriangles2D = function (data) {
        const vertexData = frag.VertexData(engine).setTriangles2D(data);
        return private.addFragment(vertexData, data.material, data.uniforms);
    }

    public.addTriangles = function (data) {
        const vertexData = frag.VertexData(engine).setTriangles(data);
        return private.addFragment(vertexData, data.material, data.uniforms);
    }

    public.addTriangleStrip = function (data) {
        const vertexData = frag.VertexData(engine).setTriangleStrip(data);
        return private.addFragment(vertexData, data.material, data.uniforms);
    }

    public.addTriangleFan = function (data) {
        const vertexData = frag.VertexData(engine).setTriangleFan(data);
        return private.addFragment(vertexData, data.material, data.uniforms);
    }

    public.fromBuffer = function(data)
    {
        const vertexData = frag.VertexData(engine);
        vertexData.vertexDimensions = data.size;
        vertexData.vertexCount = data.count;
        vertexData.primitiveType = data.primitiveType;
        vertexData.extractTriangles = function () { };

        const fragment = private.addFragment(vertexData);

        fragment.renderData = vertexData;
        fragment.vertexDataOffset = data.vertexDataOffset;
        fragment.colorDataOffset = data.colorDataOffset;
        fragment.uvDataOffset = data.uvDataOffset;
        fragment.normalDataOffset = data.normalDataOffset;
        fragment.tangentDataOffset = data.tangentDataOffset;
        fragment.bitangentDataOffset = data.bitangentDataOffset;
        fragment.material = data.material;
        fragment.uniforms = data.uniforms;

        gl.bindBuffer(gl.ARRAY_BUFFER, private.glBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, data.buffer, gl.STATIC_DRAW);

        private.finalized = true;
        private.fromBuffer = true;

        return fragment;
    }

    private.addFragmentDebugInfo = function(fragment) {
        if (!private.wireframe && private.normalLength == 0) return;

        let newFragment = fragment;
        if (!private.wireframe) {
            newFragment = private.Fragment(fragment.vertexData)
            private.debugFragments.push(newFragment);
        }

        const verticies = [];
        const colors = [];
        const uvs = [];
        const normals = [];

        const addVertex = function (i) {
            const vertex = fragment.renderData.getVertexVector(i);
            const color = fragment.renderData.getColor(i);
            const uv = fragment.renderData.getUvVector(i);
            const normal = fragment.renderData.getNormalVector(i);
            if (vertex) vertex.forEach(v => verticies.push(v));
            if (color) color.forEach((c) => colors.push(c));
            else private.normalColor.forEach(() => colors.push(0));
            if (uv) uv.forEach(t => uvs.push(t));
            if (normal) normal.forEach(n => normals.push(n));
        };

        const addNormal = function (i) {
            const vertex = fragment.renderData.getVertexVector(i);
            const uv = fragment.renderData.getUvVector(i);
            const normal = fragment.renderData.getNormalVector(i);

            if (vertex) {
                for (let j = 0; j < vertex.length; j++) {
                    verticies.push(vertex[j])
                }
                for (let j = 0; j < vertex.length; j++) {
                    verticies.push(vertex[j] + normal[j] * private.normalLength)
                }
            }

            private.normalColor.forEach((c) => colors.push(c));
            private.normalColor.forEach((c) => colors.push(c));

            if (uv) {
                uv.forEach(t => uvs.push(t));
                uv.forEach(t => uvs.push(t));
            }

            if (normal) {
                normal.forEach(n => normals.push(n));
                normal.forEach(n => normals.push(n));
            }
        };

        fragment.vertexData.extractTriangles(function (a, b, c) {
            if (private.wireframe) {
                addVertex(a); addVertex(b);
                addVertex(b); addVertex(c);
                addVertex(c); addVertex(a);
            }
            if (private.normalLength > 0) {
                addNormal(a);
                addNormal(b);
                addNormal(b);
            }
        });

        if (fragment.vertexData.vertexDimensions == 2)
            newFragment.renderData = frag.VertexData(engine).setLines2D({verticies, colors, uvs, normals});
        else
            newFragment.renderData = frag.VertexData(engine).setLines({verticies, colors, uvs, normals});
    }

    private.finalize = function () {
        private.finalized = true;

        const optimizer = frag.MeshOptimizer(engine)
            .setFragments(private.meshFragments)
            .initialize(private.smoothShading, private.smoothTexture);

        if (public.calcTangents) optimizer.calcTangentsFromUvs();
        if (public.calcBitangents) optimizer.calcBitangentsFromUvs();
        if (public.calcNormals) optimizer.calcNormalsFromCross();
        if (public.calcNormals) optimizer.calcNormalsFromGeometry();
        if (public.calcBitangents) optimizer.calcBitangentsFromCross();

        private.debugFragments = [];
        private.meshFragments.forEach((f) => {
            private.addFragmentDebugInfo(f);
        });

        let length = 0;
        const countFragmentLength = function(fragment){
            length += fragment.renderData.verticies.length;
            if (fragment.renderData.colors) length += fragment.renderData.colors.length;
            if (fragment.renderData.uvs) length += fragment.renderData.uvs.length;
            if (fragment.renderData.normals) length += fragment.renderData.normals.length;
            if (fragment.renderData.tangents) length += fragment.renderData.tangents.length;
            if (fragment.renderData.bitangents) length += fragment.renderData.bitangents.length;
        }
        private.meshFragments.forEach(countFragmentLength);
        private.debugFragments.forEach(countFragmentLength);
        
        const buffer = new Float32Array(length);

        let offset = 0;

        const copy = function (arr) {
            if (!arr) return undefined;

            for (let i = 0; i < arr.length; i++) {
                buffer[offset + i] = arr[i];
            }
            const o = offset;
            offset += arr.length;
            return o * Float32Array.BYTES_PER_ELEMENT;
        };

        const copyFragmentData = function(fragment) {
            fragment.vertexDataOffset = copy(fragment.renderData.verticies);
            fragment.colorDataOffset = copy(fragment.renderData.colors);
            fragment.uvDataOffset = copy(fragment.renderData.uvs);
            fragment.normalDataOffset = copy(fragment.renderData.normals);
            fragment.tangentDataOffset = copy(fragment.renderData.tangents);
            fragment.bitangentDataOffset = copy(fragment.renderData.bitangents);
        };
        private.meshFragments.forEach(copyFragmentData);
        private.debugFragments.forEach(copyFragmentData);

        gl.bindBuffer(gl.ARRAY_BUFFER, private.glBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, buffer, gl.STATIC_DRAW);

        return public;
    }

    private.bindFragmentPosition = function(shader, fragment, unbindFuncs) {
        if (shader.attributes.position >= 0) {
            if (fragment.vertexDataOffset != undefined) {
                gl.vertexAttribPointer(shader.attributes.position, fragment.renderData.vertexDimensions, gl.FLOAT, false, 0, fragment.vertexDataOffset);
                gl.enableVertexAttribArray(shader.attributes.position)
                unbindFuncs.push(function() {gl.disableVertexAttribArray(shader.attributes.position)} );
            }
        }
    }

    private.bindFragmentColor = function(shader, fragment, unbindFuncs) {
        if (shader.attributes.color >= 0) {
            if (fragment.colorDataOffset != undefined) {
                gl.vertexAttribPointer(shader.attributes.color, fragment.renderData.colorDimensions, gl.FLOAT, false, 0, fragment.colorDataOffset);
                gl.enableVertexAttribArray(shader.attributes.color)
                unbindFuncs.push(function() {gl.disableVertexAttribArray(shader.attributes.color)} );
            }
        }
    }

    private.bindFragmentTexture = function(shader, fragment, unbindFuncs) {
        if (shader.attributes.texcoord >= 0) {
            if (fragment.uvDataOffset != undefined) {
                gl.vertexAttribPointer(shader.attributes.texcoord, fragment.renderData.uvDimensions, gl.FLOAT, false, 0, fragment.uvDataOffset);
                gl.enableVertexAttribArray(shader.attributes.texcoord);
                unbindFuncs.push(function() {gl.disableVertexAttribArray(shader.attributes.texcoord)} );
            }
        }
    }

    private.bindFragmentNormals = function(shader, fragment, unbindFuncs) {
        if (shader.attributes.normal >= 0) {
            if (fragment.normalDataOffset != null) {
                gl.vertexAttribPointer(shader.attributes.normal, fragment.renderData.normalDimensions, gl.FLOAT, true, 0, fragment.normalDataOffset);
                gl.enableVertexAttribArray(shader.attributes.normal);
                unbindFuncs.push(function() {gl.disableVertexAttribArray(shader.attributes.normal)} );
            }
        }
    }

    private.bindFragmentTangents = function(shader, fragment, unbindFuncs) {
        if (shader.attributes.tangent >= 0) {
            if (fragment.tangentDataOffset != null) {
                gl.vertexAttribPointer(shader.attributes.tangent, fragment.renderData.normalDimensions, gl.FLOAT, true, 0, fragment.tangentDataOffset);
                gl.enableVertexAttribArray(shader.attributes.tangent);
                unbindFuncs.push(function() {gl.disableVertexAttribArray(shader.attributes.tangent)} );
            }
        }
    }

    private.bindFragmentBitangents = function(shader, fragment, unbindFuncs) {
        if (shader.attributes.bitangent >= 0) {
            if (fragment.bitangentDataOffset != null) {
                gl.vertexAttribPointer(shader.attributes.bitangent, fragment.renderData.normalDimensions, gl.FLOAT, true, 0, fragment.bitangentDataOffset);
                gl.enableVertexAttribArray(shader.attributes.bitangent);
                unbindFuncs.push(function() {gl.disableVertexAttribArray(shader.attributes.bitangent)} );
            }
        }
    }

    private.drawFragment = function(shader, fragment) {
        const unbindFuncs = [];

        if (fragment.material) {
            fragment.material.apply(shader);
        }
        
        if (fragment.uniforms) {
            for (let i = 0; i < fragment.uniforms.length; i++) {
                const uniform = fragment.uniforms[i];
                const shaderUniform = shader.uniforms[uniform.name]
                if (shaderUniform !== undefined) {
                    const baseName = uniform.name[0].toUpperCase() + uniform.name.substring(1);
                    const overrideFunction = shader['override' + baseName];
                    if (overrideFunction) 
                        overrideFunction(uniform.value);
                    else if (uniform.type)
                        gl["uniform" + uniform.type](shaderUniform, uniform.value);
                    else
                        console.error('To override a uniform on a mesh fragment you must specify the type either in the override or in the uniform definition on the shader');
                    const restoreFunction = shader['restore' + baseName];
                    if (restoreFunction) {
                        unbindFuncs.push(restoreFunction);
                    }
                }
            }
        }

        private.bindFragmentPosition(shader, fragment, unbindFuncs);
        private.bindFragmentColor(shader, fragment, unbindFuncs);
        private.bindFragmentTexture(shader, fragment, unbindFuncs);
        private.bindFragmentNormals(shader, fragment, unbindFuncs);
        private.bindFragmentTangents(shader, fragment, unbindFuncs);
        private.bindFragmentBitangents(shader, fragment, unbindFuncs);

        gl.drawArrays(fragment.renderData.primitiveType, 0, fragment.renderData.vertexCount);

        for (let i = 0; i < unbindFuncs.length; i++) unbindFuncs[i]();
    }

    public.draw = function (drawContext, getComponent) {
        const shader = drawContext.getShader();
        if (!shader) return public;
        
        if (!private.finalized && !private.fromBuffer) private.finalize();

        const gl = engine.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, private.glBuffer);
        
        for (let i = 0; i < private.meshFragments.length; i++) {
            const fragment = private.meshFragments[i];
            drawContext.beginFragment(getComponent(fragment, i));
            private.drawFragment(shader, fragment);
            drawContext.endFragment();
        }

        if (!drawContext.isHitTest) {
            for (let i = 0; i < private.debugFragments.length; i++) {
                const fragment = private.debugFragments[i];
                private.drawFragment(shader, fragment);
            }
        }

        return public;
    }

    return public;
};
