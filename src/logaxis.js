var Axis = require('./axis.js');


class LogAxis extends Axis {


	constructor(orientation, min, max, get_full_extent) {

		super(orientation, min, max, get_full_extent);

		this.minLimit = 1;
		this.maxLimit = 10;

		this.type = 1;

	}


	graphToCanvas(p) {

		var lmin = Math.log(this.min),
			lmax = Math.log(this.max);

		var ldiff = lmax - lmin;
		return (Math.log(p) - lmin) / ldiff * this.get_full_extent();

	}
	

	canvasToGraph(p) {

		var lmin = Math.log(this.min),
			lmax = Math.log(this.max);

		var ldiff = lmax - lmin;
		return Math.exp((p / this.get_full_extent()) * ldiff + lmin);

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

}


module.exports = LogAxis;