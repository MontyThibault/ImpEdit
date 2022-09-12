

function ReferenceLines(principal_axis, secondary_axis) {
	this.axis = principal_axis;
	this.saxis = secondary_axis;

	// How many small lines between large lines (recursive)
	this.line_multiples = 10;

	// Some kind of fade factor
}


ReferenceLines.prototype.draw = function(context, toX, toY) {

	var scalefactor = Math.log(Math.abs(this.axis.max - this.axis.min)) / 
		Math.log(this.line_multiples);


	var scales = [Math.floor(scalefactor), Math.floor(scalefactor) - 1];
	var scalelevels = 1;
	


	function moveTo(x, y) {
		context.moveTo(toX(x), toY(y));
	}

	function lineTo(x, y) {
		context.lineTo(toX(x), toY(y));
	}

	for(var i = 0; i < scales.length; i++) {
		var scale = scales[i];

		var shade = Math.min(Math.max(scalefactor - scale, 0), scalelevels)
			/ scalelevels;

		var hex = Math.floor(shade * 255);

		var color = 'rgb(' + hex + ', ' + hex + ', ' + hex + ')';
		context.strokeStyle = color;


		var offset = Math.pow(this.line_multiples, scale);

		var begin = Math.ceil(this.axis.min / offset) * offset,
			end = Math.floor(this.axis.max / offset) * offset;

		for(var j = begin; j <= end; j += offset) {

			var startP = j,
				endP = j,
				startS = this.saxis.min,
				endS = this.saxis.max;

			context.beginPath();

			this.axis.orientation(moveTo, startP, startS);
			this.axis.orientation(lineTo, endP, endS);

			context.stroke();

		}
	}
};


module.exports = ReferenceLines;