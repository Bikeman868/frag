/*
 * Shared vertexes exist between tiles where tiles meet at the corners.
 * These verticles calculate height as an average of the tiles that they
 * are joining. In rectangular grids of tiles each join is between
 * 4 tiles. In hexagonal grids each join is between 3 tiles.
 */
window.frag.SharedVertex = function (engine) {

    const private = {
        tiles: [],
    };

    const public = {
        __private: private,
    }

    public.dispose = function () {
    }

    public.clear = function() {
        private.tiles.length = 0;
        return public;
    }

    public.addTile = function(tile) {
        private.tiles.push(tile);
        return public;
    }

    public.getHeight = function() {
        const reducer = function(sum, tile) { 
            return sum + tile.getHeight(); 
        }
        return private.tiles.reduce(reducer, 0) / private.tiles.length;
    }

    return public;
}