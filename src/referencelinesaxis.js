

function ReferenceLinesAxis(principal_axis, secondary_axis) {
	this.axis = principal_axis;

	// Required only for drawing
	this.saxis = secondary_axis;

	// How many small lines between large lines (recursive)
	this.line_multiples = 10;

	// Increase this to see less frequent 
	this.minimum_label_distance = 100; //px


	// [[labelCoord, text, strokeStyle, <dashing> (optional)], ...]
	this.specialLabels = [];
}


ReferenceLinesAxis.prototype._iterateIntervalOverAxis = function(interval, f) {

	var begin = Math.floor(this.axis.min / interval) * interval,
		end = Math.ceil(this.axis.max / interval) * interval;


	for(var j = begin; j <= end; j += interval) {

		if(f.call(this, j)) {

			break;

		}

	}

};


ReferenceLinesAxis.prototype.getShade = function(scale, refPoint) {

	// Get canvas distance

	var interval = Math.pow(this.line_multiples, scale);

	var cd = this.axis.graphToCanvasInterval(refPoint, interval);


	// At this distance, lines appear completely black.
	// Linear interpolation from this to zero.

	var black_width = 200;

	return 1 - Math.max(0, Math.min(1, Math.abs(cd) / black_width));

};


ReferenceLinesAxis.prototype.drawLine = function(context, toX, toY, j) {

	function moveTo(x, y) {
		context.moveTo(toX(x), toY(y));
	}

	function lineTo(x, y) {
		context.lineTo(toX(x), toY(y));
	}


	var startP = j,
		endP = j,
		startS = this.saxis.min,
		endS = this.saxis.max;

	
	this.axis.orientationf(moveTo, startP, startS);
	this.axis.orientationf(lineTo, endP, endS);

};


// Eliminate duplication in this method

ReferenceLinesAxis.prototype.drawLinesAtScale = function(context, toX, toY, scale) {
	
	var interval = Math.pow(this.line_multiples, scale);


	if(this.axis.type === this.axis.TYPE_LINEAR) {


		context.beginPath();


		var shade = this.getShade(scale, 0);

		var hex = Math.floor((1 - shade) * 255);

		var color = 'rgba(0, 0, 0, ' + (1 - shade) + ')';
		context.strokeStyle = color;


		var that = this;
		this._iterateIntervalOverAxis(interval, function(j) {

			for(var i = 0; i < this.specialLabels.length; i++) {

				if(Math.abs(j - this.specialLabels[i][0]) < 1e-10) {

					return false;

				}

			}


			that.drawLine(context, toX, toY, j);

		});

		context.stroke();



	} else if(this.axis.type === this.axis.TYPE_LOG) {


		var pixelThresh = 3;


		var that = this;
		this._iterateIntervalOverAxis(interval, function(j) {

			for(var i = 0; i < this.specialLabels.length; i++) {

				if(Math.abs(j - this.specialLabels[i][0]) < 1e-10) {

					return false;

				}

			}


			if(this.axis.graphToCanvasInterval(j, interval) < pixelThresh) {

				return true;

			}


			context.beginPath();


			var shade = this.getShade(scale, j);

			var hex = Math.floor((1 - shade) * 255);

			var color = 'rgba(0, 0, 0, ' + (1 - shade) + ')';
			context.strokeStyle = color;



			that.drawLine(context, toX, toY, j);

			context.stroke();

		});


	}

};


ReferenceLinesAxis.prototype.drawSpecialLines = function(context, toX, toY) {

	// Draw special lines

	for(var i = 0; i < this.specialLabels.length; i++) {

		var sl = this.specialLabels[i];

		context.beginPath();
		context.strokeStyle = sl[2];

		if(sl.length === 4) {

			context.setLineDash(sl[3]);

		}


		this.drawLine(context, toX, toY, sl[0]);


		context.stroke();
		context.setLineDash([]);

	}

};


ReferenceLinesAxis.prototype.drawLabel = function(context, toX, toY, offset, text, weight) {

	var centerX,
		centerY;

	var height = 14,
		inset = 20;

	if(this.axis.orientation) {
		centerX = toX(offset);
		centerY = inset;
	} else {
		centerX = inset;
		centerY = toY(offset);
	}


	context.textAlign = 'center';
	context.textBaseline = 'middle';
	
	var width = context.measureText(text).width + 4;

	// var width = 40;

	context.fillStyle = 'rgba(245, 245, 245, ' + weight + ')';
	context.fillRect(centerX - (width / 2), 
		centerY - (height / 2), 
		width, 
		height);


	context.fillStyle = 'rgba(0, 0, 0, ' + weight + ')';
	context.fillText(text, centerX, centerY);

};


ReferenceLinesAxis.prototype._isIntersectingSpecialLabel = function(j) {

	for(var i = 0; i < this.specialLabels.length; i++) {

		var d = this.axis.graphToCanvas(j) - this.axis.graphToCanvas(this.specialLabels[i][0]);
		
		var intersectSpecialLabel = Math.abs(d) < this.minimum_label_distance;


		if(intersectSpecialLabel) {

			return true;

		}

	}


	return false;

};


ReferenceLinesAxis.prototype.drawLabelsAtScale = function(context, toX, toY, scale) {


	var interval = Math.pow(this.line_multiples, scale);


	var that = this;
	this._iterateIntervalOverAxis(interval, function(j) {
		
		
		if(this._isIntersectingSpecialLabel(j)) {

			return false;

		}



		d = Math.abs(that.axis.graphToCanvasInterval(j, interval));

		var intersectOtherLabels = d < that.minimum_label_distance;

		if(intersectOtherLabels) {

			return true;

		}


		var weight = Math.abs(d - that.minimum_label_distance) / 20;

		that.drawLabel(context, toX, toY, j, (Math.round(j * 1e10) / 1e10).toExponential(), weight);

	});

};


ReferenceLinesAxis.prototype.drawSpecialLabels = function(context, toX, toY) {

	for(var i = 0; i < this.specialLabels.length; i++) {

		var sl = this.specialLabels[i];
		this.drawLabel(context, toX, toY, sl[0], sl[1], 1);

	}

};


module.exports = ReferenceLinesAxis;