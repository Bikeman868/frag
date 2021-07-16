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

    private.addAttributeDeclarations = function(source) {
        if (private.verticies === "XYZ") source.vertex += "attribute vec4 a_position;\n";
        else if (private.verticies !== none) source.vertex += "attribute vec2 a_position;\n";

        if (private.colors !== none) source.vertex += "attribute " + private.colors + " a_color;\n";
        if (private.textureCoords !== none) source.vertex += "attribute " + private.textureCoords + " a_texcoord;\n";
        if (private.normals !== none) source.vertex += "attribute " + private.normals + " a_normal;\n";
        if (private.tangents !== none) source.vertex += "attribute " + private.tangents + " a_tangent;\n";
        if (private.bitangents !== none) source.vertex += "attribute " + private.bitangents + " a_bitangent;\n";
    }

    private.addUniformDeclarations = function (source) {
        if (private.matrix !== none) {
            if (private.directionalLight !== none)
                source.vertex += "uniform " + private.matrix + " u_modelMatrix;\n";
            source.vertex += "uniform " + private.matrix + " u_clipMatrix;\n";
        }
        if (private.directionalLight !== none) source.vertex += "uniform vec3 u_lightDirection;\n";
        if (private.directionalLight === "Color") source.vertex += "uniform vec3 u_lightColor;\n";
        if (private.displacementTexture !== none) source.vertex += "uniform float u_displacementScale;\n";
        if (private.displacementTexture !== none || private.roughnessTexture !== none || private.shininessTexture != none) source.vertex += "uniform sampler2D u_surface;\n";

        if (private.normalMap !== none) source.fragment += "uniform sampler2D u_normalMap;\n";
        if (private.textureCoords !== none) {
            if (private.diffuseTexture !== none) source.fragment += "uniform sampler2D u_diffuse;\n";
            if (private.emmissiveTexture !== none) source.fragment += "uniform sampler2D u_emmissive;\n";
        }
        if (private.ambientLight !== none) source.fragment += "uniform float u_ambientLight;\n";
    }

    private.addVaryingDeclarations = function (source) {
        const add = function (type, name) {
            const statement = "varying " + type + " " + name + ";\n";
            source.vertex += statement;
            source.fragment += statement;
        }

        if (private.textureCoords !== none) add(private.textureCoords, "v_texcoord");
        if (private.colors !== none) add(private.colors, "v_color");
        if (private.directionalLight !== none) {
            add("vec3", "v_lightDirection");
            if (private.directionalLight === "Color") add("vec3", "v_lightColor");
            if (private.normalMap === none) add(private.normals, "v_normal");
        }
    }

    private.addLogic = function (source) {
        if (private.verticies === "XYZ") source.vertex += "  vec4 position = a_position;\n";
        else if (private.verticies !== none) source.vertex += "  vec2 position = a_position;\n";

        if (private.displacementTexture !== none || private.roughnessTexture !== none || private.shininessTexture != none) {
            source.vertex += "  vec4 surface = texture2D(u_surface, vec2(a_texcoord.x, 1.0 - a_texcoord.y));\n";
        }

        if (private.displacementTexture !== none) {
            if (private.verticies === "XYZ" && private.normals === "vec3") {
                if (private.displacementTexture === "Sunken") source.vertex += "  float displacement = -surface.r;\n";
                else if (private.displacementTexture === "Signed") source.vertex += "  float displacement = surface.r * 2.0 - 1.0;\n";
                else if (private.displacementTexture === "Raised") source.vertex += "  float displacement = surface.r;\n";
                source.vertex += "  position = vec4(position.xyz + (a_normal * displacement * u_displacementScale), position.w);\n";
            }
        }

        if (private.verticies === "XYZ") source.vertex += "  position = u_clipMatrix * position;\n";
        else if (private.verticies !== none) source.vertex += "  position = (u_clipMatrix * vec3(position, 1)).xy;\n";

        if (private.verticies === "XYZ") source.vertex += "  gl_Position = position;\n";
        else if (private.verticies === "XY") source.vertex += "  gl_Position = vec4(position, " + private.z + ", 1);\n";
        else if (private.verticies === "XZ") source.vertex += "  gl_Position = vec4(position.x, " + private.y + ", position.y, 1);\n";
        else if (private.verticies === "YZ") source.vertex += "  gl_Position = vec4(" + private.x + ", position, 1);\n";

        if (private.textureCoords !== none) source.vertex += "  v_texcoord = a_texcoord;\n";

        if (private.directionalLight !== none) {
            if (private.normalMap !== none) {
                source.vertex += "  vec3 T = normalize(vec3(u_modelMatrix * vec4(a_tangent, 0.0)));\n";
                if (private.bitangents !== none)
                    source.vertex += "  vec3 B = normalize(vec3(u_modelMatrix * vec4(a_bitangent, 0.0)));\n";
                else
                    source.vertex += "  vec3 B = normalize(vec3(u_modelMatrix * vec4(cross(a_normal, a_tangent), 0.0)));\n";
                source.vertex += "  vec3 N = normalize(vec3(u_modelMatrix * vec4(a_normal, 0.0)));\n";
                source.vertex += "  mat3 TBN = transpose(mat3(T, B, N));\n";
                source.vertex += "  v_lightDirection = TBN * u_lightDirection;\n";
                source.fragment += "  vec3 normal = texture2D(u_normalMap, vec2(v_texcoord.x, 1.0 - v_texcoord.y)).rgb * 2.0 - 1.0;\n";
            } else {
                source.vertex += "  v_normal = (u_modelMatrix * vec4(a_normal, 0)).xyz;\n";
                source.vertex += "  v_lightDirection = u_lightDirection;\n";
                source.fragment += "  vec3 normal = normalize(v_normal);\n";
            }

            source.fragment += "  vec3 lightDirection = v_lightDirection;\n";
            source.fragment += "  float light = max(dot(normal, lightDirection), 0.0);\n";
            if (private.ambientLight !== none) source.fragment += "  light += u_ambientLight;\n";
        } else {
            if (private.ambientLight !== none) source.fragment += "  float light = u_ambientLight;\n";
        }

        if (private.directionalLight === "Color") 
            source.vertex += "  v_lightColor = u_lightColor;\n";

        if (private.colors === none)
            source.fragment += "  gl_FragColor = vec4(0, 0, 0, 1.0);\n";
        else if (private.colors === "vec4") {
            source.vertex += "  v_color = a_color;\n";
            source.fragment += "  gl_FragColor = v_color;\n";
        } else {
            source.vertex += "  v_color = a_color;\n";
            source.fragment += "  gl_FragColor = vec4(v_color, 1.0);\n";
        }

        if (private.textureCoords === "vec2") {
            if (private.diffuseTexture === "RGB")
                source.fragment += "  gl_FragColor += texture2D(u_diffuse, vec2(v_texcoord.x, 1.0 - v_texcoord.y));\n";
        }

        if (private.ambientLight !== none || private.directionalLight !== none)
            source.fragment += "  gl_FragColor.rgb *= light;\n";

        if (private.textureCoords === "vec2") {
            if (private.emmissiveTexture === "RGB")
                source.fragment += "  gl_FragColor.rgb += texture2D(u_emmissive, vec2(v_texcoord.x, 1.0 - v_texcoord.y)).rgb;\n";
        }
    }

    private.addTranspose = function(source) {
        /*
        source.vertex += "highp mat4 transpose(in highp mat4 inMatrix) {\n";
        source.vertex += "    highp vec4 i0 = inMatrix[0];\n";
        source.vertex += "    highp vec4 i1 = inMatrix[1];\n";
        source.vertex += "    highp vec4 i2 = inMatrix[2];\n";
        source.vertex += "    highp vec4 i3 = inMatrix[3];\n";
        source.vertex += "    highp mat4 outMatrix = mat4(\n";
        source.vertex += "        vec4(i0.x, i1.x, i2.x, i3.x),\n";
        source.vertex += "        vec4(i0.y, i1.y, i2.y, i3.y),\n";
        source.vertex += "        vec4(i0.z, i1.z, i2.z, i3.z),\n";
        source.vertex += "        vec4(i0.w, i1.w, i2.w, i3.w)\n";
        source.vertex += "    );\n";
        source.vertex += "    return outMatrix;\n";
        source.vertex += "}\n";
        */
        source.vertex += "highp mat3 transpose(in highp mat3 inMatrix) {\n";
        source.vertex += "    highp vec3 i0 = inMatrix[0];\n";
        source.vertex += "    highp vec3 i1 = inMatrix[1];\n";
        source.vertex += "    highp vec3 i2 = inMatrix[2];\n";
        source.vertex += "    highp mat3 outMatrix = mat3(\n";
        source.vertex += "        vec3(i0.x, i1.x, i2.x),\n";
        source.vertex += "        vec3(i0.y, i1.y, i2.y),\n";
        source.vertex += "        vec3(i0.z, i1.z, i2.z)\n";
        source.vertex += "    );\n";
        source.vertex += "    return outMatrix;\n";
        source.vertex += "}\n";
    }

    public.compile = function () {
        const shader = frag.CustomShader(private.matrix === "mat4")
            .name(private.name);

        const source = {
            vertex: "",
            fragment: "precision mediump float;\n"
        }

        private.addAttributeDeclarations(source);
        private.addUniformDeclarations(source);
        private.addVaryingDeclarations(source);

        if (private.directionalLight !== none) private.addTranspose(source);

        source.vertex += "void main() {\n";
        source.fragment += "void main() {\n";

        private.addLogic(source);

        source.vertex += "}\n";
        source.fragment += "}\n";

        shader.source(source.vertex, source.fragment);

        if (private.verticies !== none) shader.attribute("position");
        if (private.colors !== none) shader.attribute("color");
        if (private.textureCoords !== none) shader.attribute("texcoord");
        if (private.normals !== none) shader.attribute("normal");
        if (private.tangents !== none) shader.attribute("tangent");
        if (private.bitangents !== none) shader.attribute("bitangent");

        if (private.matrix !== none) {
            if (private.directionalLight !== none) shader.uniform("modelMatrix");
            shader.uniform("clipMatrix");
        }

        if (private.diffuseTexture !== none) shader.uniform("diffuse");
        if (private.emmissiveTexture !== none) shader.uniform("emmissive");
        if (private.displacementTexture !== none) shader.uniform("displacementScale", "1f", 0.2);
        if (private.normalMap !== none) shader.uniform("normalMap");
        if (private.ambientLight !== none) shader.uniform("ambientLight", "1f", 0.5);

        if (private.displacementTexture !== none || 
            private.roughnessTexture !== none || 
            private.shininessTexture != none)
            shader.uniform("surface");

        if (private.directionalLight !== none) {
            let defaultLightDirection = [-1, -1, 1];
            if (private.directionalLight === "White") defaultLightDirection = [0.8, -0.2, 0.8];
            else if (private.directionalLight === "Grey") defaultLightDirection = [0.5, -0.1, 0.5];
            shader.uniform("lightDirection", "3fv", defaultLightDirection);

            if (private.directionalLight === "Color") shader.uniform("lightColor", "3fv", [0.5, 0.5, 0.5]);

            const balanceAmbient = private.ambientLight === "Balanced";
            const setLightDirection = shader.lightDirection;
            shader.lightDirection = function (direction) {
                const length = window.frag.Vector.length(direction);
                if (length > 1) {
                    setLightDirection([-direction[0] / length, -direction[1] / length, -direction[2] / length]);
                    if (balanceAmbient) shader.ambientLight(0);
                } else {
                    setLightDirection([-direction[0], -direction[1], -direction[2]]);
                    if (balanceAmbient) shader.ambientLight(1 - length);
                }
                return shader;
            };
        }

        return shader;
    }
    return public;
};
