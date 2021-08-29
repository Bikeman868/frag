/*
 * This class a mesh that is dynamically constructed from part of a
 * larger data set. The part of the dataset that is represented can
 * be remapped visually scrolling the mesh accross the underlying data
*/
window.frag.DynamicSurface = function (engine, data) {

    const private = {
        data,
        tiles: [],
        meshFragments: [],
        mesh: null,
        location: window.frag.Location(engine, true),
        position: null,
        enabled: true,
        shader: null,
        fragmentsModified: true,
        width: 0,
        depth: 0,
        originX: 0,
        originZ: 0,
    };

    private.position = window.frag.ScenePosition(engine, private.location)

    const public = {
        __private: private,
        isDynamicSurface: true,
    }

    public.tileAt = function(x, z) {
        return private.tiles[x * private.depth + z];
    }

    private.getOffset = function(i) {
        return {
            x: Math.floor(i / private.depth),
            z: i % private.depth
        }
    }

    private.sanitizeX = function(x) {
        if (x < 0) return 0;
        const max = data.getWidth() - private.width;
        if (x >= max) return max;
        return Math.floor(x);
    }

    private.sanitizeZ = function(z) {
        if (z < 0) return 0;
        const max = data.getDepth() - private.depth;
        if (z >= max) return max;
        return Math.floor(z);
    }

    private.updateMeshFragments = function() {
        for (let i = 0; i < private.tiles.length; i++) {
            const tile = private.tiles[i];
            const meshFragment = private.meshFragments[i];
            meshFragment.material = tile.getMaterial();
            meshFragment.uniforms = tile.getUniforms();

            const vertexData = meshFragment.vertexData;
            for (var j = 0; j < tile.sharedVerticies.length; j++) {
                const vertex = vertexData.getVertexVector(j);
                vertex[1] = tile.sharedVerticies[j].getHeight();
                vertexData.setVertexVector(j, vertex);
            }
        }
        private.mesh.fragmentsUpdated();
    }

    private.logDebugInfo = function() {
        const r = function(v) { return Math.floor(v * 1000) / 1000; }
        for (let x = 0; x < private.width; x++) {
            for (let z = 0; z < private.depth; z++) {
                const tile = public.tileAt(x, z);
                console.log('Tile [' + x + ',' + z + ']', 'x=' + tile.getX(), 'z=' + tile.getZ(), 'h=' + r(tile.getHeight()));
                for (let i = 0; i < tile.sharedVerticies.length; i++) {
                    const vertex = tile.sharedVerticies[i];
                    const vertexTiles = vertex.__private.tiles;
                    let vertexInfo = '  V' + i + ' h=' + r(vertex.getHeight());
                    if (vertexTiles.length === 1) {
                        vertexInfo += ' from '
                        const t = vertex.__private.tiles[0];
                        vertexInfo += 'T[' + t.getX() + ',' + t.getZ() + '] h=' + r(t.getHeight());
                    } else {
                        vertexInfo += ' average(';
                        for (let j = 0; j < vertexTiles.length; j++) {
                            const t = vertex.__private.tiles[j];
                            if (j > 0) vertexInfo += ', ';
                            vertexInfo += 'T[' + t.getX() + ',' + t.getZ() + '] h=' + r(t.getHeight());
                        }
                        vertexInfo += ')';
                    }
                    console.log(vertexInfo);
                }
            }
        }
    }

    private.createHorizontalHexagons = function() {
        const xDist = 1.5;
        const zDist = Math.sqrt(3);
        const x0 = private.width * -0.5 * xDist;
        const z0 = private.depth * -0.5 * zDist;
        const uvs = [0.5, 0.5, 0, 0.5, 0.25, 0, 0.75, 0, 1, 0.5, 0.75, 1, 0.25, 1, 0, 0.5];
        const normals = [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0];
        for (let x = 0; x < private.width; x++) {
            const odd = x % 2;
            for (let z = 0; z < private.depth; z++) {
                const tile = window.frag.DynamicTile(engine)
                    .dynamicData(private.data)
                    .x(x)
                    .z(z);
                private.tiles.push(tile);

                const xc = x0 + x * xDist;
                const zc = z0 + z * zDist + odd * zDist * 0.5;
                const verticies = [
                    xc, 0, zc, 
                    xc-1, 0, zc, 
                    xc-0.5, 0, zc-zDist*0.5,
                    xc+0.5, 0, zc-zDist*0.5,
                    xc+1, 0, zc,
                    xc+0.5, 0, zc+zDist*0.5,
                    xc-0.5, 0, zc+zDist*0.5,
                    xc-1, 0, zc
                ];

                const meshFragment = private.mesh.addTriangleFan({ verticies, uvs, normals });
                private.meshFragments.push(meshFragment);
            }
        }

        for (let x = 0; x < private.width; x++) {
            const odd = x % 2;
            const even = (x + 1) % 2;
            for (let z = 0; z < private.depth; z++) {
                const tile = public.tileAt(x, z);
                tile.sharedVerticies = [
                    window.frag.SharedVertex(engine).addTile(tile),
                    window.frag.SharedVertex(engine).addTile(tile),
                    window.frag.SharedVertex(engine).addTile(tile),
                    window.frag.SharedVertex(engine).addTile(tile),
                    window.frag.SharedVertex(engine).addTile(tile),
                    window.frag.SharedVertex(engine).addTile(tile),
                    window.frag.SharedVertex(engine).addTile(tile),
                    window.frag.SharedVertex(engine).addTile(tile),
                ];

                if (x > 0) {
                    if (z >= even) {
                        const t = public.tileAt(x-1, z-even);
                        tile.sharedVerticies[1].addTile(t);
                        tile.sharedVerticies[2].addTile(t);
                        tile.sharedVerticies[7].addTile(t);
                    }
                    if (z < private.depth-odd) {
                        const t = public.tileAt(x-1, z+odd);
                        tile.sharedVerticies[1].addTile(t);
                        tile.sharedVerticies[6].addTile(t);
                        tile.sharedVerticies[7].addTile(t);
                    }
                }

                if (x < private.width - 1) {
                    if (z >= even) {
                        const t = public.tileAt(x+1, z-even);
                        tile.sharedVerticies[3].addTile(t);
                        tile.sharedVerticies[4].addTile(t);
                    }
                    if (z < private.depth-odd) {
                        const t = public.tileAt(x+1, z+odd);
                        tile.sharedVerticies[4].addTile(t);
                        tile.sharedVerticies[5].addTile(t);
                    }
                }

                if (z > 0) {
                    const t = public.tileAt(x, z-1);
                    tile.sharedVerticies[2].addTile(t);
                    tile.sharedVerticies[3].addTile(t);
                }

                if (z < private.depth-1) {
                    const t = public.tileAt(x, z+1);
                    tile.sharedVerticies[5].addTile(t);
                    tile.sharedVerticies[6].addTile(t);
                }
            }
        }
    }

    private.createVerticalHexagons = function() {
        const xDist = Math.sqrt(3);
        const zDist = 1.5;
        const x0 = private.width * -0.5 * xDist;
        const z0 = private.depth * -0.5 * zDist;
        const uvs = [0.5, 0.5, 0.5, 0, 1, 0.25, 1, 0.75, 0.5, 1, 0, 0.75, 0, 0.25, 0.5, 0];
        const normals = [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0];
        for (let x = 0; x < private.width; x++) {
            for (let z = 0; z < private.depth; z++) {
                const odd = z % 2;
                const tile = window.frag.DynamicTile(engine)
                    .dynamicData(private.data)
                    .x(x)
                    .z(z);
                private.tiles.push(tile);

                const xc = x0 + x * xDist + odd * xDist * 0.5;
                const zc = z0 + z * zDist;
                const verticies = [
                    xc, 0, zc,
                    xc, 0, zc-1,
                    xc+xDist*0.5, 0, zc-0.5,
                    xc+xDist*0.5, 0, zc+0.5,
                    xc, 0, zc+1,
                    xc-xDist*0.5, 0, zc+0.5,
                    xc-xDist*0.5, 0, zc-0.5,
                    xc, 0, zc-1,
                ];

                const meshFragment = private.mesh.addTriangleFan({ verticies, uvs, normals });
                private.meshFragments.push(meshFragment);
            }
        }

        for (let x = 0; x < private.width; x++) {
            for (let z = 0; z < private.depth; z++) {
                const odd = z % 2;
                const even = (z + 1) % 2;
                const tile = public.tileAt(x, z);
                tile.sharedVerticies = [
                    window.frag.SharedVertex(engine).addTile(tile),
                    window.frag.SharedVertex(engine).addTile(tile),
                    window.frag.SharedVertex(engine).addTile(tile),
                    window.frag.SharedVertex(engine).addTile(tile),
                    window.frag.SharedVertex(engine).addTile(tile),
                    window.frag.SharedVertex(engine).addTile(tile),
                    window.frag.SharedVertex(engine).addTile(tile),
                    window.frag.SharedVertex(engine).addTile(tile),
                ];

                if (z > 0) {
                    if (x >= even) {
                        const t = public.tileAt(x-even, z-1);
                        tile.sharedVerticies[1].addTile(t);
                        tile.sharedVerticies[6].addTile(t);
                        tile.sharedVerticies[7].addTile(t);
                    }
                    if (x < private.width-odd) {
                        const t = public.tileAt(x+odd, z-1);
                        tile.sharedVerticies[1].addTile(t);
                        tile.sharedVerticies[2].addTile(t);
                        tile.sharedVerticies[7].addTile(t);
                    }
                }

                if (z < private.depth - 1) {
                    if (x >= even) {
                        const t = public.tileAt(x-even, z+1);
                        tile.sharedVerticies[4].addTile(t);
                        tile.sharedVerticies[5].addTile(t);
                    }
                    if (x < private.width-odd) {
                        const t = public.tileAt(x+odd, z+1);
                        tile.sharedVerticies[3].addTile(t);
                        tile.sharedVerticies[4].addTile(t);
                    }
                }

                if (x > 0) {
                    const t = public.tileAt(x-1, z);
                    tile.sharedVerticies[5].addTile(t);
                    tile.sharedVerticies[6].addTile(t);
                }

                if (x < private.width-1) {
                    const t = public.tileAt(x+1, z);
                    tile.sharedVerticies[2].addTile(t);
                    tile.sharedVerticies[3].addTile(t);
                }
            }
        }
    }

    public.dispose = function () {
    }

    public.enabled = function(enabled) {
        private.enabled = enabled;
    }

    public.getLocation = function() {
        return private.location;
    }

    public.getPosition = function () {
        return private.position;
    };

    public.getMesh = function() {
        return private.mesh;
    }

    public.shader = function(shader) {
        private.shader = shader;
        return public;
    }

    public.getShader = function() {
        return private.shader;
    }
    
    public.setOrigin = function(x, z) {
        x = private.sanitizeX(x);
        z = private.sanitizeZ(z);

        if (x === private.originX && z === private.originZ) return;
        private.originX = x;
        private.originZ = z;

        for (let i = 0; i < private.tiles.length; i++) {
            const offset = private.getOffset(i);
            private.tiles[i].x(offset.x + x).z(offset.z + z);
        }

        private.fragmentsModified = true;
        if (engine.debugDynamicSurface) private.logDebugInfo();
    }

    public.dataModified = function() {
        private.fragmentsModified = true;
        if (engine.debugDynamicSurface) private.logDebugInfo();
        return public;
    }

    public.createSquares = function(width, depth) {
        private.tiles.length = 0;
        private.meshFragments.length = 0;
        private.mesh = window.frag.Mesh(engine);
        private.width = width;
        private.depth = depth;

        const x0 = -width;
        const z0 = -depth;
        const w = 2;
        const h = 2;

        const uvs = [1, 0, 1, 1, 0, 0, 0, 1];
        const normals = [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0];
        for (let x = 0; x < width; x++) {
            for (let z = 0; z < depth; z++) {
                const tile = window.frag.DynamicTile(engine)
                    .dynamicData(private.data)
                    .x(x)
                    .z(z);
                private.tiles.push(tile);

                const xc = x0 + x * w;
                const zc = z0 + z * h;
                const verticies = [xc+1, 0, zc-1, xc+1, 0, zc+1, xc-1, 0, zc-1, xc-1, 0, zc+1];
                const meshFragment = private.mesh.addTriangleStrip({ verticies, uvs, normals });
                private.meshFragments.push(meshFragment);
            }
        }

        for (let x = 0; x < width; x++) {
            for (let z = 0; z < depth; z++) {
                const tile = public.tileAt(x, z);
                tile.sharedVerticies = [
                    window.frag.SharedVertex(engine).addTile(tile),
                    window.frag.SharedVertex(engine).addTile(tile),
                    window.frag.SharedVertex(engine).addTile(tile),
                    window.frag.SharedVertex(engine).addTile(tile),
                ];

                if (x !== 0) {
                    let t = public.tileAt(x-1, z);
                    tile.sharedVerticies[2].addTile(t);
                    tile.sharedVerticies[3].addTile(t);
                    if (z !== 0) {
                        t = public.tileAt(x-1, z-1);
                        tile.sharedVerticies[2].addTile(t);
                    }
                    if (z !== depth-1) {
                        t = public.tileAt(x-1, z+1);
                        tile.sharedVerticies[3].addTile(t);
                    }
                }

                if (x !== width-1) {
                    let t = public.tileAt(x+1, z);
                    tile.sharedVerticies[0].addTile(t);
                    tile.sharedVerticies[1].addTile(t);
                    if (z !== 0) {
                        t = public.tileAt(x+1, z-1);
                        tile.sharedVerticies[0].addTile(t);
                    }
                    if (z !== depth-1) {
                        t = public.tileAt(x+1, z+1);
                        tile.sharedVerticies[1].addTile(t);
                    }
                }

                if (z !== 0) {
                    let t = public.tileAt(x, z-1);
                    tile.sharedVerticies[0].addTile(t);
                    tile.sharedVerticies[2].addTile(t);
                }

                if (z !== depth-1) {
                    let t = public.tileAt(x, z+1);
                    tile.sharedVerticies[1].addTile(t);
                    tile.sharedVerticies[3].addTile(t);
                }
            }
        }

        if (engine.debugDynamicSurface) private.logDebugInfo();
        return public;
    }

    public.createHexagons = function(width, depth, vertical) {
        private.tiles.length = 0;
        private.meshFragments.length = 0;
        private.mesh = window.frag.Mesh(engine);
        private.width = width;
        private.depth = depth;

        if (vertical) private.createVerticalHexagons();
        else private.createHorizontalHexagons();

        if (engine.debugDynamicSurface) private.logDebugInfo();
        return public;
    }

    public.draw = function (drawContext) {
        if (!private.enabled || !private.mesh) return public;
        
        if (private.fragmentsModified) {
            private.updateMeshFragments();
            private.fragmentsModified = false;
        }

        drawContext.beginSceneObject(public);
        private.mesh.draw(drawContext, function(_1, index) {
            return private.tiles[index];
        });
        drawContext.endSceneObject();

        return public;
    };

    return public;
}