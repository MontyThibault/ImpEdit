var Axis = require('../src/axis.js');
var assert = require('assert');

describe('Axis', function() {

	var axis;

	describe('graphToCanvas', function() {

		

		it('should map extremes to 1/0 in both cases max > min and max < min', function() {

			axis = new Axis(true, 10, 20);

			assert.equal(axis.graphToCanvas(axis.max), 1);
			assert.equal(axis.graphToCanvas(axis.min), 0);

			axis.min = 30;

			assert.equal(axis.graphToCanvas(axis.max), 1);
			assert.equal(axis.graphToCanvas(axis.min), 0);

		});

	});


	describe('canvasToGraph', function() {

		

		it('should be the inverse of graphToCanvas', function() {

			axis = new Axis(true, 10, 20);

			assert.equal(axis.canvasToGraph(axis.graphToCanvas(100)), 100);
			assert.equal(axis.canvasToGraph(axis.graphToCanvas(0)), 0);

		});

	});


	describe('orientation', function() {


		it('should flip context x/y coordinates with objects of opposite orientation', function() {

			

		});


	});


	describe('pan', function() {


		it('argument x implies graphToCanvas(y) (after) - graphToCanvas(y) (before) = x.', function() {

			axis = new Axis(true, 10, 20);

			var before1 = axis.graphToCanvas(15),
				before2 = axis.graphToCanvas(-10);

			axis.pan(1);

			var after1 = axis.graphToCanvas(15),
				after2 = axis.graphToCanvas(-10);

			assert.equal(after1 - before1, 1);
			assert.equal(after2 - before2, 1);


		});

	});

});