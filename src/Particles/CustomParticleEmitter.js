window.frag.CustomParticleEmitter = function (engine) {
    const private = {
        name: 'Custom',

        birthRange: 10,
        birthMiddle: 30,

        lifetimeRange: 10,
        lifetimeMiddle: 30,

        xPositionRange: 0,
        xPositionMiddle: 0,
        yPositionRange: 0,
        yPositionMiddle: 0,
        zPositionRange: 0,
        zPositionMiddle: 0,

        xVelocityRange: 10,
        xVelocityMiddle: 5,
        yVelocityRange: 10,
        yVelocityMiddle: 5,
        zVelocityRange: 10,
        zVelocityMiddle: 5,

        xAccelerationRange: 0,
        xAccelerationMiddle: 0,
        yAccelerationRange: 0,
        yAccelerationMiddle: 0,
        zAccelerationRange: 0,
        zAccelerationMiddle: 0,

        xOrientationRange: 0,
        xOrientationMiddle: 0,
        yOrientationRange: 0,
        yOrientationMiddle: 0,
        zOrientationRange: 0,
        zOrientationMiddle: 0,
        wOrientationRange: 0,
        wOrientationMiddle: 0,

        redRange: 1,
        redMiddle: 0.5,
        greenRange: 1,
        greenMiddle: 0.5,
        blueRange: 1,
        blueMiddle: 0.5,
        alphaRange: 0.25,
        alphaMiddle: 0.25,

        startSizeRange: 0.25,
        startSizeMiddle: 0.5,
        sizeIncreaseRange: 0.5,
        sizeIncreaseMiddle: 0.25,

        frameStartRange: 0,
        frameStartMiddle: 0,

        spinStartRange: 0,
        spinStartMiddle: 0,
        spinSpeedRange: 0,
        spinSpeedMiddle: 0,
    };

    const public = {
        __private: private,
    };

    public.name = function(name) {
        private.name = name;
        return public;
    }

    // Random number generator

    private.random = Math.random;

    public.random = function(random) {
        private.random = random;
        return public;
    }

    // Probability distribution

    private.distribution = function(random, range, middle, kind) {
        return middle + range * (random - 0.5);
    }

    public.distribution = function(distribution) {
        private.distribution = distribution;
        return public;
    }

    // Lifetime

    private.lifetime = function() {
        return private.distribution(private.random(), private.lifetimeRange, private.lifetimeMiddle, 'lifetime');
    }

    public.lifetime = function(lifetime) {
        private.lifetime = lifetime;
        return public;
    }

    public.lifetimeRange = function(min, max) {
        private.lifetimeRange = max - min;
        private.lifetimeMiddle = (max + min) * 0.5;
        return public;
    }

    // Position

    private.position = function() {
        const x = private.distribution(private.random(), private.xPositionRange, private.xPositionMiddle, 'position');
        const y = private.distribution(private.random(), private.yPositionRange, private.yPositionMiddle, 'position');
        const z = private.distribution(private.random(), private.zPositionRange, private.zPositionMiddle, 'position');
        
        return [x, y, z];
    }

    public.position = function(position) {
        private.position = position;
        return public;
    }

    public.positionRange = function(xPositionMin, xPositionMax, yPositionMin, yPositionMax, zPositionMin, zPositionMax) {
        private.xPositionRange = xPositionMax - xPositionMin;
        private.xPositionMiddle = (xPositionMax + xPositionMin) * 0.5;

        private.yPositionRange = yPositionMax - yPositionMin;
        private.yPositionMiddle = (yPositionMax + yPositionMin) * 0.5;

        private.zPositionRange = zPositionMax - zPositionMin;
        private.zPositionMiddle = (zPositionMax + zPositionMin) * 0.5;

        return public;
    }

    // Velocity

    private.velocity = function() {
        const x = private.distribution(private.random(), private.xVelocityRange, private.xVelocityMiddle, 'velocity');
        const y = private.distribution(private.random(), private.yVelocityRange, private.yVelocityMiddle, 'velocity');
        const z = private.distribution(private.random(), private.zVelocityRange, private.zVelocityMiddle, 'velocity');
        
        return [x, y, z];
    }

    public.velocity = function(velocity) {
        private.velocity = velocity;
        return public;
    }

    public.velocityRange = function(xVelocityMin, xVelocityMax, yVelocityMin, yVelocityMax, zVelocityMin, zVelocityMax) {
        private.xVelocityRange = xVelocityMax - xVelocityMin;
        private.xVelocityMiddle = (xVelocityMax + xVelocityMin) * 0.5;

        private.yVelocityRange = yVelocityMax - yVelocityMin;
        private.yVelocityMiddle = (yVelocityMax + yVelocityMin) * 0.5;

        private.zVelocityRange = zVelocityMax - zVelocityMin;
        private.zVelocityMiddle = (zVelocityMax + zVelocityMin) * 0.5;

        return public;
    }

    // Acceleration

    private.acceleration = function() {
        const x = private.distribution(private.random(), private.xAccelerationRange, private.xAccelerationMiddle, 'acceleration');
        const y = private.distribution(private.random(), private.yAccelerationRange, private.yAccelerationMiddle, 'acceleration');
        const z = private.distribution(private.random(), private.zAccelerationRange, private.zAccelerationMiddle, 'acceleration');
        
        return [x, y, z];
    }

    public.acceleration = function(acceleration) {
        private.acceleration = acceleration;
        return public;
    }

    public.accelerationRange = function(xAccelerationMin, xAccelerationMax, yAccelerationMin, yAccelerationMax, zAccelerationMin, zAccelerationMax) {
        private.xAccelerationRange = xAccelerationMax - xAccelerationMin;
        private.xAccelerationMiddle = (xAccelerationMax + xAccelerationMin) * 0.5;

        private.yAccelerationRange = yAccelerationMax - yAccelerationMin;
        private.yAccelerationMiddle = (yAccelerationMax + yAccelerationMin) * 0.5;

        private.zAccelerationRange = zAccelerationMax - zAccelerationMin;
        private.zAccelerationMiddle = (zAccelerationMax + zAccelerationMin) * 0.5;

        return public;
    }

    // Orientation

    private.orientation = function() {
        const x = private.distribution(private.random(), private.xOrientationRange, private.xOrientationMiddle, 'orientation');
        const y = private.distribution(private.random(), private.yOrientationRange, private.yOrientationMiddle, 'orientation');
        const z = private.distribution(private.random(), private.zOrientationRange, private.zOrientationMiddle, 'orientation');
        const w = private.distribution(private.random(), private.wOrientationRange, private.wOrientationMiddle, 'orientation');
        
        return [x, y, z, w];
    }

    public.orientation = function(orientation) {
        private.orientation = orientation;
        return public;
    }

    public.orientationRange = function(xOrientationMin, xOrientationMax, yOrientationMin, yOrientationMax, zOrientationMin, zOrientationMax, wOrientationMin, wOrientationMax) {
        private.xOrientationRange = xOrientationMax - xOrientationMin;
        private.xOrientationMiddle = (xOrientationMax + xOrientationMin) * 0.5;

        private.yOrientationRange = yOrientationMax - yOrientationMin;
        private.yOrientationMiddle = (yOrientationMax + yOrientationMin) * 0.5;

        private.zOrientationRange = zOrientationMax - zOrientationMin;
        private.zOrientationMiddle = (zOrientationMax + zOrientationMin) * 0.5;

        private.wOrientationRange = wOrientationMax - wOrientationMin;
        private.wOrientationMiddle = (wOrientationMax + wOrientationMin) * 0.5;

        return public;
    }

    // Color

    private.color = function() {
        const red = private.distribution(private.random(), private.redRange, private.redMiddle, 'color');
        const green = private.distribution(private.random(), private.greenRange, private.greenMiddle, 'color');
        const blue = private.distribution(private.random(), private.blueRange, private.blueMiddle, 'color');
        const alpha = private.distribution(private.random(), private.alphaRange, private.alphaMiddle, 'aplha');
        
        let scale = 1 / red;
        if (green > red) scale = 1 / green;
        if (blue > red && blue > green) scale = 1 / blue;
        return [red * scale, green * scale, blue * scale, alpha];
    }

    public.color = function(color) {
        private.color = color;
        return public;
    }

    public.colorRange = function(redMin, redMax, greenMin, greenMax, blueMin, blueMax, alphaMin, alphaMax) {
        private.redRange = redMax - redMin;
        private.redMiddle = (redMax + redMin) * 0.5;

        private.greenRange = greenMax - greenMin;
        private.greenMiddle = (greenMax + greenMin) * 0.5;

        private.blueRange = blueMax - blueMin;
        private.blueMiddle = (blueMax + blueMin) * 0.5;

        private.alphaRange = alphaMax - alphaMin;
        private.alphaMiddle = (alphaMax + alphaMin) * 0.5;

        return public;
    }

    // Size

    private.startSize = function() {
        return private.distribution(private.random(), private.startSizeRange, private.startSizeMiddle, 'size');
    }

    private.endSize = function(startSize) {
        return startSize + private.distribution(private.random(), private.sizeIncreaseRange, private.sizeIncreaseMiddle, 'size');
    }

    public.startSize = function(startSize) {
        private.startSize = startSize;
        return public;
    }

    public.endSize = function(endSize) {
        private.endSize = endSize;
        return public;
    }

    public.sizeRange = function(startMin, startMax, increaseMin, increaseMax) {
        private.startSizeRange = startMax - startMin;
        private.startSizeMiddle = (startMax + startMin) * 0.5;

        private.sizeIncreaseRange = increaseMax - increaseMin;
        private.sizeIncreaseMiddle = (increaseMax + increaseMin) * 0.5;
        return public;
    }

    // Frame

    private.frameStart = function() {
        return Math.floor(private.distribution(private.random(), private.lifetimeRange, private.lifetimeMiddle, 'lifetime'));
    }

    public.frameStart = function(frameStart) {
        private.frameStart = frameStart;
        return public;
    }

    public.frameStartRange = function(min, max) {
        private.frameStartRange = max - min;
        private.frameStartMiddle = (max + min) * 0.5;
        return public;
    }

    // Spin

    private.spinStart = function() {
        return private.distribution(private.random(), private.spinStartRange, private.spinStartMiddle, 'spin');
    }

    private.spinSpeed = function() {
        return private.distribution(private.random(), private.spinSpeedRange, private.spinSpeedMiddle, 'spin');
    }

    public.spinStart = function(spinStart) {
        private.spinStart = spinStart;
        return public;
    }

    public.spinSpeed = function(spinSpeed) {
        private.spinSpeed = spinSpeed;
        return public;
    }

    public.spinRange = function(startMin, startMax, speedMin, speedMax) {
        private.spinStartRange = startMax - startMin;
        private.spinStartMiddle = (startMax + startMin) * 0.5;

        private.spinSpeedRange = speedMax - speedMin;
        private.spinSpeedMiddle = (speedMax + speedMin) * 0.5;
        return public;
    }

    // Particle birthing

    private.adjust = function(particle) {
    }

    public.adjust = function(adjust) {
        private.adjust = adjust;
        return public;
    }

    public.createParticle = function() {
        const particle = {
            lifetime: private.lifetime(),
            position: private.position(),
            velocity: private.velocity(),
            acceleration: private.acceleration(),
            orientation: private.orientation(),
            color: private.color(),
            startSize: private.startSize(),
            frameStart: private.frameStart(),
            spinStart: private.spinStart(),
            spinSpeed: private.spinSpeed(),
        };
        particle.endSize = private.endSize(particle.startSize);
        private.adjust(particle);
        return particle;
    }

    private.birthParticle = public.createParticle;

    public.birthParticle = function(birthParticle) {
        private.birthParticle = birthParticle;
        return particle;
    }

    public.birthRate = function(min, max) {
        private.birthRange = max - min;
        private.birthMiddle = (max + min) * 0.5;
        return public;
    }

    public.birthParticles = function() {
        const newParticles = [];
        const count = private.distribution(private.random(), private.birthRange, private.birthMiddle, 'rate');
        for (let i = 0; i < count; i++) {
            newParticles.push(private.birthParticle());
        }
        return newParticles;
    }

    return public;
}
