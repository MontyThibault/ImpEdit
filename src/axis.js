var RangeSlider = require('./rangeslider.js');


function Axis(orientation, min, max, get_full_extent) {

	this.orientation = orientation ? 
		function(f, x, y) { f(x, y); } : function(f, x, y) { f(y, x); };

	this.rangeslider = new RangeSlider(orientation, this);
	this.min = min;
	this.max = max;

	// Canvas.width/canvas.height
	this.get_full_extent = get_full_extent;

}


Axis.prototype.graphToCanvas = function(x) {
	
	var diff = this.max - this.min;
	return (x - this.min) / diff * this.get_full_extent();

};


Axis.prototype.canvasToGraph = function(x) {

	var diff = this.max - this.min;
	return (x / this.get_full_extent()) * diff + this.min;

};

Axis.prototype.drawLines = function(context) {

	

};

Axis.prototype.drawLabels = function(context) {

};

Axis.prototype.zoomIn = function() {
	var min = this.min * 0.9 + this.max * 0.1;
	var max = this.min * 0.1 + this.max * 0.9;

	this.min = min;
	this.max = max;

	console.log(min, max);
};

Axis.prototype.zoomOut = function() {
	var min = this.min * 1.125 + this.max * -0.125;
	var max = this.min * -0.125 + this.max * 1.125;

	this.min = min;
	this.max = max;
};

Axis.prototype.pan = function(diff) {

	var offset = this.graphToCanvas(this.min);

	diff = this.canvasToGraph(diff + offset) - this.min;

	this.min -= diff;
	this.max -= diff;

};



module.exports = Axis;