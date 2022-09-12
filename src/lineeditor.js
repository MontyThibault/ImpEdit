var PointEditor = require('./pointeditor.js');
var PointLine = require('./pointline.js');



class LineEditor extends PointEditor {

	constructor(graph) {

		super(graph);

		this.pointLine = new PointLine();
		this.pointLine.points = this.controlpoints;

	}


	draw(context, toX, toY) {

		this.pointLine.draw(context, toX, toY);

		super.draw(context, toX, toY);

	}


	addControlPoint(x, y) {

		super.addControlPoint(x, y);

		this.sort();

	}


	removeControlPoint(o) {

		super.removeControlPoint(o);

		this.sort();

	}


	sort() {

		this.controlpoints.sort(function(a, b) {
			return a.x - b.x;
		});

	}


	onPointMove() {

		this.sort();

	}


	toBuffer(buffer, samplerate) {

		// We assume this.graph.xAxis is calibrated to seconds.

		if(this.controlpoints.length < 2) {
			buffer.fill(0);
			return;
		}


		// cp1 is the control point directly before the current point
		// cp2 is the control point directly after the current point
		var cp1 = this.controlpoints[0],
			cp2 = this.controlpoints[1];

		var cpi = 1;
		var escape = false;

		for(var i = 0; i < buffer.length; i++) {

			var time = i / samplerate;


			while(time > cp2.x) {

				cpi++;

				// If this point is beyond all control points.
				if(cpi  === this.controlpoints.length) {
					cpi--;
					buffer[i] = 0;

					escape = true;
					break;
				}

				cp1 = cp2;
				cp2 = this.controlpoints[cpi];

			}

			if(escape) {
				escape = false;
				continue;
			}

	 		
	 		// If this point is before all control points.
			if(time < cp1.x) {
				buffer[i] = 0;
				continue;
			}


			var slope = (cp2.y - cp1.y) / (cp2.x - cp1.x);
			
			buffer[i] = cp1.y + (time - cp1.x) * slope;

		}

	}

}


module.exports = LineEditor;
