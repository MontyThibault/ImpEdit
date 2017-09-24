var PointEditor = require('./pointeditor.js');
var PointLine = require('./pointline.js');



class LineEditor extends PointEditor {

	constructor(graph) {

		super(graph);

		this.pointLine = new PointLine();
		this.pointLine.points = this.controlpoints;



		this.buffer = new Float32Array(96000);
		this.samplerate = 96000;

		this.addObserver(function() {

			this.toBuffer();

		});

	}


	draw(context, toX, toY) {

		this.pointLine.draw(context, toX, toY);

		super.draw(context, toX, toY);

	}


	addControlPoint(x, y) {

		super._addControlPointNoUpdate(x, y);

		this.sort();

		this.notifyObservers();

	}


	removeControlPoint(o) {

		super._removeControlPointNoUpdate(o);

		this.sort();

		this.notifyObservers();

	}


	sort() {

		this.controlpoints.sort(function(a, b) {
			return a.x - b.x;
		});

	}


	onPointMove() {

		this.sort();

		this.notifyObservers();

	}


	toBuffer() {

		// We assume this.graph.xAxis is calibrated to seconds.

		this.buffer.fill(0);

		if(this.controlpoints.length < 2) {

			return;

		}


		// cp1 is the control point directly before the current point
		// cp2 is the control point directly after the current point

		var cp1 = this.controlpoints[0],
			cp2 = this.controlpoints[1];

		var cpi = 1;
		var escape = false;
		

		for(var i = 0; i < this.buffer.length; i++) {

			var time = i / this.samplerate;


			while(time > cp2.x) {

				cpi++;

				// If this point is beyond all control points.
				if(cpi  === this.controlpoints.length) {
					cpi--;
					this.buffer[i] = 0;

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
				this.buffer[i] = 0;
				continue;
			}


			var slope = (cp2.y - cp1.y) / (cp2.x - cp1.x);
			
			this.buffer[i] = cp1.y + (time - cp1.x) * slope;

		}

	}

}


module.exports = LineEditor;
