window.frag = window.frag || {};
window.frag.Engine = function(config) {
    config = config || {};

    const private = {
        startFunctions: [],
        scenes: [],
        activeAnimations: {},
        inactiveAnimations: {},
        running: false,
        startTime: performance.now(),
        gameTick: 0,
        frameTick: 0,
        mainScene: null,
        nextAnimationId: 0,
        currentFrameCount: 0,
        frameCounts: [],
        frameCountsSum: 0,
        nextFpsPush: 0,
        hitTestShader: null,
        nextTextureUnit: 0,
    }

    const public = {
        __private: private,
        canvas: config.canvas || document.getElementById("scene"),
        renderInterval: config.renderInterval || 15,
        gameTickMs: config.gameTickMs || 10,
        debugPackageLoader: config.debugPackageLoader === undefined ? false : config.debugPackageLoader,
        debugShaderBuilder: config.debugShaderBuilder === undefined ? false : config.debugShaderBuilder,
        debugAnimations: config.debugAnimations === undefined ? false : config.debugAnimations,
        debugMeshes: config.debugMeshes === undefined ? false : config.debugMeshes,
        debugInputs: config.debugInputs === undefined ? false : config.debugInputs,
        transparency: config.transparency === undefined ? false : config.transparency,
        fps: 0,
    }
    public.gl = public.canvas.getContext("webgl");

    public.correctClock = function(serverTick) {
        let difference = serverTick - private.gameTick;
        if (difference > 0) {
            private.startTime += public.gameTickMs;
        } else if (difference < 0) {
            private.startTime -= public.gameTickMs;
        }
    }

    public.allocateTextureUnit = function () {
        const result = private.nextTextureUnit;
        private.nextTextureUnit = (private.nextTextureUnit + 1) % public.maxTextureUnits;
        return result;
    };

    public.mainScene = function (scene) {
        if (private.mainScene) private.mainScene.dispose();
        private.mainScene = scene;
        return public;
    }

    public.getMainScene = function () {
        return private.mainScene;
    }

    public.addScene = function (scene) {
        private.scenes.push(scene);
        return public;
    };

    public.removeScene = function (scene) {
        for (let i = 0; i < private.scenes.length; i++) {
            if (private.scenes[i] === scene) {
                private.scenes.splice(i, 1);
                return true;
            }
        }
        return false;
    };

    public.activateAnimation = function(animation) {
        private.activeAnimations[animation.id] = animation;
        delete private.inactiveAnimations[animation.id];
        return public;
    }

    public.deactivateAnimation = function(animation) {
        private.inactiveAnimations[animation.id] = animation;
        delete private.activeAnimations[animation.id];
        return public;
    }

    public.addAnimation = function (animation) {
        animation.id = private.nextAnimationId++;
        private.inactiveAnimations[animation.id] = animation;
        return public;
    };

    public.removeAnimation = function (animation) {
        delete private.inactiveAnimations[animation.id];
        delete private.activeAnimations[animation.id];
        return public;
    };

    private.playAnimations = function () {
        for (let id in private.activeAnimations) {
            let animation = private.activeAnimations[id];
            if (animation.nextFrameTick !== undefined) {
                if (private.frameTick >= animation.nextFrameTick) {
                    animation.nextFrameTick = private.frameTick + 10;
                    animation.action(null, private.gameTick, private.frameTick);
                }
            } else if (animation.nextGameTick != undefined) {
                if (private.gameTick >= animation.nextGameTick) {
                    animation.nextGameTick = private.gameTick + 5;
                    animation.action(null, private.gameTick, private.frameTick);
                }
            } else {
                animation.nextGameTick = private.gameTick + 5;
            }
        }
    };

    public.hitTest = function (x, y, width, height, scene) {
        width = width || public.canvas.clientWidth;
        height = height || public.canvas.clientHeight;
        scene = scene || public.getMainScene();
    
        if (!private.hitTestShader) {
            const vertexShader =
                'attribute vec4 a_position;\n' +
                'uniform mat4 u_clipMatrix;\n' +
                'void main() {;\n' +
                '  gl_Position = u_clipMatrix * a_position;\n' +
                '}';
    
            const fragmentShader =
                'precision mediump float;\n' +
                'uniform vec4 u_color;\n' +
                'void main() {;\n' +
                '  gl_FragColor = u_color;\n' +
                '}';

            private.hitTestShader = frag.CustomShader(public)
                .name("Hit test")
                .source(vertexShader, fragmentShader)
                .attribute("position")
                .uniform("clipMatrix")
                .uniform("color");
        }
    
        const gl = public.gl;
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    
        const frameBuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    
        const depthBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
    
        gl.viewport(0, 0, width, height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
        const drawContext = frag.DrawContext(public).forHitTest(private.hitTestShader);
    
        gl.disable(gl.BLEND);
    
        if (Array.isArray(scene)) {
            for (let i = 0; i < scene.length; i++) {
                scene[i].adjustToViewport();
                scene[i].draw(drawContext);
            }
        } else {
            scene.adjustToViewport();
            scene.draw(drawContext);
        }
    
        const pixel = new Uint8Array(4);
        gl.readPixels(x, height - y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    
        if (engine.transparency) gl.enable(gl.BLEND);
    
        const red = pixel[0];
        const green = pixel[1];
        const blue = pixel[2];
        const alpha = pixel[3];
    
        const modelId = alpha | (blue << 8) | ((green & 0x0f) << 16);
        const sceneObjectId = ((green & 0xf0) >> 4) | (red << 4);
    
        if ((modelId < drawContext.models.length) && (sceneObjectId < drawContext.sceneObjects.length))
            return {
                sceneObject: drawContext.sceneObjects[sceneObjectId],
                model: drawContext.models[modelId]
            };
    
        return null;
    }    

    public.render = function () {
        if (!private.mainScene) return public;

        const t0 = performance.now();
        private.gameTick = Math.floor((t0 - private.startTime) / public.gameTickMs);
        private.frameTick++;

        private.playAnimations();

        const gl = public.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        private.mainScene.setViewport();
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const drawContext = frag.DrawContext(public).forRender();
        private.mainScene.draw(drawContext);

        for (let i = 0; i < private.scenes.length; i++) {
            private.scenes[i].adjustToViewport();
            private.scenes[i].draw(drawContext);
        }

        const t1 = performance.now();
        private.currentFrameCount++;
        if (t1 > private.nextFpsPush)
        {
            private.nextFpsPush = t1 + 100;
            private.frameCountsSum += private.currentFrameCount;
            private.frameCounts.push(private.currentFrameCount);
            private.currentFrameCount = 0;
            if (private.frameCounts.length > 20) private.frameCountsSum -= private.frameCounts.shift();
            public.fps = 10 * private.frameCountsSum / private.frameCounts.length;
        }

        return public;
    }

    private.renderLoop = function () {
        public.render();
        if (private.running)
            setTimeout(private.renderLoop, public.renderInterval);
    }

    public.onStart = function (startFunction) {
        private.startFunctions.push(startFunction);
        return public;
    }

    public.initialize = function () {
        for (var i = 0; i < private.startFunctions.length; i++)
            private.startFunctions[i](public);
    }

    public.start = function() {
        public.initialize();
        private.running = true;
        private.renderLoop();
        return public;
    }

    public.stop = function() {
        private.running = false;
        return public;
    }

    public.dispose = function () {
        public.stop();
    }

    public.onStart(function (engine) {
        engine.canvas.addEventListener('contextmenu', event => event.preventDefault());

        const gl = engine.gl;
        engine.maxTextureUnits = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);

        gl.clearColor(1, 1, 1, 1);
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);

        if (engine.transparency) {
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        }
        return public;    
    });

    // This method allows you to call engine.Constructor() instead of
    // having to write frag.Constructor(engine)
    const addProxy = function (name) {
        public[name] = function () {
            const args = Array.prototype.slice.call(arguments);
            args.unshift(public);
            return frag[name].apply(null, args); 
        }
    }

    addProxy("Observable");
    addProxy("Transform");
    addProxy("Transform2D");
    addProxy("Transform3D");
    addProxy("Location");
    
    addProxy("CustomShader");
    addProxy("Shader");
    addProxy("UiShader");
    addProxy("FontShader");
    
    addProxy("Texture");
    addProxy("Font");
    addProxy("Material");
    
    addProxy("VertexData");
    addProxy("MeshData");
    addProxy("MeshOptimizer");
    addProxy("Model");
    addProxy("ScenePosition");
    addProxy("SceneObject");
    addProxy("Scene");
    addProxy("DrawContext");

    addProxy("UiCamera");
    addProxy("OrthographicCamera");
    addProxy("PerspectiveCamera");
    
    addProxy("Animation");
    addProxy("ObjectAnimationState");
    addProxy("ModelAnimation");
    addProxy("SceneObjectAnimation");
    addProxy("ValueAnimationAction");
    addProxy("KeyframeAnimationAction");
    addProxy("ParallelAnimationAction");
    addProxy("RepeatAnimationAction");
    addProxy("PositionAnimationAction");
    
    addProxy("Cube");
    addProxy("Cylinder");
    addProxy("Disc");
    addProxy("Plane");
    
    addProxy("AssetCatalog");
    addProxy("PackageLoader");
    
    addProxy("InputMethod");
    addProxy("DigitalState");
    addProxy("AnalogState");
    addProxy("DigitalInput");
    addProxy("AnalogInput");
    addProxy("DigitalAction");
    addProxy("AnalogAction");
    
    return public;
};
