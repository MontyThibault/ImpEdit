var PointEditor = require('./pointeditor.js');


class HzEditor extends PointEditor {

	constructor(graph) {

		super(graph);


		this.buffer = new Float32Array(96000);
		this.samplerate = 96000;

		this.addObserver(function() {

			this.toBuffer();

		});

	}


	toBuffer(buffer, samplerate) {

		this.buffer.fill(0);


		for(var i = 0; i < this.controlpoints.length; i++) {

			var cp = this.controlpoints[i];


			for(var j = 0; j < this.buffer.length; j++) {

				var t = j / this.samplerate;

				this.buffer[j] += Math.cos(cp.x * t * 2 * Math.PI) * Math.exp(cp.y * t);

				// Imaginary: += Math.sin(cp.x * t * 2 * Math.PI) * Math.exp(cp.y * t);

			}

		}

	}

}


module.exports = HzEditor;