// Represents a location, scale and orientation
window.frag.Location = function (engine, is3d) {
    const public = {
        is3d,
        isModified: false,
        matrix: null,
        translateX: 0,
        translateY: 0,
        translateZ: 0,
        scaleX: 1,
        scaleY: 1,
        scaleZ: 1,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0
    };

    public.dispose = function () {
    }

    public.clone = function() {
        const clone = window.frag.Location(engine, public.is3d);
        clone.isModified = public.isModified;
        clone.matrix = public.matrix;
        clone.translateX = public.translateX;
        clone.translateY = public.translateY;
        clone.translateZ = public.translateZ;
        clone.scaleX = public.scaleX;
        clone.scaleY = public.scaleY;
        clone.scaleZ = public.scaleZ;
        clone.rotateX = public.rotateX;
        clone.rotateY = public.rotateY;
        clone.rotateZ = public.rotateZ;
        return clone;
    }

    public.add = function(other) {
        public.translateX += other.translateX;
        public.translateY += other.translateY;
        public.translateZ += other.translateZ;
        public.scaleX *= other.scaleX;
        public.scaleY *= other.scaleY;
        public.scaleZ *= other.scaleZ;
        public.rotateX += other.rotateX;
        public.rotateY += other.rotateY;
        public.rotateZ += other.rotateZ;
        public.isModified = true;
        return public;
    }

    public.getMatrix = function () {
        if (public.matrix && !public.isModified)
            return public.matrix;

        let transform;
        if (public.is3d) {
            transform = window.frag.Transform(engine)
                .translateXYZ(public.translateX, public.translateY, public.translateZ)
                .rotateXYZ(public.rotateX, public.rotateY, public.rotateZ)
                .scaleXYZ(public.scaleX, public.scaleY, public.scaleZ);
        } else {
            transform = window.frag.Transform2D(engine)
                .translateXY(public.translateX, public.translateY)
                .rotate(public.rotateZ)
                .scaleXY(public.scaleX, public.scaleY);
        }

        public.matrix = transform.getMatrix();
        public.isModified = false;

        return public.matrix;
    }

    return public;
}