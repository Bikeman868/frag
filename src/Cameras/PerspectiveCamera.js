// This public makes objects closer to the public appear larger. The frustrum
// defines clipping and scaling of the scene

window.frag.PerspectiveCamera = function () {
    const frag = window.frag;

    const private = {
        locationTransform: window.frag.Transform(),
        worldTransform: window.frag.Transform(),
        perspectiveTransform: window.frag.Transform(),
        x: 0,
        y: 0,
        z: -200,
        xRot: 0,
        yRot: 0,
        zRot: 0,
        fov: 45 * Math.PI / 180,
        zNear: -100,
        zFar: 100,
        xScale: 100,
        aspectRatio: 1,
        transformChanged: true
    }

    const public = {
        __private: private,
        worldToClipTransform: window.frag.Transform()
    };

    private.computeCameraTransforms = function () {
        // Position of the camera within the world
        private.locationTransform
            .identity()
            .translateXYZ(private.x, private.y, private.z)
            .rotateXYZ(private.xRot, private.yRot, private.zRot);

        // Position the world with the camera at the origin
        private.worldTransform
            .identity()
            .rotateXYZ(-private.xRot, -private.yRot, -private.zRot)
            .scaleXYZ(1 / private.xScale, private.aspectRatio / private.xScale, 2 / (private.zFar - private.zNear))
            .translateXYZ(-private.x, -private.y, -private.z);

        private.transformChanged = true;
    }

    private.computePerspectiveTransform = function () {
        // TODO: calculate based on private.fov
        const ps = 0.5;
        const pt = 0.7;

        // Note that the world transform already transforms the frustrum into a 2x2x2 cube at zNear
        const xs = 1;
        const ys = 1;
        const zs = 1;

        const xt = 0;
        const yt = 0;
        const zt = -2 * (private.zNear - private.z) / (private.zFar - private.zNear) - 1;

        const __ = 0;

        private.perspectiveTransform.setMatrix([
            xs, __, __, __,
            __, ys, __, __,
            __, __, zs, ps,
            xt, yt, zt, pt,
        ]);

        private.transformChanged = true;
    }

    private.computeTransform = function () {
        const transformMatrix = frag.Matrix.m4Xm4(
            private.perspectiveTransform.getMatrix(),
            private.worldTransform.getMatrix());
        public.worldToClipTransform.setMatrix(transformMatrix);

        /*
        // Opposite corners of frustrum should be [-1, -1, -1] and [1, 1, 1] in clip space
        const t = function (matrix, x, y, z) {
            const v = frag.Matrix.m4Xv4(matrix, [x, y, z, 1]);
            v[0] = v[0] / v[3];
            v[1] = v[1] / v[3];
            v[2] = v[2] / v[3];
            return v;
        }

        const gradient = 1 / Math.tan((Math.PI - private.fov) * 0.5);
        const nearWidth = private.xScale * gradient;
        const farWidth = nearWidth + (private.zFar - private.zNear) * gradient;
        const t1 = t(private.worldTransform, -nearWidth, -nearWidth, private.zNear);
        const t2 = t(private.worldTransform, farWidth, farWidth, private.zFar);

        const t3 = t(public.worldToClipTransform, -nearWidth, -nearWidth, private.zNear);
        const t4 = t(public.worldToClipTransform, farWidth, farWidth, private.zFar);
        */
    }

    private.computeCameraTransforms();
    private.computePerspectiveTransform();

    public.moveToXY = function (x, y) {
        private.x = x;
        private.y = y;

        private.computeCameraTransforms();
        return public;
    }

    public.moveToZ = function (z) {
        private.z = z;

        private.computeCameraTransforms();
        private.computePerspectiveTransform();
        return public;
    }

    public.moveToXYZ = function (x, y, z) {
        private.x = x;
        private.y = y;
        private.z = z;

        private.computeCameraTransforms();
        private.computePerspectiveTransform();
        return public;
    }

    public.frustrum = function (fieldOfView, zNear, zFar) {
        private.fov = fieldOfView;
        private.zNear = zNear;
        private.zFar = zFar;

        private.computePerspectiveTransform();
        return public;
    }

    public.scaleX = function (x) {
        private.xScale = x;
        private.computeCameraTransforms();
        return public;
    }

    public.setViewport = function (gl) {
        gl.viewport(0, 0, gl.canvas.clientWidth, gl.canvas.clientHeight);
        gl.canvas.width = gl.canvas.clientWidth;
        gl.canvas.height = gl.canvas.clientHeight;

        return public.adjustToViewport(gl);
    };

    public.adjustToViewport = function (gl) {
        const aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;

        if (aspectRatio != private.aspectRatio) {
            private.aspectRatio = aspectRatio;
            private.computeCameraTransforms();
        }

        if (private.transformChanged) {
            private.computeTransform();
            private.transformChanged = false;
        }

        return public;
    }

    return public;
};
