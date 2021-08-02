window.frag = window.frag || {};
window.frag.Quaternion = {
    // Returns a quaternion that rotates around the X-axis
    rotationX: function(angle) {
        return [Math.sin(angle / 2), 0, 0, Math.cos(angle / 2)];
    },
    // Returns a quaternion that rotates around the Y-axis
    rotationY: function(angle) {
        return [0, Math.sin(angle / 2), 0, Math.cos(angle / 2)];
    },
    // Returns a quaternion that rotates around the Z-axis
    rotationZ: function(angle) {
        return [0, 0, Math.sin(angle / 2), Math.cos(angle / 2)];
    },
    // Creates a quaternion which rotates around the given axis by the given angle.
    axisRotation: function(axis, angle) {
        var d = 1 / Math.sqrt(axis[0] * axis[0] +
                              axis[1] * axis[1] +
                              axis[2] * axis[2]);
        var sin = Math.sin(angle / 2);
        var cos = Math.cos(angle / 2);
        return [sin * axis[0] * d, sin * axis[1] * d, sin * axis[2] * d, cos];
    },
    // Returns a unit length quaternion
    normalize: function(q) {
        var d = 1 / Math.sqrt(q[0] * q[0] + q[1] * q[1] + q[2] * q[2] + q[3] * q[3]);
        return [q[0] * d, q[1] * d, q[2] * d, q[3] * d];
    },
    // Computes a 4x4 matrix that performs a Quaternion rotation
    toMatrix: function(q) {
        var qX = q[0];
        var qY = q[1];
        var qZ = q[2];
        var qW = q[3];
      
        var qWqW = qW * qW;
        var qWqX = qW * qX;
        var qWqY = qW * qY;
        var qWqZ = qW * qZ;
        var qXqW = qX * qW;
        var qXqX = qX * qX;
        var qXqY = qX * qY;
        var qXqZ = qX * qZ;
        var qYqW = qY * qW;
        var qYqX = qY * qX;
        var qYqY = qY * qY;
        var qYqZ = qY * qZ;
        var qZqW = qZ * qW;
        var qZqX = qZ * qX;
        var qZqY = qZ * qY;
        var qZqZ = qZ * qZ;
      
        var d = qWqW + qXqX + qYqY + qZqZ;
      
        return [
          [(qWqW + qXqX - qYqY - qZqZ) / d,
           2 * (qWqZ + qXqY) / d,
           2 * (qXqZ - qWqY) / d, 0],
          [2 * (qXqY - qWqZ) / d,
           (qWqW - qXqX + qYqY - qZqZ) / d,
           2 * (qWqX + qYqZ) / d, 0],
          [2 * (qWqY + qXqZ) / d,
           2 * (qYqZ - qWqX) / d,
           (qWqW - qXqX - qYqY + qZqZ) / d, 0],
          [0, 0, 0, 1]];
      },
}
