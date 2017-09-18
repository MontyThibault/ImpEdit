

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

	var begin = Math.ceil(this.axis.min / interval) * interval,
		end = Math.floor(this.axis.max / interval) * interval;

	for(var j = begin; j <= end; j += interval) {

		f.call(this, j);

	}

};


ReferenceLinesAxis.prototype.getShade = function(scale) {

	// Get canvas distance

	var interval = Math.pow(this.line_multiples, scale);
	var cd = this.axis.graphToCanvas(interval) - this.axis.graphToCanvas(0);

	// At this distance, lines appear completely black.
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


ReferenceLinesAxis.prototype.drawLines = function(context, toX, toY, scale) {
	
	var interval = Math.pow(this.line_multiples, scale);
	var shade = this.getShade(scale);

	var hex = Math.floor(shade * 255);

	var color = 'rgb(' + hex + ', ' + hex + ', ' + hex + ')';
	context.strokeStyle = color;


	context.beginPath();

	var that = this;
	this._iterateIntervalOverAxis(interval, function(j) {

		for(var i = 0; i < this.specialLabels.length; i++) {

			if(Math.abs(j - this.specialLabels[i][0]) < 1e-10) {
				return;
			}

		}


		that.drawLine(context, toX, toY, j);

	});

	context.stroke();

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


ReferenceLinesAxis.prototype.drawLabel = function(context, toX, toY, offset, text) {

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

	context.fillStyle = 'rgba(245, 245, 245, 0.8)';
	context.fillRect(centerX - (width / 2), 
		centerY - (height / 2), 
		width, 
		height);


	context.fillStyle = 'rgb(0, 0, 0)';
	context.fillText(text, centerX, centerY);

};

ReferenceLinesAxis.prototype.drawLabels = function(context, toX, toY) {

	var min_graph_distance = this.axis.canvasToGraph(this.minimum_label_distance) 
			- this.axis.canvasToGraph(0);

	var scalefactor = Math.log(min_graph_distance) / Math.log(this.line_multiples);

	var interval = Math.pow(this.line_multiples, Math.ceil(scalefactor));


	var that = this;
	this._iterateIntervalOverAxis(interval, function(j) {
		
		for(var i = 0; i < that.specialLabels.length; i++) {

			var d = that.axis.graphToCanvas(j) - that.axis.graphToCanvas(that.specialLabels[i][0]);
			if(Math.abs(d) < that.minimum_label_distance) {

				return;

			}

		}

		that.drawLabel(context, toX, toY, j, (Math.round(j * 1e10) / 1e10).toExponential());

	});



	for(var i = 0; i < that.specialLabels.length; i++) {

		var sl = that.specialLabels[i];
		that.drawLabel(context, toX, toY, sl[0], sl[1]);

	}

};


module.exports = ReferenceLinesAxis;