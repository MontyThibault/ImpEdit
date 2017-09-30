var Graph = require('./graph.js');
var Axis = require('./axis.js');
var LogAxis = require('./logaxis.js');


class OffsetGraph extends Graph {

	constructor(onscreenCanvas) {

		super(onscreenCanvas);

		this.xAxis = new Axis(true, 0, 2 * Math.PI, function() { return this.canvas.width; }.bind(this));
		this.yAxis = new Axis(false, 0, 1, function() { return this.canvas.height; }.bind(this));

		this.initAxes(this.xAxis, this.yAxis);


		this.reference.xRef.addSpecialLabel({

			coord: 75,
			coord_system: 'canvas',
			text: 'Phase (\u03C6)'

		});

		this.reference.yRef.addSpecialLabel({

			coord: 50,
			coord_system: 'canvas',
			text: 'Amp.'

		});


		this.editor = null;

	}


	_drawElements(context, toX, toY) {

		context.clearRect(0, 0, this.canvas.width, this.canvas.height);

		this.reference.draw(context, toX, toY);

		this.editor.draw(context, toX, toY);

		this.xAxisRange.draw(context, toX, toY);
		this.yAxisRange.draw(context, toX, toY);

	}


	addControlPoint(x, y) {

		var fromX = this.xAxis.canvasToGraph(x),
			fromY = this.yAxis.canvasToGraph(y);

		this.editor.parent.addControlPointEditor0(fromX, fromY);
	}


}


module.exports = OffsetGraph;