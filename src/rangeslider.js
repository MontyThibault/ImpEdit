// Throughout this class, p refers to "principal" and s refers to
// "secondary", as a generic version of x/y or y/x, depending on the orientation.

function CornerDraggable(parent, bound_type) {

	this.parent = parent;

	this.p = 0;
	this.s = 0;

	this.strokeColor = "#000000";

	this.prevDragX = undefined;
	this.prevDragY = undefined;

	this.bound_type = bound_type;

}

CornerDraggable.prototype.distanceTo = function(x, y) {

	if(this.parent.axis.orientation) {

		var myX = this.p,
			myY = this.s;

	} else {

		var myX = this.s,
			myY = this.p;

	}

	return Math.sqrt((x - myX) * (x - myX) + (y - myY) * (y - myY));

};	

CornerDraggable.prototype.draw = function(context) {

	context.strokeStyle = this.strokeColor;

	if(this.parent.axis.orientation) {

		var x = this.p,
			y = this.s;

	} else {

		var x = this.s,
			y = this.p;		

	}


	context.beginPath();

	context.moveTo(x + this.parent.corner_drag_radius, y);
	context.arc(x, y, this.parent.corner_drag_radius, 0, 2 * Math.PI);

	context.stroke();

};


CornerDraggable.prototype.onactivestart = function() {

	this.strokeColor = '#FF0000';

};


CornerDraggable.prototype.onactiveend = function() {

	this.strokeColor = '#000000';

};


CornerDraggable.prototype.onmouseup = function() {

	this.prevDragX = undefined;
	this.prevDragY = undefined;

};


CornerDraggable.prototype.ondrag = function(x, y) {

	if(this.prevDragX !== undefined) {


		// Disable corners if corners are within dragging threshold

		if(Math.abs(this.parent.endP - this.parent.startP) < this.parent.corner_drag_thresh) {

			this.onmouseup();
			return;

		}


		if(this.parent.axis.orientation) {
			var dp = x - this.prevDragX;
		} else {
			var dp = y - this.prevDragY;
		}


		var visualDiff = this.parent.maxP - this.parent.minP,
			graphDiff = this.parent.axis.maxLimit - this.parent.axis.minLimit;


		// dx / visualDiff = m / graphDiff
		var m = -graphDiff * dp / visualDiff;

		this.parent.axis.panGraphMinMax(m, this.bound_type);

	}

	this.prevDragX = x;
	this.prevDragY = y;

};




function RangeSlider(principal_axis, secondary_axis, specialLabels) {

	this.axis = principal_axis;
	this.saxis = secondary_axis;

	this.specialLabels = specialLabels;

	this.strokeColor;

	this.startP;
	this.endP;
	this.midS;
	this.minP;
	this.maxP;

	this.prevDragX = undefined;
	this.prevDragY = undefined;


	// Disable corner dragging at this length (px) 
	this.corner_drag_thresh = 20;
	this.corner_drag_radius = 3;

	this.corner_min = new CornerDraggable(this, 'min');
	this.corner_max = new CornerDraggable(this, 'max');

	this._enabledCornerDrag = null;


	// Bounding box

	this.bb_height = 20;
	this.bb_side_padding = 25;


	this.onactiveend();

}


RangeSlider.prototype._drawBB = function(context, toX, toY) {

	if(this.axis.orientation) {

		var toP = toX,
			toS = toY;
		
		var startX = 0,
		    startY = toY(this.saxis.max) - this.bb_height,
		    width = toX(this.axis.max),
		    height = this.bb_height;

	} else {

		var toP = toY,
			toS = toX;
	
		var startX = toX(this.saxis.max) - this.bb_height,
		    startY = 0,
		    width = this.bb_height,
		    height = toY(this.axis.max);

	}

	context.fillStyle = '#F5F5F5';
	context.fillRect(startX, startY, width, height);


	// These parameters provide padding from the canvas boundaries to the
	// computed mins and maxes. i.e. min is inset 20px from the extreme left.
	this.minP = this.bb_side_padding,
	this.maxP = toP(this.axis.max) - this.bb_side_padding;
	this.midS = toS(this.saxis.max) - (this.bb_height / 2);

};


RangeSlider.prototype._drawSpecialLines = function(context, toX, toY) {

	for(var i = 0; i < this.specialLabels.length; i++) {

		var sl = this.specialLabels[i];


		var diff = this.maxP - this.minP;

		var p = this.minP + ((sl[0] - this.axis.minLimit) / 
			(this.axis.maxLimit - this.axis.minLimit) * diff);


		context.beginPath();

		context.beginPath();
		context.strokeStyle = sl[2];

		if(sl.length === 4) {

			context.setLineDash(sl[3]);

		}


		if(this.axis.orientation) {

			var startX = p,
				startY = toY(this.saxis.max) - this.bb_height,
				endX = p,
				endY = toY(this.saxis.max);

		} else {

			var startX = toX(this.saxis.max) - this.bb_height,
				startY = p,
				endX = toX(this.saxis.max),
				endY = p;

		}


		context.moveTo(startX, startY);
		context.lineTo(endX, endY);


		context.stroke();
		context.setLineDash([]);

	}

};


RangeSlider.prototype._recomputeStartEndP = function() {


	var diff = this.maxP - this.minP;

	this.startP = this.minP + ((this.axis.min - this.axis.minLimit) / 
		(this.axis.maxLimit - this.axis.minLimit) * diff),

	this.endP = this.minP + ((this.axis.max  - this.axis.minLimit) / 
		(this.axis.maxLimit - this.axis.minLimit) * diff);


	// Circles should not overlap
	if(this.endP - this.startP < this.corner_drag_radius * 2) {

		var avg = (this.endP + this.startP) / 2;
		this.startP = avg - this.corner_drag_radius;
		this.endP = avg + this.corner_drag_radius;

	}

};



RangeSlider.prototype._drawCornerCircles = function(context, toX, toY) {

	this.corner_max.p = this.endP;
	this.corner_max.s = this.midS;

	this.corner_min.p = this.startP;
	this.corner_min.s = this.midS;

	this.corner_min.draw(context);
	this.corner_max.draw(context);

};


RangeSlider.prototype._drawConnectingLine = function(context, toX, toY) {

	context.strokeStyle = this.strokeColor;
	context.beginPath();


	if(this.axis.orientation) {

		context.moveTo(this.startP + this.corner_drag_radius, this.midS);
		context.lineTo(this.endP - this.corner_drag_radius, this.midS);

	} else {

		context.moveTo(this.midS, this.startP + this.corner_drag_radius);
		context.lineTo(this.midS, this.endP - this.corner_drag_radius);

	}

	context.stroke();

};


RangeSlider.prototype.draw = function(context, toX, toY) {

	this._drawBB(context, toX, toY);
	this._drawSpecialLines(context, toX, toY);

	this._recomputeStartEndP();
	this.updateCornerDrag();

	this._drawCornerCircles(context, toX, toY);
	this._drawConnectingLine(context, toX, toY);


};

RangeSlider.prototype.distanceTo = function(x, y) {

	if(this.axis.orientation) {
		var p = x,
			s = y;
	} else {
		var s = x,
			p = y;
	}


	var startP = this.startP,
		endP = this.endP;

	if(this._enabledCornerDrag) {

		startP += this.corner_drag_radius;
		endP -= this.corner_drag_radius; 
	
	}


	if(p < startP) {

		return Math.sqrt((startP - p) * (startP - p) + (this.midS - s) * (this.midS - s));
	
	} else if(p > endP) {

		return Math.sqrt((endP - p) * (endP - p) + (this.midS - s) * (this.midS - s));

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
	this._updateCornerColors();

};

RangeSlider.prototype.onactiveend = function() {

	this.strokeColor = '#000000';
	this._updateCornerColors();

};


RangeSlider.prototype.ondblclick = function() {
	this.axis.min = this.axis.minLimit;
	this.axis.max = this.axis.maxLimit;
};


RangeSlider.prototype.addMouseControl = function(mousecontrol) {

	this._mousecontrol = mousecontrol;

	mousecontrol.addObject(this);

};

RangeSlider.prototype._enableCornerDrag = function() {

	this._enabledCornerDrag = true;
	this._mousecontrol.addObject(this.corner_min);
	this._mousecontrol.addObject(this.corner_max);

	this._updateCornerColors();

};


RangeSlider.prototype._disableCornerDrag = function() {

	this._enabledCornerDrag = false;
	this._mousecontrol.removeObject(this.corner_min);
	this._mousecontrol.removeObject(this.corner_max);

	this._updateCornerColors();

};

RangeSlider.prototype.updateCornerDrag = function() {

	if(this.endP - this.startP < this.corner_drag_thresh) {

		if(this._enabledCornerDrag || this._enabledCornerDrag === null) {

			this._disableCornerDrag();

		}

	} else {

		if(!this._enabledCornerDrag || this._enabledCornerDrag === null) {

			this._enableCornerDrag();

		}

	}

};


RangeSlider.prototype._updateCornerColors = function() {

	if(!this._enabledCornerDrag) {

		this.corner_min.strokeColor = this.strokeColor;
		this.corner_max.strokeColor = this.strokeColor;

	} else {

		this.corner_min.onactiveend();
		this.corner_max.onactiveend();

	}

};


module.exports = RangeSlider;
