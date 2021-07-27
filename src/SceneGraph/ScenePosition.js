// This class provides a set of helper methods for
// manipulating a Location object
window.frag.ScenePosition = function (engine, location, is3d) {
    const private = {
        location: null,
    };

    const public = {
        __private: private,
        observableLocation: window.frag.Observable(
            engine, 
            (observer) => { 
                observer(private.location);
            }),
    };

    public.dispose = function () {
    }

    private.modified = function() {
        private.location.isModified = true;
        public.observableLocation.notify();
    }

    public.setLocation = function (value) {
        private.location = value || window.frag.Location(engine, is3d === undefined ? true : is3d);
        return public;
    }
    public.setLocation(location);

    public.getMatrix = function () {
        return private.location.getMatrix();
    }

    public.getScale = function() {
        return [
            private.location.scaleX,
            private.location.scaleY,
            private.location.scaleZ
        ];
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
        private.modified();
        return public;
    }

    public.scaleXYZ = function (x, y, z) {
        private.location.scaleX = x;
        private.location.scaleY = y;
        private.location.scaleZ = z;
        private.modified();
        return public;
    }

    public.scaleX = function (x) {
        private.location.scaleX = x;
        private.modified();
        return public;
    }

    public.scaleY = function (y) {
        private.location.scaleY = y;
        private.modified();
        return public;
    }

    public.scaleZ = function (z) {
        private.location.scaleZ = z;
        private.modified();
        return public;
    }

    public.scaleBy = function(scales){
        return public.scaleXYZ(
            private.location.scaleX * scales[0],
            private.location.scaleY * scales[1],
            private.location.scaleZ * scales[2]);
    }

    public.scaleByXYZ = function(xScale, yScale, zScale){
        return public.scaleXYZ(
            private.location.scaleX * xScale,
            private.location.scaleY * yScale,
            private.location.scaleZ * zScale);
    }

    public.getRotate = function() {
        return [
            private.location.rotateX,
            private.location.rotateY,
            private.location.rotateZ
        ];
    }

    public.getQuaternion = function() {
        // TODO
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
        if (v.length === 4) {
            // Quaternion
            // TODO
        } else {
            private.location.rotateX = v[0];
            if (v.length > 1) private.location.rotateY = v[1];
            if (v.length > 2) private.location.rotateZ = v[2];
        }
        private.modified();
        return public;
    }

    public.rotateXYZ = function (x, y, z) {
        private.location.rotateX = x;
        private.location.rotateY = y;
        private.location.rotateZ = z;
        private.modified();
        return public;
    }

    public.rotateX = function (x) {
        private.location.rotateX = x;
        private.modified();
        return public;
    }

    public.rotateY = function (y) {
        private.location.rotateY = y;
        private.modified();
        return public;
    }

    public.rotateZ = function (z) {
        private.location.rotateZ = z;
        private.modified();
        return public;
    }

    public.rotateBy = function(euler){
        return public.rotateXYZ(
            private.location.rotateX + euler[0],
            private.location.rotateY + euler[1],
            private.location.rotateZ + euler[2]);
    }

    public.rotateByXYZ = function(x, y, z){
        return public.rotateXYZ(
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
        private.modified();
        return public;
    }

    public.locationXYZ = function (x, y, z) {
        private.location.translateX = x;
        private.location.translateY = y;
        private.location.translateZ = z;
        private.modified();
        return public;
    }

    public.locationX = function (x) {
        private.location.translateX = x;
        private.modified();
        return public;
    }

    public.locationY = function (y) {
        private.location.translateY = y;
        private.modified();
        return public;
    }

    public.locationZ = function (z) {
        private.location.translateZ = z;
        private.modified();
        return public;
    }

    public.moveBy = function(direction){
        return public.locationXYZ(
            private.location.translateX + direction[0],
            private.location.translateY + direction[1],
            private.location.translateZ + direction[2]);
    }

    public.moveByXYZ = function(x, y, z){
        return public.locationXYZ(
            private.location.translateX + x,
            private.location.translateY + y,
            private.location.translateZ + z);
    }

    return public;
};