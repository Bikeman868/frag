window.frag.createShader = function (name, type, source) {
    const frag = window.frag;
    const gl = frag.gl;

    //if (frag.debugShaderBuilder) {
        console.log("\n// " + name + " " + (type === gl.VERTEX_SHADER ? "vertex" : "fragment") + " shader\n" + source);

    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) return shader;

    console.error('Failed to compile shader ' + name);
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
};

window.frag.createProgram = function (name, vertexShader, fragmentShader) {
    const frag = window.frag;
    const gl = frag.gl;

    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) return program;

    console.error('Failed to link shaders into program ' + name);
    console.log(frag.gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
};

window.frag.CustomShader = function (is3d) {
    const private = {
        name: "Custom",
        vSource: null,
        fSource: null,
        bindList: [],
        unbindList: [],
    };

    const public = {
        __private: private,
        attributes: {},
        uniforms: {},
        is3d: is3d === undefined ? true : is3d,
    }

    public.name = function (name) {
        private.name = name;
        return public;
    }

    public.source = function (vertexShaderSource, fragmentShaderSource) {
        //if (frag.debugShaderBuilder) {
            console.log("\n// " + private.name + " vertext shader\n" + vertexShaderSource);
            console.log("\n// " + private.name + " fragment shader\n" + fragmentShaderSource);
        //}

        private.vSource = vertexShaderSource;
        private.fSource = fragmentShaderSource;

        const vertexShader = frag.createShader(private.name, frag.gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = frag.createShader(private.name, frag.gl.FRAGMENT_SHADER, fragmentShaderSource);
        public.program = frag.createProgram(private.name, vertexShader, fragmentShader);

        return public;
    }

    public.onBind = function (fn) {
        private.bindList.push(fn);
        return public;
    }

    public.onUnbind = function (fn) {
        private.unbindList.push(fn);
        return public;
    }

    public.attribute = function (name) {
        if (!public.program) {
            console.error("You must set the " + private.name + " shader source before defining attributes");
            return public;
        }

        const attribute = frag.gl.getAttribLocation(public.program, "a_" + name);

        if (attribute === undefined) {
            console.error("Shader program " + private.name + " does not have attribute a_" + name);
            return public;
        }

        public.attributes[name] = attribute;
        return public;
    }

    public.uniform = function (name, glType, initialValue) {
        if (!public.program) {
            console.error("You must set the " + private.name + " shader source before defining uniforms");
            return public;
        }

        const uniform = frag.gl.getUniformLocation(public.program, "u_" + name);

        if (!uniform) {
            console.error("Shader program " + private.name + " does not have uniform u_" + name);
            return public;
        }

        public.uniforms[name] = uniform;

        if (glType) {
            private[name] = initialValue;
            public[name] = function (newValue) { 
                private[name] = newValue;
                return public;
            }
            private.bindList.push(function (gl) {
                if (private[name] !== undefined) {
                    //console.log("gl.uniform" + glType + "(" + name + "," + private[name] + ")")
                    gl["uniform" + glType](uniform, private[name]);
                }
            });
        }

        return public;
    }

    public.bind = function (gl) {
        gl.useProgram(public.program);
        private.bindList.forEach(f => f(gl));
        return public;
    }

    public.unbind = function (gl) {
        private.unbindList.forEach(f => f(gl));
        return public;
    }

    return public;
};
