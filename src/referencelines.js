var ReferenceLinesAxis = require('./referencelinesaxis.js');


function ReferenceLines(principal_axis, secondary_axis) {

	this.xRef = new ReferenceLinesAxis(principal_axis, secondary_axis);
	this.yRef = new ReferenceLinesAxis(secondary_axis, principal_axis);

}




// Generate array of shades and drawing callables
ReferenceLines.prototype._getDrawingArray = function(ref) {


	var scalefactor = Math.log(Math.abs(ref.axis.max - ref.axis.min)) / 
		Math.log(ref.line_multiples);



	// This should be implemented as a ratio of screen width/height
	var scalelevels = 2;  // ref.axis.get_full_extent() / 250;


	var a = [];

	for(var i = 0; i < scalelevels; i++) {

		var scale = Math.floor(scalefactor) - i;
		var shade = ref.getShade(scale, scalefactor, scalelevels);

		a.push([shade, scale, function(context, toX, toY, scale) {
			ref.drawLines(context, toX, toY, scale, scalefactor, scalelevels);
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
		a[i][2](context, toX, toY, a[i][1]);
	}



	this.xRef.drawAxes(context, toX, toY);
	this.yRef.drawAxes(context, toX, toY);

	this.xRef.drawLabels(context, toX, toY);
	this.yRef.drawLabels(context, toX, toY);

};


module.exports = ReferenceLines;