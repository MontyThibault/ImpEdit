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

}


module.exports = LogAxis;