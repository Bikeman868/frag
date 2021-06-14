window.frag.AssetCatalog = function (shader, defaultTextures) {
    const frag = window.frag;

    const defaultTexturePixels = new Uint8Array([
        0x7F, 0x7F, 0x7F, 0xFF, // Opaque medium grey
        0x00, 0x00, 0xFF, 0x00, // Very shinny
        0x00, 0x00, 0x00,       // No light emmission
        0x7F, 0x7F, 0x00]);     // Normal (0, 0, -1)
    
    if (!defaultTextures) defaultTextures = {};
    if (!defaultTextures.diffuse) defaultTextures.diffuse = frag.Texture()
        .name("default-diffuse-texture")
        .dataFormat(frag.gl.RGBA)
        .fromArrayBuffer(0, defaultTexturePixels.buffer, 0, 1, 1);
    if (!defaultTextures.surface) defaultTextures.surface = frag.Texture()
        .name("default-surface-texture")
        .dataFormat(frag.gl.RGBA)
        .fromArrayBuffer(0, defaultTexturePixels.buffer, 4, 1, 1);
    if (!defaultTextures.emmissive) defaultTextures.emmissive = frag.Texture()
        .name("default-emmissive-texture")
        .dataFormat(frag.gl.RGB)
        .fromArrayBuffer(0, defaultTexturePixels.buffer, 8, 1, 1);
    if (!defaultTextures.normal) defaultTextures.normal = frag.Texture()
        .name("default-normal-map-texture")
        .dataFormat(frag.gl.RGB)
        .fromArrayBuffer(0, defaultTexturePixels.buffer, 11, 1, 1);

    if (!shader) {
        shader = frag.Shader()
            .name("Model")
            .verticiesXYZ()
            .matrix3D()
            .diffuseTexture()
            .emmissiveTexture()
            .displacementTextureSunken()
            .directionalLightWhite()
            .compile()
            .displacementScale(0.4);
    };

    const private = {
        defaultTextures,
        materials: {},
        models: {},
    };

    const public = {
        __private: private,
        shader
    };

    public.getMaterial = function(name) {
        var material = private.materials[name];
        if (!material) {
            material = frag.Material()
                .name(name)
                .disposeTextures(false)
                .setTexture("diffuse", private.defaultTextures.diffuse)
                .setTexture("emmissive", private.defaultTextures.emmissive)
                .setTexture("surface", private.defaultTextures.surface)
                .setTexture("normalMap", private.defaultTextures.normal);
            private.materials[name] = material;
        }
        return material;
    }

    public.getModel = function (name, isChild) {
        var model = isChild ? undefined : private.models[name];
        if (!model) {
            model = frag.Model()
                .name(name)
                .shader(public.shader);
            if (!isChild) private.models[name] = model;
        }
        return model;
    }
    
    return public;
}
