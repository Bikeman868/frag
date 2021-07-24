const expect = require('chai').expect;

describe('Matrix', function () {
    before(() => {
        global.window = {};
        require('../src/Math/Matrix');
    });

    describe('3x3', function () {
        it('can return the identity matrix', function () {
            const identity = window.frag.Matrix.m3Identity();
            expect(identity).to.be.a('array');
            expect(identity).to.have.length(9);
            expect(identity).to.eql([
                1,0,0,
                0,1,0,
                0,0,1]);
        });
        it('can transpose a matrix', function () {
            const original = [
                1,2,3,
                4,5,6,
                7,8,9];
            const transposed = window.frag.Matrix.m3Transpose(original);
            expect(transposed).to.be.a('array');
            expect(transposed).to.have.length(9);
            expect(transposed).to.eql([
                1,4,7,
                2,5,8,
                3,6,9]);
        });
        it('can multiply matrixes', function () {
            const m1 = [
                10,11,12,
                13,14,15,
                16,17,18];
            const m2 = [
                20,21,22,
                23,24,25,
                26,27,18];
            const result = window.frag.Matrix.m3Xm3(m1, m2);
            expect(result).to.be.a('array');
            expect(result).to.have.length(9);
            expect(result).to.eql([
                825,888,951,
                942,1014,1086,
                899,970,1041]);
        });
        it('can multiply a matrix by a vector', function () {
            const m = [
                10,11,12,
                13,14,15,
                16,17,18];
            const v = [1,2,3];
            const result = window.frag.Matrix.m3Xv3(m, v);
            expect(result).to.be.a('array');
            expect(result).to.have.length(3);
            expect(result).to.eql([84,90,96]);
        });
    });
    describe('4x4', function () {
        it('can return the identity matrix', function () {
            const identity = window.frag.Matrix.m4Identity();
            expect(identity).to.be.a('array');
            expect(identity).to.have.length(16);
            expect(identity).to.eql([
                1,0,0,0,
                0,1,0,0,
                0,0,1,0,
                0,0,0,1]);
        });
        it('can transpose a matrix', function () {
            const original = [
                1,2,3,4,
                5,6,7,8,
                9,10,11,12,
                13,14,15,16];
            const transposed = window.frag.Matrix.m4Transpose(original);
            expect(transposed).to.be.a('array');
            expect(transposed).to.have.length(16);
            expect(transposed).to.eql([
                1,5, 9,13,
                2,6,10,14,
                3,7,11,15,
                4,8,12,16]);
        });
        it('can multiply matrixes', function () {
            const m1 = [
                10,11,12,13,
                14,15,16,17,
                18,19,20,21,
                22,23,24,25];
            const m2 = [
                30,31,32,33,
                34,35,36,37,
                38,39,40,41,
                42,43,44,45];
            const result = window.frag.Matrix.m4Xm4(m1, m2);
            expect(result).to.be.a('array');
            expect(result).to.have.length(16);
            expect(result).to.eql([
                2036,2162,2288,2414,
                2292,2434,2576,2718,
                2548,2706,2864,3022,
                2804,2978,3152,3326]);
        });
        it('can multiply a matrix by a vector', function () {
            const m = [
                10,11,12,13,
                14,15,16,17,
                18,19,20,21,
                22,23,24,25];
            const v = [1,2,3,4];
            const result = window.frag.Matrix.m4Xv4(m, v);
            expect(result).to.be.a('array');
            expect(result).to.have.length(4);
            expect(result).to.eql([180,190,200,210]);
        });
        it('can invert a matrix', function () {
            const original = [
                 5, 0, 0, 0,
                 0.5, 6, 0, 0,
                 0, 0, 7, 0,
                15,-4,12, 8];
            const inverted = window.frag.Matrix.m4Invert(original);
            const result = window.frag.Matrix.m4Xm4(original, inverted);
            expect(result).to.be.a('array');
            expect(result).to.eql(window.frag.Matrix.m4Identity());
        });
        it('can calculate orthographic projection', function () {
            const left = -10;
            const right = 10;
            const bottom = -10;
            const top = 10;
            const near = 50;
            const far = 100;
            const result = window.frag.Matrix.orthographic(left, right, bottom, top, near, far);
            expect(result).to.be.a('array');
            expect(result).to.eql([
                0.1,   0,     0, 0,
                  0, 0.1,     0, 0,
                  0,   0, -0.04, 0,
                 -0,  -0,    -3, 1]
            );
        });
        it('can calculate frustum projection', function () {
            const left = -10;
            const right = 10;
            const bottom = -10;
            const top = 10;
            const near = 50;
            const far = 100;
            const result = window.frag.Matrix.frustum(left, right, bottom, top, near, far);
            expect(result).to.be.a('array');
            expect(result).to.eql([
                  5,  0,    0,   0,
                  0,  5,    0,   0,
                  0,  0,   -3,  -1,
                  0,  0, -200,   0]
            );
        });
        it('can calculate perspective projection', function () {
            const fov = 30 * Math.PI / 180;
            const aspect = 1.5;
            const near = 50;
            const far = 100;
            const result = window.frag.Matrix.perspective(fov, aspect, near, far);
            for (var i = 0; i < 16; i++) result[i] = Math.round(result[i] * 100) / 100;
            expect(result).to.be.a('array');
            expect(result).to.eql([
                145.9,      0,    0,  0,
                    0, 218.85,    0,  0,
                    0,      0,   -3, -1,
                    0,      0, -200,  0]
            );
        });
    });
});
