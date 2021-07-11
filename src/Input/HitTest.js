(function() {
    let shader;

    window.frag.hitTest = function(x, y, width, height, scene) {
        const frag = window.frag;
        const gl = frag.gl;

        width = width || frag.canvas.clientWidth;
        height = height || frag.canvas.clientHeight;
        scene = scene || frag.getMainScene();

        if (!shader) {
            shader = {
                name: "HitTest",
                attributes: {},
                uniforms: {},
                is3d: true,
            };

            const vSource =
                'attribute vec4 a_position;\n' +
                'uniform mat4 u_clipMatrix;\n' +
                'void main() {;\n' +
                '  gl_Position = u_clipMatrix * a_position;\n' +
                '}';

            const fSource =
                'precision mediump float;\n' +
                'uniform vec4 u_color;\n' +
                'void main() {;\n' +
                '  gl_FragColor = u_color;\n' +
                '}';

            const vertexShader = frag.createShader(shader.name, gl.VERTEX_SHADER, vSource);
            const fragmentShader = frag.createShader(shader.name, gl.FRAGMENT_SHADER, fSource);
            shader.program = frag.createProgram(shader.name, vertexShader, fragmentShader);

            shader.attributes.position = gl.getAttribLocation(shader.program, "a_position");

            shader.uniforms.clipMatrix = gl.getUniformLocation(shader.program, "u_clipMatrix");
            shader.uniforms.color = gl.getUniformLocation(shader.program, "u_color");

            shader.bind = function (gl) {
                gl.useProgram(shader.program);
            }

            shader.unbind = function() {}
        }

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

        const drawContext = {
            gl,
            shader,
            isHitTest: true,
            sceneObjects: [],
            models: [],
        };

        if (Array.isArray(scene)) {
            for (let i = 0; i < scene.length; i++) {
                scene[i].adjustToViewport(gl);
                scene[i].draw(drawContext);
            }
        } else {
            scene.adjustToViewport(gl);
            scene.draw(drawContext);
        }

        const pixel = new Uint8Array(4);
        gl.readPixels(x, height - y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

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
    };
})();