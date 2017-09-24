var Axis = require('./axis.js');


class LogAxis extends Axis {


	constructor(orientation, min, max, get_full_extent) {

		super(orientation, min, max, get_full_extent);


		if(min < 0 && max < 0) {

			this.min = -min;
			this.max = -max;

			this.sign = -1;


		} else if(this.min > 0 && this.max > 0) {

			this.sign = 1;

		} else {

			alert("Invalid logarithmic axis bounds.");

		}


		this.type = 1;

	}


	graphToCanvas(p) {

		p *= this.sign;

		var lmin = Math.log(this.min),
			lmax = Math.log(this.max);

		var ldiff = lmax - lmin;
		return (Math.log(p) - lmin) / ldiff * this.get_full_extent();

	}
	

	canvasToGraph(p) {

		var lmin = Math.log(this.min),
			lmax = Math.log(this.max);

		var ldiff = lmax - lmin;
		return Math.exp((p / this.get_full_extent()) * ldiff + lmin) * this.sign;

	}


	graphToCanvasInterval(refPoint, interval) {

		var epsilon = (this.max - this.min) / 1000;

		var cd = this.graphToCanvas(refPoint + epsilon) - this.graphToCanvas(refPoint);

		cd /= epsilon;
		cd *= interval;

		return cd;

	}


	canvasToGraphInterval(refPoint, interval) {

		var epsilon = 1e-3;

		var gd = this.canvasToGraph(refPoint + epsilon) - this.canvasToGraph(refPoint);

		gd /= epsilon;
		gd *= interval;

		return gd;

	}



	zoomIn() {


		var cMin = 0,
			cMax = this.get_full_extent();

		var min = cMin * 0.9 + cMax * 0.1,
			max = cMin * 0.1 + cMax * 0.9;

		this.min = this.canvasToGraph(min);
		this.max = this.canvasToGraph(max);

		this._limits();

	}


	zoomOut() {


		var cMin = 0,
			cMax = this.get_full_extent();

		var min = cMin * 1.125 + cMax * -0.125,
			max = cMin * -0.125 + cMax * 1.125;

		this.min = this.canvasToGraph(min);
		this.max = this.canvasToGraph(max);

		this._limits();

	}


	panCanvas(diff, pos) {


		// Improve this so we have sticky mouse behavior

		var pan = this.canvasToGraphInterval(pos, diff);

		this.panGraph(pan);

	}

}


module.exports = LogAxis;