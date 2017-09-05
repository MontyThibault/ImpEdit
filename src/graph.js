var SplineEditor = require('./splineeditor.js');
var Axis = require('./axis.js');
var MouseControl = require('./mousecontrol.js');


function prevent_default_set_context(that, f) {
	return function(e) {
		e.preventDefault();
		f.apply(that, [e]);
	}
}

pdsc = prevent_default_set_context;


function debounce(f, delay) {
  var timer = null;

  return function () {
    var context = this, 
    	args = arguments;

    clearTimeout(timer);

    timer = setTimeout(function () {
      f.apply(context, args);
    }, delay);
  };
}



function Graph(canvas) {
	this.canvas = canvas;

	this.xAxis = new Axis(true, 0, 10, function() { return canvas.width; });
	this.yAxis = new Axis(false, 0, 10, function() { return canvas.height; });

	this.mousecontrol = new MouseControl(this);
	this.splineeditor = new SplineEditor(this);

	this.splineeditor.addControlPoint(5, 5);



	canvas.onmousemove = pdsc(this.mousecontrol, 
		debounce(this.mousecontrol.onmousemove), 1000 / 60);

	canvas.onmousedown = pdsc(this.mousecontrol, this.mousecontrol.onmousedown);
	canvas.onmouseup = pdsc(this.mousecontrol, this.mousecontrol.onmouseup);
	canvas.ondblclick = pdsc(this.mousecontrol, this.mousecontrol.ondblclick);
	canvas.onmousewheel = pdsc(this.mousecontrol, this.mousecontrol.onscroll);
}


Graph.prototype.draw = function(context) {

	var xAxis = this.xAxis;
	var yAxis = this.yAxis;

	var toX = function(x) { return xAxis.graphToCanvas.call(xAxis, x); },
		toY = function(x) { return yAxis.graphToCanvas.call(yAxis, x); };


	this.xAxis.drawLines(context, toX, toY);
	this.yAxis.drawLines(context, toX, toY);
	this.xAxis.drawLabels(context, toX, toY);
	this.yAxis.drawLabels(context, toX, toY);

	this.splineeditor.draw(context, toX, toY);

};


Graph.prototype.zoomIn = function() {
	this.xAxis.zoomIn();
	this.yAxis.zoomIn();
};

Graph.prototype.zoomOut = function() {
	this.xAxis.zoomOut();
	this.yAxis.zoomOut();
};

Graph.prototype.pan = function(diffX, diffY) {

	this.xAxis.pan(diffX);
	this.yAxis.pan(diffY);
};


Graph.prototype.addControlPoint = function(x, y) {

	var fromX = this.xAxis.canvasToGraph(x),
		fromY = this.yAxis.canvasToGraph(y);

	this.splineeditor.addControlPoint(fromX, fromY);
};



module.exports = Graph;