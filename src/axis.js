var RangeSlider = require('./rangeslider.js');


class Axis {

	constructor(orientation, min, max, get_full_extent) {

		this.TYPE_LINEAR = 0;
		this.TYPE_LOG = 1;


		this.type = 0;
		

		// true when x is the principal axis, false otherwise
		this.orientation = orientation;


		this.orientationf = orientation ? 
			function(f, x, y) { f(x, y); } : function(f, x, y) { f(y, x); };
			

		// Current viewport boundaries
		this.min = min;
		this.max = max;

		// Absolute boundaries
		this.minLimit = -1e2;
		this.maxLimit = 1e2;


		// returns canvas.width/canvas.height
		this.get_full_extent = get_full_extent;

	}


	_limits() {

		this.min = (this.min > this.minLimit) ? this.min : this.minLimit;
		this.max = (this.max < this.maxLimit) ? this.max : this.maxLimit;

	}


	graphToCanvas(p) {
		
		var diff = this.max - this.min;
		return (p - this.min) / diff * this.get_full_extent();

	}


	canvasToGraph(p) {

		var diff = this.max - this.min;
		return (p / this.get_full_extent()) * diff + this.min;

	}


	graphToCanvasInterval(refPoint, interval) {

		return this.graphToCanvas(interval) - this.graphToCanvas(0);

	}


	canvasToGraphInterval(refPoint, interval) {

		return this.canvasToGraph(interval) - this.canvasToGraph(0);

	}


	zoomIn() {

		var min = this.min * 0.9 + this.max * 0.1;
		var max = this.min * 0.1 + this.max * 0.9;

		this.min = min;
		this.max = max;

		this._limits();

	}


	zoomOut() {

		var min = this.min * 1.125 + this.max * -0.125;
		var max = this.min * -0.125 + this.max * 1.125;

		this.min = min;
		this.max = max;

		this._limits();

	}


	panCanvas(diff) {

		var offset = this.graphToCanvas(this.min);

		diff = this.canvasToGraph(diff + offset) - this.min;

		this.panGraph(diff);

	}


	panGraph(diff) {

		if(this.min - diff < this.minLimit || 
			this.max - diff > this.maxLimit) {

			// Boundary border
			return;

		}

		this.min -= diff;
		this.max -= diff;

		this._limits();

	}


	panGraphMinMax(diff, bound_type) {

		if(bound_type === 'min') {

			if(this.min - diff < this.minLimit) {

				return;

			}

			this.min -= diff;


		} else if(bound_type === 'max') {

			if(this.max - diff > this.maxLimit) {

				return;

			}

			this.max -= diff;

		}

	}

}


module.exports = Axis;