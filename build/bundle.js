(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ComplexArray = function () {
  function ComplexArray(other) {
    var arrayType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Float32Array;

    _classCallCheck(this, ComplexArray);

    if (other instanceof ComplexArray) {
      // Copy constuctor.
      this.ArrayType = other.ArrayType;
      this.real = new this.ArrayType(other.real);
      this.imag = new this.ArrayType(other.imag);
    } else {
      this.ArrayType = arrayType;
      // other can be either an array or a number.
      this.real = new this.ArrayType(other);
      this.imag = new this.ArrayType(this.real.length);
    }

    this.length = this.real.length;
  }

  _createClass(ComplexArray, [{
    key: 'toString',
    value: function toString() {
      var components = [];

      this.forEach(function (value, i) {
        components.push('(' + value.real.toFixed(2) + ', ' + value.imag.toFixed(2) + ')');
      });

      return '[' + components.join(', ') + ']';
    }
  }, {
    key: 'forEach',
    value: function forEach(iterator) {
      var n = this.length;
      // For gc efficiency, re-use a single object in the iterator.
      var value = Object.seal(Object.defineProperties({}, {
        real: { writable: true }, imag: { writable: true }
      }));

      for (var i = 0; i < n; i++) {
        value.real = this.real[i];
        value.imag = this.imag[i];
        iterator(value, i, n);
      }
    }

    // In-place mapper.

  }, {
    key: 'map',
    value: function map(mapper) {
      var _this = this;

      this.forEach(function (value, i, n) {
        mapper(value, i, n);
        _this.real[i] = value.real;
        _this.imag[i] = value.imag;
      });

      return this;
    }
  }, {
    key: 'conjugate',
    value: function conjugate() {
      return new ComplexArray(this).map(function (value) {
        value.imag *= -1;
      });
    }
  }, {
    key: 'magnitude',
    value: function magnitude() {
      var mags = new this.ArrayType(this.length);

      this.forEach(function (value, i) {
        mags[i] = Math.sqrt(value.real * value.real + value.imag * value.imag);
      });

      return mags;
    }
  }]);

  return ComplexArray;
}();

exports.default = ComplexArray;
},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ComplexArray = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.FFT = FFT;
exports.InvFFT = InvFFT;
exports.frequencyMap = frequencyMap;

var _complex_array = require('./complex_array');

var _complex_array2 = _interopRequireDefault(_complex_array);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Math constants and functions we need.
var PI = Math.PI;
var SQRT1_2 = Math.SQRT1_2;

function FFT(input) {
  return ensureComplexArray(input).FFT();
};

function InvFFT(input) {
  return ensureComplexArray(input).InvFFT();
};

function frequencyMap(input, filterer) {
  return ensureComplexArray(input).frequencyMap(filterer);
};

var ComplexArray = exports.ComplexArray = function (_baseComplexArray) {
  _inherits(ComplexArray, _baseComplexArray);

  function ComplexArray() {
    _classCallCheck(this, ComplexArray);

    return _possibleConstructorReturn(this, (ComplexArray.__proto__ || Object.getPrototypeOf(ComplexArray)).apply(this, arguments));
  }

  _createClass(ComplexArray, [{
    key: 'FFT',
    value: function FFT() {
      return fft(this, false);
    }
  }, {
    key: 'InvFFT',
    value: function InvFFT() {
      return fft(this, true);
    }

    // Applies a frequency-space filter to input, and returns the real-space
    // filtered input.
    // filterer accepts freq, i, n and modifies freq.real and freq.imag.

  }, {
    key: 'frequencyMap',
    value: function frequencyMap(filterer) {
      return this.FFT().map(filterer).InvFFT();
    }
  }]);

  return ComplexArray;
}(_complex_array2.default);

function ensureComplexArray(input) {
  return input instanceof ComplexArray && input || new ComplexArray(input);
}

function fft(input, inverse) {
  var n = input.length;

  if (n & n - 1) {
    return FFT_Recursive(input, inverse);
  } else {
    return FFT_2_Iterative(input, inverse);
  }
}

function FFT_Recursive(input, inverse) {
  var n = input.length;

  if (n === 1) {
    return input;
  }

  var output = new ComplexArray(n, input.ArrayType);

  // Use the lowest odd factor, so we are able to use FFT_2_Iterative in the
  // recursive transforms optimally.
  var p = LowestOddFactor(n);
  var m = n / p;
  var normalisation = 1 / Math.sqrt(p);
  var recursive_result = new ComplexArray(m, input.ArrayType);

  // Loops go like O(n Σ p_i), where p_i are the prime factors of n.
  // for a power of a prime, p, this reduces to O(n p log_p n)
  for (var j = 0; j < p; j++) {
    for (var i = 0; i < m; i++) {
      recursive_result.real[i] = input.real[i * p + j];
      recursive_result.imag[i] = input.imag[i * p + j];
    }
    // Don't go deeper unless necessary to save allocs.
    if (m > 1) {
      recursive_result = fft(recursive_result, inverse);
    }

    var del_f_r = Math.cos(2 * PI * j / n);
    var del_f_i = (inverse ? -1 : 1) * Math.sin(2 * PI * j / n);
    var f_r = 1;
    var f_i = 0;

    for (var _i = 0; _i < n; _i++) {
      var _real = recursive_result.real[_i % m];
      var _imag = recursive_result.imag[_i % m];

      output.real[_i] += f_r * _real - f_i * _imag;
      output.imag[_i] += f_r * _imag + f_i * _real;

      var _ref = [f_r * del_f_r - f_i * del_f_i, f_i = f_r * del_f_i + f_i * del_f_r];
      f_r = _ref[0];
      f_i = _ref[1];
    }
  }

  // Copy back to input to match FFT_2_Iterative in-placeness
  // TODO: faster way of making this in-place?
  for (var _i2 = 0; _i2 < n; _i2++) {
    input.real[_i2] = normalisation * output.real[_i2];
    input.imag[_i2] = normalisation * output.imag[_i2];
  }

  return input;
}

function FFT_2_Iterative(input, inverse) {
  var n = input.length;

  var output = BitReverseComplexArray(input);
  var output_r = output.real;
  var output_i = output.imag;
  // Loops go like O(n log n):
  //   width ~ log n; i,j ~ n
  var width = 1;
  while (width < n) {
    var del_f_r = Math.cos(PI / width);
    var del_f_i = (inverse ? -1 : 1) * Math.sin(PI / width);
    for (var i = 0; i < n / (2 * width); i++) {
      var f_r = 1;
      var f_i = 0;
      for (var j = 0; j < width; j++) {
        var l_index = 2 * i * width + j;
        var r_index = l_index + width;

        var left_r = output_r[l_index];
        var left_i = output_i[l_index];
        var right_r = f_r * output_r[r_index] - f_i * output_i[r_index];
        var right_i = f_i * output_r[r_index] + f_r * output_i[r_index];

        output_r[l_index] = SQRT1_2 * (left_r + right_r);
        output_i[l_index] = SQRT1_2 * (left_i + right_i);
        output_r[r_index] = SQRT1_2 * (left_r - right_r);
        output_i[r_index] = SQRT1_2 * (left_i - right_i);

        var _ref2 = [f_r * del_f_r - f_i * del_f_i, f_r * del_f_i + f_i * del_f_r];
        f_r = _ref2[0];
        f_i = _ref2[1];
      }
    }
    width <<= 1;
  }

  return output;
}

function BitReverseIndex(index, n) {
  var bitreversed_index = 0;

  while (n > 1) {
    bitreversed_index <<= 1;
    bitreversed_index += index & 1;
    index >>= 1;
    n >>= 1;
  }
  return bitreversed_index;
}

function BitReverseComplexArray(array) {
  var n = array.length;
  var flips = new Set();

  for (var i = 0; i < n; i++) {
    var r_i = BitReverseIndex(i, n);

    if (flips.has(i)) continue;

    var _ref3 = [array.real[r_i], array.real[i]];
    array.real[i] = _ref3[0];
    array.real[r_i] = _ref3[1];
    var _ref4 = [array.imag[r_i], array.imag[i]];
    array.imag[i] = _ref4[0];
    array.imag[r_i] = _ref4[1];


    flips.add(r_i);
  }

  return array;
}

function LowestOddFactor(n) {
  var sqrt_n = Math.sqrt(n);
  var factor = 3;

  while (factor <= sqrt_n) {
    if (n % factor === 0) return factor;
    factor += 2;
  }
  return n;
}
},{"./complex_array":1}],3:[function(require,module,exports){

var jsfft = require('jsfft');


function set_context(that, f) {
	return function() {
		f.apply(that, arguments);
	}
}


function Audio() {

	this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

	var myAudio = document.querySelector('audio');
	this.source = this.audioContext.createMediaElementSource(myAudio);	

	this.block_size = 16384;
	this.lowpass_cutoff = 500; // Hz


	var z_array = new jsfft.ComplexArray(this.block_size, Float32Array);



	var lowpass_map = set_context(this, function(freq, i, n) {

		var hz = (this.audioContext.sampleRate / this.block_size)  * (i + 1); 

		if(hz > this.lowpass_cutoff) {
			freq.real = 0;
			freq.imag = 0;
		}

	});

	this.fft_processor = this.audioContext.createScriptProcessor(this.block_size, 2, 2);
	this.fft_processor.onaudioprocess = 
			set_context(this, function(audioProcessingEvent) {


		var inputBuffer = audioProcessingEvent.inputBuffer;
		var outputBuffer = audioProcessingEvent.outputBuffer;

		for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {

			z_array.real = inputBuffer.getChannelData(channel);
			z_array.imag.fill(0);


			z_array.frequencyMap(lowpass_map);


		    outputBuffer.copyToChannel(z_array.real, channel, 0);
	    }

	});


	this.convolver = this.audioContext.createConvolver();

	// Dirac-Delta 
	this.convolver.buffer = this.audioContext.createBuffer(2, 100, this.audioContext.sampleRate);
	
	this.convolver.buffer.getChannelData(0)[0] = 1;
	this.convolver.buffer.getChannelData(1)[0] = 1;


	this.convolve = false;
	this.fft = false;

	this.reconnect();

}



Audio.prototype.convolve_enable = function() {
	this.convolve = true;
	this.reconnect();
};

Audio.prototype.convolve_disable = function() {
	this.convolve = false;
	this.reconnect();
};

Audio.prototype.fft_enable = function() {
	this.fft = true;
	this.reconnect();
};

Audio.prototype.fft_disable = function() {
	this.fft = false;
	this.reconnect();
};

Audio.prototype.reconnect = function() {

	this.source.disconnect();
	this.fft_processor.disconnect();
	this.convolver.disconnect();


	var last = this.source;

	if(this.fft) {
		last.connect(this.fft_processor);
		last = this.fft_processor;
	}

	if(this.convolve) {
		last.connect(this.convolver);
		last = this.convolver;
	}

	last.connect(this.audioContext.destination);

};


module.exports = Audio;
},{"jsfft":2}],4:[function(require,module,exports){
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
},{"./rangeslider.js":11}],5:[function(require,module,exports){
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
},{}],6:[function(require,module,exports){
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
},{"./axis.js":4,"./lineeditor.js":8,"./mousecontrol.js":10,"./rangeslider.js":11,"./referencelines.js":12}],7:[function(require,module,exports){
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
},{}],8:[function(require,module,exports){
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
},{"./controlpoint.js":5,"./line.js":7}],9:[function(require,module,exports){


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



var audio = new Audio();



var convolution_enabled = document.getElementById('convolution_enabled');
var fft_enabled = document.getElementById('fft_enabled');
var range_label = document.getElementById('range_label');
var range_slider = document.getElementById('range_slider');


convolution_enabled.onclick = function(e) {

	if(convolution_enabled.checked === true) {
		audio.convolve_enable();
	} else {
		audio.convolve_disable();
	}

};


fft_enabled.onclick = function(e) {

	if(fft_enabled.checked === true) {
		audio.fft_enable();
	} else {
		audio.fft_disable();
	}

};


var range_min = 20;
var range_max = 20000;

var range_log_base = 10;

range_slider.min = Math.log(range_min) / Math.log(range_log_base);
range_slider.max = Math.log(range_max) / Math.log(range_log_base);

range_slider.oninput = function() {

	var n = Math.floor(Math.pow(range_log_base, this.value));

	range_label.innerHTML = n + ' Hz';
	audio.lowpass_cutoff = n;

};

range_slider.value = (Math.log(range_min) + Math.log(range_max)) 
		/ (2 * Math.log(range_log_base));
range_slider.oninput();
},{"./audio.js":3,"./graph.js":6}],10:[function(require,module,exports){

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
},{}],11:[function(require,module,exports){

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

},{}],12:[function(require,module,exports){
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
},{"./referencelinesaxis.js":13}],13:[function(require,module,exports){


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
},{}]},{},[9]);
