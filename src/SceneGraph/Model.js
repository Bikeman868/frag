window.frag.Model = function (engine, is3d, parent) {
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
        mesh: null,
        shader: null,
        material: null,
        enabled: true
    }

    const public = {
        __private: private,
        isModel: true,
        location: frag.Location(engine, is3d),
        animations: []
    };

    public.dispose = function(){
    }

    public.addFlattenedChildren = function (flattenedChildren, predicate) {
        for (let i = 0; i < private.children.length; i++) {
            let child = private.children[i];
            if (predicate(child)) flattenedChildren.push(child);
            child.addFlattenedChildren(flattenedChildren, predicate);
        }
    }

    public.getLocation = function() {
        return public.location;
    }

    public.getPosition = function() {
        return frag.ScenePosition(engine, public.location);
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
        private.mesh = value;
        return public;
    }

    public.getMesh = function() {
        return private.mesh;
    }

    public.material = function (value) {
        private.material = value;
        return public;
    }

    public.enable = function() {
        private.enabled = true;
    }

    public.disable = function() {
        private.enabled = false;
    }

    public.isEnabled = function() {
        return private.enabled;
    }

    public.isDisabled = function() {
        return !private.enabled;
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
            child = window.frag.Model(engine, undefined, public);
        }
        private.children.push(child);
        return child;
    }

    public.shadeSmooth = function (depth) {
        if (depth === undefined) depth = -1;
        if (private.mesh) private.mesh.shadeSmooth();
        
        if (depth === 0) return public;
        private.children.forEach((c) => { c.shadeSmooth(depth-1); });
        return public;
    }

    public.shadeFlat = function (depth) {
        if (depth === undefined) depth = -1;
        if (private.mesh) private.mesh.shadeFlat();
        
        if (depth === 0) return public;
        private.children.forEach((c) => { c.shadeFlat(depth-1); });
        return public;
    }

    public.textureSmooth = function (depth) {
        if (depth === undefined) depth = -1;
        if (private.mesh) private.mesh.textureSmooth();
        
        if (depth === 0) return public;
        private.children.forEach((c) => { c.textureSmooth(depth-1); });
        return public;
    }

    public.textureFlat = function (depth) {
        if (depth === undefined) depth = -1;
        if (private.mesh) private.mesh.textureFlat();
        
        if (depth === 0) return public;
        private.children.forEach((c) => { c.textureFlat(depth-1); });
        return public;
    }

    public.wireframe = function (drawWireframe, depth) {
        if (depth === undefined) depth = -1;
        if (private.mesh) private.mesh.wireframe(drawWireframe);
        
        if (depth === 0) return public;
        private.children.forEach((c) => { c.wireframe(drawWireframe, depth-1); });
        return public;
    }

    public.drawNormals = function(length, color, depth) {
        if (depth === undefined) depth = -1;
        if (private.mesh) private.mesh.drawNormals(length, color);

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

    public.draw = function (drawContext) {
        if (!public.location) return public;
        drawContext.beginMesh(public);

        const shader = drawContext.getShader();

        if (shader && private.mesh && private.enabled) {
            var material = public.getMaterial();
            if (material) material.apply(shader);

            private.mesh.draw(drawContext, function(fragment, index) {
                return index === 0 ? public : null;
            });
        }

        for (let i = 0; i < private.children.length; i++)
            private.children[i].draw(drawContext);

        const childMap = drawContext.state.childMap;
        const sceneObjects = parent 
            ? (childMap && private.name ? childMap[private.name] : undefined)
            : (childMap ? childMap['.'] : undefined);

        if (sceneObjects) {
            for (let i = 0; i < sceneObjects.length; i++)
                sceneObjects[i].draw(drawContext);
        }

        drawContext.endMesh();
        return public;
    }

    return public;
};
