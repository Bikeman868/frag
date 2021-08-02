window.frag.CustomParticleSystem = function (engine, is3d, shader) {
    if (shader !== undefined) is3d = shader.is3d;
    if (is3d === undefined) is3d = true;

    const frag = window.frag;
    const gl = engine.gl;

    const UV_LIFE_TIME_FRAME_START_IDX = 0;
    const POSITION_START_TIME_IDX = 4;
    const VELOCITY_START_SIZE_IDX = 8;
    const ACCELERATION_END_SIZE_IDX = 12;
    const SPIN_START_SPIN_SPEED_IDX = 16;
    const ORIENTATION_IDX = 20;
    const COLOR_MULT_IDX = 24;
    const LAST_IDX = 28;

    const VERTEX_COUNT_PER_PARTICLE = 4; // 4 corners
    const INDEX_COUNT_PER_PARTICLE = 6;  // 2 triangles
    
    const private = {
        name: "Custom",
        shader: shader || (is3d ? frag.ParticleShader3D(engine) : frag.ParticleShader2D(engine)),
        location: window.frag.Location(engine, is3d),
        lifetimeGameTickInterval: 25,
        nextLifetimeGameTick: 0,
        emitters: {},
        particles: [],
        enabled: true,
        rampTexture: null,
        colorTexture: null,
        particleBuffer: gl.createBuffer(),
        indexBuffer: gl.createBuffer(),
        aliveCount: 0,
        bufferedIndexCount: 0,
        bufferedParticleCount: 0,
        nextEmitterId: 0,
        velocity: [0, 0, 0],
        acceleration: [0, 0, 0],
        timeRange: 99999999,
        timeOffset: 0,
        numFrames: 1,
        frameDuration: 1,
    };

    const public = {
        __private: private,
        parent: null,
    }

    const corners = [
        [-0.5, -0.5],
        [+0.5, -0.5],
        [+0.5, +0.5],
        [-0.5, +0.5]];

    const defaultRampData = new Float32Array([1, 1, 1, 1, 1, 1, 1, 0]);
    private.rampTexture = frag.Texture(engine)
        .name("particle-ramp-texture")
        .dataFormat(gl.RGBA)
        .fromArrayBuffer(0, defaultRampData.buffer, 0, 2, 1);

    const defaultColorBase = [0, 0.20, 0.70, 1, 0.70, 0.20, 0, 0];
    const defaultColorData = new Float32Array(8 * 8);
    let ix = 0;
    for (let y = 0; y < 8; y++) {
        for (var x = 0; x < 8; x++) {
            var pixel = defaultColorBase[x] * defaultColorBase[y];
            defaultColorData[ix++] = pixel;
            defaultColorData[ix++] = pixel;
            defaultColorData[ix++] = pixel;
            defaultColorData[ix++] = pixel;
        }
    }
    private.colorTexture = frag.Texture(engine)
        .name("particle-color-texture")
        .dataFormat(gl.RGBA)
        .fromArrayBuffer(0, defaultColorData.buffer, 0, 8, 8);

    private.populateParticleBuffer = function(particle, buffer, offset) {
        let offset0 = offset;
        let offset1 = offset + 1;
        let offset2 = offset + 2;
        let offset3 = offset + 3;

        for (let i = 0; i < VERTEX_COUNT_PER_PARTICLE; i++) {
            buffer[offset0 + UV_LIFE_TIME_FRAME_START_IDX] = corners[i][0];
            buffer[offset1 + UV_LIFE_TIME_FRAME_START_IDX] = corners[i][1];
            buffer[offset2 + UV_LIFE_TIME_FRAME_START_IDX] = particle.lifetime;
            buffer[offset3 + UV_LIFE_TIME_FRAME_START_IDX] = particle.frameStart;

            buffer[offset0 + POSITION_START_TIME_IDX] = particle.position[0];
            buffer[offset1 + POSITION_START_TIME_IDX] = particle.position[1];
            buffer[offset2 + POSITION_START_TIME_IDX] = particle.position[2];
            buffer[offset3 + POSITION_START_TIME_IDX] = particle.startTime;

            buffer[offset0 + VELOCITY_START_SIZE_IDX] = particle.velocity[0];
            buffer[offset1 + VELOCITY_START_SIZE_IDX] = particle.velocity[1];
            buffer[offset2 + VELOCITY_START_SIZE_IDX] = particle.velocity[2];
            buffer[offset3 + VELOCITY_START_SIZE_IDX] = particle.startSize;

            buffer[offset0 + SPIN_START_SPIN_SPEED_IDX] = particle.spinStart;
            buffer[offset1 + SPIN_START_SPIN_SPEED_IDX] = particle.spinSpeed;
            buffer[offset2 + SPIN_START_SPIN_SPEED_IDX] = 0;
            buffer[offset3 + SPIN_START_SPIN_SPEED_IDX] = 0;

            buffer[offset0 + ACCELERATION_END_SIZE_IDX] = particle.acceleration[0];
            buffer[offset1 + ACCELERATION_END_SIZE_IDX] = particle.acceleration[1];
            buffer[offset2 + ACCELERATION_END_SIZE_IDX] = particle.acceleration[2];
            buffer[offset3 + ACCELERATION_END_SIZE_IDX] = particle.endSize;

            buffer[offset0 + ORIENTATION_IDX] = particle.orientation[0];
            buffer[offset1 + ORIENTATION_IDX] = particle.orientation[1];
            buffer[offset2 + ORIENTATION_IDX] = particle.orientation[2];
            buffer[offset3 + ORIENTATION_IDX] = particle.orientation[3];

            buffer[offset0 + COLOR_MULT_IDX] = particle.colorMult[0];
            buffer[offset1 + COLOR_MULT_IDX] = particle.colorMult[1];
            buffer[offset2 + COLOR_MULT_IDX] = particle.colorMult[2];
            buffer[offset3 + COLOR_MULT_IDX] = particle.colorMult[3];

            offset0 += LAST_IDX;
            offset1 += LAST_IDX;
            offset2 += LAST_IDX;
            offset3 += LAST_IDX;
        }
    }

    // Copies a range of particles indexes to the GPU based on their array index
    private.bufferParticleRange = function(startIndex, particleCount) {
        const particleFloatCount = LAST_IDX * VERTEX_COUNT_PER_PARTICLE;
        const buffer = new Float32Array(particleFloatCount * particleCount);
        let offset = 0;
        for (let i = startIndex; i < startIndex + particleCount; i++) {
            private.populateParticleBuffer(private.particles[i], buffer, offset);
            offset += particleFloatCount;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, private.particleBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, buffer.particleFloatCount * buffer.BYTES_PER_ELEMENT * startIndex, buffer);
    }

    // Copies a list of changed particles to the GPU based on their array indexes
    // Only works if the buffer in the GPU is big enough, ie number of particles 
    // is the same or less
    private.bufferSpecificParticles = function(particleIndexes) {
        particleIndexes.sort(function(a, b) { return a - b; });
        let rangeStart = 0;
        let rangeCount = 0;
        for (let i = 0; i < particleIndexes.length; i++) {
            const index = particleIndexes[i];
            if (i > 0 && index !== particleIndexes[i - 1]) {
                if (rangeCount > 0) {
                    private.bufferParticleRange(rangeStart, rangeCount);
                    rangeCount = 0;
                }
            }
            if (rangeCount === 0) {
                rangeStart = index;
                rangeCount = 1;
            } else {
                rangeCount++;
            }
        }
        if (rangeCount > 0) private.bufferParticleRange(rangeStart, rangeCount);
    }

    // Copies all particles to the GPU. You must do this if the number of particles increases
    private.bufferAllParticles = function() {
        const particleFloatCount = LAST_IDX * VERTEX_COUNT_PER_PARTICLE;
        const buffer = new Float32Array(particleFloatCount * private.aliveCount);
        let offset = 0;
        for (let i = 0; i < private.aliveCount; i++) {
            private.populateParticleBuffer(private.particles[i], buffer, offset);
            offset += particleFloatCount;
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, private.particleBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, buffer, gl.DYNAMIC_DRAW);

        private.bufferedParticleCount = private.aliveCount;
    }

    // Creates an index that maps the 4 corners of each particle onto 2 triangles. This 
    // needs to be done if the number of particles changes at all.
    private.bufferIndexes = function() {
        if (private.bufferedIndexCount === private.aliveCount) return;

        var indices = new Uint16Array(INDEX_COUNT_PER_PARTICLE * private.aliveCount);
        var idx = 0;
        var vertexStart = 0;
        for (let i = 0; i < private.aliveCount; i++) {
            indices[idx++] = vertexStart + 0;
            indices[idx++] = vertexStart + 1;
            indices[idx++] = vertexStart + 2;
            indices[idx++] = vertexStart + 0;
            indices[idx++] = vertexStart + 2;
            indices[idx++] = vertexStart + 3;
            vertexStart += VERTEX_COUNT_PER_PARTICLE;
        }
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, private.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
        private.bufferedIndexCount = private.aliveCount;
    }

    public.dispose = function () {
        public.disable();
        if (public.parent) public.parent.removeObject(public);
        if (private.particleBuffer) {
            gl.deleteBuffer(private.particleBuffer);
            private.particleBuffer = null;
        }
        if (private.indexBuffer) {
            gl.deleteBuffer(private.indexBuffer);
            private.indexBuffer = null;
        }
    }

    public.name = function (name) {
        private.name = name;
        return public;
    }

    public.getName = function () {
        return private.name;
    }

    public.getPosition = function() {
        if (!private.position) 
            private.position = frag.ScenePosition(engine, private.location);
        return private.position;
    }

    public.enable = function () {
        private.enabled = true;
        return public;
    };

    public.disable = function () {
        private.enabled = false;
        return public;
    };

    public.rampTexture = function(texture) {
        private.rampTexture = texture;
        return public;
    }

    public.colorTexture = function(texture) {
        private.colorTexture = texture;
        return public;
    }

    public.lifetimeGameTickInterval = function(value) {
        private.lifetimeGameTickInterval = value;
        return public;
    }

    public.addEmitter = function(emitter) {
        emitter.id = private.nextEmitterId++;
        private.emitters[emitter.id] = emitter;
        return public;
    }

    public.removeEmitter = function(emitter) {
        if (!private.emitters[emitter.id]) return false;
        delete private.emitters[emitter.id];
        return true;
    }

    private.draw = function(drawContext) {
        const shader = private.shader;
        shader.bind();

        private.rampTexture.apply('rampSampler', shader);
        private.colorTexture.apply('colorSampler', shader);

        if (shader.uniforms.clipMatrix !== undefined) {
            frag.Transform(engine, drawContext.state.modelToClipMatrix)
                .apply(shader.uniforms.clipMatrix);
        }

        if (shader.uniforms.modelMatrix !== undefined) {
            frag.Transform(engine, drawContext.state.modelToWorldMatrix)
                .apply(shader.uniforms.modelMatrix);
        }

        if (shader.uniforms.clipMatrixInverse !== undefined) {
            frag.Transform(engine, frag.Matrix.m4Invert(drawContext.state.modelToClipMatrix))
                .apply(shader.uniforms.clipMatrixInverse);
        }
    
        if (shader.time !== undefined) shader.time(engine.getElapsedSeconds());

        if (shader.velocity !== undefined) shader.velocity(private.velocity);
        if (shader.acceleration !== undefined) shader.acceleration(private.acceleration);
        if (shader.timeRange !== undefined) shader.timeRange(private.timeRange);
        if (shader.timeOffset !== undefined) shader.timeOffset(private.timeOffset);
        if (shader.numFrames !== undefined) shader.numFrames(private.numFrames);
        if (shader.frameDuration !== undefined) shader.frameDuration(private.frameDuration);

        // TODO: Only buffer changed particles
        private.bufferAllParticles();
        private.bufferIndexes();

        var sizeofFloat = 4;
        var stride = sizeofFloat * LAST_IDX;

        const bindAttribute = function(attribute, offset, unbind) {
            if (attribute >= 0) {
                gl.vertexAttribPointer(attribute, 4, gl.FLOAT, false, stride, sizeofFloat * offset);
                gl.enableVertexAttribArray(attribute);
                unbind.push(function(){ gl.disableVertexAttribArray(attribute); });
            }
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, private.particleBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, private.indexBuffer);

        const unbind = [];
        bindAttribute(shader.attributes.uvLifeTimeFrameStart, UV_LIFE_TIME_FRAME_START_IDX, unbind);
        bindAttribute(shader.attributes.positionStartTime, POSITION_START_TIME_IDX, unbind);
        bindAttribute(shader.attributes.velocityStartSize, VELOCITY_START_SIZE_IDX, unbind);
        bindAttribute(shader.attributes.accelerationEndSize, ACCELERATION_END_SIZE_IDX, unbind);
        bindAttribute(shader.attributes.spinStartSpinSpeed, SPIN_START_SPIN_SPEED_IDX, unbind);
        bindAttribute(shader.attributes.orientation, ORIENTATION_IDX, unbind);
        bindAttribute(shader.attributes.colorMult, COLOR_MULT_IDX, unbind);

        gl.drawElements(gl.TRIANGLES, private.bufferedIndexCount * INDEX_COUNT_PER_PARTICLE, gl.UNSIGNED_SHORT, 0);

        for (let i = 0; i < unbind.length; i++) unbind[i]();
    }

    private.addAndRemoveParticles = function(drawContext) {
        const time = engine.getElapsedSeconds();

        const deadParticleIndexes = [];
        for (let i = 0; i < private.particles.length; i++) {
            const particle = private.particles[i];
            if (time > particle.startTime + particle.lifetime) {
                deadParticleIndexes.push(i);
            } else {
                const emitter = private.emitters[particle.id];
                if (emitter && emitter.isDead && emitter.isDead(particle))
                    deadParticleIndexes.push(i);
            }
        }

        if (deadParticleIndexes) {
            deadParticleIndexes.sort(function(a, b) { return b - a; });
            for (let i = 0; i < deadParticleIndexes.length; i++) {
                private.particles.splice(deadParticleIndexes[i], 1);
                private.aliveCount--;
            }
        }

        for(var id in private.emitters) {
            const emitter = private.emitters[id];
            const newParticles = emitter.birthParticles(public, time);
            if (newParticles) {
                for (let j = 0; j < newParticles.length; j++) {
                    const particle = newParticles[j];
                    particle.id = id;
                    particle.startTime = time;
                    if (particle.lifetime === undefined) particle.lifetime = 20;
                    if (particle.frameStart === undefined) particle.frameStart = 0;
                    if (particle.spinStart === undefined) particle.spinStart = 0;
                    if (particle.spinSpeed === undefined) particle.spinSpeed = 0;
                    if (particle.startSize === undefined) particle.startSize = 1;
                    if (particle.endSize === undefined) particle.endSize = particle.startSize;
                    if (particle.position === undefined) particle.position = [0, 0, 0];
                    if (particle.velocity === undefined) particle.velocity = [0, 1, 0];
                    if (particle.acceleration === undefined) particle.acceleration = [0, 0, 0];
                    if (particle.orientation === undefined) particle.orientation = [0, 0, 0, 0];
                    if (particle.colorMult === undefined) particle.colorMult = [1, 1, 1, 1];
                    private.particles.push(particle);
                }
                private.aliveCount += newParticles.length;
            }
        }
    }

    public.draw = function(drawContext) {
        if (drawContext.isHitTest) return public;

        if (drawContext.gameTick >= private.nextLifetimeGameTick) {
            private.addAndRemoveParticles(drawContext);
            private.nextLifetimeGameTick = drawContext.gameTick + private.lifetimeGameTickInterval;
        }

        if (!private.enabled) return public;

        drawContext.beginSceneObject(private.location, {}, {});
        private.draw(drawContext);
        drawContext.endSceneObject();

        return public;
    }

    return public;
}
