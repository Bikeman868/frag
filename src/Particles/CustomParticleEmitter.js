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

    public.dispose = function() {}

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

    public.randomValue = function(range, middle, kind) {
        return private.distribution(private.random(), range, middle, kind);
    }

    // Probability distribution

    private.distribution = function(random, range, middle, kind) {
        middle = middle || 0;
        return middle + range * (random - 0.5);
    }

    public.distribution = function(distribution) {
        private.distribution = distribution;
        return public;
    }

    // Lifetime

    private.lifetime = function() {
        return public.randomValue(private.lifetimeRange, private.lifetimeMiddle, 'lifetime');
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
        const x = public.randomValue(private.xPositionRange, private.xPositionMiddle, 'position');
        const y = public.randomValue(private.yPositionRange, private.yPositionMiddle, 'position');
        const z = public.randomValue(private.zPositionRange, private.zPositionMiddle, 'position');
        
        return [x, y, z];
    }

    public.position = function(position) {
        private.position = position;
        return public;
    }

    public.positionRange = function(min, max) {
        private.xPositionRange = max[0] - min[0];
        private.xPositionMiddle = (max[0] + min[0]) * 0.5;

        private.yPositionRange = max[1] - min[1];
        private.yPositionMiddle = (max[1] + min[1]) * 0.5;

        private.zPositionRange = max[2] - min[2];
        private.zPositionMiddle = (max[2] + min[2]) * 0.5;

        return public;
    }

    // Velocity

    private.velocity = function() {
        const x = public.randomValue(private.xVelocityRange, private.xVelocityMiddle, 'velocity');
        const y = public.randomValue(private.yVelocityRange, private.yVelocityMiddle, 'velocity');
        const z = public.randomValue(private.zVelocityRange, private.zVelocityMiddle, 'velocity');
        
        return [x, y, z];
    }

    public.velocity = function(velocity) {
        private.velocity = velocity;
        return public;
    }

    public.velocityRange = function(min, max) {
        private.xVelocityRange = max[0] - min[0];
        private.xVelocityMiddle = (max[0] + min[0]) * 0.5;

        private.yVelocityRange = max[1] - min[1];
        private.yVelocityMiddle = (max[1] + min[1]) * 0.5;

        private.zVelocityRange = max[2] - min[2];
        private.zVelocityMiddle = (max[2] + min[2]) * 0.5;

        return public;
    }

    // Acceleration

    private.acceleration = function() {
        const x = public.randomValue(private.xAccelerationRange, private.xAccelerationMiddle, 'acceleration');
        const y = public.randomValue(private.yAccelerationRange, private.yAccelerationMiddle, 'acceleration');
        const z = public.randomValue(private.zAccelerationRange, private.zAccelerationMiddle, 'acceleration');
        
        return [x, y, z];
    }

    public.acceleration = function(acceleration) {
        private.acceleration = acceleration;
        return public;
    }

    public.accelerationRange = function(min, max) {
        private.xAccelerationRange = max[0] - min[0];
        private.xAccelerationMiddle = (max[0] + min[0]) * 0.5;

        private.yAccelerationRange = max[1] - min[1];
        private.yAccelerationMiddle = (max[1] + min[1]) * 0.5;

        private.zAccelerationRange = max[2] - min[2];
        private.zAccelerationMiddle = (max[2] + min[2]) * 0.5;

        return public;
    }

    // Orientation

    private.orientation = function() {
        const x = public.randomValue(private.xOrientationRange, private.xOrientationMiddle, 'orientation');
        const y = public.randomValue(private.yOrientationRange, private.yOrientationMiddle, 'orientation');
        const z = public.randomValue(private.zOrientationRange, private.zOrientationMiddle, 'orientation');
        const w = public.randomValue(private.wOrientationRange, private.wOrientationMiddle, 'orientation');
        
        return [x, y, z, w];
    }

    public.orientation = function(orientation) {
        private.orientation = orientation;
        return public;
    }

    public.orientationRange = function(min, max) {
        private.xOrientationRange = max[0] - min[0];
        private.xOrientationMiddle = (max[0] + min[0]) * 0.5;

        private.yOrientationRange = max[1] - min[1];
        private.yOrientationMiddle = (max[1] + min[1]) * 0.5;

        private.zOrientationRange = max[2] - min[2];
        private.zOrientationMiddle = (max[2] + min[2]) * 0.5;

        private.wOrientationRange = max[3] - min[3];
        private.wOrientationMiddle = (max[3] + min[3]) * 0.5;

        return public;
    }

    // Color

    private.color = function() {
        const red = public.randomValue(private.redRange, private.redMiddle, 'color');
        const green = public.randomValue(private.greenRange, private.greenMiddle, 'color');
        const blue = public.randomValue(private.blueRange, private.blueMiddle, 'color');
        const alpha = public.randomValue(private.alphaRange, private.alphaMiddle, 'aplha');
        
        let scale = 1 / red;
        if (green > red) scale = 1 / green;
        if (blue > red && blue > green) scale = 1 / blue;
        return [red * scale, green * scale, blue * scale, alpha];
    }

    public.color = function(color) {
        private.color = color;
        return public;
    }

    public.colorRange = function(min, max) {
        private.redRange = max[0] - min[0];
        private.redMiddle = (max[0] + min[0]) * 0.5;

        private.greenRange = max[1] - min[1];
        private.greenMiddle = (max[1] + min[1]) * 0.5;

        private.blueRange = max[2] - min[2];
        private.blueMiddle = (max[2] + min[2]) * 0.5;

        private.alphaRange = max[3] - min[3];
        private.alphaMiddle = (max[3] + min[3]) * 0.5;

        return public;
    }

    // Size

    private.startSize = function() {
        return public.randomValue(private.startSizeRange, private.startSizeMiddle, 'size');
    }

    private.endSize = function(startSize) {
        return startSize + public.randomValue(private.sizeIncreaseRange, private.sizeIncreaseMiddle, 'size');
    }

    public.startSize = function(startSize) {
        private.startSize = startSize;
        return public;
    }

    public.startSizeRange = function(startMin, startMax) {
        private.startSizeRange = startMax - startMin;
        private.startSizeMiddle = (startMax + startMin) * 0.5;
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
        return Math.floor(public.randomValue(private.lifetimeRange, private.lifetimeMiddle, 'frame'));
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

    // Spin start

    private.spinStart = function() {
        return public.randomValue(private.spinStartRange, private.spinStartMiddle, 'spin');
    }

    public.spinStart = function(spinStart) {
        private.spinStart = spinStart;
        return public;
    }

    public.spinStartRange = function(startMin, startMax) {
        private.spinStartRange = startMax - startMin;
        private.spinStartMiddle = (startMax + startMin) * 0.5;
        return public;
    }

    // Spin speed

    private.spinSpeed = function() {
        return public.randomValue(private.spinSpeedRange, private.spinSpeedMiddle, 'spin');
    }

    public.spinSpeed = function(spinSpeed) {
        private.spinSpeed = spinSpeed;
        return public;
    }

    public.spinSpeedRange = function(speedMin, speedMax) {
        private.spinSpeedRange = speedMax - speedMin;
        private.spinSpeedMiddle = (speedMax + speedMin) * 0.5;
        return public;
    }

    // Particle birthing

    private.adjust = null;

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
        if (private.adjust) private.adjust(particle);
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
        const count = Math.floor(public.randomValue(private.birthRange, private.birthMiddle, 'rate'));
        for (let i = 0; i < count; i++) {
            newParticles.push(private.birthParticle());
        }
        return newParticles;
    }

    return public;
}
