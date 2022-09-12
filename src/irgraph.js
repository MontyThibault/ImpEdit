var Graph = require('./graph.js');
var LineEditor = require('./lineeditor.js');
var Axis = require('./axis.js');
var BufferLine = require('./bufferline.js');


class IRGraph extends Graph {

	constructor(canvas) {

		super(canvas);

		this.xAxis = new Axis(true, -1, 2, function() { return canvas.width; });
		this.yAxis = new Axis(false, 1.5, -1.5, function() { return canvas.height; });

		this.initAxes(this.xAxis, this.yAxis);


		this.reference.xRef.specialLabels.push([0, 'Y (Waveform)', '#0000FF']);
		this.reference.xRef.specialLabels.push([1, 'END', '#00CC00', [10, 3, 2, 3]]);
		this.reference.yRef.specialLabels.push([0, 'X (s)', '#0000FF']);

		this.lineeditor = new LineEditor(this);
		this.lineeditor.addControlPoint(0, 0);

		this.vizline = new BufferLine(this.vizIR, 96000);

	}


	_drawElements(context, toX, toY) {

		context.clearRect(0, 0, this.canvas.width, this.canvas.height);

		this.reference.draw(context, toX, toY);

		this.lineeditor.draw(context, toX, toY);

		this.vizline.draw(context, toX, toY);

		this.xAxisRange.draw(context, toX, toY);
		this.yAxisRange.draw(context, toX, toY);

	}


	addControlPoint(x, y) {

		var fromX = this.xAxis.canvasToGraph(x),
			fromY = this.yAxis.canvasToGraph(y);

		this.lineeditor.addControlPoint(fromX, fromY);
	}


	getIR(buffer, samplerate) {

		this.lineeditor.toBuffer(buffer, samplerate);

	}


	setVizIR(buffer) {

		this.vizline.buffer = buffer;

	}


}


module.exports = IRGraph;