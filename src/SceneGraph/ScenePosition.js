window.frag.ScenePosition = function (transform) {
    const private = {
        scale: {
            x: 1,
            y: 1,
            z: 1
        },
        rotation: {
            x: 0,
            y: 0,
            z: 0
        },
        translation: {
            x: 0,
            y: 0,
            z: 0
        },
        transform: transform,
        isDirty: true
    };

    const public = {
        __private: private,
    };

    private.ensureTransform = function () {
        if (!private.isDirty) return;
        private.isDirty = false;
        if (private.transform.is3d) {
            private.transform
                .identity()
                .translateXYZ(private.translation.x, private.translation.y, private.translation.z)
                .rotateXYZ(private.rotation.x, private.rotation.y, private.rotation.z)
                .scaleXYZ(private.scale.x, private.scale.y, private.scale.z);
        } else {
            private.transform
                .identity()
                .translateXY(private.translation.x, private.translation.y)
                .rotate(private.rotation.z)
                .scaleXY(private.scale.x, private.scale.y);
        }
    }

    public.transform = function (value) {
        private.transform = value;
        private.isDirty = true;
        return public;
    }

    public.getTransform = function () {
        private.ensureTransform();
        return private.transform;
    }

    public.getScaleX = function () {
        return private.scale.x;
    }

    public.getScaleY = function () {
        return private.scale.y;
    }

    public.getScaleZ = function () {
        return private.scale.z;
    }

    public.scale = function (s) {
        private.scale.x = s;
        private.scale.y = s;
        private.scale.z = s;
        private.isDirty = true;
        return public;
    }

    public.scaleXYZ = function (x, y, z) {
        private.scale.x = x;
        private.scale.y = y;
        private.scale.z = z;
        private.isDirty = true;
        return public;
    }

    public.scaleX = function (x) {
        private.scale.x = x;
        private.isDirty = true;
        return public;
    }

    public.scaleY = function (y) {
        private.scale.y = y;
        private.isDirty = true;
        return public;
    }

    public.scaleZ = function (z) {
        private.scale.z = z;
        private.isDirty = true;
        return public;
    }

    public.getRotateX = function () {
        return private.rotation.x;
    }

    public.getRotateY = function () {
        return private.rotation.y;
    }

    public.getRotateZ = function () {
        return private.rotation.z;
    }

    public.rotateXYZ = function (x, y, z) {
        private.rotation.x = x;
        private.rotation.y = y;
        private.rotation.z = z;
        private.isDirty = true;
        return public;
    }

    public.rotateX = function (x) {
        private.rotation.x = x;
        private.isDirty = true;
        return public;
    }

    public.rotateY = function (y) {
        private.rotation.y = y;
        private.isDirty = true;
        return public;
    }

    public.rotateZ = function (z) {
        private.rotation.z = z;
        private.isDirty = true;
        return public;
    }

    public.getTranslateX = function () {
        return private.translation.x;
    }

    public.getTranslateY = function () {
        return private.translation.y;
    }

    public.getTranslateZ = function () {
        return private.translation.z;
    }

    public.translateXYZ = function (x, y, z) {
        private.translation.x = x;
        private.translation.y = y;
        private.translation.z = z;
        private.isDirty = true;
        return public;
    }

    public.translateX = function (x) {
        private.translation.x = x;
        private.isDirty = true;
        return public;
    }

    public.translateY = function (y) {
        private.translation.y = y;
        private.isDirty = true;
        return public;
    }

    public.translateZ = function (z) {
        private.translation.z = z;
        private.isDirty = true;
        return public;
    }

    return public;
};