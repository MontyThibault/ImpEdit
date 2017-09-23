var ReferenceLinesAxis = require('./referencelinesaxis.js');


function ReferenceLines(principal_axis, secondary_axis) {

	this.xRef = new ReferenceLinesAxis(principal_axis, secondary_axis);
	this.yRef = new ReferenceLinesAxis(secondary_axis, principal_axis);

	this.xRef.minimum_label_distance = 60;
	this.yRef.minimum_label_distance = 25;
}




// Take rate of change at point (in canvas-space), expanded to encompass the whole canvas,
// and return log in base of line_multiples.

// ex. If non-linear scale has rate of change 10 at point P, and canvas is 100 pixels,
// then this returns log_{line_multiples} 1000.

// Point argument is irrelevant for linear scaling.

ReferenceLines.prototype._getScaleFactor = function(point, ref) {

	var span = ref.axis.canvasToGraphInterval(point, ref.axis.get_full_extent());

	return Math.log(span) / Math.log(ref.line_multiples);

}



// Generate array of shades and drawing callables
ReferenceLines.prototype._getDrawingArray = function(ref) {


	// scale- before variables refers to logarithmic values

	// Screen span

	var scalefactorTop = this._getScaleFactor(0, ref),
		scalefactorBottom = this._getScaleFactor(ref.axis.get_full_extent(), ref);


	// Draw this many scale levels below min 

	var scalefactorCutoff = 1.5;


	var scalefactorMin = Math.min(scalefactorTop, scalefactorBottom) - scalefactorCutoff,
		scalefactorMax = Math.max(scalefactorTop, scalefactorBottom);


	scalefactorMin = Math.floor(scalefactorMin);
	scalefactorMax = Math.ceil(scalefactorMax);



	var a = [];

	for(var scale = scalefactorMin; scale < scalefactorMax; scale++) {


		a.push([scale, function(scale, context, toX, toY) {
			ref.drawLinesAtScale(context, toX, toY, scale);
		}.bind(this, scale)]);


		a.push([scale - 100, function(scale, context, toX, toY) {
			ref.drawLabelsAtScale(context, toX, toY, scale);
		}.bind(this, scale)]);

	}

	return a;

};

ReferenceLines.prototype.draw = function(context, toX, toY) {


	var xArr = this._getDrawingArray(this.xRef),
		yArr = this._getDrawingArray(this.yRef);

	var a = xArr.concat(yArr);


	// Sort by /descending/ shade. i.e. darker groups of lines
	// are drawn later
	a.sort(function(a, b) {
		return b[0] - a[0];
	});


	for(var i = 0; i < a.length; i++) {

		// Draw
		a[i][1](context, toX, toY);
	}



	this.xRef.drawSpecialLines(context, toX, toY);
	this.yRef.drawSpecialLines(context, toX, toY);

	this.xRef.drawSpecialLabels(context, toX, toY);
	this.yRef.drawSpecialLabels(context, toX, toY);



};


module.exports = ReferenceLines;