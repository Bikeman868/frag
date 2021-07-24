const expect = require('chai').expect;
let Matrix;

describe('Matrix', function () {
    before(() => {
        global.window = {};
        require('../src/Math/Matrix');
        Matrix = window.frag.Matrix;
    });

    describe('3x3', function () {
        it('can return the identity matrix', function () {
            const identity = Matrix.m3Identity();
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
            const transposed = Matrix.m3Transpose(original);
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
            const result = Matrix.m3Xm3(m1, m2);
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
            const result = Matrix.m3Xv3(m, v);
            expect(result).to.be.a('array');
            expect(result).to.have.length(3);
            expect(result).to.eql([84,90,96]);
        });
    });
    describe('4x4', function () {
        it('can return the identity matrix', function () {
            const identity = Matrix.m4Identity();
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
            const transposed = Matrix.m4Transpose(original);
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
            const result = Matrix.m4Xm4(m1, m2);
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
            const result = Matrix.m4Xv4(m, v);
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
            const inverted = Matrix.m4Invert(original);
            const result = Matrix.m4Xm4(original, inverted);
            expect(result).to.be.a('array');
            expect(result).to.eql(Matrix.m4Identity());
        });
    });
    describe('projections', function () {
        const project = function(projectionMatrix, x, y, z) {
            const shaderOutput = Matrix.m4Xv4(projectionMatrix, [x, y, z, 1]);
            // The OpenGL pipeline divides x,y,z by w to get screen coordinates and depth
            const w = shaderOutput[3];
            return [
                shaderOutput[0] / w,
                shaderOutput[1] / w,
                shaderOutput[2] / w
            ];
        }

        const expectProjection = function (projectionMatrix, wx, wy, wz, x, y, depth, desc) {
            expect(projectionMatrix).to.be.a('array', desc);
            expect(projectionMatrix).to.have.length(16, desc);

            const screen = project(projectionMatrix, wx, wy, wz)
            expect(screen[0]).to.be.approximately(x, 0.001, desc + " x");
            expect(screen[1]).to.be.approximately(y, 0.001, desc + " y");
            expect(screen[2]).to.be.approximately(depth, 0.001, desc + " depth");
        }

        it('can calculate orthographic projection', function () {
            const left = -10;
            const right = 10;
            const bottom = -10;
            const top = 10;
            const near = 50;
            const far = 100;
            const result = Matrix.orthographic(left, right, bottom, top, near, far);

            expectProjection(result, left, bottom, near, -1, -1, -1, "near bottom left");
            expectProjection(result, right, top, near, 1, 1, -1, "near top right");
            expectProjection(result, left, bottom, far, -1, -1, 1, "far bottom left");
            expectProjection(result, right, top, far, 1, 1, 1, "far top right");
        });
        it('can calculate frustum projection', function () {
            const left = -10;
            const right = 10;
            const bottom = -10;
            const top = 10;
            const near = 50;
            const far = 100;
            const result = Matrix.frustum(left, right, bottom, top, near, far);

            const scale = far / (far - near);
            expectProjection(result, left, bottom, near, -1, -1, -1, "near bottom left");
            expectProjection(result, right, top, near, 1, 1, -1, "near top right");
            expectProjection(result, left * scale, bottom * scale, far, -1, -1, 1, "far bottom left");
            expectProjection(result, right * scale, top * scale, far, 1, 1, 1, "near top right");
        });
        it('can calculate perspective projection', function () {
            const fovy = 35 * Math.PI / 180;
            const aspect = 1.5;
            const near = 50;
            const far = 100;
            const result = Matrix.perspective(fovy, aspect, near, far);
            expect(result).to.be.a('array');

            const scale = far / (far - near);
            const top = near * Math.tan(fovy);
            const bottom = -top;
            const right = top * aspect;
            const left = -right;
            expectProjection(result, left, bottom, near, -1, -1, -1, "near bottom left");
            expectProjection(result, right, top, near, 1, 1, -1, "near top right");
            expectProjection(result, left * scale, bottom * scale, far, -1, -1, 1, "far bottom left");
            expectProjection(result, right * scale, top * scale, far, 1, 1, 1, "near top right");
        });
    });
});
