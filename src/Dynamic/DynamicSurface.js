/*
 * This class a mesh that is dynamically constructed from part of a
 * larger data set. The part of the dataset that is represented can
 * be remapped visually scrolling the mesh acroll the underlying data
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
    };

    private.position = window.frag.ScenePosition(engine, private.location)

    const public = {
        __private: private,
    }

    public.dispose = function () {
    }

    public.enabled = function(enabled) {
        private.enabled = enabled;
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
    
    public.setOrigin = function(x, z) {
        x = private.sanitizeX(x);
        z = private.sanitizeX(z);

        for (let i = 0; i < private.tiles.length; i++) {
            const offset = private.getOffset(i);
            private.tiles[i].x(offset.x + x).z(offset.z + z);
        }

        private.fragmentsModified = true;
    }
    
    public.createSquares = function(width, depth) {
        private.tiles.length = 0;
        private.meshFragments.length = 0;
        private.mesh = window.frag.Mesh(engine);

        private.tileAt = function(x, z) {
            return private.tiles[x * depth + z];
        }

        private.getOffset = function(i) {
            return {
                x: Math.floor(i / depth),
                z: i % depth
            }
        }

        private.sanitizeX = function(x) {
            if (x < 0) return 0;
            const max = data.getWidth() - width;
            if (x >= max) return max;
            return Math.floor(x);
        }

        private.sanitizeZ = function(z) {
            if (z < 0) return 0;
            const max = data.getDepth() - depth;
            if (z >= max) return max;
            return Math.floor(z);
        }

        private.updateMeshFragments = function() {
            for (let i = 0; i < private.tiles.length; i++) {
                const tile = private.tiles[i];
                const meshFragment = private.meshFragments[i];
                meshFragment.material = tile.getMaterial();

                const vertexData = meshFragment.vertexData;
                for (var j = 0; j < 4; j++) {
                    const vertex = vertexData.getVertexVector(j);
                    vertex[1] = tile.sharedVerticies[j].getHeight();
                    vertexData.setVertexVector(j, vertex);
                }
            }
            private.mesh.fragmentsUpdated();
        }

        for (let x = 0; x < width; x++) {
            for (let z = 0; z < depth; z++) {
                const tile = window.frag.DynamicTile(engine)
                    .data(private.data)
                    .x(x)
                    .z(z);
                private.tiles.push(tile);

                const verticies = [x+1, 0, z, x+1, 0, z+1, x, 0, z, x, 0, z+1];
                const uvs = [1, 0, 1, 1, 0, 0, 0, 1];
                const normals = [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0];

                const meshFragment = private.mesh.addTriangleStrip({ verticies, uvs, normals });
                private.meshFragments.push(meshFragment);
            }
        }

        for (let x = 0; x < width; x++) {
            for (let z = 0; z < depth; z++) {
                const tile = private.tileAt(x, z);
                tile.sharedVerticies = [
                    window.frag.SharedVertex(engine).addTile(tile),
                    window.frag.SharedVertex(engine).addTile(tile),
                    window.frag.SharedVertex(engine).addTile(tile),
                    window.frag.SharedVertex(engine).addTile(tile),
                ];
                if (x !== 0) {
                    tile.sharedVerticies[2].addTile(private.tileAt(x-1, z));
                    tile.sharedVerticies[3].addTile(private.tileAt(x-1, z));
                    if (z !== 0) {
                        tile.sharedVerticies[2].addTile(private.tileAt(x-1, z-1));
                    }
                    if (z !== depth-1) {
                        tile.sharedVerticies[3].addTile(private.tileAt(x-1, z+1));
                    }
                }
                if (x !== width-1) {
                    tile.sharedVerticies[0].addTile(private.tileAt(x+1, z));
                    tile.sharedVerticies[1].addTile(private.tileAt(x+1, z));
                }
                if (z !== 0) {
                    tile.sharedVerticies[0].addTile(private.tileAt(x, z-1));
                    tile.sharedVerticies[2].addTile(private.tileAt(x, z-1));
                    if (x !== width-1) {
                        tile.sharedVerticies[0].addTile(private.tileAt(x+1, z-1));
                    }
                }
                if (z !== depth-1) {
                    tile.sharedVerticies[1].addTile(private.tileAt(x, z+1));
                    tile.sharedVerticies[3].addTile(private.tileAt(x, z+1));
                    if (x !== width-1) {
                        tile.sharedVerticies[1].addTile(private.tileAt(x+1, z+1));
                    }
                }
            }
        }
        return public;
    }

    public.createHorizontalHexagons = function(width, depth) {
        console.error('Dynamic surface of hexagons is not yet implementted');
        return public;
    }

    public.createVerticalHexagons = function(width, depth) {
        console.error('Dynamic surface of hexagons is not yet implementted');
        return public;
    }

    public.draw = function (drawContext) {
        if (!private.enabled || !private.mesh) return public;

        const shader = drawContext.shader || private.shader;
        if (!shader) return public;

        if (private.fragmentsModified) {
            private.updateMeshFragments();
            private.fragmentsModified = false;
        }

        shader.bind();
        drawContext.beginSceneObject(private.location);

        if (drawContext.isHitTest) drawContext.sceneObjects.push(public);

        drawContext.setupShader(shader, public);
    
        private.mesh.draw(shader);

        drawContext.endSceneObject();
        return public;
    };

    return public;
}