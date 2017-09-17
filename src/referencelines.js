var ReferenceLinesAxis = require('./referencelinesaxis.js');


function ReferenceLines(principal_axis, secondary_axis) {

	this.xRef = new ReferenceLinesAxis(principal_axis, secondary_axis);
	this.yRef = new ReferenceLinesAxis(secondary_axis, principal_axis);

}




// Generate array of shades and drawing callables
ReferenceLines.prototype._getDrawingArray = function(ref) {


	// scale-x refers to logarithmic values

	// Screen span

	var scalefactor = Math.log(Math.abs(ref.axis.max - ref.axis.min)) / 
		Math.log(ref.line_multiples);



	// ex. scalelevels = 2 means to draw two "levels" of reference lines
	// with shading proportional to canvas distance.

	// Fractional values are allowed. 

	// screenwidth ~ ref.line_multiples ^ scalelevels
	// -> scalelevels ~ log_{ref.line_multiples} screenwidth 

	var scalelevels = Math.log(ref.axis.get_full_extent());

	// We wish that screenwidth = 500 -> scalelevels = 2

	scalelevels /= Math.log(500);
	scalelevels *= 2;


	var a = [];

	for(var i = 0; i < scalelevels; i++) {

		var scale = Math.floor(scalefactor) - i;
		var shade = ref.getShade(scale);


		// Revise this
		a.push([shade, scale, function(context, toX, toY, scale) {
			ref.drawLines(context, toX, toY, scale);
		}]);

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
		a[i][2](context, toX, toY, a[i][1]);
	}



	this.xRef.drawAxes(context, toX, toY);
	this.yRef.drawAxes(context, toX, toY);

	this.xRef.drawLabels(context, toX, toY);
	this.yRef.drawLabels(context, toX, toY);

};


module.exports = ReferenceLines;