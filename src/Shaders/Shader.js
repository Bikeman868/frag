// This builds a custom shader based on a set of options
window.frag.Shader = function (engine) {
    const frag = window.frag;
    const gl = engine.gl;

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
        if (private.verticies === "XYZ") shader.vectorShader += "attribute vec4 a_position;\n";
        else if (private.verticies !== none) shader.vectorShader += "attribute vec2 a_position;\n";

        if (private.colors !== none) shader.vectorShader += "attribute " + private.colors + " a_color;\n";
        if (private.textureCoords !== none) shader.vectorShader += "attribute " + private.textureCoords + " a_texcoord;\n";
        if (private.normals !== none) shader.vectorShader += "attribute " + private.normals + " a_normal;\n";
        if (private.tangents !== none) shader.vectorShader += "attribute " + private.tangents + " a_tangent;\n";
        if (private.bitangents !== none) shader.vectorShader += "attribute " + private.bitangents + " a_bitangent;\n";
    }

    private.addUniformDeclarations = function (shader) {
        if (private.matrix !== none) {
            if (private.directionalLight !== none)
                shader.vectorShader += "uniform " + private.matrix + " u_modelMatrix;\n";
            shader.vectorShader += "uniform " + private.matrix + " u_clipMatrix;\n";
        }
        if (private.directionalLight !== none) shader.vectorShader += "uniform vec3 u_lightDirection;\n";
        if (private.directionalLight === "Color") shader.vectorShader += "uniform vec3 u_lightColor;\n";
        if (private.displacementTexture !== none) shader.vectorShader += "uniform float u_displacementScale;\n";
        if (private.displacementTexture !== none || private.roughnessTexture !== none || private.shininessTexture != none) shader.vectorShader += "uniform sampler2D u_surface;\n";

        if (private.normalMap !== none) shader.fragmentShader += "uniform sampler2D u_normalMap;\n";
        if (private.textureCoords !== none) {
            if (private.diffuseTexture !== none) shader.fragmentShader += "uniform sampler2D u_diffuse;\n";
            if (private.emmissiveTexture !== none) shader.fragmentShader += "uniform sampler2D u_emmissive;\n";
        }
        if (private.ambientLight !== none) shader.fragmentShader += "uniform float u_ambientLight;\n";
    }

    private.addVaryingDeclarations = function (shader) {
        const add = function (type, name) {
            const statement = "varying " + type + " " + name + ";\n";
            shader.vectorShader += statement;
            shader.fragmentShader += statement;
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
        if (private.verticies === "XYZ") shader.vectorShader += "  vec4 position = a_position;\n";
        else if (private.verticies !== none) shader.vectorShader += "  vec2 position = a_position;\n";

        if (private.displacementTexture !== none || private.roughnessTexture !== none || private.shininessTexture != none) {
            shader.vectorShader += "  vec4 surface = texture2D(u_surface, vec2(a_texcoord.x, 1.0 - a_texcoord.y));\n";
        }

        if (private.displacementTexture !== none) {
            if (private.verticies === "XYZ" && private.normals === "vec3") {
                if (private.displacementTexture === "Sunken") shader.vectorShader += "  float displacement = -surface.r;\n";
                else if (private.displacementTexture === "Signed") shader.vectorShader += "  float displacement = surface.r * 2.0 - 1.0;\n";
                else if (private.displacementTexture === "Raised") shader.vectorShader += "  float displacement = surface.r;\n";
                shader.vectorShader += "  position = vec4(position.xyz + (a_normal * displacement * u_displacementScale), position.w);\n";
            }
        }

        if (private.verticies === "XYZ") shader.vectorShader += "  position = u_clipMatrix * position;\n";
        else if (private.verticies !== none) shader.vectorShader += "  position = (u_clipMatrix * vec3(position, 1)).xy;\n";

        if (private.verticies === "XYZ") shader.vectorShader += "  gl_Position = position;\n";
        else if (private.verticies === "XY") shader.vectorShader += "  gl_Position = vec4(position, " + private.z + ", 1);\n";
        else if (private.verticies === "XZ") shader.vectorShader += "  gl_Position = vec4(position.x, " + private.y + ", position.y, 1);\n";
        else if (private.verticies === "YZ") shader.vectorShader += "  gl_Position = vec4(" + private.x + ", position, 1);\n";

        if (private.textureCoords !== none) shader.vectorShader += "  v_texcoord = a_texcoord;\n";

        if (private.directionalLight !== none) {
            if (private.normalMap !== none) {
                shader.vectorShader += "  vec3 T = normalize(vec3(u_modelMatrix * vec4(a_tangent, 0.0)));\n";
                if (private.bitangents !== none)
                    shader.vectorShader += "  vec3 B = normalize(vec3(u_modelMatrix * vec4(a_bitangent, 0.0)));\n";
                else
                    shader.vectorShader += "  vec3 B = normalize(vec3(u_modelMatrix * vec4(cross(a_normal, a_tangent), 0.0)));\n";
                shader.vectorShader += "  vec3 N = normalize(vec3(u_modelMatrix * vec4(a_normal, 0.0)));\n";
                shader.vectorShader += "  mat3 TBN = transpose(mat3(T, B, N));\n";
                shader.vectorShader += "  v_lightDirection = TBN * u_lightDirection;\n";
                shader.fragmentShader += "  vec3 normal = texture2D(u_normalMap, vec2(v_texcoord.x, 1.0 - v_texcoord.y)).rgb * 2.0 - 1.0;\n";
            } else {
                shader.vectorShader += "  v_normal = (u_modelMatrix * vec4(a_normal, 0)).xyz;\n";
                shader.vectorShader += "  v_lightDirection = u_lightDirection;\n";
                shader.fragmentShader += "  vec3 normal = normalize(v_normal);\n";
            }

            shader.fragmentShader += "  vec3 lightDirection = v_lightDirection;\n";
            shader.fragmentShader += "  float light = max(dot(normal, lightDirection), 0.0);\n";
            if (private.ambientLight !== none) shader.fragmentShader += "  light += u_ambientLight;\n";
        } else {
            if (private.ambientLight !== none) shader.fragmentShader += "  float light = u_ambientLight;\n";
        }

        if (private.directionalLight === "Color") 
            shader.vectorShader += "  v_lightColor = u_lightColor;\n";

        if (private.colors === none)
            shader.fragmentShader += "  gl_FragColor = vec4(0, 0, 0, 1.0);\n";
        else if (private.colors === "vec4") {
            shader.vectorShader += "  v_color = a_color;\n";
            shader.fragmentShader += "  gl_FragColor = v_color;\n";
        } else {
            shader.vectorShader += "  v_color = a_color;\n";
            shader.fragmentShader += "  gl_FragColor = vec4(v_color, 1.0);\n";
        }

        if (private.textureCoords === "vec2") {
            if (private.diffuseTexture === "RGB")
                shader.fragmentShader += "  gl_FragColor += texture2D(u_diffuse, vec2(v_texcoord.x, 1.0 - v_texcoord.y));\n";
        }

        if (private.ambientLight !== none || private.directionalLight !== none)
            shader.fragmentShader += "  gl_FragColor.rgb *= light;\n";

        if (private.textureCoords === "vec2") {
            if (private.emmissiveTexture === "RGB")
                shader.fragmentShader += "  gl_FragColor.rgb += texture2D(u_emmissive, vec2(v_texcoord.x, 1.0 - v_texcoord.y)).rgb;\n";
        }
    }

    public.compile = function () {
        const shader = frag.CustomShader(engine, private.matrix === "mat4")
            .name(private.name);

        const source = {
            vectorShader: "",
            fragmentShader: "precision mediump float;\n"
        }

        private.addAttributeDeclarations(source);
        private.addUniformDeclarations(source);
        private.addVaryingDeclarations(source);

        if (private.directionalLight !== none) {
            /*
            source.vectorShader += "highp mat4 transpose(in highp mat4 inMatrix) {\n";
            source.vectorShader += "    highp vec4 i0 = inMatrix[0];\n";
            source.vectorShader += "    highp vec4 i1 = inMatrix[1];\n";
            source.vectorShader += "    highp vec4 i2 = inMatrix[2];\n";
            source.vectorShader += "    highp vec4 i3 = inMatrix[3];\n";
            source.vectorShader += "    highp mat4 outMatrix = mat4(\n";
            source.vectorShader += "        vec4(i0.x, i1.x, i2.x, i3.x),\n";
            source.vectorShader += "        vec4(i0.y, i1.y, i2.y, i3.y),\n";
            source.vectorShader += "        vec4(i0.z, i1.z, i2.z, i3.z),\n";
            source.vectorShader += "        vec4(i0.w, i1.w, i2.w, i3.w)\n";
            source.vectorShader += "    );\n";
            source.vectorShader += "    return outMatrix;\n";
            source.vectorShader += "}\n";
            */
            source.vectorShader += "highp mat3 transpose(in highp mat3 inMatrix) {\n";
            source.vectorShader += "    highp vec3 i0 = inMatrix[0];\n";
            source.vectorShader += "    highp vec3 i1 = inMatrix[1];\n";
            source.vectorShader += "    highp vec3 i2 = inMatrix[2];\n";
            source.vectorShader += "    highp mat3 outMatrix = mat3(\n";
            source.vectorShader += "        vec3(i0.x, i1.x, i2.x),\n";
            source.vectorShader += "        vec3(i0.y, i1.y, i2.y),\n";
            source.vectorShader += "        vec3(i0.z, i1.z, i2.z)\n";
            source.vectorShader += "    );\n";
            source.vectorShader += "    return outMatrix;\n";
            source.vectorShader += "}\n";
        }

        source.vectorShader += "void main() {\n";
        source.fragmentShader += "void main() {\n";

        private.addLogic(source);

        source.vectorShader += "}\n";
        source.fragmentShader += "}\n";

        shader.source(source.vectorShader, source.fragmentShader);

        if (private.verticies !== none) shader.attribute("position");
        if (private.colors !== none) shader.attribute("color");
        if (private.textureCoords !== none) shader.attribute("texcoord");
        if (private.normals !== none) shader.attribute("normal");
        if (private.tangents !== none) shader.attribute("tangent");
        if (private.bitangents !== none) shader.attribute("bitangent");

        if (private.diffuseTexture !== none) shader.uniform("diffuse");
        if (private.emmissiveTexture !== none) shader.uniform("emmissive");
        if (private.normalMap !== none) shader.uniform("normalMap");
        if (private.displacementTexture !== none) shader.uniform("displacementScale", "1f", 0.2);
        if (private.ambientLight !== none) shader.uniform("ambientLight", "1f", 0.5);

        if (private.displacementTexture !== none || 
            private.roughnessTexture !== none || 
            private.shininessTexture != none) 
            shader.uniform("surface");

        if (private.matrix !== none) {
            if (private.directionalLight !== none)
                shader.uniform("modelMatrix");
            shader.uniform("clipMatrix");
        }

        if (private.directionalLight !== none) {
            shader.uniform("lightDirection", "3fv");

            if (private.directionalLight === "Color")
                shader.uniform("lightColor", "3fv");

            const balanceAmbient = private.ambientLight === "Balanced" && shader.ambientLight;
            const innerLightDirection = shader.lightDirection;

            shader.lightDirection = function (direction) {
                const length = frag.Vector.length(direction);
                if (length > 1) {
                    innerLightDirection([-direction[0] / length, -direction[1] / length, -direction[2] / length]);
                    if (balanceAmbient) shader.ambientLight(0);
                } else {
                    innerLightDirection([-direction[0], -direction[1], -direction[2]]);
                    if (balanceAmbient) shader.ambientLight(1 - length);
                }
                return shader;
            };

            if (private.directionalLight === "White")
                shader.lightDirection([0.8, -0.2, 0.8]);
            else if (private.directionalLight === "Grey")
                shader.lightDirection([0.5, -0.1, 0.5]);
        }

        return shader;
    }
    return public;
};
