var RangeSlider = require('./rangeslider.js');


function Axis(orientation, min, max, get_full_extent) {

	this.orientation = orientation;
	this.orientationf = orientation ? 
		function(f, x, y) { f(x, y); } : function(f, x, y) { f(y, x); };
		
	this.min = min;
	this.max = max;

	this.minLimit = -1e2;
	this.maxLimit = 1e2;

	// Canvas.width/canvas.height
	this.get_full_extent = get_full_extent;

}


Axis.prototype._limits = function() {
	this.min = (this.min > this.minLimit) ? this.min : this.minLimit;
	this.max = (this.max < this.maxLimit) ? this.max : this.maxLimit;
}


Axis.prototype.graphToCanvas = function(x) {
	
	var diff = this.max - this.min;
	return (x - this.min) / diff * this.get_full_extent();

};


Axis.prototype.canvasToGraph = function(x) {

	var diff = this.max - this.min;
	return (x / this.get_full_extent()) * diff + this.min;

};

Axis.prototype.zoomIn = function() {
	var min = this.min * 0.9 + this.max * 0.1;
	var max = this.min * 0.1 + this.max * 0.9;

	this.min = min;
	this.max = max;

	this._limits();
};

Axis.prototype.zoomOut = function() {
	var min = this.min * 1.125 + this.max * -0.125;
	var max = this.min * -0.125 + this.max * 1.125;

	this.min = min;
	this.max = max;

	this._limits();
};

Axis.prototype.panCanvas = function(diff) {

	var offset = this.graphToCanvas(this.min);

	diff = this.canvasToGraph(diff + offset) - this.min;

	this.panGraph(diff);

};


Axis.prototype.panGraph = function(diff) {


	if(this.min - diff < this.minLimit || 
		this.max - diff > this.maxLimit) {

		// Boundary border
		return;

	}

	this.min -= diff;
	this.max -= diff;

	this._limits();

}




module.exports = Axis;