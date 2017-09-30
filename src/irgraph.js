var Graph = require('./graph.js');
var LineEditor = require('./lineeditor.js');
var Axis = require('./axis.js');
var BufferLine = require('./bufferline.js');


class IRGraph extends Graph {

	constructor(onscreenCanvas) {

		super(onscreenCanvas);

		this.xAxis = new Axis(true, -1, 2, function() { return this.canvas.width; }.bind(this));
		this.yAxis = new Axis(false, 1.5, -1.5, function() { return this.canvas.height; }.bind(this));

		this.initAxes(this.xAxis, this.yAxis);


		this.reference.xRef.addSpecialLabel({

			coord: 0,
			text: 'Y (Waveform)',
			strokeStyle: '#0000FF'

		});

		this.reference.xRef.addSpecialLabel({

			coord: 1,
			text: 'END',
			strokeStyle: '#00CC00',
			dash: [10, 3, 2, 3]

		});

		this.reference.yRef.addSpecialLabel({

			coord: 0,
			text: 'X (s)',
			strokeStyle: '#0000FF'

		});


		this.editor = new LineEditor(this);
		this.editor.addControlPoint(0, 0);

		this.vizline = new BufferLine(this.vizIR, 96000);

	}


	_drawElements(context, toX, toY) {

		context.clearRect(0, 0, this.canvas.width, this.canvas.height);

		this.reference.draw(context, toX, toY);

		this.editor.draw(context, toX, toY);

		this.vizline.draw(context, toX, toY);

		this.xAxisRange.draw(context, toX, toY);
		this.yAxisRange.draw(context, toX, toY);

	}


	addControlPoint(x, y) {

		var fromX = this.xAxis.canvasToGraph(x),
			fromY = this.yAxis.canvasToGraph(y);

		this.editor.addControlPoint(fromX, fromY);
	}


	// getIR(buffer, samplerate) {

	// 	this.lineeditor.toBuffer(buffer, samplerate);

	// }


	setVizIR(buffer) {

		this.vizline.buffer = buffer;

	}


}


module.exports = IRGraph;