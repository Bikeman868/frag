/*
 * This class represents a tile in a dynamic surface. The tile has neighbors
 * and connects with and underlying data set that defines the height of this
 * tile and the material to use to draw it.
 */
window.frag.DynamicTile = function (engine) {

    const private = {
        data: null,
        x: 0,
        z: 0,
        height: 0,
        material: null,
        modified: true,
    };

    const public = {
        __private: private,
        sharedVerticies: [],
    }

    private.update = function() {
        if (private.modified) {
            const data = public.getData();
            private.height = data.height;
            private.material = data.material;
            private.modified = false;
        }
    }

    public.dispose = function () {
    }

    public.data = function(data) {
        private.data = data;
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
        return private.data.get(private.x, private.z);
    }

    public.getMaterial = function() {
        private.update();
        return private.material;
    }

    public.getHeight = function() {
        private.update();
        return private.height;
    }

    public.getState = function() {
        private.update();
        return private.height;
    }

    return public;
}