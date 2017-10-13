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


function throttle(fn, threshhold, scope) {
  threshhold || (threshhold = 250);
  var last,
      deferTimer;
  return function () {
    var context = scope || this;

    var now = +new Date,
        args = arguments;
    if (last && now < last + threshhold) {
      // hold on to it
      clearTimeout(deferTimer);
      deferTimer = setTimeout(function () {
        last = now;
        fn.apply(context, args);
      }, threshhold);
    } else {
      last = now;
      fn.apply(context, args);
    }
  };
}



class Graph {
	
	constructor(onscreenCanvas) {

		this.canvas = document.createElement('canvas');
		this.context = this.canvas.getContext('2d');

		this.onscreenCanvas = onscreenCanvas;
		this.onscreenContext = onscreenCanvas.getContext('2d');

		this.mousecontrol = new MouseControl(this, onscreenCanvas);


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
			return false;
		}

		var xAxis = this.xAxis;
		var yAxis = this.yAxis;


		var toX = function(x) { return xAxis.graphToCanvas.call(xAxis, x); },
			toY = function(x) { return yAxis.graphToCanvas.call(yAxis, x); };


		this._drawElements(this.context, toX, toY);

		this.needsUpdate = false;

		return true;

	}


	copyToCanvas(context) {

		context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		context.drawImage(this.canvas, 0, 0, this.canvas.width, this.canvas.height);

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


	addControlPoint(x, y) {

		var fromX = this.xAxis.canvasToGraph(x),
			fromY = this.yAxis.canvasToGraph(y);

		return this.editor.addControlPoint(fromX, fromY);
		
	}


	mouseBindings(canvas) {

		this.onscreenCanvas.onmousedown = pdsc(this.mousecontrol, this.mousecontrol.onmousedown);
		this.onscreenCanvas.ondblclick = pdsc(this.mousecontrol, this.mousecontrol.ondblclick);
		this.onscreenCanvas.onmousewheel = pdsc(this.mousecontrol, this.mousecontrol.onscroll);


		var that = this;
		document.addEventListener('mousemove', 
			throttle(pdsc(that.mousecontrol, that.mousecontrol.onmousemove), 1000 / 60));


		document.addEventListener('mouseup', that.mousecontrol.onmouseup.bind(that.mousecontrol));

	}


	setVizIR(buffer) {

		this.vizIR = buffer;

	}

}

module.exports = Graph;