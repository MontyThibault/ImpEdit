(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

function Audio(canvas, context) {

	var audioContext = new (window.AudioContext || window.webkitAudioContext)();


	var myAudio = document.querySelector('audio');
	myAudio.crossOrigin = "anonymous";

	var source = audioContext.createMediaElementSource(myAudio);
	
	var analyser = audioContext.createAnalyser();


	source.connect(analyser);
	analyser.connect(audioContext.destination);

	/////////////////////////



	analyser.fftSize = 2048;
	var bufferLength = analyser.frequencyBinCount;
	var dataArray = new Uint8Array(bufferLength);
	analyser.getByteTimeDomainData(dataArray);


	// draw an oscilloscope of the current audio source

	function draw() {

	  drawVisual = requestAnimationFrame(draw);

	  window.crypto.getRandomValues(dataArray);

	  analyser.getByteTimeDomainData(dataArray);

	  context.fillStyle = 'rgb(200, 200, 200)';
	  context.fillRect(0, 0, canvas.width, canvas.height);

	  context.lineWidth = 2;
	  context.strokeStyle = 'rgb(0, 0, 0)';

	  context.beginPath();

	  var sliceWidth = canvas.width * 1.0 / bufferLength;
	  var x = 0;

	  for (var i = 0; i < bufferLength; i++) {

	    var v = dataArray[i] / 128.0;
	    var y = v * canvas.height / 2;

	    if (i === 0) {
	      context.moveTo(x, y);
	    } else {
	      context.lineTo(x, y);
	    }

	    x += sliceWidth;
	  }

	  context.lineTo(canvas.width, canvas.height / 2);
	  context.stroke();
	};

	draw();

}




module.exports = Audio;
},{}],2:[function(require,module,exports){
var RangeSlider = require('./rangeslider.js');


function Axis(orientation, min, max, get_full_extent) {

	this.orientation = orientation;
	this.orientationf = orientation ? 
		function(f, x, y) { f(x, y); } : function(f, x, y) { f(y, x); };
		
	this.min = min;
	this.max = max;

	this.minLimit = -1e2;
	this.maxLimit = 1e2;

	// Canvas.width/canvas.height
	this.get_full_extent = get_full_extent;

}


Axis.prototype._limits = function() {
	this.min = (this.min > this.minLimit) ? this.min : this.minLimit;
	this.max = (this.max < this.maxLimit) ? this.max : this.maxLimit;
}


Axis.prototype.graphToCanvas = function(x) {
	
	var diff = this.max - this.min;
	return (x - this.min) / diff * this.get_full_extent();

};


Axis.prototype.canvasToGraph = function(x) {

	var diff = this.max - this.min;
	return (x / this.get_full_extent()) * diff + this.min;

};

Axis.prototype.zoomIn = function() {
	var min = this.min * 0.9 + this.max * 0.1;
	var max = this.min * 0.1 + this.max * 0.9;

	this.min = min;
	this.max = max;

	this._limits();
};

Axis.prototype.zoomOut = function() {
	var min = this.min * 1.125 + this.max * -0.125;
	var max = this.min * -0.125 + this.max * 1.125;

	this.min = min;
	this.max = max;

	this._limits();
};

Axis.prototype.panCanvas = function(diff) {

	var offset = this.graphToCanvas(this.min);

	diff = this.canvasToGraph(diff + offset) - this.min;

	this.panGraph(diff);

};


Axis.prototype.panGraph = function(diff) {


	if(this.min - diff < this.minLimit || 
		this.max - diff > this.maxLimit) {

		// Boundary border
		return;

	}

	this.min -= diff;
	this.max -= diff;

	this._limits();

}




module.exports = Axis;
},{"./rangeslider.js":9}],3:[function(require,module,exports){
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
},{}],4:[function(require,module,exports){
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

	this.xAxis = new Axis(true, 0, 10, function() { return canvas.width; });
	this.yAxis = new Axis(false, 0, 10, function() { return canvas.height; });

	this.reference = new ReferenceLines(this.xAxis, this.yAxis);

	// this.xAxisReference = new ReferenceLinesAxis(this.xAxis, this.yAxis);
	// this.yAxisReference = new ReferenceLinesAxis(this.yAxis, this.xAxis);

	this.xAxisRange = new RangeSlider(this.xAxis, this.yAxis);
	this.yAxisRange = new RangeSlider(this.yAxis, this.xAxis);


	this.mousecontrol = new MouseControl(this);
	this.lineeditor = new LineEditor(this);


	///
	this.lineeditor.addControlPoint(5, 5);

	this.mousecontrol.addObject(this.xAxisRange);
	this.mousecontrol.addObject(this.yAxisRange);
	///


	canvas.onmousemove = pdsc(this.mousecontrol, 
		debounce(this.mousecontrol.onmousemove), 1000 / 60);

	canvas.onmousedown = pdsc(this.mousecontrol, this.mousecontrol.onmousedown);
	canvas.onmouseup = pdsc(this.mousecontrol, this.mousecontrol.onmouseup);
	canvas.ondblclick = pdsc(this.mousecontrol, this.mousecontrol.ondblclick);
	canvas.onmousewheel = pdsc(this.mousecontrol, this.mousecontrol.onscroll);

	canvas.onmouseout = canvas.onmouseup;
}


Graph.prototype.draw = function(context) {

	var xAxis = this.xAxis;
	var yAxis = this.yAxis;

	var toX = function(x) { return xAxis.graphToCanvas.call(xAxis, x); },
		toY = function(x) { return yAxis.graphToCanvas.call(yAxis, x); };


	this.reference.draw(context, toX, toY);

	this.xAxisRange.draw(context, toX, toY);
	this.yAxisRange.draw(context, toX, toY);

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

	this.xAxis.panCanvas(diffX);
	this.yAxis.panCanvas(diffY);
};


Graph.prototype.addControlPoint = function(x, y) {

	var fromX = this.xAxis.canvasToGraph(x),
		fromY = this.yAxis.canvasToGraph(y);

	this.lineeditor.addControlPoint(fromX, fromY);
};



module.exports = Graph;
},{"./axis.js":2,"./lineeditor.js":6,"./mousecontrol.js":8,"./rangeslider.js":9,"./referencelines.js":10}],5:[function(require,module,exports){
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
},{}],6:[function(require,module,exports){
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
},{"./controlpoint.js":3,"./line.js":5}],7:[function(require,module,exports){


var Graph = require("./graph.js");
var Audio = require("./audio.js");


var graph_canvas = document.getElementById('screen');
var graph_context = graph_canvas.getContext('2d');


var graph = new Graph(graph_canvas);


window.onresize = function() {

	graph_canvas.width = window.innerWidth;
	graph_canvas.height = 500;

	draw();
};

function draw() {

	graph_context.fillStyle = '#F5F5F5';
	graph_context.fillRect(0, 0, graph_canvas.width, graph_canvas.height);

	graph.draw(graph_context);
	requestAnimationFrame(draw);

}

window.onresize();




///////////////////////

var eq_canvas = document.getElementById('eq');
var eq_context = eq_canvas.getContext('2d');

Audio(eq_canvas, eq_context);
},{"./audio.js":1,"./graph.js":4}],8:[function(require,module,exports){

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

	if(this.active && this.active.onmouseup) {
		this.active.onmouseup();
	}
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
},{}],9:[function(require,module,exports){

// Throughout this class, p refers to "principal" and s refers to
// "secondary", as a generic version of x/y or y/x, depending on the orientation.


function RangeSlider(principal_axis, secondary_axis) {

	this.axis = principal_axis;
	this.saxis = secondary_axis;

	this.strokeColor;

	this.startP;
	this.endP;
	this.midS;
	this.minP;
	this.maxP;

	this.prevDragX = undefined;
	this.prevDragY = undefined;


	this.onactiveend();

}


RangeSlider.prototype.draw = function(context, toX, toY) {

	if(this.axis.orientation) {

		var toP = toX,
			toS = toY;
		
		var startX = 0,
		    startY = toY(this.saxis.max) - 20,
		    width = toX(this.axis.max),
		    height = 20;

	} else {

		var toP = toY,
			toS = toX;
	
		var startX = toX(this.saxis.max) - 20,
		    startY = 0,
		    width = 20,
		    height = toY(this.axis.max);

	}

	context.fillStyle = '#F5F5F5';
	context.fillRect(startX, startY, width, height);



	this.minP = 20,
	this.maxP = toP(this.axis.max) - 20;

	this.midS = toS(this.saxis.max) - 10;


	var o = this.axis.orientation;
	function arc(x, y, r, sa, ea) {
		if(o) {
			context.arc(x, y, r, sa, ea);
		} else {
			context.arc(y, x, r, sa + Math.PI / 2, ea + Math.PI / 2);
		}
	}


	var diff = this.maxP - this.minP;

	this.startP = this.minP + ((this.axis.min - this.axis.minLimit) / 
		(this.axis.maxLimit - this.axis.minLimit) * diff),

	this.endP = this.minP + ((this.axis.max  - this.axis.minLimit) / 
		(this.axis.maxLimit - this.axis.minLimit) * diff);
	

	context.strokeStyle = this.strokeColor;
	context.beginPath();

	// Draw first circle-half & dot
	arc(this.startP, this.midS, 1, 0, 2 * Math.PI);
	

	// Draw second circle-half & dot
	arc(this.endP, this.midS, 1, 0, 2 * Math.PI);


	// Draw connecting lines


	context.stroke();
	

};


RangeSlider.prototype.distanceTo = function(x, y) {

	if(this.axis.orientation) {
		var p = x,
			s = y;
	} else {
		var s = x,
			p = y;
	}

	if(p < this.startP) {

		return Math.sqrt((this.startP - p) * (this.startP - p) + (this.midS - s) * (this.midS - s));
	
	} else if(p > this.endP) {

		return Math.sqrt((this.endP - p) * (this.endP - p) + (this.midS - s) * (this.midS - s));

	} else {

		return Math.abs(this.midS - s);

	}

};


RangeSlider.prototype.ondrag = function(x, y) {

	if(this.prevDragX !== undefined) {

		if(this.axis.orientation) {
			var dp = x - this.prevDragX;
		} else {
			var dp = y - this.prevDragY;
		}


		var visualDiff = this.maxP - this.minP,
			graphDiff = this.axis.maxLimit - this.axis.minLimit;


		// dx / visualDiff = m / graphDiff
		var m = -graphDiff * dp / visualDiff;

		this.axis.panGraph(m);

	}

	this.prevDragX = x;
	this.prevDragY = y;

};

RangeSlider.prototype.onmouseup = function() {

	this.prevDragX = undefined;
	this.prevDragY = undefined;

}

RangeSlider.prototype.onactivestart = function() {

	this.strokeColor = "#FF0000";

};

RangeSlider.prototype.onactiveend = function() {

	this.strokeColor = '#000000';

};


RangeSlider.prototype.ondblclick = function() {
	this.axis.min = this.axis.minLimit;
	this.axis.max = this.axis.maxLimit;
};


module.exports = RangeSlider;

},{}],10:[function(require,module,exports){
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
	// with shading proportional to (scalefactor - refscale) / scalelevels.

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
		var shade = ref.getShade(scale, scalefactor, scalelevels);


		// Revise this
		a.push([shade, scale, scalefactor, scalelevels, function(context, toX, toY, scale, scalefactor, scalelevels) {
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

		// Draw
		a[i][4](context, toX, toY, a[i][1], a[i][2], a[i][3]);
	}



	this.xRef.drawAxes(context, toX, toY);
	this.yRef.drawAxes(context, toX, toY);

	this.xRef.drawLabels(context, toX, toY);
	this.yRef.drawLabels(context, toX, toY);

};


module.exports = ReferenceLines;
},{"./referencelinesaxis.js":11}],11:[function(require,module,exports){


function ReferenceLinesAxis(principal_axis, secondary_axis) {
	this.axis = principal_axis;

	// Required only for drawing
	this.saxis = secondary_axis;

	// How many small lines between large lines (recursive)
	this.line_multiples = 10;

	// Increase this to see less frequent 
	this.minimum_label_distance = 100; //px
}

ReferenceLinesAxis.prototype._iterateIntervalOverAxis = function(interval, f) {

	var begin = Math.ceil(this.axis.min / interval) * interval,
		end = Math.floor(this.axis.max / interval) * interval;

	for(var j = begin; j <= end; j += interval) {

		f.call(this, j);

	}

};


ReferenceLinesAxis.prototype.getShade = function(scale, scalefactor, scalelevels) {

	return Math.max(Math.min(scalefactor - scale, scalelevels), 0) / scalelevels;

};


ReferenceLinesAxis.prototype.drawLines = function(context, toX, toY, scale, scalefactor, scalelevels) {


	function moveTo(x, y) {
		context.moveTo(toX(x), toY(y));
	}

	function lineTo(x, y) {
		context.lineTo(toX(x), toY(y));
	}


	

	var shade = this.getShade(scale, scalefactor, scalelevels);

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

};


ReferenceLinesAxis.prototype.drawAxes = function(context, toX, toY) {


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

ReferenceLinesAxis.prototype._drawLabel = function(context, toX, toY, offset, text) {


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

ReferenceLinesAxis.prototype.drawLabels = function(context, toX, toY) {


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


module.exports = ReferenceLinesAxis;
},{}]},{},[7]);
