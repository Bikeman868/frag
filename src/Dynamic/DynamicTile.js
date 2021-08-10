/*
 * This class represents a tile in a dynamic surface. The tile has neighbors
 * and connects with and underlying data set that defines the height of this
 * tile and the material to use to draw it.
 */
window.frag.DynamicTile = function (engine) {

    const private = {
        dynamicData: null,
        tileData: null,
        x: 0,
        z: 0,
        modified: true,
    };

    const public = {
        __private: private,
        isDynamicTile: true,
        sharedVerticies: [],
    }

    private.update = function() {
        if (private.modified) {
            private.tileData = private.dynamicData.get(private.x, private.z);
            private.modified = false;
        }
    }

    public.dispose = function () {
    }

    public.dynamicData = function(data) {
        private.dynamicData = data;
        private.modified = true;
        return public;
    }

    public.x = function(x) {
        private.x = x;
        private.modified = true;
        return public;
    }

    public.getX = function() {
        return private.x;
    }

    public.z = function(z) {
        private.z = z;
        private.modified = true;
        return public;
    }

    public.getZ = function() {
        return private.z;
    }

    public.getData = function() {
        private.update();
        return private.tileData;
    }

    public.getMaterial = function() {
        private.update();
        return private.tileData.material;
    }

    public.getHeight = function() {
        private.update();
        return private.tileData.height;
    }

    public.getColorMult = function() {
        private.update();
        return private.tileData.colorMult;
    }

    public.getColor = function() {
        private.update();
        return private.tileData.color;
    }

    return public;
}