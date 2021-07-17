window.frag.startFunctions.push(function(frag) {
    const vertexShader = 
        "attribute vec4 a_position;\n" +
        "attribute vec2 a_texcoord;\n" +
        "uniform mat4 u_clipMatrix;\n" +
        "varying vec2 v_texcoord;\n" +
        "void main() {\n" +
        "  gl_Position = u_clipMatrix * a_position;\n" +
        "  v_texcoord = a_texcoord;\n" +
        "}";

    const fragmentShader = 
        "precision mediump float;\n" +
        "uniform sampler2D u_diffuse;\n" +
        "uniform vec4 u_fgcolor;\n" +
        "uniform vec4 u_bgcolor;\n" +
        "varying vec2 v_texcoord;\n" +
        "void main() {\n" +
        "  vec4 texture = texture2D(u_diffuse, vec2(v_texcoord.x, 1.0 - v_texcoord.y));\n" +
        "  gl_FragColor = mix(u_bgcolor, u_fgcolor, length(texture.rgb));\n" +
        "}\n";
    
    frag.fontShader = frag.CustomShader()
        .name("Font")
        .source(vertexShader, fragmentShader)
        .attribute("position")
        .attribute("texcoord")
        .uniform("clipMatrix")
        .uniform("bgcolor", "4fv", [1, 1, 1, 1])
        .uniform("fgcolor", "4fv", [0, 0, 0, 1])
        .uniform("diffuse");
});
