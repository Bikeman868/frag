// Applies mesh smoothing and calculates normals and binormals where required
window.frag.MeshOptimizer = function (engine) {
    const frag = window.frag;

    const private = {
        meshFragments: null,
        smoothShading: true,
        smoothTexture: false,
        fragmentTriangles: null,
        groups: null,
        groupIndecies: null,
    }

    const public = {
        __private: private,
    };

    private.ensureTriangles = function () {
        if (private.fragmentTriangles) return;

        private.fragmentTriangles = [];

        private.meshFragments.forEach(fragment => {
            const vertexData = fragment.vertexData;
            const fragmentTriangles = {
                triangles: [],
                vertexTriangleIndecies: []
            };
            fragmentTriangles.vertexTriangleIndecies.length = vertexData.vertexCount;
            if (vertexData.verticies) {
                vertexData.extractTriangles(function (a, b, c) {
                    const vectorA = vertexData.getVertexVector(a);
                    const vectorB = vertexData.getVertexVector(b);
                    const vectorC = vertexData.getVertexVector(c);

                    const fragmentTriangle = {
                        triangle: frag.Triangle.makeTriangleFromVectors(vectorA, vectorB, vectorC),
                        normal: null,
                        tangent: null,
                        bitangent: null
                    };
                    fragmentTriangle.normal = frag.Triangle.normal(fragmentTriangle.triangle);

                    if (vertexData.uvs) {
                        const uvA = vertexData.getUvVector(a);
                        const uvB = vertexData.getUvVector(b);
                        const uvC = vertexData.getUvVector(c);

                        const Vector = frag.Vector;
                        const deltaPos1 = Vector.sub(vectorB, vectorA);
                        const deltaPos2 = Vector.sub(vectorC, vectorA);
                        const deltaUv1 = Vector.sub(uvB, uvA);
                        const deltaUv2 = Vector.sub(uvC, uvA);

                        const r = deltaUv1[0] * deltaUv2[1] - deltaUv1[1] * deltaUv2[0];
                        if (r === 0) {
                            fragmentTriangle.tangent = Vector.zero(vertexData.normalDimensions);
                            fragmentTriangle.bitangent = Vector.zero(vertexData.normalDimensions);
                        } else {
                            const ri = 1 / r;
                            fragmentTriangle.tangent = Vector.normalize(Vector.mult(Vector.sub(Vector.mult(deltaPos1, deltaUv2[1]), Vector.mult(deltaPos2, deltaUv1[1])), ri));
                            fragmentTriangle.bitangent = Vector.normalize(Vector.mult(Vector.sub(Vector.mult(deltaPos2, deltaUv1[0]), Vector.mult(deltaPos1, deltaUv2[0])), ri));
                        }
                    }

                    fragmentTriangles.triangles.push(fragmentTriangle);
                    const index = fragmentTriangles.triangles.length - 1;

                    fragmentTriangles.vertexTriangleIndecies[a] = index;
                    fragmentTriangles.vertexTriangleIndecies[b] = index;
                    fragmentTriangles.vertexTriangleIndecies[c] = index;
                });
            }

            private.fragmentTriangles.push(fragmentTriangles);
        });
    }

    private.ensureGroups = function () {
        if (private.groups) return;

        private.groups = [];
        private.groupIndecies = {};

        const equal = function (vertexData, index, vertex) {
            if (vertexData.vertexDimensions !== vertex.length) return false;
            const offset = vertexData.vertexIndex(index);
            for (var i = 0; i < vertex.length; i++)
                if (Math.abs(vertexData.verticies[offset + i] - vertex[i]) > 0.00001) return false;
            return true;
        };

        for (let fragmentIndex = 0; fragmentIndex < private.meshFragments.length; fragmentIndex++) {
            const fragment = private.meshFragments[fragmentIndex];
            const groupIndecies = private.groupIndecies[fragmentIndex] || [];
            private.groupIndecies[fragmentIndex] = groupIndecies;

            if (fragment.vertexData.verticies) {
                for (let vertexIndex = 0; vertexIndex < fragment.vertexData.vertexCount; vertexIndex++) {
                    let found = false;
                    for (var groupIndex = 0; !found && groupIndex < private.groups.length; groupIndex++) {
                        const group = private.groups[groupIndex];
                        if (equal(fragment.vertexData, vertexIndex, group.vertex)) {
                            group.fragmentIndecies[fragmentIndex] = group.fragmentIndecies[fragmentIndex] || [];
                            group.fragmentIndecies[fragmentIndex].push(vertexIndex);
                            groupIndecies.push(groupIndex);
                            found = true;
                        }
                    }
                    if (!found) {
                        groupIndecies.push(private.groups.length);
                        const group = {
                            vertex: fragment.vertexData.getVertexVector(vertexIndex),
                            fragmentIndecies: {},
                            normal: frag.Vector.zero(fragment.vertexData.normalDimensions),
                            uv: frag.Vector.zero(fragment.vertexData.uvDimensions),
                        };
                        group.fragmentIndecies[fragmentIndex] = [vertexIndex];
                        private.groups.push(group);
                    }
                }
            }
        }
    };

    private.calcGroupNormals = function () {
        private.ensureGroups();
        for (let groupIndex = 0; groupIndex < private.groups.length; groupIndex++) {
            const group = private.groups[groupIndex];
            group.normal = frag.Vector.zero(private.meshFragments[0].renderData.normalDimensions);
            for (const fragmentIndex in group.fragmentIndecies) {
                const fragment = private.meshFragments[fragmentIndex];
                const vertexData = fragment.renderData ? fragment.renderData : fragment.vertexData;
                if (vertexData && vertexData.normals) {
                    const fragmentIndecies = group.fragmentIndecies[fragmentIndex];
                    for (let i = 0; i < fragmentIndecies.length; i++) {
                        const vertexIndex = fragmentIndecies[i];
                        const vertexNormal = vertexData.getNormalVector(vertexIndex);
                        group.normal = frag.Vector.add(group.normal, vertexNormal);
                    }
                }
            };
            group.normal = frag.Vector.normalize(group.normal);
        }
    };

    private.calcGroupUvs = function () {
        private.ensureGroups();
        for (let groupIndex = 0; groupIndex < private.groups.length; groupIndex++) {
            const group = private.groups[groupIndex];
            for (const fragmentIndex in group.fragmentIndecies) {
                const fragment = private.meshFragments[fragmentIndex];
                const vertexData = fragment.renderData ? fragment.renderData : fragment.vertexData;
                if (vertexData) {
                    const fragmentIndicies = group.fragmentIndecies[fragmentIndex];
                    if (fragmentIndicies.length > 0) {
                        const vertexIndex = fragmentIndicies[0];
                        group.uv = vertexData.getUvVector(vertexIndex);
                    }
                }
            }
        }
    };

    private.calcSmoothShading = function () {
        for (let fragmentIndex = 0; fragmentIndex < private.meshFragments.length; fragmentIndex++) {
            const fragment = private.meshFragments[fragmentIndex];
            if (!fragment.renderData.normals) return;
        }

        private.calcGroupNormals();

        for (let fragmentIndex = 0; fragmentIndex < private.meshFragments.length; fragmentIndex++) {
            const fragment = private.meshFragments[fragmentIndex];
            const renderData = fragment.renderData;
            const groupIndecies = private.groupIndecies[fragmentIndex];
            if (groupIndecies.length) {
                renderData.normals = [];
                for (var vertexIndex = 0; vertexIndex < renderData.vertexCount; vertexIndex++) {
                    const group = private.groups[groupIndecies[vertexIndex]];
                    for (var i = 0; i < renderData.normalDimensions; i++)
                        renderData.normals.push(group.normal[i]);
                }
            }
        }
    }

    private.calcSmoothTexture = function () {
        private.calcGroupUvs();
        for (let fragmentIndex = 0; fragmentIndex < private.meshFragments.length; fragmentIndex++) {
            const vertexData = private.meshFragments[fragmentIndex].renderData;
            const groupIndecies = private.groupIndecies[fragmentIndex];
            if (groupIndecies.length) {
                vertexData.uvs = [];
                for (var vertexIndex = 0; vertexIndex < vertexData.vertexCount; vertexIndex++) {
                    const group = private.groups[groupIndecies[vertexIndex]];
                    for (var i = 0; i < vertexData.uvDimensions; i++)
                        vertexData.uvs.push(group.uv[i]);
                }
            }
        }
    }

    public.setFragments = function (meshFragments) {
        private.meshFragments = meshFragments;
        return public;
    };

    public.initialize = function (smoothShading, smoothTexture) {
        private.smoothShading = smoothShading;
        private.smoothTexture = smoothTexture;

        private.meshFragments.forEach((fragment) => {
            fragment.renderData = fragment.vertexData.clone();
        });

        if (smoothTexture) {
            private.calcSmoothTexture();
        }
        return public;
    };

    public.calcTangentsFromUvs = function () {
        for (let fragmentIndex = 0; fragmentIndex < private.meshFragments.length; fragmentIndex++) {
            const fragment = private.meshFragments[fragmentIndex];
            const renderData = fragment.renderData;
            const vertexData = fragment.vertexData;
            if (!renderData.tangents) {
                if (vertexData.tangents) {
                    renderData.tangents = [];
                    for (let vertexIndex = 0; vertexIndex < vertexData.vertexCount; vertexIndex++) {
                        for (var i = 0; i < vertexData.normalDimensions; i++) {
                            renderData.tangents.push(vertexData.tangents[vertexData.tangentIndex(vertexIndex, i)]);
                        }
                    }
                } else {
                    if (renderData.uvs) {
                        private.ensureTriangles();
                        const fragmentTriangles = private.fragmentTriangles[fragmentIndex];
                        if (fragmentTriangles && fragmentTriangles.triangles) {
                            renderData.tangents = [];
                            renderData.tangents.length = renderData.normalDimensions * renderData.vertexCount;
                            for (let vertexIndex = 0; vertexIndex < renderData.vertexCount; vertexIndex++) {
                                const triangleIndex = fragmentTriangles.vertexTriangleIndecies[vertexIndex];
                                const triangle = fragmentTriangles.triangles[triangleIndex];
                                if (triangle) {
                                    renderData.setTangentVector(vertexIndex, triangle.tangent);
                                }
                            }
                        }
                    }
                }
            }
        }
        return public;
    };

    public.calcBitangentsFromUvs = function () {
        for (let fragmentIndex = 0; fragmentIndex < private.meshFragments.length; fragmentIndex++) {
            const fragment = private.meshFragments[fragmentIndex];
            const renderData = fragment.renderData;
            const vertexData = fragment.vertexData;
            if (!renderData.bitangents) {
                if (vertexData.bitangents) {
                    renderData.bitangents = [];
                    for (let vertexIndex = 0; vertexIndex < vertexData.vertexCount; vertexIndex++) {
                        for (var i = 0; i < vertexData.normalDimensions; i++) {
                            renderData.bitangents.push(vertexData.bitangents[vertexData.bitangentIndex(vertexIndex, i)]);
                        }
                    }
                } else {
                    if (renderData.uvs) {
                        private.ensureTriangles();
                        const fragmentTriangles = private.fragmentTriangles[fragmentIndex];
                        if (fragmentTriangles && fragmentTriangles.triangles) {
                            renderData.bitangents = [];
                            renderData.bitangents.length = renderData.normalDimensions * renderData.vertexCount;
                            for (let vertexIndex = 0; vertexIndex < renderData.vertexCount; vertexIndex++) {
                                const triangleIndex = fragmentTriangles.vertexTriangleIndecies[vertexIndex];
                                const triangle = fragmentTriangles.triangles[triangleIndex];
                                if (triangle) {
                                    renderData.setBitangentVector(vertexIndex, triangle.bitangent);
                                }
                            }
                        }
                    }
                }
            }
        }
        return public;
    };

    public.calcNormalsFromCross = function () {
        for (let fragmentIndex = 0; fragmentIndex < private.meshFragments.length; fragmentIndex++) {
            const fragment = private.meshFragments[fragmentIndex];
            const renderData = fragment.renderData;
            const vertexData = fragment.vertexData;
            if (!renderData.normals) {
                if (vertexData.normals) {
                    renderData.normals = [];
                    for (let vertexIndex = 0; vertexIndex < vertexData.vertexCount; vertexIndex++) {
                        for (var i = 0; i < vertexData.normalDimensions; i++) {
                            renderData.normals.push(vertexData.normals[vertexData.normalIndex(vertexIndex, i)]);
                        }
                    }
                } else {
                    if (renderData.tangents && renderData.bitangents) {
                        renderData.normals = [];
                        for (let vertexIndex = 0; vertexIndex < vertexData.vertexCount; vertexIndex++) {
                            const tangent = renderData.getTangentVector(vertexIndex);
                            const bitangent = renderData.getBitangentVector(vertexIndex);
                            const normal = frag.Vector.cross(tangent, bitangent);
                            for (var i = 0; i < normal.length; i++) {
                                renderData.normals.push(normal[i]);
                            }
                        }
                    }
                }
            }
        }
        if (private.smoothShading) {
            private.calcSmoothShading();
        }
        return public;
    };

    public.calcNormalsFromGeometry = function () {
        for (let fragmentIndex = 0; fragmentIndex < private.meshFragments.length; fragmentIndex++) {
            const fragment = private.meshFragments[fragmentIndex];
            const renderData = fragment.renderData;
            const vertexData = fragment.vertexData;
            if (!renderData.normals) {
                if (vertexData.normals) {
                    renderData.normals = [];
                    for (let vertexIndex = 0; vertexIndex < vertexData.vertexCount; vertexIndex++) {
                        for (var i = 0; i < vertexData.normalDimensions; i++) {
                            renderData.normals.push(vertexData.normals[vertexData.normalIndex(vertexIndex, i)]);
                        }
                    }
                } else {
                    private.ensureTriangles();
                    const fragmentTriangles = private.fragmentTriangles[fragmentIndex];
                    if (fragmentTriangles && fragmentTriangles.triangles) {
                        renderData.normals = [];
                        renderData.normals.length = renderData.normalDimensions * renderData.vertexCount;
                        for (let vertexIndex = 0; vertexIndex < renderData.vertexCount; vertexIndex++) {
                            const triangleIndex = fragmentTriangles.vertexTriangleIndecies[vertexIndex];
                            const triangle = fragmentTriangles.triangles[triangleIndex];
                            if (triangle) renderData.setNormalVector(vertexIndex, triangle.normal);
                        }
                    }
                }
            }
        }
        if (private.smoothShading) {
            private.calcSmoothShading();
        }
        return public;
    };

    public.calcBitangentsFromCross = function () {
        for (let fragmentIndex = 0; fragmentIndex < private.meshFragments.length; fragmentIndex++) {
            const fragment = private.meshFragments[fragmentIndex];
            const renderData = fragment.renderData;
            const vertexData = fragment.vertexData;
            if (!renderData.bitangents) {
                if (vertexData.bitangents) {
                    renderData.bitangents = [];
                    for (let vertexIndex = 0; vertexIndex < vertexData.vertexCount; vertexIndex++) {
                        for (var i = 0; i < vertexData.normalDimensions; i++) {
                            renderData.bitangents.push(vertexData.bitangents[vertexData.bitangentIndex(vertexIndex, i)]);
                        }
                    }
                } else {
                    if (renderData.tangents && renderData.normals) {
                        renderData.bitangents = [];
                        for (let vertexIndex = 0; vertexIndex < vertexData.vertexCount; vertexIndex++) {
                            const normal = renderData.getNormalVector(vertexIndex);
                            const tangent = renderData.getTangentVector(vertexIndex);
                            const bitangent = frag.Vector.cross(normal, tangent);
                            for (var i = 0; i < bitangent.length; i++) {
                                renderData.bitangents.push(bitangent[i]);
                            }
                        }
                    }
                }
            }
        }
        return public;
    };

    return public;
};
