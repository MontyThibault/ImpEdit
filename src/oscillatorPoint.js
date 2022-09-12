var ControlPoint = require('./controlpoint.js');


class OscillatorPoint {

	constructor(cp, cp0) {

		this.cp = cp;
		this.cp0 = cp0;

		cp.parent = this;
		cp0.parent = this;

		this.disabled = false;


	}


	reAtTime(t) {

		return Math.cos((this.cp.x * t * 2 * Math.PI) + this.cp0.x) * Math.exp(this.cp.y * t) * this.cp0.y;

	}


	imAtTime(t) {

		return Math.sin((this.cp.x * t * 2 * Math.PI) + this.cp0.x) * Math.exp(this.cp.y * t) * this.cp0.y;

	}

}

module.exports = OscillatorPoint;