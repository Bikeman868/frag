/*
 * This class defines the data beneath a dynamic surface. Verticies in
 * the mesh will draw data from this structure, the mesh itself
 * typically reflects only a small portion of this data, for example drawing
 * ground close to the player and not drawing ground that is behind
 * or too far away to see.
 * The data is assumed to lie in a 2D surface with a height at each point.
 * This works well for ground any maybe adaptable to other kinds of
 * dynamic mesh.
*/
window.frag.DynamicData = function (engine, width, depth) {

    const private = {
        width,
        depth,
        data: [],
    };

    for (let i = 0; i < width * depth; i++)
        private.data.push({
            height: 0,
            material: null,
            state: 0,
        });

    const public = {
        __private: private,
    }

    public.dispose = function () {
    }

    public.get = function(x, z) {
        return private.data[x * private.depth + z];
    }

    return public;
}