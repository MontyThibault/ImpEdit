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
		this.minLimit = min;
		this.maxLimit = max;


		// returns canvas.width/canvas.height
		this.get_full_extent = get_full_extent;

	}


	_limits() {

		if(this.minLimit < this.maxLimit) {

			this.min = (this.min > this.minLimit) ? this.min : this.minLimit;
			this.max = (this.max < this.maxLimit) ? this.max : this.maxLimit;

		} else {

			this.min = (this.min < this.minLimit) ? this.min : this.minLimit;
			this.max = (this.max > this.maxLimit) ? this.max : this.maxLimit;

		}
		

	}


	_fixedWidthLimits() {


		if(this.minLimit < this.maxLimit) {


			if(this.min < this.minLimit) {

				var diff = this.minLimit - this.min;

				this.min += diff;
				this.max += diff;

			} else if(this.max > this.maxLimit) {

				var diff = this.max - this.maxLimit;

				this.min -= diff;
				this.max -= diff;

			}


		} else {


			if(this.min > this.minLimit) {

				var diff = this.minLimit - this.min;

				this.min += diff;
				this.max += diff;

			} else if(this.max < this.maxLimit) {

				var diff = this.max - this.maxLimit;

				this.min -= diff;
				this.max -= diff;

			}

		}

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



	// Given graph coord, returns numeric value between zero and one for visualization.

	interpolate(p) {

		return this.graphToCanvas(p) / this.get_full_extent();

	}


	inverseInterpolate(p) {

		return this.canvasToGraph(p * this.get_full_extent());

	}



	// Above, but in terms of maxLimit and minLimit

	interpolateGlobal(p) {

		return (this.graphToCanvas(p) - this.graphToCanvas(this.minLimit)) 
		/ (this.graphToCanvas(this.maxLimit) - this.graphToCanvas(this.minLimit)) 


	}


	inverseInterpolateGlobal(p) {

		return this.canvasToGraph(

			(p * (this.graphToCanvas(this.maxLimit) - this.graphToCanvas(this.minLimit)))
			+ this.graphToCanvas(this.minLimit)

			);

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


	panCanvas(diff, pos) {

		diff = this.canvasToGraphInterval(pos, diff);

		this.panGraph(diff);

	}


	panGraph(diff) {

		this.min -= diff;
		this.max -= diff;

		this._fixedWidthLimits();

	}


	panGraphMinMax(diff, bound_type) {

		if(bound_type === 'min') {

			// if(this.min - diff < this.minLimit) {

			// 	return;

			// }

			this.min -= diff;




		} else if(bound_type === 'max') {

			// if(this.max - diff > this.maxLimit) {

			// 	return;

			// }

			this.max -= diff;

		}

		this._limits();

	}

}


module.exports = Axis;