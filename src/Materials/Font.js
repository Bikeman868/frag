window.frag.Font = function () {
    const frag = window.frag;
    const gl = frag.gl;

    const private = {
        glTexture: null,
        generated: false,
        internalFormat: gl.RGBA,
        format: gl.RGBA,
        dataType: gl.UNSIGNED_BYTE,
        valuesPerPixel: 4,
        chars: {},
        lineHeight: 24,
        color: [0, 0, 0, 1]
    }

    const public = {
        __private: private,
        textureUnit: window.frag.allocateTextureUnit()
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

    public.color = function(color) {
        private.color = color;
    }

    public.dataFormat = function (format) {
        private.internalFormat = format;
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
    }

    public.addChar = function(char, x, y, width, height, originX, originY, advance) {
        private.chars[char] = { x, y, width, height, originX, originY, advance };
    }

    public.fromArrayBuffer = function (buffer, offset, width, height) {
        let bufferView;
        if (private.dataType === gl.UNSIGNED_BYTE)
            bufferView = new Uint8Array(buffer, offset, width * height * private.valuesPerPixel);

        private.setup(width, height);
        gl.texImage2D(gl.TEXTURE_2D, 0, private.internalFormat, width, height, 0, private.format, private.dataType, bufferView);

        return public;
    }

    public.fromImage = function (image) {
        const load = function() {
            private.setup(image.width, image.height);
            gl.texImage2D(gl.TEXTURE_2D, 0, private.internalFormat, private.format, private.dataType, image);
        }
        if (image.onload)
            load();
        else
            image.onload = load;
        return public;
    }

    public.apply = function (gl, shader) {
        if (shader.uniforms["color"] !== undefined) {
            gl["uniform" + private.color.length + "fv"](shader.uniforms["color"], private.color);
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

            return x + dimensions.advance;
        }

        let x = 0;
        for (let i = 0; i < text.length; i++) {
            x = drawChar(text[i], x);
        }

        return frag.MeshData()
            .addTriangles(verticies, undefined, uvs, normals)
            .shadeFlat()
            .textureFlat();
    }

    public.buildTextModel = function(text) {
        const mesh = public.buildTextMesh(text);

        const model = frag.Model(true)
            .shader(frag.fontShader)
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
