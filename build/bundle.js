(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var RangeSlider = require('./rangeslider.js');


function Axis(orientation, min, max, get_full_extent) {

	this.orientation = orientation;
	this.orientationf = orientation ? 
		function(f, x, y) { f(x, y); } : function(f, x, y) { f(y, x); };

	this.rangeslider = new RangeSlider(this);
	this.min = min;
	this.max = max;

	// Canvas.width/canvas.height
	this.get_full_extent = get_full_extent;

}


Axis.prototype.graphToCanvas = function(x) {
	
	var diff = this.max - this.min;
	return (x - this.min) / diff * this.get_full_extent();

};


Axis.prototype.canvasToGraph = function(x) {

	var diff = this.max - this.min;
	return (x / this.get_full_extent()) * diff + this.min;

};

Axis.prototype.drawLines = function(context) {

	

};

Axis.prototype.drawLabels = function(context) {

};

Axis.prototype.zoomIn = function() {
	var min = this.min * 0.9 + this.max * 0.1;
	var max = this.min * 0.1 + this.max * 0.9;

	this.min = min;
	this.max = max;
};

Axis.prototype.zoomOut = function() {
	var min = this.min * 1.125 + this.max * -0.125;
	var max = this.min * -0.125 + this.max * 1.125;

	this.min = min;
	this.max = max;
};

Axis.prototype.pan = function(diff) {

	var offset = this.graphToCanvas(this.min);

	diff = this.canvasToGraph(diff + offset) - this.min;

	this.min -= diff;
	this.max -= diff;

};



module.exports = Axis;
},{"./rangeslider.js":8}],2:[function(require,module,exports){
function ControlPoint(x, y, editor, graph) {
	this.x = x;
	this.y = y;

	this.editor = editor;
	this.graph = graph;

	this.strokeColor;
	this.onactiveend();
}


ControlPoint.prototype.draw = function(context, toX, toY) {
	
	// Draw circle
	context.strokeStyle = this.strokeColor;

	context.beginPath();
	context.arc(toX(this.x), toY(this.y), 10, 0, 2 * Math.PI);
	context.stroke();

};


ControlPoint.prototype.distanceTo = function(x, y) {

	var x_canvas = this.graph.xAxis.graphToCanvas(this.x),
		y_canvas = this.graph.yAxis.graphToCanvas(this.y);

	return Math.sqrt((x_canvas - x) * (x_canvas - x) + 
		(y_canvas - y) * (y_canvas - y));

};


ControlPoint.prototype.ondrag = function(x, y) {
	this.x = this.graph.xAxis.canvasToGraph(x);
	this.y = this.graph.yAxis.canvasToGraph(y);
};

ControlPoint.prototype.onactivestart = function() {
	this.strokeColor = '#FF0000';
};

ControlPoint.prototype.onactiveend = function() {
	this.strokeColor = '#000000';
};

ControlPoint.prototype.ondblclick = function() {
	this.editor.removeControlPoint(this);
};

module.exports = ControlPoint;
},{}],3:[function(require,module,exports){
var LineEditor = require('./lineeditor.js');
var Axis = require('./axis.js');
var MouseControl = require('./mousecontrol.js');
var ReferenceLines = require('./referencelines.js');


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

	this.xAxisReference = new ReferenceLines(this.xAxis, this.yAxis);
	this.yAxisReference = new ReferenceLines(this.yAxis, this.xAxis);


	this.mousecontrol = new MouseControl(this);
	this.lineeditor = new LineEditor(this);

	this.lineeditor.addControlPoint(5, 5);



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


	this.xAxisReference.draw(context, toX, toY);
	this.yAxisReference.draw(context, toX, toY);

	this.xAxisReference.drawLabels(context, toX, toY);
	this.yAxisReference.drawLabels(context, toX, toY);

	// this.xAxis.drawLines(context, toX, toY);
	// this.yAxis.drawLines(context, toX, toY);
	// this.xAxis.drawLabels(context, toX, toY);
	// this.yAxis.drawLabels(context, toX, toY);

	this.lineeditor.draw(context, toX, toY);
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

	this.lineeditor.addControlPoint(fromX, fromY);
};



module.exports = Graph;
},{"./axis.js":1,"./lineeditor.js":5,"./mousecontrol.js":7,"./referencelines.js":9}],4:[function(require,module,exports){
function Line() {
	this.points = [];
	this.color = '#FF0000';
}

Line.prototype.draw = function(context, toX, toY) {

	context.strokeStyle = this.color;

	context.beginPath();

	context.moveTo(toX(this.points[0].x), toY(this.points[0].y));
	
	for(var i = 1; i < this.points.length; i++) {
		context.lineTo(toX(this.points[i].x), toY(this.points[i].y));
	}

	context.stroke();

};

module.exports = Line;
},{}],5:[function(require,module,exports){
var ControlPoint = require('./controlpoint.js');
var Line = require('./line.js');


function LineEditor(graph) {

	this.line = new Line();
	this.controlpoints = [];

	this.line.points = this.controlpoints;

	this.graph = graph;

}


LineEditor.prototype.draw = function(context, toX, toY) {

	this.controlpoints.sort(function(a, b) {
		return a.x - b.x;
	});

	this.line.draw(context, toX, toY);

	for(var i = 0; i < this.controlpoints.length; i++) {
		this.controlpoints[i].draw(context, toX, toY);
	}

};	

LineEditor.prototype.addControlPoint = function(x, y) {

	cp = new ControlPoint(x, y, this, this.graph);

	this.controlpoints.push(cp);
	this.graph.mousecontrol.addObject(cp);
};

LineEditor.prototype.removeControlPoint = function(o) {

	this.graph.mousecontrol.removeObject(o);

	var i = this.controlpoints.indexOf(o);

	if(i > -1) {
		this.controlpoints.splice(i, 1);
	}
};


LineEditor.prototype.toBuffer = function() {

};


module.exports = LineEditor;
},{"./controlpoint.js":2,"./line.js":4}],6:[function(require,module,exports){


var Graph = require("./graph.js");


var canvas = document.getElementById('screen');
var context = canvas.getContext('2d');


var graph = new Graph(canvas);


window.onresize = function() {

	canvas.width = window.innerWidth;
	canvas.height = 500;

	draw();
};

function draw() {

	context.fillStyle = '#F5F5F5';
	context.fillRect(0, 0, canvas.width, canvas.height);

	graph.draw(context);
	requestAnimationFrame(draw);

}

window.onresize();
},{"./graph.js":3}],7:[function(require,module,exports){
function MouseControl(graph) {

	this.active = false;
	this.mousedown = false;

	this.objects = [];
	this.graph = graph;

	// Pixels from nearest object before it's not active.
	this.threshold = 15;

	this.oldClientX = 0;
	this.oldClientY = 0;

}

MouseControl.prototype._getX = function(e) {
	return e.clientX - this.graph.canvas.getBoundingClientRect().left;
};

MouseControl.prototype._getY = function(e) {
	return e.clientY - this.graph.canvas.getBoundingClientRect().top;
};


MouseControl.prototype._updateActive = function(e) {

	var closest = undefined,
		distance = 999;

	var x = this._getX(e);
	var y = this._getY(e);

	for(var i = 0; i < this.objects.length; i++) {

		var distToObj = this.objects[i].distanceTo(x, y);

		if(distToObj < distance) {
			distance = distToObj;
			closest = this.objects[i];
		}
	}

	if(distance <= this.threshold) {
		this._setActive(closest);
	} else {
		this._setActive(false);
	}

};

MouseControl.prototype._setActive = function(o) {

	if(this.active !== o) {
		if(this.active !== false) {
			this.active.onactiveend();
		}

		if(o !== false) {
			o.onactivestart();
		}
	}

	this.active = o;
};

MouseControl.prototype.addObject = function(o) {
	this.objects.push(o);
};

MouseControl.prototype.removeObject = function(o) {

	var i = this.objects.indexOf(o);

	if(i > -1) {
		this.objects.splice(i, 1);
	}
};

MouseControl.prototype.onmousemove = function(e) {

	if(this.active && this.mousedown) {

		var x = this._getX(e);
		var y = this._getY(e);

		this.active.ondrag(x, y);
	
	} else if(this.mousedown) {

		var x = this._getX(e);
		var y = this._getY(e);

		this.graph.pan(x - this.oldClientX, y - this.oldClientY);

		this.oldClientX = x;
		this.oldClientY = y;

	} else {
		this._updateActive(e);
	}

};

MouseControl.prototype.onmousedown = function(e) {
	this.mousedown = true;

	this.oldClientX = this._getX(e);
	this.oldClientY = this._getY(e);
};

MouseControl.prototype.onmouseup = function(e) {
	this.mousedown = false;
};

MouseControl.prototype.ondblclick = function(e) {

	if(this.active) {
		this.active.ondblclick(e);
	} else {
		this.graph.addControlPoint(this._getX(e), this._getY(e));
	}

};

MouseControl.prototype.onscroll = function(e) {

	if(e.wheelDelta > 0) {
		this.graph.zoomIn();
	} else if(e.wheelDelta < 0) {
		this.graph.zoomOut();
	}

};


module.exports = MouseControl; // Singleton
},{}],8:[function(require,module,exports){
function RangeSlider(axis) {

	this.axis = axis;


	// These will be delegated to the axis class.
	this.minLimit;
	this.maxLimit;
}


RangeSlider.prototype.draw = function(context, toX, toY) {
	
	

};


RangeSlider.prototype.distanceTo = function(x, y) {

};


RangeSlider.prototype.ondrag = function() {

};

RangeSlider.prototype.onactive = function() {

};

RangeSlider.prototype.ondblclick = function() {

};

module.exports = RangeSlider;
},{}],9:[function(require,module,exports){


function ReferenceLines(principal_axis, secondary_axis) {
	this.axis = principal_axis;

	// Required only for drawing
	this.saxis = secondary_axis;

	// How many small lines between large lines (recursive)
	this.line_multiples = 10;

	// Increase this to see less frequent 
	this.minimum_label_distance = 100; //px
}

ReferenceLines.prototype._iterateIntervalOverAxis = function(interval, f) {

	var begin = Math.ceil(this.axis.min / interval) * interval,
		end = Math.floor(this.axis.max / interval) * interval;

	for(var j = begin; j <= end; j += interval) {

		f.call(this, j);

	}

};

ReferenceLines.prototype._drawLines = function(context, toX, toY) {


	var scalefactor = Math.log(Math.abs(this.axis.max - this.axis.min)) / 
		Math.log(this.line_multiples);


	var scales = [Math.floor(scalefactor), Math.floor(scalefactor) - 1];
	var scalelevels = 2;
	


	function moveTo(x, y) {
		context.moveTo(toX(x), toY(y));
	}

	function lineTo(x, y) {
		context.lineTo(toX(x), toY(y));
	}


	var labels = [];


	for(var i = 0; i < scales.length; i++) {
		var scale = scales[i];

		var shade = Math.min(Math.max(scalefactor - scale, 0), scalelevels)
			/ scalelevels;

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

	}

};


ReferenceLines.prototype._drawAxes = function(context, toX, toY) {


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

ReferenceLines.prototype._drawLabel = function(context, toX, toY, offset, text) {


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
	
	// Returns undefined for some reason
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

ReferenceLines.prototype.drawLabels = function(context, toX, toY) {


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

ReferenceLines.prototype.draw = function(context, toX, toY) {

	this._drawLines(context, toX, toY);
	this._drawAxes(context, toX, toY);


	// This call is delegated to after draw calls of x/y reference axes to
	// prevent overlapping.

	// this.drawLabels(context, toX, toY);

};


module.exports = ReferenceLines;
},{}]},{},[6]);
