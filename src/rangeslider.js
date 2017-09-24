// Throughout this class, p refers to "principal" and s refers to
// "secondary", as a generic version of x/y or y/x, depending on the orientation.

class CornerDraggable {


	constructor(parent, bound_type) {

		this.parent = parent;

		this.p = 0;
		this.s = 0;

		this.strokeColor = "#000000";

		this.prevDragX = undefined;
		this.prevDragY = undefined;

		this.bound_type = bound_type;

	}


	distanceTo(x, y) {

		if(this.parent.axis.orientation) {

			var myX = this.p,
				myY = this.s;

		} else {

			var myX = this.s,
				myY = this.p;

		}

		return Math.sqrt((x - myX) * (x - myX) + (y - myY) * (y - myY));

	}


	draw(context) {

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

	}


	onactivestart() {

		this.strokeColor = '#FF0000';

	}


	onactiveend() {

		this.strokeColor = '#000000';

	}


	onmouseup() {

		this.prevDragX = undefined;
		this.prevDragY = undefined;

	}


	ondrag(x, y) {

		if(this.prevDragX !== undefined) {


			// Disable corners if corners are within dragging threshold

			if(Math.abs(this.parent.endP - this.parent.startP) < this.parent.corner_drag_thresh) {

				this.onmouseup();
				return;

			}


			if(this.parent.axis.orientation) {

				var dp = x - this.prevDragX,
					p = x;

			} else {

				var dp = y - this.prevDragY,
					p = y;

			}


			// var graphDistance = this.parent.axis.interval(this.parent.sliderToGraph, p, dp);

			var graphDistance = this.parent.sliderToGraphInterval(this.p, dp);

			this.parent.axis.panGraphMinMax(-graphDistance, this.bound_type);

		}

		this.prevDragX = x;
		this.prevDragY = y;

	}

}



class RangeSlider {


	constructor(principal_axis, secondary_axis, specialLabels) {

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


	_drawBB(context, toX, toY) {

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

	}


	graphToSlider(p) {

		var diff = this.maxP - this.minP;

		return this.minP + this.axis.interpolateGlobal(p) * diff;

	}


	sliderToGraph(p) {

		var diff = this.maxP - this.minP;

		return this.axis.inverseInterpolateGlobal((p - this.minP) / diff);

	}


	canvasToSlider(p) {

		return this.graphToSlider(this.axis.canvasToGraph(p));

	}


	sliderToCanvas(p) {

		return this.axis.graphToCanvas(this.sliderToGraph(p));

	}


	sliderToGraphInterval(refPoint, interval) {

		var d = this.sliderToGraph(refPoint + interval) - this.sliderToGraph(refPoint);

		return d;

	}


	_drawSpecialLines(context, toX, toY) {

		for(var i = 0; i < this.specialLabels.length; i++) {

			var sl = this.specialLabels[i];


			var p = this.graphToSlider(sl[0]);


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

	}


	_recomputeStartEndP() {


		this.startP = this.graphToSlider(this.axis.min);
		this.endP = this.graphToSlider(this.axis.max);


		// Circles should not overlap
		if(this.endP - this.startP < this.corner_drag_radius * 2) {

			var avg = (this.endP + this.startP) / 2;
			this.startP = avg - this.corner_drag_radius;
			this.endP = avg + this.corner_drag_radius;

		}

	}


	_drawCornerCircles(context, toX, toY) {

		this.corner_max.p = this.endP;
		this.corner_max.s = this.midS;

		this.corner_min.p = this.startP;
		this.corner_min.s = this.midS;

		this.corner_min.draw(context);
		this.corner_max.draw(context);

	}


	_drawConnectingLine(context, toX, toY) {

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

	}


	draw(context, toX, toY) {

		this._drawBB(context, toX, toY);
		this._drawSpecialLines(context, toX, toY);

		this._recomputeStartEndP();
		this.updateCornerDrag();

		this._drawCornerCircles(context, toX, toY);
		this._drawConnectingLine(context, toX, toY);


	}


	distanceTo(x, y) {

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

	}


	ondrag(x, y) {

		if(this.prevDragX !== undefined) {

			if(this.axis.orientation) {
				var dp = x - this.prevDragX;
			} else {
				var dp = y - this.prevDragY;
			}


			this.corner_min.ondrag(x, y);
			this.corner_max.ondrag(x, y);

		}

		this.prevDragX = x;
		this.prevDragY = y;

	}


	onmouseup() {

		this.corner_min.onmouseup();
		this.corner_max.onmouseup();

		this.prevDragX = undefined;
		this.prevDragY = undefined;

	}


	onactivestart() {

		this.corner_min.onactivestart();
		this.corner_max.onactivestart();

		this.strokeColor = "#FF0000";

	}


	onactiveend() {

		this.corner_min.onactiveend();
		this.corner_max.onactiveend();


		this.strokeColor = '#000000';

	}


	ondblclick() {

		this.axis.min = this.axis.minLimit;
		this.axis.max = this.axis.maxLimit;

	}


	addMouseControl(mousecontrol) {

		this._mousecontrol = mousecontrol;

		mousecontrol.addObject(this);

	}


	_enableCornerDrag() {

		this._enabledCornerDrag = true;
		this._mousecontrol.addObject(this.corner_min);
		this._mousecontrol.addObject(this.corner_max);

		// this._updateCornerColors();

	}


	_disableCornerDrag() {

		this._enabledCornerDrag = false;
		this._mousecontrol.removeObject(this.corner_min);
		this._mousecontrol.removeObject(this.corner_max);

		// this._updateCornerColors();

	}


	updateCornerDrag() {

		if(this.endP - this.startP < this.corner_drag_thresh) {

			if(this._enabledCornerDrag || this._enabledCornerDrag === null) {

				this._disableCornerDrag();

			}

		} else {

			if(!this._enabledCornerDrag || this._enabledCornerDrag === null) {

				this._enableCornerDrag();

			}

		}

	}

}


module.exports = RangeSlider;
