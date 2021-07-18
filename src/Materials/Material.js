window.frag.Material = function (engine) {
    const private = {
        textures: {},
        disposeTextures: false
    }

    const public = {
        __private: private
    };

    public.dispose = function () {
        if (private.disposeTextures) {
            for (let textureType in private.textures) {
                const texture = private.textures[textureType];
                if (texture) texture.dispose();
            }
        }
        private.textures = {};
    };

    public.disposeTextures = function (shouldDispose) {
        private.disposeTextures = shouldDispose;
        return public;
    }

    public.name = function (value) {
        private.name = value;
        return public;
    };

    // The name of the texture type must match the name of a uniform on the shader
    public.setTexture = function (textureType, texture) {
        if (private.disposeTextures) {
            const currentTexture = private.textures[textureType];
            if (currentTexture) currentTexture.dispose();
        }
        private.textures[textureType] = texture;
        return public;
    }

    public.apply = function (gl, shader) {
        for (let textureType in private.textures) {
            const texture = private.textures[textureType];
            if (texture) texture.apply(textureType, gl, shader);
        }
        return public;
    };

    return public;
};
