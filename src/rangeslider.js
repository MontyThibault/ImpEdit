function RangeSlider(principal_axis, secondary_axis) {

	this.axis = principal_axis;
	this.saxis = secondary_axis;


	// These will be delegated to the axis class.
	this.minLimit;
	this.maxLimit;
}


RangeSlider.prototype.draw = function(context, toX, toY) {

	if(this.axis.orientation) {
		
		var startX = 0,
		    startY = toY(this.saxis.max) - 20,
		    width = toX(this.axis.max),
		    height = 20;

	} else {
	
		var startX = toX(this.saxis.max) - 20,
		    startY = 0,
		    width = 20,
		    height = toY(this.axis.max);

	}

	context.fillStyle = '#F5F5F5';
	context.fillRect(startX, startY, width, height);


	

};


RangeSlider.prototype.distanceTo = function(x, y) {

};


RangeSlider.prototype.ondrag = function() {

};

RangeSlider.prototype.onactive = function() {

};

RangeSlider.prototype.ondblclick = function() {
	this.axis.min = this.axis.minLimit;
	this.axis.max = this.axis.maxLimit;
};


module.exports = RangeSlider;
