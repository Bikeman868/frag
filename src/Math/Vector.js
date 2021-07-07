﻿window.frag = window.frag || {};
window.frag.Vector = {
    extract2D: function (array, offset) {
        if (!array) return null;
        return [array[offset], array[offset + 1]];
    },
    extract3D: function (array, offset) {
        if (!array) return null;
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
    eulerAngles: function(directionVector, upVector) {
        const Vector = window.frag.Vector;
        if (!upVector) upVector = [0, 1, 0];

        const dir = Vector.normalize(directionVector);
        const up = Vector.normalize(upVector);

        const pitch = Math.asin(dir[1]);
        const yaw = Math.atan2(dir[0], dir[2]);

        const wingDir = [-dir[2], 0, dir[0]];
        const vertical = Vector.cross(wingDir, dir);
        const roll = Math.atan2(Vector.dot(wingDir, up), Vector.dot(vertical, up));

        return [roll, yaw, pitch];
    }
}
