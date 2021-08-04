window.frag.SphericalExplosionEmitter = function(engine, position, size) {
    const emitter = window.frag.CustomParticleEmitter(engine)
        .name("Spherical")
        .lifetime(function(){ return 3; })
        .position(function(){ return position; })
        .acceleration(function(){ return [0, 0, 0]; })
        .orientation(function(){ return window.frag.Quaternion.rotationX(Math.PI * 0.5); })
        .startSize(function(){ return 0.5 })
        .endSize(function(){ return 0.5 })
        .frameStart(function(){ return 0; })
        .spinStart(function(){ return 0; })
        .spinSpeed(function(){ return 0; });

    const r = function(range, mid) {
        return mid + range * (Math.random() - 0.5);
    };

    emitter.birthParticles = function() {
        const newParticles = [];
        const latitudeCount = 15;
        const delta = Math.PI / latitudeCount;
        for (let i = 0; i <= latitudeCount; i++) {
            const baseLatitude = Math.PI * (2 * i / latitudeCount - 1);
            const longitudeCount = i <= latitudeCount / 2 ? (i + 1) * 2 : (latitudeCount - i) * 2 ;
            for (let j = 0; j <= longitudeCount; j++) {
                particle = emitter.createParticle();
                newParticles.push(particle);

                const longitude = r(delta, Math.PI * (2 * j / longitudeCount - 1));
                const latitude = r(delta, baseLatitude);
                vx = Math.cos(longitude) * Math.sin(latitude) * size;
                vy = Math.cos(latitude) * size;
                vz = Math.sin(longitude) * Math.sin(latitude) * size;
                particle.velocity = [vx, vy, vz];
            }
        };
        return newParticles;
    };

    emitter.fire = function(particleSystem, duration) {
        duration = duration || 150;
        particleSystem.addEmitter(emitter);
        setTimeout(function(){ particleSystem.removeEmitter(emitter) }, duration);
    };

    return emitter;
}