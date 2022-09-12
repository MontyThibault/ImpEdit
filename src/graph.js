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



class Graph {
	
	constructor(onscreenCanvas) {

		this.canvas = document.createElement('canvas');
		this.context = this.canvas.getContext('2d');

		this.onscreenCanvas = onscreenCanvas;
		this.onscreenContext = onscreenCanvas.getContext('2d');

		this.mousecontrol = new MouseControl(this);

		this.vizIR = [];

		this.needsUpdate = true;

	}


	initAxes(xAxis, yAxis) {

		this.xAxis = xAxis;
		this.yAxis = yAxis;


		this.reference = new ReferenceLines(this.xAxis, this.yAxis);

		this.xAxisRange = new RangeSlider(this.xAxis, this.yAxis, this.reference.xRef.specialLabels);
		this.yAxisRange = new RangeSlider(this.yAxis, this.xAxis, this.reference.yRef.specialLabels);


		this.xAxisRange.addMouseControl(this.mousecontrol);
		this.yAxisRange.addMouseControl(this.mousecontrol);

	}


	_drawElements(context, toX, toY) {

		context.clearRect(0, 0, this.canvas.width, this.canvas.height);

		this.reference.draw(context, toX, toY);

		this.xAxisRange.draw(context, toX, toY);
		this.yAxisRange.draw(context, toX, toY);

	}


	draw() {


		if(!this.needsUpdate) {
			return;
		}

		var xAxis = this.xAxis;
		var yAxis = this.yAxis;


		var toX = function(x) { return xAxis.graphToCanvas.call(xAxis, x); },
			toY = function(x) { return yAxis.graphToCanvas.call(yAxis, x); };


		this._drawElements(this.context, toX, toY);
		this.copyToCanvas();

		this.needsUpdate = false;

	}


	copyToCanvas() {

		this.onscreenContext.clearRect(0, 0, this.onscreenCanvas.width, this.onscreenCanvas.height);
		this.onscreenContext.drawImage(this.canvas, 0, 0, this.canvas.width, this.canvas.height);

	}


	setWidthHeight(w, h) {

		this.canvas.width = w;
		this.canvas.height = h;

		this.needsUpdate = true;

	}


	zoomIn() {

		this.xAxis.zoomIn();
		this.yAxis.zoomIn();

		this.needsUpdate = true;

	}


	zoomOut() {

		this.xAxis.zoomOut();
		this.yAxis.zoomOut();

		this.needsUpdate = true;

	}
	

	pan(diffX, diffY, posX, posY) {

		this.xAxis.panCanvas(diffX, posX);
		this.yAxis.panCanvas(diffY, posY);

		this.needsUpdate = true;
	}


	mouseBindings(canvas) {

		canvas.onmousedown = pdsc(this.mousecontrol, this.mousecontrol.onmousedown);
		canvas.ondblclick = pdsc(this.mousecontrol, this.mousecontrol.ondblclick);
		canvas.onmousewheel = pdsc(this.mousecontrol, this.mousecontrol.onscroll);


		var that = this;
		document.addEventListener('mousemove', 
			debounce(pdsc(that.mousecontrol, that.mousecontrol.onmousemove), 1000 / 60));


		document.addEventListener('mouseup', that.mousecontrol.onmouseup.bind(that.mousecontrol));

	}


	setVizIR(buffer) {

		this.vizIR = buffer;

	}

}

module.exports = Graph;