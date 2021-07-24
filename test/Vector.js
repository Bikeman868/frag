const expect = require('chai').expect;
let Vector;

describe('Vector', function () {
    before(() => {
        global.window = {};
        require('../src/Math/Vector');
        Vector = window.frag.Vector;
    });

    describe('2-dimensional', function () {
        it('can extract 2D vector', function () {
            const buffer = [1, 2, 3, 4, 5, 6, 7, 8];
            const vector = Vector.extract2D(buffer, 3);
            expect(vector).to.be.a('array');
            expect(vector).to.have.length(2);
            expect(vector).to.eql([4, 5]);
        });
        it('can initialize a vector', function () {
            const vector = Vector.zero(2);
            expect(vector).to.be.a('array');
            expect(vector).to.have.length(2);
            expect(vector).to.eql([0, 0]);
        });
        it('can calculate length', function () {
            const length = Vector.length([3, 4]);
            expect(length).to.equal(5);
        });
        it('can normalize', function () {
            const vector = Vector.normalize([16, 5]);
            expect(vector).to.be.a('array');
            expect(vector).to.have.length(2);
            const length = Vector.length(vector);
            expect(length).to.be.approximately(1, 0.0001);
            expect(vector[0] / vector[1]).to.be.approximately(16/5, 0.0001);
        });
    });
    describe('3-dimensional', function () {
        it('can extract 3D vector', function () {
            const buffer = [1, 2, 3, 4, 5, 6, 7, 8];
            const vector = Vector.extract3D(buffer, 3);
            expect(vector).to.be.a('array');
            expect(vector).to.have.length(3);
            expect(vector).to.eql([4, 5, 6]);
        });
        it('can initialize a vector', function () {
            const vector = Vector.zero(3);
            expect(vector).to.be.a('array');
            expect(vector).to.have.length(3);
            expect(vector).to.eql([0, 0, 0]);
        });
        it('can calculate length', function () {
            const length = Vector.length([2, 3, 6]);
            expect(length).to.equal(7);
        });
        it('can normalize', function () {
            const vector = Vector.normalize([16, 5, 10]);
            expect(vector).to.be.a('array');
            expect(vector).to.have.length(3);
            const length = Vector.length(vector);
            expect(length).to.be.approximately(1, 0.0001);
            expect(vector[0] / vector[1]).to.be.approximately(16/5, 0.0001);
            expect(vector[0] / vector[2]).to.be.approximately(16/10, 0.0001);
        });
        it('can calculate pitch, yaw and roll in X', function () {
            const heading = Vector.heading([1, 0, 0], [0, 1, 0]);
            expect(heading).to.be.a('array');
            expect(heading).to.have.length(3);
            expect(heading[0]).to.be.approximately(0, 0.0001, "pitch");
            expect(heading[1]).to.be.approximately(Math.PI / 2, 0.0001, "yaw");
            expect(heading[2]).to.be.approximately(0, 0.0001, "roll");
        });
        it('can calculate pitch, yaw and roll in Z', function () {
            const heading = Vector.heading([0, 0, 1], [0, 1, 0]);
            expect(heading).to.be.a('array');
            expect(heading).to.have.length(3);
            expect(heading[0]).to.be.approximately(0, 0.0001, "pitch");
            expect(heading[1]).to.be.approximately(0, 0.0001, "yaw");
            expect(heading[2]).to.be.approximately(0, 0.0001, "roll");
        });
    });
});
