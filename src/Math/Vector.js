window.frag = window.frag || {};
window.frag.Vector = {
    extract2D: function (array, offset) {
        if (!array) return null;
        offset = offset || 0;
        return [array[offset], array[offset + 1]];
    },
    extract3D: function (array, offset) {
        if (!array) return null;
        offset = offset || 0;
        return [array[offset], array[offset + 1], array[offset + 2]];
    },
    zero: function (dimensions) {
        const vector = [0, 0, 0, 0, 0];
        vector.length = dimensions;
        return vector;
    },
    add: function (a, b) {
        const result = [];
        if (Array.isArray(b))
            for (let i = 0; i < a.length; i++) result.push(a[i] + b[i]);
        else
            for (let i = 0; i < a.length; i++) result.push(a[i] + b);
        return result;
    },
    sub: function (a, b) {
        const result = [];
        if (Array.isArray(b))
            for (let i = 0; i < a.length; i++) result.push(a[i] - b[i]);
        else
            for (let i = 0; i < a.length; i++) result.push(a[i] - b);
        return result;
    },
    mult: function (a, b) {
        const result = [];
        if (Array.isArray(b))
            for (let i = 0; i < a.length; i++) result.push(a[i] * b[i]);
        else
            for (let i = 0; i < a.length; i++) result.push(a[i] * b);
        return result;
    },
    div: function (a, b) {
        const result = [];
        if (Array.isArray(b))
            for (let i = 0; i < a.length; i++) result.push(a[i] / b[i]);
        else
            for (let i = 0; i < a.length; i++) result.push(a[i] / b);
        return result;
    },
    length: function (a) {
        let sum = 0;
        for (let i = 0; i < a.length; i++) sum += a[i] * a[i];
        return Math.sqrt(sum);
    },
    average: function (a, b) {
        const result = [];
        for (let i = 0; i < a.length; i++) result.push((a[i] + b[i]) * 0.5);
        return result;
    },
    cross: function (a, b) {
        return [
            a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0],
        ];
    },
    dot: function (a, b) {
        let result = 0;
        for (let i = 0; i < a.length; i++)
            result += a[i] * b[i];
        return result;
    },
    normalize: function (a) {
        const length = window.frag.Vector.length(a);
        if (length < 1e-5) return a;

        const result = [];
        for (let i = 0; i < a.length; i++) result.push(a[i] / length);
        return result;
    },
    append: function(a, v) {
        for (let i = 0; i < v.length; i++) a.push(v[i]);
    },
    // Calculates pitch, yaw and roll relative to +Z axis (when Y is up)
    // Imagine that you have a plane flying along the Z-axis in the positive direction
    // and you want to head in a particular direction, this method will calculate
    // how much to rotate the plane by around the x, y and z axes to point in this direction
    // Pitch is a rotation around the x-axis
    // Yaw is a rotation around the y-axis
    // Roll is a rotation around the z-axis
    heading: function(directionVector, upVector) {
        const Vector = window.frag.Vector;
        if (!upVector) upVector = [0, 1, 0];

        const dir = Vector.normalize(directionVector);
        const up = Vector.normalize(upVector);

        const z = Math.asin(dir[1]);
        const y = Math.atan2(dir[0], dir[2]);

        const wingDir = [-dir[2], 0, dir[0]];
        const vertical = Vector.cross(wingDir, dir);
        const x = Math.atan2(Vector.dot(wingDir, up), Vector.dot(vertical, up));

        return [x, y, z];
    },
    quaternion: function(euler) {
        return window.frag.Vector.quaternionXYZ(
            euler[0],
            euler[1],
            euler[2]
        );
    },
    quaternionXYZ: function(x, y, z) {
        const cr = Math.cos(x * 0.5);
        const sr = Math.sin(x * 0.5);
        const cp = Math.cos(y * 0.5);
        const sp = Math.sin(y * 0.5);
        const cy = Math.cos(z * 0.5);
        const sy = Math.sin(z * 0.5);
    
        const qw = cr * cp * cy + sr * sp * sy;
        const qx = sr * cp * cy - cr * sp * sy;
        const qy = cr * sp * cy + sr * cp * sy;
        const qz = cr * cp * sy - sr * sp * cy;

        return [qx, qy, qz, qw];
    },
    euler: function(quaternion) {
        return window.frag.Vector.eulerXYZW(
            quaternion[0],
            quaternion[1],
            quaternion[2],
            quaternion[3]
        );
    },
    eulerXYZW: function(x, y, z, w) {
        const sinr_cosp = 2 * (w * x + y * z);
        const cosr_cosp = 1 - 2 * (x * x + y * y);
        const eulerX = Math.atan2(sinr_cosp, cosr_cosp);
    
        const sinp = 2 * (w * y - z * x);
        const eulerY = Math.abs(sinp) >= 1
            ? (Math.PI * (sinp > 0 ? 0.5 : -0.5))
            : Math.asin(sinp);
    
        const siny_cosp = 2 * (w * z + x * y);
        const cosy_cosp = 1 - 2 * (y * y + z * z);
        const eulerZ = Math.atan2(siny_cosp, cosy_cosp);

        return [eulerX, eulerY, eulerZ];
    }
}
