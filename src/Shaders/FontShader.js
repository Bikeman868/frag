window.frag.startFunctions.push(function(frag) {
    const vertexShader = 
        "attribute vec4 a_position;\n" +
        "attribute vec2 a_texcoord;\n" +
        "attribute vec3 a_normal;\n" +
        "uniform mat4 u_modelMatrix;\n" +
        "uniform mat4 u_clipMatrix;\n" +
        "uniform vec3 u_lightDirection;\n" +
        "varying vec2 v_texcoord;\n" +
        "varying vec3 v_lightDirection;\n" +
        "varying vec3 v_normal;\n" +
        "void main() {\n" +
        "  vec4 position = a_position;\n" +
        "  position = u_clipMatrix * position;\n" +
        "  gl_Position = position;\n" +
        "  v_texcoord = a_texcoord;\n" +
        "  v_normal = (u_modelMatrix * vec4(a_normal, 0)).xyz;\n" +
        "  v_lightDirection = u_lightDirection;\n" +
        "}";

    const fragmentShader = 
        "precision mediump float;\n" +
        "uniform sampler2D u_diffuse;\n" +
        "uniform float u_ambientLight;\n" +
        "varying vec2 v_texcoord;\n" +
        "varying vec3 v_lightDirection;\n" +
        "varying vec3 v_normal;\n" +
        "void main() {\n" +
        "  vec3 normal = normalize(v_normal);\n" +
        "  vec3 lightDirection = v_lightDirection;\n" +
        "  float light = max(dot(normal, lightDirection), 0.0);\n" +
        "  light += u_ambientLight;\n" +
        "  gl_FragColor = vec4(0, 0, 0, 1.0);\n" +
        "  gl_FragColor += texture2D(u_diffuse, vec2(v_texcoord.x, 1.0 - v_texcoord.y));\n" +
        "  gl_FragColor.rgb *= light;\n" +
        "}\n";
    
    frag.fontShader = frag.CustomShader()
        .name("Font")
        .source(vertexShader, fragmentShader)
        .attribute("position")
        .attribute("texcoord")
        .attribute("normal")
        .uniform("modelMatrix")
        .uniform("clipMatrix")
        .uniform("lightDirection", "3fv", [-1, -1, 1])
        .uniform("ambientLight", "1f", 0.5)
        .uniform("diffuse");
});
