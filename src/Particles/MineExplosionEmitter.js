window.frag.MineExplosionEmitter = function(engine, position, size) {
    const emitter = window.frag.CustomParticleEmitter(engine)
        .name("Mine")
        .birthRate(100, 100)
        .lifetime(function(){ return 2; })
        .position(function(){ return position; })
        .velocityRange(size * -0.1, size * 0.1, size * 0.8, size * 1.2, size * -0.1, size * 0.1)
        .acceleration(function(){ return [0, 0, 0]; })
        .orientation(function(){ return window.frag.Quaternion.rotationX(Math.PI * 0.5); })
        .startSize(function(){ return 0.5 })
        .endSize(function(){ return 0.5 })
        .frameStart(function(){ return 0; })
        .spinStart(function(){ return 0; })
        .spinSpeed(function(){ return 0; })
        .adjust(function(p){ 
            p.acceleration = [p.velocity[0] * 1.2, 0,  p.velocity[2] * 1.2];
        });

    emitter.fire = function(particleSystem, duration) {
        duration = duration || 500;
        particleSystem.addEmitter(emitter);
        setTimeout(function(){ particleSystem.removeEmitter(emitter) }, duration);
    }

    return emitter;
}