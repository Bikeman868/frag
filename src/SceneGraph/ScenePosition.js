// This class provides a set of helper methods for
// manipulating a Location object
window.frag.ScenePosition = function (engine, location) {
    const private = {
        location: null,
    };

    const public = {
        __private: private,
    };

    public.dispose = function () {
    }

    public.setLocation = function (value) {
        private.location = value || window.frag.Location(engine);
        return public;
    }
    public.setLocation(location);

    public.getMatrix = function () {
        return private.location.getMatrix();
    }

    public.getScaleX = function () {
        return private.location.scaleX;
    }

    public.getScaleY = function () {
        return private.location.scaleY;
    }

    public.getScaleZ = function () {
        return private.location.scaleZ;
    }

    public.scale = function (s) {
        private.location.scaleX = s;
        private.location.scaleY = s;
        private.location.scaleZ = s;
        private.location.isModified = true;
        return public;
    }

    public.scaleXYZ = function (x, y, z) {
        private.location.scaleX = x;
        private.location.scaleY = y;
        private.location.scaleZ = z;
        private.location.isModified = true;
        return public;
    }

    public.scaleX = function (x) {
        private.location.scaleX = x;
        private.location.isModified = true;
        return public;
    }

    public.scaleY = function (y) {
        private.location.scaleY = y;
        private.location.isModified = true;
        return public;
    }

    public.scaleZ = function (z) {
        private.location.scaleZ = z;
        private.location.isModified = true;
        return public;
    }

    public.scaleBy = function(scales){
        public.scaleXYZ(
            private.location.scaleX * scales[0],
            private.location.scaleY * scales[1],
            private.location.scaleZ * scales[2]);
    }

    public.scaleByXYZ = function(xScale, yScale, zScale){
        public.scaleXYZ(
            private.location.scaleX * xScale,
            private.location.scaleY * yScale,
            private.location.scaleZ * zScale);
    }

    public.getRotateX = function () {
        return private.location.rotateX;
    }

    public.getRotateY = function () {
        return private.location.rotateY;
    }

    public.getRotateZ = function () {
        return private.location.rotateZ;
    }

    public.getRotate = function() {
        if (private.location.is3d)
            return [private.location.rotateX, private.location.rotateY, private.location.rotateZ];
        else
            return [private.location.rotateX, private.location.rotateY];
    }

    public.rotate = function(v) {
        private.location.rotateX = v[0];
        if (v.length > 1) private.location.rotateY = v[1];
        if (v.length > 2) private.location.rotateZ = v[2];
        private.location.isModified = true;
        return public;
    }

    public.rotateXYZ = function (x, y, z) {
        private.location.rotateX = x;
        private.location.rotateY = y;
        private.location.rotateZ = z;
        private.location.isModified = true;
        return public;
    }

    public.rotateX = function (x) {
        private.location.rotateX = x;
        private.location.isModified = true;
        return public;
    }

    public.rotateY = function (y) {
        private.location.rotateY = y;
        private.location.isModified = true;
        return public;
    }

    public.rotateZ = function (z) {
        private.location.rotateZ = z;
        private.location.isModified = true;
        return public;
    }

    public.rotateBy = function(euler){
        public.rotateXYZ(
            private.location.rotateX + euler[0],
            private.location.rotateY + euler[1],
            private.location.rotateZ + euler[2]);
    }

    public.rotateByXYZ = function(x, y, z){
        public.rotateXYZ(
            private.location.rotateX + x,
            private.location.rotateY + y,
            private.location.rotateZ + z);
    }

    public.getLocationX = function () {
        return private.location.translateX;
    }

    public.getLocationY = function () {
        return private.location.translateY;
    }

    public.getLocationZ = function () {
        return private.location.translateZ;
    }

    public.getLocation = function() {
        if (private.location.is3d)
            return [private.location.translateX, private.location.translateY, private.location.translateZ];
        else
            return [private.location.translateX, private.location.translateY];
    }

    public.location = function(v) {
        private.location.translateX = v[0];
        if (v.length > 1) private.location.translateY = v[1];
        if (v.length > 2) private.location.translateZ = v[2];
        private.location.isModified = true;
        return public;
    }

    public.locationXYZ = function (x, y, z) {
        private.location.translateX = x;
        private.location.translateY = y;
        private.location.translateZ = z;
        private.location.isModified = true;
        return public;
    }

    public.locationX = function (x) {
        private.location.translateX = x;
        private.location.isModified = true;
        return public;
    }

    public.locationY = function (y) {
        private.location.translateY = y;
        private.location.isModified = true;
        return public;
    }

    public.locationZ = function (z) {
        private.location.translateZ = z;
        private.location.isModified = true;
        return public;
    }

    public.moveBy = function(direction){
        public.locationXYZ(
            private.location.translateX + direction[0],
            private.location.translateY + direction[1],
            private.location.translateZ + direction[2]);
    }

    public.moveByXYZ = function(x, y, z){
        public.locationXYZ(
            private.location.translateX + x,
            private.location.translateY + y,
            private.location.translateZ + z);
    }

    return public;
};