window.frag.SprayEmitter = function(engine, position, axis, width) {
    const emitter = window.frag.CustomParticleEmitter(engine)
        .name("Spray")
        .birthRate(25, 25)
        .lifetime(function(){ return 6; })
        .position(function(){ return position; })
        .velocity(function(){
            const velocity = Array.from(axis);
            for (var i = 0; i < 3; i++) {
                if (axis[i] === 0)
                    velocity[i] += (Math.random() - 0.5) * width;
                else
                    velocity[i] *= 1 + Math.random() * 0.5;
            }
            return velocity;
        })
        .orientation(function(){ return window.frag.Quaternion.rotationX(Math.PI * 0.5); })
        .startSize(function(){ return 0.5 })
        .endSize(function(){ return 1 });

    emitter.stop = function() {
        emitter.particleSystem.removeEmitter(emitter);
    }

    emitter.start = function(particleSystem, duration) {
        emitter.particleSystem = particleSystem;
        particleSystem.addEmitter(emitter);
        if (duration)
            setTimeout(emitter.stop, duration);
    }

    return emitter;
}