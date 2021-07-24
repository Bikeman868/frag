const expect = require('chai').expect;

describe('Vector', function () {
    before(() => {
        global.window = {};
        require('../src/Math/Vector');
    });

    describe('2-dimensional', function () {
        it('can extract 2D vector', function () {
            const buffer = [1, 2, 3, 4, 5, 6, 7, 8];
            const vector = window.frag.Vector.extract2D(buffer, 3);
            expect(vector).to.be.a('array');
            expect(vector).to.have.length(2);
            expect(vector).to.eql([4, 5]);
        });
        it('can initialize a vector', function () {
            const vector = window.frag.Vector.zero(2);
            expect(vector).to.be.a('array');
            expect(vector).to.have.length(2);
            expect(vector).to.eql([0, 0]);
        });
        it('can calculate length', function () {
            const length = window.frag.Vector.length([3, 4]);
            expect(length).to.equal(5);
        });
        it('can normalize', function () {
            const vector = window.frag.Vector.normalize([16, 5]);
            expect(vector).to.be.a('array');
            expect(vector).to.have.length(2);
            const length = window.frag.Vector.length(vector);
            expect(length).to.be.approximately(1, 0.0001);
            expect(vector[0] / vector[1]).to.be.approximately(16/5, 0.0001);
        });
    });
    describe('3-dimensional', function () {
        it('can extract 3D vector', function () {
            const buffer = [1, 2, 3, 4, 5, 6, 7, 8];
            const vector = window.frag.Vector.extract3D(buffer, 3);
            expect(vector).to.be.a('array');
            expect(vector).to.have.length(3);
            expect(vector).to.eql([4, 5, 6]);
        });
        it('can initialize a vector', function () {
            const vector = window.frag.Vector.zero(3);
            expect(vector).to.be.a('array');
            expect(vector).to.have.length(3);
            expect(vector).to.eql([0, 0, 0]);
        });
        it('can calculate length', function () {
            const length = window.frag.Vector.length([2, 3, 6]);
            expect(length).to.equal(7);
        });
        it('can normalize', function () {
            const vector = window.frag.Vector.normalize([16, 5, 10]);
            expect(vector).to.be.a('array');
            expect(vector).to.have.length(3);
            const length = window.frag.Vector.length(vector);
            expect(length).to.be.approximately(1, 0.0001);
            expect(vector[0] / vector[1]).to.be.approximately(16/5, 0.0001);
            expect(vector[0] / vector[2]).to.be.approximately(16/10, 0.0001);
        });
        it('can calculate pitch, yaw and roll in X', function () {
            const angles = window.frag.Vector.heading([1, 0, 0], [0, 1, 0]);
            expect(angles).to.be.a('array');
            expect(angles).to.have.length(3);
            expect(angles[0]).to.be.approximately(0, 0.0001, "pitch");
            expect(angles[1]).to.be.approximately(Math.PI / 2, 0.0001, "yaw");
            expect(angles[2]).to.be.approximately(0, 0.0001, "roll");
        });
        it('can calculate pitch, yaw and roll in Z', function () {
            const angles = window.frag.Vector.heading([0, 0, 1], [0, 1, 0]);
            expect(angles).to.be.a('array');
            expect(angles).to.have.length(3);
            expect(angles[0]).to.be.approximately(0, 0.0001, "pitch");
            expect(angles[1]).to.be.approximately(0, 0.0001, "yaw");
            expect(angles[2]).to.be.approximately(0, 0.0001, "roll");
        });
    });
});
