window.frag.startFunctions.push(function(frag) {
    frag.fontShader = frag.Shader()
        .name("Font")
        .diffuseTexture()
        .compile();
});
