function RangeSlider(orientation, axis) {

	this.orientation = orientation ? 
		function(f, x, y) { f(x, y); } : function(f, x, y) { f(y, x); };

	this.axis = axis;

}


RangeSlider.prototype.draw = function(context, toX, toY) {
	
};


RangeSlider.prototype.getdistance = function(x, y) {

};


RangeSlider.prototype.ondrag = function() {

};

RangeSlider.prototype.onactive = function() {

};

RangeSlider.prototype.ondblclick = function() {

};

module.exports = RangeSlider;