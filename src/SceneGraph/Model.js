window.frag.Model = function (is3d, parent) {
    const frag = window.frag;

    if (is3d === undefined) {
        if (parent && parent.location)
            is3d = parent.location.is3d;
        else
            is3d = true;
    }

    const private = {
        name: null,
        parent,
        children: [],
        meshData: null,
        shader: null,
        material: null,
    }

    const public = {
        __private: private,
        location: frag.Location(is3d),
        animations: []
    };

    public.addFlattenedChildren = function (flattenedChildren, predicate) {
        for (let i = 0; i < private.children.length; i++) {
            let child = private.children[i];
            if (predicate(child)) flattenedChildren.push(child);
            child.addFlattenedChildren(flattenedChildren, predicate);
        }
    }

    public.getPosition = function() {
        return frag.ScenePosition(public.location);
    }

    public.name = function (value) {
        private.name = value;
        return public;
    }

    public.getName = function () {
        return private.name;
    }

    public.shader = function (value) {
        if (value.is3d !== public.location.is3d){
            const m = public.location.is3d ? "3D" : "2D";
            console.error("Model '" + private.name + "' has a " + m + " location and must use a " + m + " shader");
        }
        private.shader = value;
        return public;
    }

    public.getShader = function () {
        if (private.shader) return private.shader;
        if (private.parent) return private.parent.getShader();
        return undefined;
    }

    public.mesh = function (value) {
        private.meshData = value;
        return public;
    }

    public.material = function (value) {
        private.material = value;
        return public;
    }

    public.getMaterial = function () {
        if (private.material) return private.material;
        if (private.parent) return private.parent.getMaterial();
        return undefined;
    }

    public.addChild = function (child) {
        if (child) {
            child.__private.parent = public;
        } else {
            child = window.frag.Model(undefined, public);
        }
        private.children.push(child);
        return child;
    }

    public.shadeSmooth = function (depth) {
        if (depth === undefined) depth = -1;
        if (private.meshData) private.meshData.shadeSmooth();
        
        if (depth === 0) return public;
        private.children.forEach((c) => { c.shadeSmooth(depth-1); });
        return public;
    }

    public.shadeFlat = function (depth) {
        if (depth === undefined) depth = -1;
        if (private.meshData) private.meshData.shadeFlat();
        
        if (depth === 0) return public;
        private.children.forEach((c) => { c.shadeFlat(depth-1); });
        return public;
    }

    public.textureSmooth = function (depth) {
        if (depth === undefined) depth = -1;
        if (private.meshData) private.meshData.textureSmooth();
        
        if (depth === 0) return public;
        private.children.forEach((c) => { c.textureSmooth(depth-1); });
        return public;
    }

    public.textureFlat = function (depth) {
        if (depth === undefined) depth = -1;
        if (private.meshData) private.meshData.textureFlat();
        
        if (depth === 0) return public;
        private.children.forEach((c) => { c.textureFlat(depth-1); });
        return public;
    }

    public.wireframe = function (drawWireframe, depth) {
        if (depth === undefined) depth = -1;
        if (private.meshData) private.meshData.wireframe();
        
        if (depth === 0) return public;
        private.children.forEach((c) => { c.wireframe(depth-1); });
        return public;
    }

    public.drawNormals = function(length, color, depth) {
        if (depth === undefined) depth = -1;
        if (private.meshData) private.meshData.drawNormals(length, color);

        if (depth === 0) return public;
        private.children.forEach((c) => { c.drawNormals(length, color, depth-1); });
        return public;
    }

    public.addAnimation = function (modelAnimation) {
        const children = [];
        public.addFlattenedChildren(children, function (child) { return child.getName(); });

        const childAnimations = [];
        const graphs = modelAnimation.getChannelGraphs();
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            const childName = child.getName();
            for (let j = 0; j < graphs.length; j++) {
                const graph = graphs[j];
                if (graph.pattern.test(childName)) {
                    childAnimations.push({
                        graph: graph,
                        model: child
                    });
                }
            }
        }

        if (childAnimations.length > 0)
            public.animations.push({ modelAnimation, childAnimations });

        return public;
    }

    public.draw = function (gl, modelToWorldMatrix, modelToClipMatrix, animationMap) {
        if (!public.location) return public;

        const animationState = animationMap && private.name ? animationMap[private.name] : null;
        const location = animationState
            ? public.location.clone().add(animationState.location)
            : public.location;
        const localMatrix = location.getMatrix();

        if (location.is3d) {
            modelToWorldTransform = frag.Transform(frag.Matrix.m4Xm4(modelToWorldMatrix, localMatrix));
            modelToClipTransform = frag.Transform(frag.Matrix.m4Xm4(modelToClipMatrix, localMatrix));
        } else {
            modelToWorldTransform = frag.Transform2D(frag.Matrix.m3Xm3(modelToWorldMatrix, localMatrix));
            modelToClipTransform = frag.Transform2D(frag.Matrix.m3Xm3(modelToClipMatrix, localMatrix));
        }

        const shader = public.getShader();

        if (shader !== undefined && private.meshData) {
            shader.bind(gl);

            var material = public.getMaterial();
            if (material) material.apply(gl, shader);

            if (shader.uniforms.clipMatrix !== undefined) {
                modelToClipTransform.apply(gl, shader.uniforms.clipMatrix);
            }

            if (shader.uniforms.modelMatrix !== undefined) {
                modelToWorldTransform.apply(gl, shader.uniforms.modelMatrix);
            }

            private.meshData.draw(gl, shader);

            shader.unbind(gl);
        }

        for (let i = 0; i < private.children.length; i++)
            private.children[i].draw(gl, modelToWorldTransform.getMatrix(), modelToClipTransform.getMatrix(), animationMap);

        return public;
    }

    return public;
};
