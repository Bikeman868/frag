window.frag.ParticleShader2D = function(engine) {
    if (engine.particleShader2D) return engine.particleShader2D;
    
    const vertexShader = 
        'uniform mat4 u_clipMatrix;\n' +
        'uniform mat4 u_modelMatrix;\n' +
        'uniform mat4 u_clipMatrixInverse;\n' +
        'uniform vec3 u_velocity;\n' +
        'uniform vec3 u_acceleration;\n' +
        'uniform float u_timeRange;\n' +
        'uniform float u_time;\n' +
        'uniform float u_timeOffset;\n' +
        'uniform float u_frameDuration;\n' +
        'uniform float u_numFrames;\n' +
        '\n' +
        'attribute vec4 a_uvLifeTimeFrameStart; // uv, lifeTime, frameStart\n' +
        'attribute vec4 a_positionStartTime;    // position.xyz, startTime\n' +
        'attribute vec4 a_velocityStartSize;    // velocity.xyz, startSize\n' +
        'attribute vec4 a_accelerationEndSize;  // acceleration.xyz, endSize\n' +
        'attribute vec4 a_spinStartSpinSpeed;   // spinStart.x, spinSpeed.y\n' +
        'attribute vec4 a_orientation;          // a_orientation quaternion\n' +
        'attribute vec4 a_colorMult;            // multiplies color and ramp textures\n' +
        '\n' +
        'varying vec2 v_texcoord;\n' +
        'varying float v_percentLife;\n' +
        'varying vec4 v_colorMult;\n' +
        '\n' +
        'void main() {\n' +
        '  vec2 uv = a_uvLifeTimeFrameStart.xy;\n' +
        '  float lifeTime = a_uvLifeTimeFrameStart.z;\n' +
        '  float frameStart = a_uvLifeTimeFrameStart.w;\n' +
        '  vec3 position = a_positionStartTime.xyz;\n' +
        '  float startTime = a_positionStartTime.w;\n' +
        '  vec3 velocity = (u_modelMatrix * vec4(a_velocityStartSize.xyz, 0.)).xyz + u_velocity;\n' +
        '  float startSize = a_velocityStartSize.w;\n' +
        '  vec3 acceleration = (u_modelMatrix * vec4(a_accelerationEndSize.xyz, 0)).xyz + u_acceleration;\n' +
        '  float endSize = a_accelerationEndSize.w;\n' +
        '  float spinStart = a_spinStartSpinSpeed.x;\n' +
        '  float spinSpeed = a_spinStartSpinSpeed.y;\n' +
        '\n' +
        '  float localTime = mod((u_time - u_timeOffset - startTime), u_timeRange);\n' +
        '  float percentLife = clamp(localTime / lifeTime, 0., 1.);\n' +
        '\n' +
        '  float frame = mod(floor(localTime / u_frameDuration + frameStart), u_numFrames);\n' +
        '  float uOffset = frame / u_numFrames;\n' +
        '  float u = uOffset + (uv.x + 0.5) * (1. / u_numFrames);\n' +
        '\n' +
        '  v_texcoord = vec2(u, uv.y + 0.5);\n' +
        '  v_colorMult = a_colorMult;\n' +
        '\n' +
        '  vec3 basisX = u_clipMatrixInverse[0].xyz;\n' +
        '  vec3 basisZ = u_clipMatrixInverse[1].xyz;\n' +
        '\n' +
        '  float size = mix(startSize, endSize, percentLife);\n' +
        '  float s = sin(spinStart + spinSpeed * localTime);\n' +
        '  float c = cos(spinStart + spinSpeed * localTime);\n' +
        '\n' +
        '  vec4 rotatedPoint = vec2(uv.x * c + uv.y * s, -uv.x * s + uv.y * c);\n' +
        '  vec3 localPosition = vec3(basisX * rotatedPoint.x + basisZ * rotatedPoint.y) * size +\n' + 
        '    velocity * localTime + acceleration * localTime * localTime + position;\n' +
        '\n' +
        '  v_percentLife = percentLife;\n' +
        '  gl_Position = u_clipMatrix * vec4(localPosition + u_modelMatrix[3].xyz, 1.);\n' +
        '}\n';
  
    const fragmentShader = 
        'precision mediump float;\n' +
        'uniform sampler2D u_rampSampler;\n' +
        'uniform sampler2D u_colorSampler;\n' +
        '\n' +
        'varying vec2 v_texcoord;\n' +
        'varying float v_percentLife;\n' +
        'varying vec4 v_colorMult;\n' +
        '\n' +
        'void main() {\n' +
        '  vec4 colorMult = texture2D(u_rampSampler, vec2(v_percentLife, 0.5)) * v_colorMult;\n' +
        '  gl_FragColor = texture2D(u_colorSampler, v_texcoord) * colorMult;\n' +
        '}\n'
  
    engine.particleShader2D = frag.CustomShader(engine)
        .name("Particle 2D")
        .source(vertexShader, fragmentShader)

        .attribute("uvLifeTimeFrameStart")
        .attribute("positionStartTime")
        .attribute("velocityStartSize")
        .attribute("accelerationEndSize")
        .attribute("spinStartSpinSpeed")
        .attribute("orientation")
        .attribute("colorMult")

        .uniform("clipMatrix")
        .uniform("clipMatrixInverse")
        .uniform("modelMatrix")
        .uniform("rampSampler")
        .uniform("colorSampler")
        .uniform("velocity", "3fv", [0, 100, 0])
        .uniform("acceleration", "3fv", [0, -9.8, 0])
        .uniform("timeRange", "1f", 500)
        .uniform("time", "1f", 0)
        .uniform("timeOffset", "1f", 0)
        .uniform("frameDuration", "1f", 0)
        .uniform("numFrames", "1f", 50);
        
    return engine.particleShader2D;
}