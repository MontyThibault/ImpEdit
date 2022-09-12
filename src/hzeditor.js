var PointEditor = require('./pointeditor.js');


class HzEditor extends PointEditor {


	toBuffer(buffer, samplerate) {

		buffer.fill(0);


		for(var i = 0; i < this.controlpoints.length; i++) {

			var cp = this.controlpoints[i];


			for(var j = 0; j < buffer.length; j++) {

				var t = j / samplerate;

				buffer[j] += Math.cos(cp.y * t * 2 * Math.PI) * Math.exp(cp.x * t);

				// Imaginary: += Math.sin(cp.y * t * 2 * Math.PI) * Math.exp(cp.x * t);

			}

		}

	}

}


module.exports = HzEditor;