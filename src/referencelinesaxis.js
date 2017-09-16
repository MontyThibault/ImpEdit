

function ReferenceLinesAxis(principal_axis, secondary_axis) {
	this.axis = principal_axis;

	// Required only for drawing
	this.saxis = secondary_axis;

	// How many small lines between large lines (recursive)
	this.line_multiples = 10;

	// Increase this to see less frequent 
	this.minimum_label_distance = 100; //px
}

ReferenceLinesAxis.prototype._iterateIntervalOverAxis = function(interval, f) {

	var begin = Math.ceil(this.axis.min / interval) * interval,
		end = Math.floor(this.axis.max / interval) * interval;

	for(var j = begin; j <= end; j += interval) {

		f.call(this, j);

	}

};


ReferenceLinesAxis.prototype.getShade = function(scale, scalefactor, scalelevels) {

	return Math.max(Math.min(scalefactor - scale, scalelevels), 0) / scalelevels;

};


ReferenceLinesAxis.prototype.drawLines = function(context, toX, toY, scale, scalefactor, scalelevels) {


	function moveTo(x, y) {
		context.moveTo(toX(x), toY(y));
	}

	function lineTo(x, y) {
		context.lineTo(toX(x), toY(y));
	}


	

	var shade = this.getShade(scale, scalefactor, scalelevels);

	var hex = Math.floor(shade * 255);

	var color = 'rgb(' + hex + ', ' + hex + ', ' + hex + ')';
	context.strokeStyle = color;


	var interval = Math.pow(this.line_multiples, scale);


	context.beginPath();

	this._iterateIntervalOverAxis(interval, function(j) {

		var startP = j,
			endP = j,
			startS = this.saxis.min,
			endS = this.saxis.max;

		
		this.axis.orientationf(moveTo, startP, startS);
		this.axis.orientationf(lineTo, endP, endS);

	});

	context.stroke();

};


ReferenceLinesAxis.prototype.drawAxes = function(context, toX, toY) {


	function moveTo(x, y) {
		context.moveTo(toX(x), toY(y));
	}

	function lineTo(x, y) {
		context.lineTo(toX(x), toY(y));
	}


	// Draw axis lines in blue

	context.strokeStyle = '#0000FF';

	var startP = 0,
		endP = 0,
		startS = this.saxis.min,
		endS = this.saxis.max;

	context.beginPath();

	this.axis.orientationf(moveTo, startP, startS);
	this.axis.orientationf(lineTo, endP, endS);

	context.stroke();


};

ReferenceLinesAxis.prototype._drawLabel = function(context, toX, toY, offset, text) {


	var centerX,
		centerY;

	if(this.axis.orientation) {
		centerX = toX(offset);
		centerY = 20;
	} else {
		centerX = 20;
		centerY = toY(offset);
	}


	context.textAlign = 'center';
	context.textBaseline = 'middle';
	
	var width = context.measureText(text).width;

	// var width = 40;

	context.fillStyle = '#F5F5F5';
	context.fillRect(centerX - (width / 2), 
		centerY - 7, 
		width, 
		14);

	context.fillStyle = 'rgb(0, 0, 0)';
	context.fillText(text, centerX, centerY);

};

ReferenceLinesAxis.prototype.drawLabels = function(context, toX, toY) {


	var scalefactor = Math.log(Math.abs(this.axis.max - this.axis.min)) / 
		Math.log(this.line_multiples);


	var labels = [];
	var interval = Math.pow(this.line_multiples, Math.floor(scalefactor));


	this._iterateIntervalOverAxis(interval, function(j) {
		labels.push([j, (Math.round(j * 1e10) / 1e10).toExponential()]);
	});

	for(var i = 0; i < labels.length; i++) {
		var label = labels[i];

		this._drawLabel(context, toX, toY, label[0], label[1]);
	}

};


module.exports = ReferenceLinesAxis;