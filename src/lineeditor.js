var ControlPoint = require('./controlpoint.js');
var Line = require('./line.js');


function LineEditor(graph) {

	this.line = new Line();
	this.controlpoints = [];

	this.line.points = this.controlpoints;

	this.graph = graph;

}


LineEditor.prototype.draw = function(context, toX, toY) {

	this.controlpoints.sort(function(a, b) {
		return a.x - b.x;
	});

	this.line.draw(context, toX, toY);

	for(var i = 0; i < this.controlpoints.length; i++) {
		this.controlpoints[i].draw(context, toX, toY);
	}

};	

LineEditor.prototype.addControlPoint = function(x, y) {

	cp = new ControlPoint(x, y, this, this.graph);

	this.controlpoints.push(cp);
	this.graph.mousecontrol.addObject(cp);
};

LineEditor.prototype.removeControlPoint = function(o) {

	this.graph.mousecontrol.removeObject(o);

	var i = this.controlpoints.indexOf(o);

	if(i > -1) {
		this.controlpoints.splice(i, 1);
	}
};


LineEditor.prototype.toBuffer = function() {

};


module.exports = LineEditor;