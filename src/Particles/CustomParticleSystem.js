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
    const EXTRA_PARTICLES_TO_BUFFER = 500;
    const MAX_PARTICLE_COUNT = 65536 / VERTEX_COUNT_PER_PARTICLE;
    
    // Notes:
    // The `particles` array contains references to particle instances. Dead particles have null
    // pointers in the array because we don't want to send all the data to the GPU again just
    // because one particle died.
    // Each particle instance has its own velocity, acceleration etc which is added to the 
    // particle system velocity, acceleration etc.
    // Particles can be freely moved within the `particles` array without re-building the
    // index. The index just creates triangles out of quads but defines how many particle
    // quads will be drawn.
    // The `aliveCount` says how many of the particles in the `particles` array are alive.
    // The rest of the array contains dead particles that can be overwritten with new ones.
    // `bufferedParticleCount` says how many of the particles in the `particles` array are
    // currently in the GPU.
    // `bufferedIndexCount` is the size of the index in the GPU and this is how many particles
    // will get drawn on each refresh. This can include some dead particles which will output
    // no pixels but consume GPU cycles to compute.

    const private = {
        name: "Custom",
        shader: shader || (is3d ? frag.ParticleShader3D(engine) : frag.ParticleShader2D(engine)),
        location: window.frag.Location(engine, is3d),
        lifetimeGameTickInterval: 10,
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
        numFrames: 4,
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

    private.rampTexture = frag.Texture(engine)
        .name("particle-ramp-texture")
        .dataFormat(gl.RGBA)
        .fromArrayBuffer(
            0,
            new Uint8Array([
                255, 255, 255, 255, 
                255, 255, 255, 0
            ]), 
            0, 2, 1);

    private.colorTexture = frag.Texture(engine)
        .name("particle-color-texture")
        .dataFormat(gl.RGBA)
        .fromArrayBuffer(
            0, 
            new Uint8Array([255, 255, 255, 255]), 
            0, 1, 1);

    private.checkError = function(description) {
        const error = gl.getError();
        if (error !== 0) 
            console.error(private.name, 'error', error, 'in', description);
    }

    // Copies particle attributes to an array buffer so that it can
    // be uploaded into the GPU. For dead particles pass `null` for
    // the `particle` parameter
    private.populateParticleBuffer = function(particle, buffer, offset) {
        let offset0 = offset;
        let offset1 = offset + 1;
        let offset2 = offset + 2;
        let offset3 = offset + 3;

        if (!particle) {
            buffer.fill(0, offset, offset + LAST_IDX * VERTEX_COUNT_PER_PARTICLE - 1);
            return;
        }

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

            buffer[offset0 + COLOR_MULT_IDX] = particle.color[0];
            buffer[offset1 + COLOR_MULT_IDX] = particle.color[1];
            buffer[offset2 + COLOR_MULT_IDX] = particle.color[2];
            buffer[offset3 + COLOR_MULT_IDX] = particle.color[3];

            offset0 += LAST_IDX;
            offset1 += LAST_IDX;
            offset2 += LAST_IDX;
            offset3 += LAST_IDX;
        }
    }

    // Copies a range of particles indexes to the GPU based on their array index
    // Only works if the buffer in the GPU is big enough, ie number of particles 
    // is the same or than bufferedParticleCount. 
    private.bufferParticleRange = function(startIndex, particleCount) {
        if (startIndex >= private.aliveCount) return;
        if (startIndex + particleCount > private.aliveCount)
            particleCount = private.aliveCount - startIndex - 1;

        const particleFloatCount = LAST_IDX * VERTEX_COUNT_PER_PARTICLE;
        const buffer = new Float32Array(particleFloatCount * particleCount);
        let offset = 0;
        for (let i = startIndex; i < startIndex + particleCount; i++) {
            private.populateParticleBuffer(private.particles[i], buffer, offset);
            offset += particleFloatCount;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, private.particleBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, buffer.particleFloatCount * buffer.BYTES_PER_ELEMENT * startIndex, buffer);
        private.checkError('bufferSubData');

        if (engine.debugParticles)
            console.log(private.name, 'copied particles', startIndex, '-', startIndex + particleCount - 1, 'to the GPU');
}

    // Copies a list of changed particles to the GPU based on their array indexes
    // particleIndexes must be sorted from high to low
    private.bufferSpecificParticles = function(particleIndexes) {
        // TODO: if there are small gaps in the ranges it makes sense to combine them
        let rangeStart = 0;
        let rangeCount = 0;
        for (let i = 0; i < particleIndexes.length; i++) {
            const index = particleIndexes[i];
            if (i > 0) {
                const prior = particleIndexes[i - 1];
                if (prior === index) continue;
                if (prior !== index + 1 && rangeCount > 0) {
                    private.bufferParticleRange(rangeStart, rangeCount);
                    rangeCount = 0;
                }
            }
            rangeStart = index;
            rangeCount++;
        }
        if (rangeCount > 0) 
            private.bufferParticleRange(rangeStart, rangeCount);
    }

    // Copies all particles to the GPU. You must do this if the number of alive 
    // particles is bigger than bufferedParticleCount
    private.bufferAllParticles = function() {
        const count = private.aliveCount + EXTRA_PARTICLES_TO_BUFFER;
        while (private.particles.length < count) private.particles.push(null);

        const particleFloatCount = LAST_IDX * VERTEX_COUNT_PER_PARTICLE;
        const buffer = new Float32Array(particleFloatCount * count);
        let offset = 0;
        for (let i = 0; i < count; i++) {
            private.populateParticleBuffer(private.particles[i], buffer, offset);
            offset += particleFloatCount;
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, private.particleBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, buffer, gl.DYNAMIC_DRAW);
        private.checkError('bufferData for particle buffer');

        private.bufferedParticleCount = count;

        if (engine.debugParticles)
            console.log(private.name, 'initialized GPU particle buffer with', count, 'particles');
}

    // Creates an index that maps the 4 corners of each particle onto 2 triangles. This 
    // needs to be done if the number of particles changes at all, but note that the
    // `particles` array contains dead particles and is only resized when needed
    private.bufferIndexes = function() {
        let count = private.particles.length;
        if (count > MAX_PARTICLE_COUNT) count = MAX_PARTICLE_COUNT;
        if (private.bufferedIndexCount >= count) return;

        var indices = new Uint16Array(INDEX_COUNT_PER_PARTICLE * count);
        var idx = 0;
        var vertexStart = 0;
        for (let i = 0; i < count; i++) {
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
        private.checkError('bufferData for index buffer');

        private.bufferedIndexCount = count;

        if (engine.debugParticles)
            console.log(private.name, 'initialized GPU index buffer with', count, 'particle index');
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
        if (private.rampTexture) {
            private.rampTexture.dispose();
            private.rampTexture = null;
        }
        if (private.colorTexture) {
            private.colorTexture.dispose();
            private.colorTexture = null;
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
        if (private.rampTexture) private.rampTexture.dispose();
        private.rampTexture = texture;
        return public;
    }

    public.colorTexture = function(texture) {
        if (private.colorTexture) private.colorTexture.dispose();
        private.colorTexture = texture;
        return public;
    }

    public.lifetimeGameTickInterval = function(value) {
        private.lifetimeGameTickInterval = value;
        return public;
    }

    public.velocity = function(vector) {
        private.velocity = vector;
        return public;
    }

    public.acceleration = function(vector) {
        private.acceleration = vector;
        return public;
    }

    public.timeRange = function(value) {
        private.timeRange = value;
        return public;
    }

    public.timeOffset = function(value) {
        private.timeOffset = value;
        return public;
    }

    public.numFrames = function(value) {
        private.numFrames = value;
        return public;
    }

    public.frameDuration = function(value) {
        private.frameDuration = value;
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

        var sizeofFloat = 4;
        var stride = sizeofFloat * LAST_IDX;
        const bindAttribute = function(attribute, offset, unbind) {
            if (attribute >= 0) {
                gl.vertexAttribPointer(attribute, 4, gl.FLOAT, false, stride, sizeofFloat * offset);
                private.checkError('vertexAttribPointer');

                gl.enableVertexAttribArray(attribute);
                private.checkError('enableVertexAttribArray');

                unbind.push(function(){ gl.disableVertexAttribArray(attribute); });
            }
        };

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

        let drawCount = private.aliveCount;
        if (drawCount > MAX_PARTICLE_COUNT) drawCount = MAX_PARTICLE_COUNT;
        gl.drawElements(gl.TRIANGLES, drawCount * INDEX_COUNT_PER_PARTICLE, gl.UNSIGNED_SHORT, 0);
        private.checkError('drawElements');

        for (let i = 0; i < unbind.length; i++) unbind[i]();
    }


    private.addAndRemoveParticles = function(drawContext) {
        const time = engine.getElapsedSeconds();

        const deadParticleIndexes = [];
        for (let i = 0; i < private.particles.length; i++) {
            const particle = private.particles[i];
            if (!particle) continue;
            if (time > particle.startTime + particle.lifetime) {
                deadParticleIndexes.push(i);
            } else {
                const emitter = private.emitters[particle.id];
                if (emitter && emitter.isDead && emitter.isDead(particle))
                    deadParticleIndexes.push(i);
            }
        }

        if (deadParticleIndexes.length) {
            deadParticleIndexes.sort(function(a, b) { return b - a; });
            for (let i = 0; i < deadParticleIndexes.length; i++) {
                const deadIndex = deadParticleIndexes[i];
                private.aliveCount--;
                private.particles[deadIndex] = private.particles[private.aliveCount];
                private.particles[private.aliveCount] = null;
            }
        }

        let lowWaterMark = private.aliveCount;
        for(var id in private.emitters) {
            const emitter = private.emitters[id];
            const newParticles = emitter.birthParticles(public, time);
            if (newParticles) {
                for (let j = 0; j < newParticles.length; j++) {
                    const particle = newParticles[j];
                    particle.id = id;
                    particle.startTime = time;
                    if (particle.lifetime === undefined) particle.lifetime = 5;
                    if (particle.frameStart === undefined) particle.frameStart = 0;
                    if (particle.spinStart === undefined) particle.spinStart = 0;
                    if (particle.spinSpeed === undefined) particle.spinSpeed = 0;
                    if (particle.startSize === undefined) particle.startSize = 1;
                    if (particle.endSize === undefined) particle.endSize = particle.startSize;
                    if (particle.position === undefined) particle.position = [0, 0, 0];
                    if (particle.velocity === undefined) particle.velocity = [0, 1, 0];
                    if (particle.acceleration === undefined) particle.acceleration = [0, 0, 0];
                    if (particle.orientation === undefined) particle.orientation = [0, 0, 0, 0];
                    if (particle.color === undefined) particle.color = [1, 1, 1, 1];

                    if (private.particles.length > private.aliveCount)
                        private.particles[private.aliveCount] = particle;
                    else
                        private.particles.push(particle);
                    private.aliveCount++;

                    if (private.aliveCount > MAX_PARTICLE_COUNT)
                        console.error(private.name, 'has too many particles');
                }
            }
        }

        if (engine.debugParticles)
            console.log(
                private.name, 'alive=' + private.aliveCount + '/' + private.particles.length, 
                ', GPU particles=' + private.bufferedParticleCount, ', GPU index=' + private.bufferedIndexCount);

        const bufferCount = private.aliveCount + EXTRA_PARTICLES_TO_BUFFER;
        if (true || // There seems to be stability and speed issues with gl.bufferSubData
            private.bufferedParticleCount < private.aliveCount || 
            private.particles.length > bufferCount) {
            if (private.particles.length > bufferCount)
                private.particles.length = bufferCount;
            private.bufferAllParticles();
            if (engine.debugParticles)
                console.log(private.name, 'copied all', private.aliveCount, 'alive particles to the GPU');
        } else {
            if (lowWaterMark < private.aliveCount) {
                private.bufferParticleRange(lowWaterMark, private.aliveCount - lowWaterMark);
                if (engine.debugParticles)
                    console.log(private.name, 'copied', private.aliveCount - lowWaterMark, 'new particles to the GPU');
            }
            if (deadParticleIndexes.length) {
                private.bufferSpecificParticles(deadParticleIndexes);
                if (engine.debugParticles)
                    console.log(private.name, 'copied', deadParticleIndexes.length, 'reloacated particles to the GPU');
            }
        }
        private.bufferIndexes();    
        if (engine.debugParticles) console.log('');
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
