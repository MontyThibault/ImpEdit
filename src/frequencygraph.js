var Graph = require('./graph.js');
var Axis = require('./axis.js');


class FrequencyGraph extends Graph {


	constructor(canvas2d, canvas3d) {

		super(canvas2d);

		this.xAxis = new Axis(true, -10, 10, function() { return canvas2d.width; });
		this.yAxis = new Axis(false, -10, 10, function() { return canvas2d.height; });

		this.initAxes(this.xAxis, this.yAxis);



		this.canvas3d = canvas3d;
		this.laplaceNeedsUpdate = true;

		this._initiateWebGL();

	}


	_drawElements(context, toX, toY) {

		this.laplaceNeedsUpdate = this.needsUpdate;


		if(this.laplaceNeedsUpdate) {

			this._drawLaplace(context.context3d, toX, toY);
			this.laplaceNeedsUpdate = false;

		}

		super._drawElements(context.context2d, toX, toY);

	}


	_drawLaplace(context, toX, toY) {

		// We need impulse response function eventually

		console.log('drawin!');

	}


	_initiateWebGL() {



	}

}


module.exports = FrequencyGraph;