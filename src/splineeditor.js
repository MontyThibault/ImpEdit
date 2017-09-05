var ControlPoint = require('./controlpoint.js');
var Line = require('./line.js');


function SplineEditor(graph) {

	this.line = new Line();
	this.controlpoints = [];

	this.graph = graph;

}


SplineEditor.prototype.draw = function(context, toX, toY) {

	this.line.draw(context, toX, toY);

	for(var i = 0; i < this.controlpoints.length; i++) {
		this.controlpoints[i].draw(context, toX, toY);
	}

};	

SplineEditor.prototype.addControlPoint = function(x, y) {

	cp = new ControlPoint(x, y, this, this.graph);

	this.controlpoints.push(cp);
	this.graph.mousecontrol.addObject(cp);
};

SplineEditor.prototype.removeControlPoint = function(o) {

	this.graph.mousecontrol.removeObject(cp);

	var i = this.controlpoints.indexOf(o);

	if(i > -1) {
		this.controlpoints.splice(i, 1);
	}
};


SplineEditor.prototype.toBuffer = function() {

};


module.exports = SplineEditor;