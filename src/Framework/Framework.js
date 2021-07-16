(function() {
    const frag = window.frag;
    const scenes = [];
    const activeAnimations = {};
    const inactiveAnimations = {};
    let startTime = performance.now();
    let gameTick = 0;
    let frameTick = 0;
    let mainScene = null;
    let nextAnimationId = 0;
    let frameTimes = [];
    let frameTimesSum = 0;

    frag.correctClock = function(serverTick) {
        let difference = serverTick - gameTick;
        if (difference > 0) {
            startTime += frag.gameTickMs;
        } else if (difference < 0) {
            startTime -= frag.gameTickMs;
        }
    }

    frag.mainScene = function (scene) {
        if (mainScene) mainScene.dispose();
        mainScene = scene;
        return frag;
    }

    frag.getMainScene = function () {
        return mainScene;
    }

    frag.addScene = function (scene) {
        scenes.push(scene);
        return frag;
    };

    frag.removeScene = function (scene) {
        for (let i = 0; i < scenes.length; i++) {
            if (scenes[i] === scene) {
                scenes.splice(i, 1);
                return true;
            }
        }
        return false;
    };

    frag.activateAnimation = function(animation) {
        activeAnimations[animation.id] = animation;
        delete inactiveAnimations[animation.id];
    }

    frag.deactivateAnimation = function(animation) {
        inactiveAnimations[animation.id] = animation;
        delete activeAnimations[animation.id];
    }

    frag.addAnimation = function (animation) {
        animation.id = nextAnimationId++;
        inactiveAnimations[animation.id] = animation;
        return frag;
    };

    frag.removeAnimation = function (animation) {
        delete inactiveAnimations[animation.id];
        delete activeAnimations[animation.id];
        return frag;
    };

    const playAnimations = function (gameTick, frameTick) {
        for (let id in activeAnimations) {
            let animation = activeAnimations[id];
            if (animation.nextFrameTick !== undefined) {
                if (frameTick >= animation.nextFrameTick) {
                    animation.nextFrameTick = frameTick + 10;
                    animation.action(null, gameTick, frameTick);
                }
            } else if (animation.nextGameTick != undefined) {
                if (gameTick >= animation.nextGameTick) {
                    animation.nextGameTick = gameTick + 5;
                    animation.action(null, gameTick, frameTick);
                }
            } else {
                animation.nextGameTick = gameTick + 5;
            }
        }
    };

    const render = function () {
        if (mainScene) {
            const gl = frag.gl;

            const t0 = performance.now();
            gameTick = Math.floor((t0 - startTime) / window.frag.gameTickMs);
            frameTick++;

            playAnimations(gameTick, frameTick);

            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            mainScene.setViewport(gl);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            const drawContext = { gl };
            mainScene.draw(drawContext);

            for (let i = 0; i < scenes.length; i++) {
                scenes[i].adjustToViewport(gl);
                scenes[i].draw(drawContext);
            }

            const elapsed = performance.now() - startTime;
            frameTimes.push(elapsed);
            frameTimesSum += elapsed;
            if (frameTimes.length > 100) frameTimesSum -= frameTimes.shift();
            frag.fps = 1000 * frameTimes.length / frameTimesSum;
        }
        setTimeout(render, frag.renderInterval);
    }
    window.frag.startFunctions.push(render);
})();
