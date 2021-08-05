window.frag.RainEmitter = function(engine, position, width, depth, height, velocity, density) {
    const velocityRange = window.frag.Vector.length(velocity) * 0.05;

    const emitter = window.frag.CustomParticleEmitter(engine)
        .name("Rain")
        .birthRate(density * 0.05, density)
        .lifetime(function(){ return height; })
        .position(function(){ 
            return window.frag.Vector.add(position, [emitter.randomValue(width), 0, emitter.randomValue(depth)]); 
        })
        .velocity(function(){
            return window.frag.Vector.mult(velocity, emitter.randomValue(velocityRange, 1));
        })
        .orientation(function(){ return window.frag.Quaternion.rotationX(Math.PI * 0.5); })
        .startSize(function(){ return 1.5 })
        .endSize(function(){ return 1.5 })
        .color(function(){ return [0.5, 0.5, 0.5, 0.1]; });

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