(function () {
    const frag = window.frag;

    const scenes = [];
    const animations = [];
    let startTime = performance.now();
    let gameTick = 0;
    let frameTick = 0;
    let mainScene = null;

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

    frag.addAnimation = function (animation) {
        animations.push(animation);
        return frag;
    };

    frag.removeAnimation = function (animation) {
        for (let i = 0; i < animations.length; i++) {
            if (animations[i] === animation) {
                animations.splice(i, 1);
                return true;
            }
        }
        return false;
    };

    const playAnimations = function (gameTick, frameTick) {
        for (let i = 0; i < animations.length; i++) {
            // TODO: sort animations into buckets according to how far away from next step
            // TODO: keep a separate list of animations that are stopped
            let animation = animations[i];
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
            let gl = frag.gl;

            const t0 = performance.now();
            gameTick = Math.floor((t0 - startTime) / window.frag.gameTickMs);
            frameTick++;

            playAnimations(gameTick, frameTick);

            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            mainScene.setViewport(gl);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            mainScene.draw(gl);

            for (let i = 0; i < scenes.length; i++) {
                scenes[i].adjustToViewport(gl);
                scenes[i].draw(gl);
            }

            const t1 = performance.now();
            frag.fps = 1000 / (t1 - t0);
        }
        setTimeout(render, frag.renderInterval);
    }
    render();
})();
