window.frag.UiShader = function(engine) {
    if (!engine.uiShader) {
        engine.uiShader = window.frag.Shader(engine)
            .name("UI")
            .verticiesXY(-1)  // Renders in xy plane with z = -1
            .matrix2D()       // Transformation matricies are 2D
            .diffuseTexture() // Adds support for diffuse texture mapping
            .compile();       // Compile the shader
    }
    return engine.uiShader;
}