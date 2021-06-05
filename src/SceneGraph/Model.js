window.frag.Model = function (parent) {
    const frag = window.frag;

    const private = {
        name: null,
        parent,
        children: [],
        meshData: null,
        shader: null,
        material: null,
        transform: frag.Transform().identity(), // assume 3D
    }

    const public = {
        __private: private,
        animations: []
    };

    public.addFlattenedChildren = function (flattenedChildren, predicate) {
        for (let i = 0; i < private.children.length; i++) {
            let child = private.children[i];
            if (predicate(child)) flattenedChildren.push(child);
            child.addFlattenedChildren(flattenedChildren, predicate);
        }
    }

    public.name = function (value) {
        private.name = value;
        return public;
    }

    public.getName = function () {
        return private.name;
    }

    public.transform = function (value) {
        private.transform = value;
        return public;
    }

    public.getTransform = function () {
        return private.transform;
    }

    public.shader = function (value) {
        private.shader = value;
        return public;
    }

    public.getShader = function () {
        if (private.shader) return private.shader;
        if (private.parent) return private.parent.getShader();
        return undefined;
    }

    public.data = function (value) {
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
            child = window.frag.Model(public);
        }
        private.children.push(child);
        return child;
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

    public.draw = function (gl, modelToWorldTransform, modelToClipTransform, animationMap) {
        let animationMatrix;
        if (animationMap && private.name) {
            const animationState = animationMap[private.name];
            if (animationState) animationMatrix = animationState.getMatrix();
        }

        let localMatrix = private.transform.getMatrix();
        if (animationMatrix) {
            if (private.transform.is3d) localMatrix = frag.Matrix.m4Xm4(localMatrix, animationMatrix);
            else localMatrix = frag.Matrix.m3Xm3(localMatrix, animationMatrix);
        }

        const modelToWorldMatrix = modelToWorldTransform.getMatrix();
        const modelToClipMatrix = modelToClipTransform.getMatrix();

        if (private.transform.is3d) {
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
            private.children[i].draw(gl, modelToWorldTransform, modelToClipTransform, animationMap);

        return public;
    }

    return public;
};
