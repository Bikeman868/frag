window.frag.AssetCatalog = function (engine, shader, defaultTextures) {
    const frag = window.frag;
    const gl = engine.gl;

    const defaultTexturePixels = new Uint8Array([
        0x7F, 0x7F, 0x7F, 0xFF, // Opaque medium grey
        0x00, 0x00, 0xFF, 0x00, // Very shinny
        0x00, 0x00, 0x00,       // No light emmission
        0x7F, 0x7F, 0xFF]);     // Normal (0, 0, 1)
    
    if (!defaultTextures) defaultTextures = {};
    if (!defaultTextures.diffuse) defaultTextures.diffuse = frag.Texture(engine)
        .name("default-diffuse-texture")
        .dataFormat(gl.RGBA)
        .fromArrayBuffer(0, defaultTexturePixels.buffer, 0, 1, 1);
    if (!defaultTextures.surface) defaultTextures.surface = frag.Texture(engine)
        .name("default-surface-texture")
        .dataFormat(gl.RGBA)
        .fromArrayBuffer(0, defaultTexturePixels.buffer, 4, 1, 1);
    if (!defaultTextures.emmissive) defaultTextures.emmissive = frag.Texture(engine)
        .name("default-emmissive-texture")
        .dataFormat(gl.RGB)
        .fromArrayBuffer(0, defaultTexturePixels.buffer, 8, 1, 1);
    if (!defaultTextures.normal) defaultTextures.normal = frag.Texture(engine)
        .name("default-normal-map-texture")
        .dataFormat(gl.RGB)
        .fromArrayBuffer(0, defaultTexturePixels.buffer, 11, 1, 1);

    if (!shader) {
        shader = frag.Shader(engine)
            .name("Model")
            .verticiesXYZ()
            .matrix3D()
            .diffuseTexture()
            .directionalLightGrey()
            .compile();
    };

    const private = {
        defaultTextures,
        fonts: {},
        materials: {},
        models: {},
    };

    const public = {
        __private: private,
        shader
    };

    public.dispose = function () {
    }

    public.getFont = function(name) {
        var font = private.fonts[name];
        if (!font) {
            font = frag.Font(engine)
                .name(name)
            private.fonts[name] = font;
        }
        return font;
    }

    public.getMaterial = function(name) {
        var material = private.materials[name];
        if (!material) {
            material = frag.Material(engine)
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
            model = frag.Model(engine, public.shader.is3d)
                .name(name)
                .shader(public.shader);
            if (!isChild) private.models[name] = model;
        }
        return model;
    }

    return public;
}
