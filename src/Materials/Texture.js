window.frag.Texture = function (engine) {
    const gl = engine.gl;

    const private = {
        glTexture: null,
        generated: false,
        format: gl.RGBA,
        dataType: gl.UNSIGNED_BYTE,
        valuesPerPixel: 4
    }

    const public = {
        __private: private,
        textureUnit: engine.allocateTextureUnit()
    };

    public.dispose = function () {
        if (private.glTexture) {
            gl.deleteTexture(private.glTexture);
            private.glTexture = null;
            private.disposed = true;
        }
    }

    public.name = function (value) {
        private.name = value;
        return public;
    }

    public.dataFormat = function (format) {
        private.format = format;

        if (format === gl.RGBA) {
            private.dataType = gl.UNSIGNED_BYTE;
            private.valuesPerPixel = 4;
        }
        else if (format === gl.RGB) {
            private.dataType = gl.UNSIGNED_BYTE;
            private.valuesPerPixel = 3;
        }
        else if (format === gl.LUMINANCE_ALPHA) {
            private.dataType = gl.UNSIGNED_BYTE;
            private.valuesPerPixel = 2;
        }
        else if (format === gl.LUMINANCE || formaat === gl.ALPHA) {
            private.dataType = gl.UNSIGNED_BYTE;
            private.valuesPerPixel = 1;
        }

        return public;
    }

    private.setup = function (width, height) {
        private.width = width;
        private.height = height;

        if (!private.glTexture)
            private.glTexture = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, private.glTexture);

        if ((width & (width - 1)) !== 0 || (height & (height - 1)) !== 0) {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            private.generated = true;
        }
    }

    public.fromArrayBuffer = function (level, typedArray, offset, width, height) {
        const count = width * height * private.valuesPerPixel;

        let bufferView;
        if (private.dataType === gl.UNSIGNED_BYTE) {
            bufferView = new Uint8Array(typedArray.buffer, offset, count);
        }
        else {
            console.error('Unsupported data type for texture buffer');
            return public;
        }

        private.setup(width, height);

        // https://stackoverflow.com/questions/51582282/error-when-creating-textures-in-webgl-with-the-rgb-format
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        gl.texImage2D(gl.TEXTURE_2D, level, private.format, width, height, 0, private.format, private.dataType, bufferView);

        return public;
    }

    public.fromImage = function (level, image) {
        const load = function() {
            private.setup(image.width, image.height);
            gl.texImage2D(gl.TEXTURE_2D, level, private.format, private.format, private.dataType, image);
        }
        if (image.onload)
            load();
        else
            image.onload = load;
        return public;
    }

    public.fromUrl = function (level, url, crossOrigin) {
        const image = new Image();
        public.fromImage(level, image);
        if (crossOrigin !== undefined)
            image.crossOrigin = crossOrigin;
        image.src = url;
        return public;
    }

    public.update = function (width, height, gameTick) {
        if (!private.scene) return public;
        
        if (width !== undefined && height !== undefined) {
            if (width !== private.width || height !== private.height) {
                public.fromScene(private.scene, width, height);
            }
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, private.frameBuffer);
        gl.viewport(0, 0, private.width, private.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        private.scene.adjustToViewport();
        private.scene.draw(frag.DrawContext(engine).forRender(gameTick));

        return public;
    }

    public.fromScene = function (scene, width, height) {
        const level = 0;

        private.setup(width, height);
        gl.texImage2D(gl.TEXTURE_2D, level, private.format, width, height, 0, private.format, private.dataType, null);

        private.scene = scene;
        private.frameBuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, private.frameBuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, private.glTexture, level);

        private.depthBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, private.depthBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, private.depthBuffer);

        return public.update(width, height);
    }

    public.apply = function (textureType, shader) {
        const uniform = shader.uniforms[textureType];
        if (!uniform || !private.glTexture)
            return public;
        
        const gl = engine.gl;
        gl.activeTexture(gl.TEXTURE0 + public.textureUnit);
        gl.bindTexture(gl.TEXTURE_2D, private.glTexture);

        if (!private.generated) {
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            private.generated = true;
        }

        gl.uniform1i(uniform, public.textureUnit);
        return public;
    }

    return public;
};
