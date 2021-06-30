window.frag.startFunctions.push(function(frag) {
    frag.uiShader = frag.Shader()
        .name("UI")
        .verticiesXY(-1)  // Renders in xy plane with z = -1
        .matrix2D()       // Transformation matricies are 2D
        .diffuseTexture() // Adds support for diffuse texture mapping
        .compile();       // Compile the shader
});
