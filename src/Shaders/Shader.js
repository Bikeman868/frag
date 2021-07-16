// This builds a custom shader based on a set of options
window.frag.Shader = function () {
    const none = "None";
    const private = {
        name: "Custom",
        verticies: "XYZ",
        x: 0,
        y: 0,
        z: 0,
        colors: none,
        matrix: "mat4",
        textureCoords: none,
        diffuseTexture: none,
        emmissiveTexture: none,
        displacementTexture: none,
        normalMap: none,
        roughnessTexture: none,
        shininessTexture: none,
        metalinessTexture: none,
        normals: none,
        tangents: none,
        bitangents: none,
        directionalLight: none,
        ambientLight: none,
    };

    const public = {
        __private: private,
    };

    public.name = function (name) { private.name = name; return public; }

    public.verticiesXY = function (z) { private.verticies = "XY"; private.z = z; return public; }
    public.verticiesXZ = function (y) { private.verticies = "XZ"; private.y = y; return public; }
    public.verticiesYZ = function (x) { private.verticies = "YZ"; private.x = x; return public; }
    public.verticiesXYZ = function () { private.verticies = "XYZ"; return public; }
    public.verticiesNone = function () { private.verticies = none; return public; }

    public.matrix2D = function () { private.matrix = "mat3"; return public; }
    public.matrix3D = function () { private.matrix = "mat4"; return public; }
    public.matrixNone = function () { private.matrix = none; return public; }
           
    public.normals = function () { private.normals = "vec3"; return public; }

    public.colorsRGB = function() { private.colors = "vec3"; return public; }
    public.colorsRGBA = function() { private.colors = "vec4"; return public; }
    public.colorsNone = function() { private.colors = none; return public; }

    public.diffuseTexture = function () {
        private.diffuseTexture = "RGB";
        private.colors = none;
        if (private.textureCoords === none) private.textureCoords = "vec2";
        return public; 
    };

    public.emmissiveTexture = function () {
        private.emmissiveTexture = "RGB";
        if (private.textureCoords === none) private.textureCoords = "vec2";
        return public;
    };

    public.normalMapStandard = function () {
        private.normalMap = "Standard";
        if (private.textureCoords === none) private.textureCoords = "vec2";
        if (private.normals === none) private.normals = "vec3";
        if (private.tangents === none) private.tangents = "vec3";
        return public; 
    };

    public.normalMapOpenGL = function () {
        private.normalMap = "OpenGL";
        if (private.textureCoords === none) private.textureCoords = "vec2";
        if (private.normals === none) private.normals = "vec3";
        if (private.tangents === none) private.tangents = "vec3";
        return public; 
    };

    public.displacementTextureRaised = function () {
        private.displacementTexture = "Raised";
        if (private.textureCoords === none) private.textureCoords = "vec2";
        if (private.normals === none) private.normals = "vec3";
        return public;
    };

    public.displacementTextureSunken = function () {
        private.displacementTexture = "Sunken";
        if (private.textureCoords === none) private.textureCoords = "vec2";
        if (private.normals === none) private.normals = "vec3";
        return public;
    };

    public.displacementTextureSigned = function () {
        private.displacementTexture = "Signed";
        if (private.textureCoords === none) private.textureCoords = "vec2";
        if (private.normals === none) private.normals = "vec3";
        return public;
    };

    public.tangents = function () {
        private.tangents = "vec3";
        if (private.normals === none) private.normals = "vec3";
        return public;
    };

    public.bitangents = function () {
        private.bitangents = "vec3";
        if (private.normals === none) private.normals = "vec3";
        return public; 
    };

    public.directionalLightColor = function () {
        public.matrix3D();
        private.directionalLight = "Color";
        if (private.ambientLight === none) private.ambientLight = "Balanced";
        if (private.normals === none) private.normals = "vec3";
        return public;
    }

    public.directionalLightWhite = function () {
        public.matrix3D();
        private.directionalLight = "White";
        if (private.ambientLight === none) private.ambientLight = none;
        if (private.normals === none) private.normals = "vec3";
        return public;
    }

    public.directionalLightGrey = function () {
        public.matrix3D();
        private.directionalLight = "Grey";
        if (private.ambientLight === none) private.ambientLight = "Balanced";
        if (private.normals === none) private.normals = "vec3";
        return public;
    }

    public.directionalLightNone = function () {
        private.directionalLight = none;
        return public;
    }

    public.ambientLightBalanced = function () {
        private.ambientLight = "Balanced";
        return public;
    }

    public.ambientLightNone = function () {
        private.ambientLight = none;
        return public;
    }

    public.ambientLightFixed = function () {
        private.ambientLight = "Fixed";
        return public;
    }

    private.addAttributeDeclarations = function(shader) {
        if (private.verticies === "XYZ") shader.vSource += "attribute vec4 a_position;\n";
        else if (private.verticies !== none) shader.vSource += "attribute vec2 a_position;\n";

        if (private.colors !== none) shader.vSource += "attribute " + private.colors + " a_color;\n";
        if (private.textureCoords !== none) shader.vSource += "attribute " + private.textureCoords + " a_texcoord;\n";
        if (private.normals !== none) shader.vSource += "attribute " + private.normals + " a_normal;\n";
        if (private.tangents !== none) shader.vSource += "attribute " + private.tangents + " a_tangent;\n";
        if (private.bitangents !== none) shader.vSource += "attribute " + private.bitangents + " a_bitangent;\n";
    }

    private.addUniformDeclarations = function (shader) {
        if (private.matrix !== none) {
            if (private.directionalLight !== none)
                shader.vSource += "uniform " + private.matrix + " u_modelMatrix;\n";
            shader.vSource += "uniform " + private.matrix + " u_clipMatrix;\n";
        }
        if (private.directionalLight !== none) shader.vSource += "uniform vec3 u_lightDirection;\n";
        if (private.directionalLight === "Color") shader.vSource += "uniform vec3 u_lightColor;\n";
        if (private.displacementTexture !== none) shader.vSource += "uniform float u_displacementScale;\n";
        if (private.displacementTexture !== none || private.roughnessTexture !== none || private.shininessTexture != none) shader.vSource += "uniform sampler2D u_surface;\n";

        if (private.normalMap !== none) shader.fSource += "uniform sampler2D u_normalMap;\n";
        if (private.textureCoords !== none) {
            if (private.diffuseTexture !== none) shader.fSource += "uniform sampler2D u_diffuse;\n";
            if (private.emmissiveTexture !== none) shader.fSource += "uniform sampler2D u_emmissive;\n";
        }
        if (private.ambientLight !== none) shader.fSource += "uniform float u_ambientLight;\n";
    }

    private.addVaryingDeclarations = function (shader) {
        const add = function (type, name) {
            const statement = "varying " + type + " " + name + ";\n";
            shader.vSource += statement;
            shader.fSource += statement;
        }

        if (private.textureCoords !== none) add(private.textureCoords, "v_texcoord");
        if (private.colors !== none) add(private.colors, "v_color");
        if (private.directionalLight !== none) {
            add("vec3", "v_lightDirection");
            if (private.directionalLight === "Color") add("vec3", "v_lightColor");
            if (private.normalMap === none) add(private.normals, "v_normal");
        }
    }

    private.addLogic = function (shader) {
        if (private.verticies === "XYZ") shader.vSource += "  vec4 position = a_position;\n";
        else if (private.verticies !== none) shader.vSource += "  vec2 position = a_position;\n";

        if (private.displacementTexture !== none || private.roughnessTexture !== none || private.shininessTexture != none) {
            shader.vSource += "  vec4 surface = texture2D(u_surface, vec2(a_texcoord.x, 1.0 - a_texcoord.y));\n";
        }

        if (private.displacementTexture !== none) {
            if (private.verticies === "XYZ" && private.normals === "vec3") {
                if (private.displacementTexture === "Sunken") shader.vSource += "  float displacement = -surface.r;\n";
                else if (private.displacementTexture === "Signed") shader.vSource += "  float displacement = surface.r * 2.0 - 1.0;\n";
                else if (private.displacementTexture === "Raised") shader.vSource += "  float displacement = surface.r;\n";
                shader.vSource += "  position = vec4(position.xyz + (a_normal * displacement * u_displacementScale), position.w);\n";
            }
        }

        if (private.verticies === "XYZ") shader.vSource += "  position = u_clipMatrix * position;\n";
        else if (private.verticies !== none) shader.vSource += "  position = (u_clipMatrix * vec3(position, 1)).xy;\n";

        if (private.verticies === "XYZ") shader.vSource += "  gl_Position = position;\n";
        else if (private.verticies === "XY") shader.vSource += "  gl_Position = vec4(position, " + private.z + ", 1);\n";
        else if (private.verticies === "XZ") shader.vSource += "  gl_Position = vec4(position.x, " + private.y + ", position.y, 1);\n";
        else if (private.verticies === "YZ") shader.vSource += "  gl_Position = vec4(" + private.x + ", position, 1);\n";

        if (private.textureCoords !== none) shader.vSource += "  v_texcoord = a_texcoord;\n";

        if (private.directionalLight !== none) {
            if (private.normalMap !== none) {
                shader.vSource += "  vec3 T = normalize(vec3(u_modelMatrix * vec4(a_tangent, 0.0)));\n";
                if (private.bitangents !== none)
                    shader.vSource += "  vec3 B = normalize(vec3(u_modelMatrix * vec4(a_bitangent, 0.0)));\n";
                else
                    shader.vSource += "  vec3 B = normalize(vec3(u_modelMatrix * vec4(cross(a_normal, a_tangent), 0.0)));\n";
                shader.vSource += "  vec3 N = normalize(vec3(u_modelMatrix * vec4(a_normal, 0.0)));\n";
                shader.vSource += "  mat3 TBN = transpose(mat3(T, B, N));\n";
                shader.vSource += "  v_lightDirection = TBN * u_lightDirection;\n";
                shader.fSource += "  vec3 normal = texture2D(u_normalMap, vec2(v_texcoord.x, 1.0 - v_texcoord.y)).rgb * 2.0 - 1.0;\n";
            } else {
                shader.vSource += "  v_normal = (u_modelMatrix * vec4(a_normal, 0)).xyz;\n";
                shader.vSource += "  v_lightDirection = u_lightDirection;\n";
                shader.fSource += "  vec3 normal = normalize(v_normal);\n";
            }

            shader.fSource += "  vec3 lightDirection = v_lightDirection;\n";
            shader.fSource += "  float light = max(dot(normal, lightDirection), 0.0);\n";
            if (private.ambientLight !== none) shader.fSource += "  light += u_ambientLight;\n";
        } else {
            if (private.ambientLight !== none) shader.fSource += "  float light = u_ambientLight;\n";
        }

        if (private.directionalLight === "Color") 
            shader.vSource += "  v_lightColor = u_lightColor;\n";

        if (private.colors === none)
            shader.fSource += "  gl_FragColor = vec4(0, 0, 0, 1.0);\n";
        else if (private.colors === "vec4") {
            shader.vSource += "  v_color = a_color;\n";
            shader.fSource += "  gl_FragColor = v_color;\n";
        } else {
            shader.vSource += "  v_color = a_color;\n";
            shader.fSource += "  gl_FragColor = vec4(v_color, 1.0);\n";
        }

        if (private.textureCoords === "vec2") {
            if (private.diffuseTexture === "RGB")
                shader.fSource += "  gl_FragColor += texture2D(u_diffuse, vec2(v_texcoord.x, 1.0 - v_texcoord.y));\n";
        }

        if (private.ambientLight !== none || private.directionalLight !== none)
            shader.fSource += "  gl_FragColor.rgb *= light;\n";

        if (private.textureCoords === "vec2") {
            if (private.emmissiveTexture === "RGB")
                shader.fSource += "  gl_FragColor.rgb += texture2D(u_emmissive, vec2(v_texcoord.x, 1.0 - v_texcoord.y)).rgb;\n";
        }
    }

    public.compile = function () {
        const shader = {
            name: private.name,
            vSource: "",
            fSource: "precision mediump float;\n",
            attributes: {},
            uniforms: {},
            is3d: private.matrix === "mat4",
        };

        private.addAttributeDeclarations(shader);
        private.addUniformDeclarations(shader);
        private.addVaryingDeclarations(shader);

        if (private.directionalLight !== none) {
            /*
            shader.vSource += "highp mat4 transpose(in highp mat4 inMatrix) {\n";
            shader.vSource += "    highp vec4 i0 = inMatrix[0];\n";
            shader.vSource += "    highp vec4 i1 = inMatrix[1];\n";
            shader.vSource += "    highp vec4 i2 = inMatrix[2];\n";
            shader.vSource += "    highp vec4 i3 = inMatrix[3];\n";
            shader.vSource += "    highp mat4 outMatrix = mat4(\n";
            shader.vSource += "        vec4(i0.x, i1.x, i2.x, i3.x),\n";
            shader.vSource += "        vec4(i0.y, i1.y, i2.y, i3.y),\n";
            shader.vSource += "        vec4(i0.z, i1.z, i2.z, i3.z),\n";
            shader.vSource += "        vec4(i0.w, i1.w, i2.w, i3.w)\n";
            shader.vSource += "    );\n";
            shader.vSource += "    return outMatrix;\n";
            shader.vSource += "}\n";
            */
            shader.vSource += "highp mat3 transpose(in highp mat3 inMatrix) {\n";
            shader.vSource += "    highp vec3 i0 = inMatrix[0];\n";
            shader.vSource += "    highp vec3 i1 = inMatrix[1];\n";
            shader.vSource += "    highp vec3 i2 = inMatrix[2];\n";
            shader.vSource += "    highp mat3 outMatrix = mat3(\n";
            shader.vSource += "        vec3(i0.x, i1.x, i2.x),\n";
            shader.vSource += "        vec3(i0.y, i1.y, i2.y),\n";
            shader.vSource += "        vec3(i0.z, i1.z, i2.z)\n";
            shader.vSource += "    );\n";
            shader.vSource += "    return outMatrix;\n";
            shader.vSource += "}\n";
        }

        shader.vSource += "void main() {\n";
        shader.fSource += "void main() {\n";

        private.addLogic(shader);

        shader.vSource += "}\n";
        shader.fSource += "}\n";

        const vertexShader = frag.createShader(shader.name, frag.gl.VERTEX_SHADER, shader.vSource);
        const fragmentShader = frag.createShader(shader.name, frag.gl.FRAGMENT_SHADER, shader.fSource);
        shader.program = frag.createProgram(shader.name, vertexShader, fragmentShader);

        if (!shader.program) return null;

        const bindList = [];
        const unbindList = [];

        if (private.verticies !== none) {
            shader.attributes.position = frag.gl.getAttribLocation(shader.program, "a_position");
        }

        if (private.colors !== none) {
            shader.attributes.color = frag.gl.getAttribLocation(shader.program, "a_color");
        }

        if (private.textureCoords !== none) {
            shader.attributes.texture = frag.gl.getAttribLocation(shader.program, "a_texcoord");
        }

        if (private.normals !== none) {
            shader.attributes.normal = frag.gl.getAttribLocation(shader.program, "a_normal");
        }

        if (private.tangents !== none) {
            shader.attributes.tangent = frag.gl.getAttribLocation(shader.program, "a_tangent");
        }

        if (private.bitangents !== none) {
            shader.attributes.bitangent = frag.gl.getAttribLocation(shader.program, "a_bitangent");
        }

        if (private.matrix !== none) {
            if (private.directionalLight !== none)
                shader.uniforms.modelMatrix = frag.gl.getUniformLocation(shader.program, "u_modelMatrix");
            shader.uniforms.clipMatrix = frag.gl.getUniformLocation(shader.program, "u_clipMatrix");
        }

        if (private.diffuseTexture !== none) {
            shader.uniforms.diffuse = frag.gl.getUniformLocation(shader.program, "u_diffuse");
        }

        if (private.emmissiveTexture !== none) {
            shader.uniforms.emmissive = frag.gl.getUniformLocation(shader.program, "u_emmissive");
        }

        if (private.displacementTexture !== none || private.roughnessTexture !== none || private.shininessTexture != none) {
            shader.uniforms.surface = frag.gl.getUniformLocation(shader.program, "u_surface");
        }

        if (private.displacementTexture !== none) {
            shader.uniforms.displacementScale = frag.gl.getUniformLocation(shader.program, "u_displacementScale");
            bindList.push(function (gl) { gl.uniform1f(shader.uniforms.displacementScale, shader._displacementScale); });
            shader._displacementScale = 0.2;
            shader.displacementScale = function (scale) {
                shader._displacementScale = scale;
                return shader;
            };
        }

        if (private.normalMap !== none) {
            shader.uniforms.normalMap = frag.gl.getUniformLocation(shader.program, "u_normalMap");
        }

        if (private.ambientLight !== none) {
            shader.uniforms.ambientLight = frag.gl.getUniformLocation(shader.program, "u_ambientLight");
            bindList.push(function (gl) { gl.uniform1f(shader.uniforms.ambientLight, shader._ambientLight); });
            shader._ambientLight = 0.5;
        }

        if (private.directionalLight !== none) {
            shader.uniforms.lightDirection = frag.gl.getUniformLocation(shader.program, "u_lightDirection");
            bindList.push(function (gl) { gl.uniform3fv(shader.uniforms.lightDirection, shader._lightDirection); });

            if (private.directionalLight === "Color"){
                shader.uniforms.lightColor = frag.gl.getUniformLocation(shader.program, "u_lightColor");
                bindList.push(function (gl) { gl.uniform3fv(shader.uniforms.lightColor, shader._lightColor); });

                shader.lightColor = function(color) {
                    shader._lightColor = color;
                    return shader;
                }
            }

            const balanceAmbient = private.ambientLight === "Balanced";
            shader.lightDirection = function (direction) {
                const length = window.frag.Vector.length(direction);
                if (length > 1) {
                    shader._lightDirection = [-direction[0] / length, -direction[1] / length, -direction[2] / length];
                    if (balanceAmbient) shader._ambientLight = 0;
                } else {
                    shader._lightDirection = [-direction[0], -direction[1], -direction[2]];
                    if (balanceAmbient) shader._ambientLight = 1 - length;
                }
                return shader;
            };
            if (private.directionalLight === "White")
                shader.lightDirection([0.8, -0.2, 0.8]);
            else if (private.directionalLight === "Grey")
                shader.lightDirection([0.5, -0.1, 0.5]);
        }

        shader.bind = function (gl) {
            gl.useProgram(shader.program);
            bindList.forEach(f => f(gl));
        }

        shader.unbind = function (gl) {
            unbindList.forEach(f => f(gl));
        }

        return shader;
    }
    return public;
};
