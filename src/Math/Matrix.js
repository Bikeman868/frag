window.frag = window.frag || {};
window.frag.Matrix = {
    m3Identity: function () {
        return [
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        ];
    },

    m3Invert: function (a) {
        return a; // TODO: http://blog.acipo.com/matrix-inversion-in-javascript/
    },

    m3Transpose: function (a) {
        return [
            a[0], a[3], a[6],
            a[1], a[4], a[7],
            a[2], a[5], a[8],
        ];
    },

    m3Xm3: function (a, b) {
        const a00 = a[0 * 3 + 0];
        const a01 = a[0 * 3 + 1];
        const a02 = a[0 * 3 + 2];
        const a10 = a[1 * 3 + 0];
        const a11 = a[1 * 3 + 1];
        const a12 = a[1 * 3 + 2];
        const a20 = a[2 * 3 + 0];
        const a21 = a[2 * 3 + 1];
        const a22 = a[2 * 3 + 2];

        const b00 = b[0 * 3 + 0];
        const b01 = b[0 * 3 + 1];
        const b02 = b[0 * 3 + 2];
        const b10 = b[1 * 3 + 0];
        const b11 = b[1 * 3 + 1];
        const b12 = b[1 * 3 + 2];
        const b20 = b[2 * 3 + 0];
        const b21 = b[2 * 3 + 1];
        const b22 = b[2 * 3 + 2];
        return [
            b00 * a00 + b01 * a10 + b02 * a20,
            b00 * a01 + b01 * a11 + b02 * a21,
            b00 * a02 + b01 * a12 + b02 * a22,
            b10 * a00 + b11 * a10 + b12 * a20,
            b10 * a01 + b11 * a11 + b12 * a21,
            b10 * a02 + b11 * a12 + b12 * a22,
            b20 * a00 + b21 * a10 + b22 * a20,
            b20 * a01 + b21 * a11 + b22 * a21,
            b20 * a02 + b21 * a12 + b22 * a22,
        ];
    },

    m3Xv3: function (a, b) {
        const a00 = a[0 * 3 + 0];
        const a01 = a[0 * 3 + 1];
        const a02 = a[0 * 3 + 2];
        const a10 = a[1 * 3 + 0];
        const a11 = a[1 * 3 + 1];
        const a12 = a[1 * 3 + 2];
        const a20 = a[2 * 3 + 0];
        const a21 = a[2 * 3 + 1];
        const a22 = a[2 * 3 + 2];

        const b0 = b[0];
        const b1 = b[1];
        const b2 = b[2];

        return [
            b0 * a00 + b1 * a10 + b2 * a20,
            b0 * a01 + b1 * a11 + b2 * a21,
            b0 * a02 + b1 * a12 + b2 * a22,
        ];
    },

    m4Identity: function () {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
    },

    m4Invert: function (a) {
        // TODO: http://blog.acipo.com/matrix-inversion-in-javascript/
        return [
            a[0], a[4], a[8],
            a[1], a[5], a[9],
            a[2], a[6], a[10],
            a[3], a[7], a[11],
        ];
    },

    m4Transpose: function (a) {
        return [
            a[0], a[4], a[8], a[12],
            a[1], a[5], a[9], a[13],
            a[2], a[6], a[10], a[14],
            a[3], a[7], a[11], a[15],
        ];
    },

    m4Xm4: function (a, b) {
        const a00 = a[0 * 4 + 0];
        const a01 = a[0 * 4 + 1];
        const a02 = a[0 * 4 + 2];
        const a03 = a[0 * 4 + 3];
        const a10 = a[1 * 4 + 0];
        const a11 = a[1 * 4 + 1];
        const a12 = a[1 * 4 + 2];
        const a13 = a[1 * 4 + 3];
        const a20 = a[2 * 4 + 0];
        const a21 = a[2 * 4 + 1];
        const a22 = a[2 * 4 + 2];
        const a23 = a[2 * 4 + 3];
        const a30 = a[3 * 4 + 0];
        const a31 = a[3 * 4 + 1];
        const a32 = a[3 * 4 + 2];
        const a33 = a[3 * 4 + 3];

        const b00 = b[0 * 4 + 0];
        const b01 = b[0 * 4 + 1];
        const b02 = b[0 * 4 + 2];
        const b03 = b[0 * 4 + 3];
        const b10 = b[1 * 4 + 0];
        const b11 = b[1 * 4 + 1];
        const b12 = b[1 * 4 + 2];
        const b13 = b[1 * 4 + 3];
        const b20 = b[2 * 4 + 0];
        const b21 = b[2 * 4 + 1];
        const b22 = b[2 * 4 + 2];
        const b23 = b[2 * 4 + 3];
        const b30 = b[3 * 4 + 0];
        const b31 = b[3 * 4 + 1];
        const b32 = b[3 * 4 + 2];
        const b33 = b[3 * 4 + 3];

        return [
            b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
            b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
            b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
            b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
            b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
            b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
            b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
            b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
            b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
            b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
            b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
            b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
            b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
            b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
            b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
            b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
        ];
    },

    m4Xv4: function (a, b) {
        const c0r0 = a[0];
        const c0r1 = a[1];
        const c0r2 = a[2];
        const c0r3 = a[3];
        const c1r0 = a[4];
        const c1r1 = a[5];
        const c1r2 = a[6];
        const c1r3 = a[7];
        const c2r0 = a[8];
        const c2r1 = a[9];
        const c2r2 = a[10];
        const c2r3 = a[11];
        const c3r0 = a[12];
        const c3r1 = a[13];
        const c3r2 = a[14];
        const c3r3 = a[15];

        const b0 = b[0];
        const b1 = b[1];
        const b2 = b[2];
        const b3 = b[3];

        return [
            b0 * c0r0 + b1 * c1r0 + b2 * c2r0 + b3 * c3r0,
            b0 * c0r1 + b1 * c1r1 + b2 * c2r1 + b3 * c3r1,
            b0 * c0r2 + b1 * c1r2 + b2 * c2r2 + b3 * c3r2,
            b0 * c0r3 + b1 * c1r3 + b2 * c2r3 + b3 * c3r3,
        ];
    },
}
/*
// Unit tests framework

window.tests = window.tests || {};

window.tests.expectArray = function (name, expected, actual) {
    if (actual.length !== expected.length) console.log('Test ' + name + ' wrong length array');
    for (let i = 0; i < expected.length; i++) {
        if (Math.abs(expected[i] - actual[i]) > 0.001)
            console.log('Test ' + name + ' index ' + i + ' was ' + actual[i] + ' expecting ' + expected[i]);
    }
}

// Unit tests for matrix

window.tests.matrix = {
    t1: window.frag.Matrix.m4Transpose([
         1,  2,  3,  4,
         5,  6,  7,  8,
         9, 10, 11, 12,
        13, 14, 15, 16,
    ]),

    run: function (test) {
        window.tests.expectArray("Transpose matrix", test.t1, [
            1, 5,  9, 13,
            2, 6, 10, 14,
            3, 7, 11, 15,
            4, 8, 12, 16,
        ]);
    }
}

window.tests.matrix.run(window.tests.matrix);
*/