var ControlPoint = require('./controlpoint.js');
var Line = require('./line.js');


function LineEditor(graph) {

	this.line = new Line();

	// This array stays sorted by x-coordinate.
	this.controlpoints = [];

	this.line.points = this.controlpoints;

	this.graph = graph;

}


LineEditor.prototype.draw = function(context, toX, toY) {

	this.line.draw(context, toX, toY);

	for(var i = 0; i < this.controlpoints.length; i++) {
		this.controlpoints[i].draw(context, toX, toY);
	}

};	

LineEditor.prototype.addControlPoint = function(x, y) {

	cp = new ControlPoint(x, y, this, this.graph);

	this.controlpoints.push(cp);
	this.graph.mousecontrol.addObject(cp);

	this.sort();
};

LineEditor.prototype.removeControlPoint = function(o) {

	this.graph.mousecontrol.removeObject(o);

	var i = this.controlpoints.indexOf(o);

	if(i > -1) {
		this.controlpoints.splice(i, 1);
	}

	this.sort();
};


LineEditor.prototype.sort = function() {

	this.controlpoints.sort(function(a, b) {
		return a.x - b.x;
	});

};


LineEditor.prototype.toBuffer = function(buffer, samplerate) {

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

};


module.exports = LineEditor;
