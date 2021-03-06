window.frag.Font = function (engine, _private, _instance) {
    const frag = window.frag;
    const gl = engine.gl;

    const private = _private || {
        glTexture: null,
        generated: false,
        format: gl.RGBA,
        dataType: gl.UNSIGNED_BYTE,
        valuesPerPixel: 4,
        chars: {},
        lineHeight: 24,
    }

    const instance = {
        textColor: [0, 0, 0, 1],
        backgroundColor: [0, 0, 0, 1],
        kerning: false,
        letterSpacing: 0,
    }

    if (_instance) {
        instance.textColor = _instance.textColor;
        instance.backgroundColor = _instance.backgroundColor;
        instance.kerning = _instance.kerning;
        instance.letterSpacing = _instance.letterSpacing;
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

    public.clone = function () {
        return window.frag.Font(engine, private, instance);
    }

    public.name = function (value) {
        private.name = value;
        return public;
    }

    public.kerning = function (kerning) {
        instance.kerning = kerning;
        return public;
    }

    public.letterSpacing = function (pixels) {
        instance.letterSpacing = pixels;
        return public;
    }

    public.textColor = function(textColor) {
        instance.textColor = textColor;
        return public;
    }

    public.backgroundColor = function(backgroundColor) {
        instance.backgroundColor = backgroundColor;
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

    public.lineHeight = function (height) {
        private.lineHeight = height;
        return public;
    }

    public.addChar = function(char, x, y, width, height, originX, originY, advance) {
        private.chars[char] = { x, y, width, height, originX, originY, advance };
        return public;
    }

    public.fromArrayBuffer = function (typedArray, offset, width, height) {
        const count = width * height * private.valuesPerPixel;

        let bufferView;
        if (private.dataType === gl.UNSIGNED_BYTE)
            bufferView = new Uint8Array(typedArray.buffer, offset, count);
        else {
            console.error('Unsupported data type for font texture buffer');
            return public;
        }

        private.setup(width, height);

        // https://stackoverflow.com/questions/51582282/error-when-creating-textures-in-webgl-with-the-rgb-format
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        gl.texImage2D(gl.TEXTURE_2D, 0, private.format, width, height, 0, private.format, private.dataType, bufferView);

        return public;
    }

    public.fromImage = function (image) {
        const load = function() {
            private.setup(image.width, image.height);
            gl.texImage2D(gl.TEXTURE_2D, 0, private.format, private.format, private.dataType, image);
        }
        if (image.onload)
            load();
        else
            image.onload = load;
        return public;
    }

    public.apply = function (shader) {
        const gl = engine.gl;
        
        if (shader.uniforms["fgcolor"] !== undefined) {
            gl["uniform" + instance.textColor.length + "fv"](shader.uniforms["fgcolor"], instance.textColor);
        }
        if (shader.uniforms["bgcolor"] !== undefined) {
            gl["uniform" + instance.backgroundColor.length + "fv"](shader.uniforms["bgcolor"], instance.backgroundColor);
        }

        const uniform = shader.uniforms["diffuse"];
        if (!uniform || !private.glTexture)
            return public;
        
        gl.activeTexture(gl.TEXTURE0 + public.textureUnit);
        gl.bindTexture(gl.TEXTURE_2D, private.glTexture);

        if (!private.generated) {
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            private.generated = true;
        }

        gl.uniform1i(uniform, public.textureUnit);
        return public;
    }

    public.buildTextMesh = function (text) {
        const verticies = [];
        const uvs = [];
        const normals = [];

        const pushVerticies = function (left, right, top, bottom) {
            verticies.push(left);
            verticies.push(bottom);
            verticies.push(0);

            verticies.push(right);
            verticies.push(top);
            verticies.push(0);

            verticies.push(left);
            verticies.push(top);
            verticies.push(0);

            verticies.push(left);
            verticies.push(bottom);
            verticies.push(0);

            verticies.push(right);
            verticies.push(bottom);
            verticies.push(0);

            verticies.push(right);
            verticies.push(top);
            verticies.push(0);

            for (let i = 0; i < 6; i++) {
                normals.push(0);
                normals.push(0);
                normals.push(-1);
            }
        }

        const pushTexture = function(left, right, top, bottom) {
            left = left  / private.width;
            right = right  / private.width;
            top = top / private.height;
            bottom = bottom / private.height;

            uvs.push(left);
            uvs.push(bottom);

            uvs.push(right);
            uvs.push(top);

            uvs.push(left);
            uvs.push(top);

            uvs.push(left);
            uvs.push(bottom);

            uvs.push(right);
            uvs.push(bottom);

            uvs.push(right);
            uvs.push(top);
        }

        const drawChar = function (ch, x) {
            dimensions = private.chars[ch];
            if (!dimensions) return x;

            const left = x - dimensions.originX;
            const right = left + dimensions.width;
            const top = dimensions.originY;
            const bottom = top - dimensions.height;

            pushVerticies(left, right, top, bottom);
    
            const texLeft = dimensions.x;
            const texTop = private.height - dimensions.y;
            const texRight = texLeft + dimensions.width;
            const texBottom = texTop - dimensions.height;

            pushTexture(texLeft, texRight, texTop, texBottom);

            let advance = dimensions.advance;
            if (!instance.kerning)
                advance = dimensions.width > dimensions.advance 
                    ? dimensions.width 
                    : dimensions.advance;

            return x + advance + instance.letterSpacing;
        }

        let x = 0;
        for (let i = 0; i < text.length; i++) {
            x = drawChar(text[i], x);
        }

        const mesh = frag.Mesh(engine)
            .shadeFlat()
            .textureFlat();
        mesh.addTriangles({ verticies, uvs, normals });
        return mesh;
    }

    public.buildTextModel = function(text) {
        const mesh = public.buildTextMesh(text);

        const model = frag.Model(engine, true)
            .shader(frag.FontShader(engine))
            .mesh(mesh)
            .material(public);
        return model;
    }

    public.updateTextModel = function(model, text) {
        const oldMesh = model.getMesh();
        model.mesh(public.buildTextMesh(text));
        oldMesh.dispose();
        return public;
    }

    return public;
};
