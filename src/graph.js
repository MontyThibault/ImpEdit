var LineEditor = require('./lineeditor.js');
var Axis = require('./axis.js');
var MouseControl = require('./mousecontrol.js');
var ReferenceLines = require('./referencelines.js');
var RangeSlider = require('./rangeslider.js');


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

	this.xAxis = new Axis(true, -5, 5, function() { return canvas.width; });
	this.yAxis = new Axis(false, -5, 5, function() { return canvas.height; });

	this.reference = new ReferenceLines(this.xAxis, this.yAxis);

	this.xAxisRange = new RangeSlider(this.xAxis, this.yAxis);
	this.yAxisRange = new RangeSlider(this.yAxis, this.xAxis);


	this.mousecontrol = new MouseControl(this);
	this.lineeditor = new LineEditor(this);

	this.lineeditor.addControlPoint(0, 0);

	this.mousecontrol.addObject(this.xAxisRange);
	this.mousecontrol.addObject(this.yAxisRange);


	canvas.onmousemove = pdsc(this.mousecontrol, 
		debounce(this.mousecontrol.onmousemove), 1000 / 60);

	canvas.onmousedown = pdsc(this.mousecontrol, this.mousecontrol.onmousedown);
	canvas.onmouseup = pdsc(this.mousecontrol, this.mousecontrol.onmouseup);
	canvas.ondblclick = pdsc(this.mousecontrol, this.mousecontrol.ondblclick);
	canvas.onmousewheel = pdsc(this.mousecontrol, this.mousecontrol.onscroll);

	canvas.onmouseout = canvas.onmouseup;


	this.needsUpdate = true;
}


Graph.prototype.draw = function(context) {

	if(!this.needsUpdate) {
		return;
	}


	context.fillStyle = '#F5F5F5';
	context.fillRect(0, 0, this.canvas.width, this.canvas.height);


	var xAxis = this.xAxis;
	var yAxis = this.yAxis;


	var toX = function(x) { return xAxis.graphToCanvas.call(xAxis, x); },
		toY = function(x) { return yAxis.graphToCanvas.call(yAxis, x); };


	this.reference.draw(context, toX, toY);

	this.xAxisRange.draw(context, toX, toY);
	this.yAxisRange.draw(context, toX, toY);

	this.lineeditor.draw(context, toX, toY);


	this.needsUpdate = false;
};


Graph.prototype.zoomIn = function() {
	this.xAxis.zoomIn();
	this.yAxis.zoomIn();

	this.needsUpdate = true;
};

Graph.prototype.zoomOut = function() {
	this.xAxis.zoomOut();
	this.yAxis.zoomOut();

	this.needsUpdate = true;
};

Graph.prototype.pan = function(diffX, diffY) {

	this.xAxis.panCanvas(diffX);
	this.yAxis.panCanvas(diffY);

	this.needsUpdate = true;
};


Graph.prototype.addControlPoint = function(x, y) {

	var fromX = this.xAxis.canvasToGraph(x),
		fromY = this.yAxis.canvasToGraph(y);

	this.lineeditor.addControlPoint(fromX, fromY);
};



module.exports = Graph;