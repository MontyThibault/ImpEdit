
// Throughout this class, p refers to "principal" and s refers to
// "secondary", as a generic version of x/y or y/x, depending on the orientation.


function RangeSlider(principal_axis, secondary_axis) {

	this.axis = principal_axis;
	this.saxis = secondary_axis;

	this.strokeColor;

	this.startP;
	this.endP;
	this.midS;
	this.minP;
	this.maxP;

	this.prevDragX = undefined;
	this.prevDragY = undefined;


	this.onactiveend();

}


RangeSlider.prototype.draw = function(context, toX, toY) {

	if(this.axis.orientation) {

		var toP = toX,
			toS = toY;
		
		var startX = 0,
		    startY = toY(this.saxis.max) - 20,
		    width = toX(this.axis.max),
		    height = 20;

	} else {

		var toP = toY,
			toS = toX;
	
		var startX = toX(this.saxis.max) - 20,
		    startY = 0,
		    width = 20,
		    height = toY(this.axis.max);

	}

	context.fillStyle = '#F5F5F5';
	context.fillRect(startX, startY, width, height);



	this.minP = 20,
	this.maxP = toP(this.axis.max) - 20;

	this.midS = toS(this.saxis.max) - 10;


	var o = this.axis.orientation;
	function arc(x, y, r, sa, ea) {
		if(o) {
			context.arc(x, y, r, sa, ea);
		} else {
			context.arc(y, x, r, sa + Math.PI / 2, ea + Math.PI / 2);
		}
	}


	var diff = this.maxP - this.minP;

	this.startP = this.minP + ((this.axis.min - this.axis.minLimit) / 
		(this.axis.maxLimit - this.axis.minLimit) * diff),

	this.endP = this.minP + ((this.axis.max  - this.axis.minLimit) / 
		(this.axis.maxLimit - this.axis.minLimit) * diff);
	

	context.strokeStyle = this.strokeColor;
	context.beginPath();

	// Draw first circle-half & dot
	arc(this.startP, this.midS, 1, 0, 2 * Math.PI);
	

	// Draw second circle-half & dot
	arc(this.endP, this.midS, 1, 0, 2 * Math.PI);


	// Draw connecting lines


	context.stroke();
	

};


RangeSlider.prototype.distanceTo = function(x, y) {

	if(this.axis.orientation) {
		var p = x,
			s = y;
	} else {
		var s = x,
			p = y;
	}

	if(p < this.startP) {

		return Math.sqrt((this.startP - p) * (this.startP - p) + (this.midS - s) * (this.midS - s));
	
	} else if(p > this.endP) {

		return Math.sqrt((this.endP - p) * (this.endP - p) + (this.midS - s) * (this.midS - s));

	} else {

		return Math.abs(this.midS - s);

	}

};


RangeSlider.prototype.ondrag = function(x, y) {

	if(this.prevDragX !== undefined) {

		if(this.axis.orientation) {
			var dp = x - this.prevDragX;
		} else {
			var dp = y - this.prevDragY;
		}


		var visualDiff = this.maxP - this.minP,
			graphDiff = this.axis.maxLimit - this.axis.minLimit;


		// dx / visualDiff = m / graphDiff
		var m = -graphDiff * dp / visualDiff;

		this.axis.panGraph(m);

	}

	this.prevDragX = x;
	this.prevDragY = y;

};

RangeSlider.prototype.onmouseup = function() {

	this.prevDragX = undefined;
	this.prevDragY = undefined;

}

RangeSlider.prototype.onactivestart = function() {

	this.strokeColor = "#FF0000";

};

RangeSlider.prototype.onactiveend = function() {

	this.strokeColor = '#000000';

};


RangeSlider.prototype.ondblclick = function() {
	this.axis.min = this.axis.minLimit;
	this.axis.max = this.axis.maxLimit;
};


module.exports = RangeSlider;
