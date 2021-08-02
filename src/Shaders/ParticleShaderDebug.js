window.frag.ParticleShaderDebug = function(engine) {
    if (engine.particleShaderDebug) return engine.particleShaderDebug;
    
    const vertexShader = 
        'uniform mat4 u_clipMatrix;\n' +
        'uniform mat4 u_modelMatrix;\n' +
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
        '  float percentLife = localTime / lifeTime;\n' +
        '\n' +
        '  float frame = mod(floor(localTime / u_frameDuration + frameStart), u_numFrames);\n' +
        '  float uOffset = frame / u_numFrames;\n' +
        '  float u = uOffset + (uv.x + 0.5) * (1. / u_numFrames);\n' +
        '\n' +
        '  float size = mix(startSize, endSize, percentLife);\n' +
        '  size = (percentLife < 0. || percentLife > 1.) ? 0. : size;\n' +
        '  float s = sin(spinStart + spinSpeed * localTime);\n' +
        '  float c = cos(spinStart + spinSpeed * localTime);\n' +
        '\n' +
        '  vec4 rotatedPoint = vec4((uv.x * c + uv.y * s) * size, 0., (uv.x * s - uv.y * c) * size, 1.);\n' +
        '  vec3 center = velocity * localTime + acceleration * localTime * localTime + position;\n' +
        '\n' +
        '  vec4 q2 = a_orientation + a_orientation;\n' +
        '  vec4 qx = a_orientation.xxxw * q2.xyzx;\n' +
        '  vec4 qy = a_orientation.xyyw * q2.xyzy;\n' +
        '  vec4 qz = a_orientation.xxzw * q2.xxzz;\n' +
        '\n' +
        '  mat4 localMatrix = mat4(\n' + 
        '    (1.0 - qy.y) - qz.z, qx.y + qz.w, qx.z - qy.w, 0,\n' +
        '    qx.y - qz.w, (1.0 - qx.x) - qz.z, qy.z + qx.w, 0,\n' +
        '    qx.z + qy.w, qy.z - qx.w, (1.0 - qx.x) - qy.y, 0,\n' +
        '    center.x, center.y, center.z, 1);\n' +
        '  rotatedPoint = localMatrix * rotatedPoint;\n' +
        '  gl_Position = u_clipMatrix * rotatedPoint;\n' +
        '}\n';
  
    const fragmentShader = 
        'precision mediump float;\n' +
        'void main() {\n' +
        '  gl_FragColor = vec4(1, 0, 0, 1);\n' +
        '}\n'
  
    engine.particleShaderDebug = frag.CustomShader(engine)
        .name("Particle debug")
        .source(vertexShader, fragmentShader)
        .attribute("uvLifeTimeFrameStart")
        .attribute("positionStartTime")
        .attribute("velocityStartSize")
        .attribute("accelerationEndSize")
        .attribute("spinStartSpinSpeed")
        .attribute("orientation")
        .uniform("clipMatrix")
        .uniform("modelMatrix")
        .uniform("velocity", "3fv")
        .uniform("acceleration", "3fv")
        .uniform("timeRange", "1f")
        .uniform("time", "1f")
        .uniform("timeOffset", "1f")
        .uniform("frameDuration", "1f")
        .uniform("numFrames", "1f");
        
    return engine.particleShaderDebug;
}