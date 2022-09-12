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
	this.convolver.buffer = this.audioContext.createBuffer(1, 96000, this.audioContext.sampleRate);


	this.convolver.loop = false;
	this.convolver.normalize = true;



	this.convolve = false;
	this.fft = false;

	this.reconnect();

}


Audio.prototype.update_convolver = function(buffer) {

	// Simply this.convolver.buffer.copyToChannel(this.convolutionBufferArray, 0, 0);
	// does not work for some reason. 

	var convlutionBuffer = this.convolver.buffer;

	convlutionBuffer.copyToChannel(buffer, 0, 0);

	this.convolver.buffer = convlutionBuffer;

};


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
module.exports = function(audio) {

	var convolution_enabled = document.getElementById('convolution_enabled');
	var fft_enabled = document.getElementById('fft_enabled');
	var range_label = document.getElementById('range_label');
	var range_slider = document.getElementById('range_slider');

	var audio_file = document.getElementById('audio_file');


	// Check for BlobURL support
	var blob = window.URL || window.webkitURL;

    if (!blob) {
        console.log('Your browser does not support Blob URLs. File selection disabled.');
        return;           
    } 


	convolution_enabled.onclick = function(e) {

		if(convolution_enabled.checked) {
			audio.convolve_enable();
		} else {
			audio.convolve_disable();
		}

	};


	fft_enabled.onclick = function(e) {

		if(fft_enabled.checked) {
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



	// http://jsfiddle.net/adamazad/0oy5moph/
	audio_file.onchange = function(e) {

		var file =  audio_file.files[0];
		var fileURL = blob.createObjectURL(file);

		var myAudio = document.querySelector('audio');
		myAudio.src = fileURL;

	};

};
},{}],5:[function(require,module,exports){
var RangeSlider = require('./rangeslider.js');


class Axis {

	constructor(orientation, min, max, get_full_extent) {

		this.TYPE_LINEAR = 0;
		this.TYPE_LOG = 1;


		this.type = 0;
		

		// true when x is the principal axis, false otherwise
		this.orientation = orientation;


		this.orientationf = orientation ? 
			function(f, x, y) { f(x, y); } : function(f, x, y) { f(y, x); };
			

		// Current viewport boundaries
		this.min = min;
		this.max = max;

		// Absolute boundaries
		this.minLimit = min;
		this.maxLimit = max;


		// returns canvas.width/canvas.height
		this.get_full_extent = get_full_extent;

	}


	_limits() {

		this.min = (this.min > this.minLimit) ? this.min : this.minLimit;
		this.max = (this.max < this.maxLimit) ? this.max : this.maxLimit;

	}


	_fixedWidthLimits() {

		if(this.min < this.minLimit) {

			var diff = this.minLimit - this.min;

			this.min += diff;
			this.max += diff;

		} else if(this.max > this.maxLimit) {

			var diff = this.max - this.maxLimit;

			this.min -= diff;
			this.max -= diff;

		}

	}


	graphToCanvas(p) {
		
		var diff = this.max - this.min;
		return (p - this.min) / diff * this.get_full_extent();

	}


	canvasToGraph(p) {

		var diff = this.max - this.min;
		return (p / this.get_full_extent()) * diff + this.min;

	}


	graphToCanvasInterval(refPoint, interval) {

		return this.graphToCanvas(interval) - this.graphToCanvas(0);

	}


	canvasToGraphInterval(refPoint, interval) {

		return this.canvasToGraph(interval) - this.canvasToGraph(0);

	}



	// Given graph coord, returns numeric value between zero and one for visualization.

	interpolate(p) {

		return this.graphToCanvas(p) / this.get_full_extent();

	}


	inverseInterpolate(p) {

		return this.canvasToGraph(p * this.get_full_extent());

	}



	// Above, but in terms of maxLimit and minLimit

	interpolateGlobal(p) {

		return (this.graphToCanvas(p) - this.graphToCanvas(this.minLimit)) 
		/ (this.graphToCanvas(this.maxLimit) - this.graphToCanvas(this.minLimit)) 


	}


	inverseInterpolateGlobal(p) {

		return this.canvasToGraph(

			(p * (this.graphToCanvas(this.maxLimit) - this.graphToCanvas(this.minLimit)))
			+ this.graphToCanvas(this.minLimit)

			);

	}



	zoomIn() {

		var min = this.min * 0.9 + this.max * 0.1;
		var max = this.min * 0.1 + this.max * 0.9;

		this.min = min;
		this.max = max;

		this._limits();

	}


	zoomOut() {

		var min = this.min * 1.125 + this.max * -0.125;
		var max = this.min * -0.125 + this.max * 1.125;

		this.min = min;
		this.max = max;

		this._limits();

	}


	panCanvas(diff, pos) {

		var offset = this.graphToCanvas(this.min);

		diff = this.canvasToGraph(diff + offset) - this.min;

		this.panGraph(diff);

	}


	panGraph(diff) {

		this.min -= diff;
		this.max -= diff;

		this._fixedWidthLimits();

	}


	panGraphMinMax(diff, bound_type) {

		if(bound_type === 'min') {

			// if(this.min - diff < this.minLimit) {

			// 	return;

			// }

			this.min -= diff;




		} else if(bound_type === 'max') {

			// if(this.max - diff > this.maxLimit) {

			// 	return;

			// }

			this.max -= diff;

		}

		this._limits();

	}

}


module.exports = Axis;
},{"./rangeslider.js":20}],6:[function(require,module,exports){
class BufferLine {

	constructor(buffer, samplerate) {

		this.buffer = buffer;
		this.samplerate = samplerate;

	}


	draw(context, toX, toY) {

		context.beginPath();

		context.strokeStyle = '#CC0000';
		context.setLineDash([10, 3, 2, 3]);


		var sampleStep = 1 / this.samplerate;
		var pixelsPerSample = toX(sampleStep) - toX(0);
		var samplesPerPixel = 1 / pixelsPerSample;


		var xzero = toX(0);


		// if sample step is less than pixel step
		// draw per-pixel

		if(pixelsPerSample <= 1) {

			context.moveTo(xzero, toY(this.buffer[0]));


			for(var i = 1; i < this.buffer.length; i++) {

				// samplesPerPixel = 1 / pixelsPerSample

				var closestIndex = Math.floor(samplesPerPixel * i);

				context.lineTo(xzero + i, toY(this.buffer[closestIndex]));


				if(xzero + i > context.canvas.width) {

					break;

				}

			}

		}		


		// if sample step is more than pixel step
		// draw per sample

		if(pixelsPerSample > 1) {

			context.moveTo(xzero, toY(this.buffer[0]));


			for(var i = 1; i < this.buffer.length; i++) {


				context.lineTo(xzero + pixelsPerSample * i, toY(this.buffer[i]));


				if(xzero + pixelsPerSample * i > context.canvas.width) {

					break;

				}

			}

		}


		context.stroke();
		context.setLineDash([]);

	}

}


module.exports = BufferLine;
},{}],7:[function(require,module,exports){
var Observable = require('./observable.js');


class BufferSum extends Observable {

	constructor(bufferClassA, bufferClassB) {

		super();
		

		// Here a "bufferClass" is any class that implements
		// the method toBuffer(buffer, samplerate) and extends
		// Observable.

		this.bufferClassA = bufferClassA;
		this.bufferClassB = bufferClassB;


		this.bufferClassA.addObserver(this.notifyObservers.bind(this));
		this.bufferClassB.addObserver(this.notifyObservers.bind(this));


		this.buffer = new Float32Array(96000);

		this.addObserver(function() {

			this.toBuffer();

		});

	}



	toBuffer() {

		for(var i = 0; i < this.buffer.length; i++) {

			this.buffer[i] = this.bufferClassA.buffer[i] + this.bufferClassB.buffer[i];

		}

	}

}


module.exports = BufferSum;
},{"./observable.js":17}],8:[function(require,module,exports){
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

	this.editor.onPointMove();

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
},{}],9:[function(require,module,exports){
var Graph = require('./graph.js');
var HzEditor = require('./hzeditor.js');
var LogAxis = require('./logaxis.js');
var Axis = require('./axis.js');


class FrequencyGraph extends Graph {


	constructor(canvas2d, canvas3d) {

		super(canvas2d);

		
		this.xAxis = new LogAxis(true, 5, 10000, function() { return canvas2d.width; });
		this.yAxis = new LogAxis(false, 1, 100, function() { return canvas2d.height; });

		this.initAxes(this.xAxis, this.yAxis);


		this.hzeditor = new HzEditor(this);



		this.canvas3d = canvas3d;
		this.gl = canvas3d.getContext('webgl');

		if(!this.gl) {

			alert("Unable to initialize WebGL");

		}


		this.laplaceNeedsUpdate = true;

		this._initiateWebGL();

	}


	_drawElements(context, toX, toY) {

		this.laplaceNeedsUpdate = this.needsUpdate;


		if(this.laplaceNeedsUpdate) {

			this._drawLaplace(toX, toY);
			this.laplaceNeedsUpdate = false;

		}

		context.clearRect(0, 0, this.canvas.width, this.canvas.height);

		this.reference.draw(context, toX, toY);

		this.hzeditor.draw(context, toX, toY);

		this.xAxisRange.draw(context, toX, toY);
		this.yAxisRange.draw(context, toX, toY);

	}


	_drawLaplace(toX, toY) {

		// We need impulse response function eventually

		// this.gl.clearColor(1.0, 0.0, 0.0, 1.0);
		// this.gl.clear(this.gl.COLOR_BUFFER_BIT);

		this.gl.clearColor(1.0, 1.0, 1.0, 1.0); 
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);



		{

			const numComponents = 2;  // pull out 2 values per iteration
			const type = this.gl.FLOAT;    // the data in the buffer is 32bit floats
			const normalize = false;  // don't normalize
			const stride = 0;         // how many bytes to get from one set of values to the next
									  // 0 = use type and numComponents above
			const offset = 0;         // how many bytes inside the buffer to start from
			

			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.screenPosition);
			
			this.gl.vertexAttribPointer(
				this.programInfo.attribLocations.vertexScreenPosition,
				numComponents,
				type,
				normalize,
				stride,
				offset);
			
			this.gl.enableVertexAttribArray(
				this.programInfo.attribLocations.vertexScreenPosition);

		}


		{

			const numComponents = 2;  // pull out 2 values per iteration
			const type = this.gl.FLOAT;    // the data in the buffer is 32bit floats
			const normalize = false;  // don't normalize
			const stride = 0;         // how many bytes to get from one set of values to the next
									  // 0 = use type and numComponents above
			const offset = 0;         // how many bytes inside the buffer to start from
			

			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.graphPosition);


			this.graphPositions[0] = this.xAxis.max;
			this.graphPositions[1] = this.yAxis.min;
			this.graphPositions[2] = this.xAxis.min;
			this.graphPositions[3] = this.yAxis.min;
			this.graphPositions[4] = this.xAxis.max;
			this.graphPositions[5] = this.yAxis.max;
			this.graphPositions[6] = this.xAxis.min;
			this.graphPositions[7] = this.yAxis.max;


			this.gl.bufferData(this.gl.ARRAY_BUFFER, 
						this.graphPositions,
						this.gl.DYNAMIC_DRAW);


			
			this.gl.vertexAttribPointer(
				this.programInfo.attribLocations.vertexGraphPosition,
				numComponents,
				type,
				normalize,
				stride,
				offset);
			
			this.gl.enableVertexAttribArray(
				this.programInfo.attribLocations.vertexGraphPosition);

		}


		{
			this.gl.uniform1fv(this.programInfo.uniformLocations.ir, this.vizIR);

		}


		{

			this.gl.uniform1iv(this.programInfo.uniformLocations.axisTypes, this.axisTypes);

		}


		this.gl.useProgram(this.shaderProgram);


		const offset = 0;
		const vertexCount = 4;

		this.gl.drawArrays(this.gl.TRIANGLE_STRIP, offset, vertexCount);

	}


	_initiateWebGL() {

		this.gl.viewport(0, 0, this.canvas3d.width, this.canvas3d.height);


		const vsSource = `

			uniform lowp int uAxisTypes[2];

			attribute vec2 aVertexScreenPosition;
			attribute vec2 aVertexGraphPosition;

			varying lowp vec2 vVertexGraphPosition;


			void main() {

				gl_Position = vec4(aVertexScreenPosition, 0.0, 1.0);


				vVertexGraphPosition = aVertexGraphPosition;

				if(uAxisTypes[0] == 1) {

					vVertexGraphPosition.x = log(vVertexGraphPosition.x);

				}

				if(uAxisTypes[1] == 1) {

					vVertexGraphPosition.y = log(vVertexGraphPosition.y);

				}

			}			

		`;


		const fsSource = `

			#define buffer_length 1000
			#define samplerate 96000.0
			#define pi 3.1415926536

			uniform lowp int uAxisTypes[2];
			uniform lowp float uIR[buffer_length];

			varying lowp vec2 vVertexGraphPosition;

			
			lowp float computeLaplace(vec2 graphPosition) {


				// Sum over terms f(t)e^st
				// recall e^st = e^(re(s)t)(cos (imag s)t + i sin (imag s)t)

				lowp float re_sum = 0.0;
				lowp float im_sum = 0.0;
				lowp float t;

				for(int i = 0; i < buffer_length; i++) {

					t = float(i) / samplerate;	

					re_sum += exp(graphPosition.y * t) * cos(graphPosition.x * t * 2.0 * pi) * uIR[i];
					im_sum += exp(graphPosition.y * t) * sin(graphPosition.x * t * 2.0 * pi) * uIR[i];

				}

				return re_sum;

			}

			
			lowp vec3 color_interp(lowp float x) {

				lowp vec3 min = vec3(1.0, 1.0, 1.0);
				lowp vec3 max = vec3(1.0, 1.0, 0.0);

				lowp float minX = 0.0;
				lowp float maxX = 10.0;


				if(x <= minX) {
					return min;
				}

				if(x >= maxX) {
					return max;
				}

				return min + (max - min) * ((x - minX) / (maxX - minX));

			}


			void main() {


				lowp vec2 vgp = vVertexGraphPosition;


				if(uAxisTypes[0] == 1) {

					vgp.x = exp(vgp.x);

				}


				if(uAxisTypes[1] == 1) {

					vgp.y = exp(vgp.y);

				}


				lowp float laplace = computeLaplace(vgp);

				gl_FragColor = vec4(color_interp(laplace), 1.0);

			}

		`;


		this._initShaderProgram(vsSource, fsSource);
		this._initBuffers();

	}

	_initBuffers() {

		  // Create a buffer for the square's positions.

		const screenBuffer = this.gl.createBuffer();

		// Select the screenBuffer as the one to apply buffer
		// operations to from here out.

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, screenBuffer);

		// Now create an array of positions for the square.

		const screenPositions = [
			 1.0,  1.0,
			-1.0,  1.0,
			 1.0, -1.0,
			-1.0, -1.0,
		];

		// Now pass the list of screenPositions into WebGL to build the
		// shape. We do this by creating a Float32Array from the
		// JavaScript array, then use it to fill the current buffer.

		this.gl.bufferData(this.gl.ARRAY_BUFFER,
					new Float32Array(screenPositions),
					this.gl.STATIC_DRAW);



		/////////////////////

		this.graphPositions = new Float32Array(screenPositions);

		const graphBuffer = this.gl.createBuffer();

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, graphBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, 
					this.graphPositions,
					this.gl.DYNAMIC_DRAW);



		////////////////////

		this.axisTypes = new Int32Array(2);

		this.axisTypes[0] = this.xAxis.type;
		this.axisTypes[1] = this.yAxis.type;

		const axisBuffer = this.gl.createBuffer();

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, axisBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, 
					this.axisTypes,
					this.gl.STATIC_DRAW);



		this.buffers = {

			screenPosition: screenBuffer,
			graphPosition: graphBuffer,
			axisTypes: axisBuffer

		};

	}


	_initShaderProgram(vsSource, fsSource) {

		const vertexShader = this._loadShader(this.gl.VERTEX_SHADER, vsSource);
		const fragmentShader = this._loadShader(this.gl.FRAGMENT_SHADER, fsSource);


		// Create the shader program

		this.shaderProgram = this.gl.createProgram();

		this.gl.attachShader(this.shaderProgram, vertexShader);
		this.gl.attachShader(this.shaderProgram, fragmentShader);
		this.gl.linkProgram(this.shaderProgram);

		// If creating the shader program failed, alert

		if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)) {

			alert('Unable to initialize the shader program: ' + this.gl.getProgramInfoLog(this.shaderProgram));

		}


		this.programInfo = {

			attribLocations: {

				vertexScreenPosition: this.gl.getAttribLocation(this.shaderProgram, 'aVertexScreenPosition'),
				vertexGraphPosition: this.gl.getAttribLocation(this.shaderProgram, 'aVertexGraphPosition')

			},

			uniformLocations: {

				ir: this.gl.getUniformLocation(this.shaderProgram, 'uIR'),
				axisTypes: this.gl.getUniformLocation(this.shaderProgram, 'uAxisTypes')

			}

		};


		this.gl.useProgram(this.shaderProgram);

	}


	_loadShader(type, source) {

		const s = this.gl.createShader(type);
		this.gl.shaderSource(s, source);
		this.gl.compileShader(s);

		if (!this.gl.getShaderParameter(s, this.gl.COMPILE_STATUS)) {

			alert('An error occurred compiling the shaders: ' + this.gl.getShaderInfoLog(s));

		}

		return s;

	}


	addControlPoint(x, y) {

		var fromX = this.xAxis.canvasToGraph(x),
			fromY = this.yAxis.canvasToGraph(y);

		this.hzeditor.addControlPoint(fromX, fromY);

	}


}


module.exports = FrequencyGraph;

},{"./axis.js":5,"./graph.js":10,"./hzeditor.js":11,"./logaxis.js":14}],10:[function(require,module,exports){
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
	
	constructor(canvas, xAxis, yAxis) {

		this.canvas = canvas;
		this.context = canvas.getContext('2d');

		this.mousecontrol = new MouseControl(this);
		this.mouseBindings();


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


		this.needsUpdate = false;
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


	mouseBindings() {

		this.canvas.onmousedown = pdsc(this.mousecontrol, this.mousecontrol.onmousedown);
		this.canvas.ondblclick = pdsc(this.mousecontrol, this.mousecontrol.ondblclick);
		this.canvas.onmousewheel = pdsc(this.mousecontrol, this.mousecontrol.onscroll);


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
},{"./mousecontrol.js":16,"./rangeslider.js":20,"./referencelines.js":21}],11:[function(require,module,exports){
var PointEditor = require('./pointeditor.js');


class HzEditor extends PointEditor {

	constructor(graph) {

		super(graph);


		this.buffer = new Float32Array(96000);
		this.samplerate = 96000;

		this.addObserver(function() {

			this.toBuffer();

		});

	}


	toBuffer(buffer, samplerate) {

		this.buffer.fill(0);


		for(var i = 0; i < this.controlpoints.length; i++) {

			var cp = this.controlpoints[i];


			for(var j = 0; j < this.buffer.length; j++) {

				var t = j / this.samplerate;

				this.buffer[j] += Math.cos(cp.x * t * 2 * Math.PI) * Math.exp(cp.y * t);

				// Imaginary: += Math.sin(cp.x * t * 2 * Math.PI) * Math.exp(cp.y * t);

			}

		}

	}

}


module.exports = HzEditor;
},{"./pointeditor.js":18}],12:[function(require,module,exports){
var Graph = require('./graph.js');
var LineEditor = require('./lineeditor.js');
var Axis = require('./axis.js');
var BufferLine = require('./bufferline.js');


class IRGraph extends Graph {

	constructor(canvas) {

		super(canvas);

		this.xAxis = new Axis(true, -1, 2, function() { return canvas.width; });
		this.yAxis = new Axis(false, -1.5, 1.5, function() { return canvas.height; });

		this.initAxes(this.xAxis, this.yAxis);


		this.reference.xRef.specialLabels.push([0, 'Y (Waveform)', '#0000FF']);
		this.reference.xRef.specialLabels.push([1, 'END', '#00CC00', [10, 3, 2, 3]]);
		this.reference.yRef.specialLabels.push([0, 'X (s)', '#0000FF']);

		this.lineeditor = new LineEditor(this);
		this.lineeditor.addControlPoint(0, 0);

		this.vizline = new BufferLine(this.vizIR, 96000);

	}


	_drawElements(context, toX, toY) {

		context.clearRect(0, 0, this.canvas.width, this.canvas.height);

		this.reference.draw(context, toX, toY);

		this.lineeditor.draw(context, toX, toY);

		this.vizline.draw(context, toX, toY);

		this.xAxisRange.draw(context, toX, toY);
		this.yAxisRange.draw(context, toX, toY);

	}


	addControlPoint(x, y) {

		var fromX = this.xAxis.canvasToGraph(x),
			fromY = this.yAxis.canvasToGraph(y);

		this.lineeditor.addControlPoint(fromX, fromY);
	}


	getIR(buffer, samplerate) {

		this.lineeditor.toBuffer(buffer, samplerate);

	}


	setVizIR(buffer) {

		this.vizline.buffer = buffer;

	}


}


module.exports = IRGraph;
},{"./axis.js":5,"./bufferline.js":6,"./graph.js":10,"./lineeditor.js":13}],13:[function(require,module,exports){
var PointEditor = require('./pointeditor.js');
var PointLine = require('./pointline.js');



class LineEditor extends PointEditor {

	constructor(graph) {

		super(graph);

		this.pointLine = new PointLine();
		this.pointLine.points = this.controlpoints;



		this.buffer = new Float32Array(96000);
		this.samplerate = 96000;

		this.addObserver(function() {

			this.toBuffer();

		});

	}


	draw(context, toX, toY) {

		this.pointLine.draw(context, toX, toY);

		super.draw(context, toX, toY);

	}


	addControlPoint(x, y) {

		super._addControlPointNoUpdate(x, y);

		this.sort();

		this.notifyObservers();

	}


	removeControlPoint(o) {

		super._removeControlPointNoUpdate(o);

		this.sort();

		this.notifyObservers();

	}


	sort() {

		this.controlpoints.sort(function(a, b) {
			return a.x - b.x;
		});

	}


	onPointMove() {

		this.sort();

		this.notifyObservers();

	}


	toBuffer() {

		// We assume this.graph.xAxis is calibrated to seconds.

		this.buffer.fill(0);

		if(this.controlpoints.length < 2) {

			return;

		}


		// cp1 is the control point directly before the current point
		// cp2 is the control point directly after the current point

		var cp1 = this.controlpoints[0],
			cp2 = this.controlpoints[1];

		var cpi = 1;
		var escape = false;
		

		for(var i = 0; i < this.buffer.length; i++) {

			var time = i / this.samplerate;


			while(time > cp2.x) {

				cpi++;

				// If this point is beyond all control points.
				if(cpi  === this.controlpoints.length) {
					cpi--;
					this.buffer[i] = 0;

					escape = true;
					break;
				}

				cp1 = cp2;
				cp2 = this.controlpoints[cpi];

			}

			if(escape) {
				escape = false;
				continue;
			}

	 		
	 		// If this point is before all control points.
			if(time < cp1.x) {
				this.buffer[i] = 0;
				continue;
			}


			var slope = (cp2.y - cp1.y) / (cp2.x - cp1.x);
			
			this.buffer[i] = cp1.y + (time - cp1.x) * slope;

		}

	}

}


module.exports = LineEditor;

},{"./pointeditor.js":18,"./pointline.js":19}],14:[function(require,module,exports){
var Axis = require('./axis.js');


class LogAxis extends Axis {


	constructor(orientation, min, max, get_full_extent) {

		super(orientation, min, max, get_full_extent);


		if(min < 0 && max < 0) {

			this.min = -min;
			this.max = -max;

			this.sign = -1;


		} else if(this.min > 0 && this.max > 0) {

			this.sign = 1;

		} else {

			alert("Invalid logarithmic axis bounds.");

		}


		this.type = 1;

	}


	graphToCanvas(p) {

		p *= this.sign;

		var lmin = Math.log(this.min),
			lmax = Math.log(this.max);

		var ldiff = lmax - lmin;
		return (Math.log(p) - lmin) / ldiff * this.get_full_extent();

	}
	

	canvasToGraph(p) {

		var lmin = Math.log(this.min),
			lmax = Math.log(this.max);

		var ldiff = lmax - lmin;
		return Math.exp((p / this.get_full_extent()) * ldiff + lmin) * this.sign;

	}


	graphToCanvasInterval(refPoint, interval) {

		var epsilon = (this.max - this.min) / 1000;

		var cd = this.graphToCanvas(refPoint + epsilon) - this.graphToCanvas(refPoint);

		cd /= epsilon;
		cd *= interval;

		return cd;

	}


	canvasToGraphInterval(refPoint, interval) {

		var epsilon = 1e-3;

		var gd = this.canvasToGraph(refPoint + epsilon) - this.canvasToGraph(refPoint);

		gd /= epsilon;
		gd *= interval;

		return gd;

	}



	zoomIn() {


		var cMin = 0,
			cMax = this.get_full_extent();

		var min = cMin * 0.9 + cMax * 0.1,
			max = cMin * 0.1 + cMax * 0.9;

		this.min = this.canvasToGraph(min);
		this.max = this.canvasToGraph(max);

		this._limits();

	}


	zoomOut() {


		var cMin = 0,
			cMax = this.get_full_extent();

		var min = cMin * 1.125 + cMax * -0.125,
			max = cMin * -0.125 + cMax * 1.125;

		this.min = this.canvasToGraph(min);
		this.max = this.canvasToGraph(max);

		this._limits();

	}


	panCanvas(diff, pos) {


		// Improve this so we have sticky mouse behavior

		var pan = this.canvasToGraphInterval(pos, diff);

		this.panGraph(pan);

	}

}


module.exports = LogAxis;
},{"./axis.js":5}],15:[function(require,module,exports){


var IRGraph = require("./irgraph.js");
var FrequencyGraph = require("./frequencygraph.js");
var Audio = require("./audio.js");
var attachAudioDOM = require("./audioDOM.js");
var BufferSum = require('./buffersum.js');


var ir_canvas = document.getElementById('ir_graph');

var hz_canvas2d = document.getElementById('hz_graph2d');
var hz_canvas3d = document.getElementById('hz_graph3d');
var hz_div = document.getElementById('hz_div');


var ir = new IRGraph(ir_canvas);
var hz = new FrequencyGraph(hz_canvas2d, hz_canvas3d);


window.onresize = function() {

	ir_canvas.width = window.innerWidth - 20;
	ir_canvas.height = 500;


	ir.needsUpdate = true;


	hz_canvas2d.width = window.innerWidth - 20;
	hz_canvas2d.height = 500;

	hz_canvas3d.width = window.innerWidth - 20;
	hz_canvas3d.height = 500;

	hz_div.style = 'height: 500px';

	hz.needsUpdate = true;

	hz.gl.viewport(0, 0, hz_canvas3d.width, hz_canvas3d.height);


	draw();
};






var totalBuffer = new BufferSum(hz.hzeditor, ir.lineeditor);

ir.setVizIR(totalBuffer.buffer);
hz.setVizIR(totalBuffer.buffer);


//////////////////////////


var audio = new Audio();
attachAudioDOM(audio);



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




totalBuffer.addObserver(debounce(function() {

	audio.update_convolver(this.buffer);

}, 1000));



var m = 0;

function draw() {

	requestAnimationFrame(draw);


	ir.needsUpdate = hz.needsUpdate = ir.needsUpdate || hz.needsUpdate;


	ir.draw();
	hz.draw();

}

window.onresize();



///////////////////////




},{"./audio.js":3,"./audioDOM.js":4,"./buffersum.js":7,"./frequencygraph.js":9,"./irgraph.js":12}],16:[function(require,module,exports){

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


		this.graph.needsUpdate = true;
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

		this.graph.needsUpdate = true;

	
	} else if(this.mousedown) {

		var x = this._getX(e);
		var y = this._getY(e);

		this.graph.pan(x - this.oldClientX, y - this.oldClientY, x, y);

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

	this.graph.needsUpdate = true;

};


MouseControl.prototype.onscroll = function(e) {

	if(e.wheelDelta > 0) {
		this.graph.zoomIn();
	} else if(e.wheelDelta < 0) {
		this.graph.zoomOut();
	}

};


module.exports = MouseControl; // Singleton
},{}],17:[function(require,module,exports){

class Observable {

	constructor() {

		this.observers = [];

	}


	addObserver(f) {

		this.observers.push(f);

	}


	removeObserver(f) {

		var i = this.observers.indexOf(f);

		if(i > -1) {
			this.observers.splice(i, 1);
		}

	}


	notifyObservers() {

		for(var i = 0; i < this.observers.length; i++) {

			this.observers[i].call(this);

		}

	}

}


module.exports = Observable;
},{}],18:[function(require,module,exports){
var ControlPoint = require('./controlpoint.js');
var Observable = require('./observable.js');


class PointEditor extends Observable {

	constructor(graph) {

		super();

		this.controlpoints = [];

		this.graph = graph;

	}


	draw(context, toX, toY) {

		for(var i = 0; i < this.controlpoints.length; i++) {

			this.controlpoints[i].draw(context, toX, toY);

		}

	}


	_addControlPointNoUpdate(x, y) {

		var cp = new ControlPoint(x, y, this, this.graph);

		this.controlpoints.push(cp);
		this.graph.mousecontrol.addObject(cp);

	}


	addControlPoint(x, y) {

		this._addControlPointNoUpdate(x, y);

		this.notifyObservers();

	}


	_removeControlPointNoUpdate(o) {

		this.graph.mousecontrol.removeObject(o);

		var i = this.controlpoints.indexOf(o);

		if(i > -1) {
			this.controlpoints.splice(i, 1);
		}

	}

	removeControlPoint(o) {

		this._removeControlPointNoUpdate(o);

		this.notifyObservers();

	}


	onPointMove() {

		this.notifyObservers();
		
	}

}


module.exports = PointEditor;
},{"./controlpoint.js":8,"./observable.js":17}],19:[function(require,module,exports){
function PointLine() {

	this.points = [];
	this.color = '#FF0000';

}

PointLine.prototype.draw = function(context, toX, toY) {

	context.strokeStyle = this.color;

	context.beginPath();

	context.moveTo(toX(this.points[0].x), toY(this.points[0].y));
	
	for(var i = 1; i < this.points.length; i++) {
		context.lineTo(toX(this.points[i].x), toY(this.points[i].y));
	}

	context.stroke();

};


module.exports = PointLine;
},{}],20:[function(require,module,exports){
// Throughout this class, p refers to "principal" and s refers to
// "secondary", as a generic version of x/y or y/x, depending on the orientation.

function CornerDraggable(parent, bound_type) {

	this.parent = parent;

	this.p = 0;
	this.s = 0;

	this.strokeColor = "#000000";

	this.prevDragX = undefined;
	this.prevDragY = undefined;

	this.bound_type = bound_type;

}

CornerDraggable.prototype.distanceTo = function(x, y) {

	if(this.parent.axis.orientation) {

		var myX = this.p,
			myY = this.s;

	} else {

		var myX = this.s,
			myY = this.p;

	}

	return Math.sqrt((x - myX) * (x - myX) + (y - myY) * (y - myY));

};	

CornerDraggable.prototype.draw = function(context) {

	context.strokeStyle = this.strokeColor;

	if(this.parent.axis.orientation) {

		var x = this.p,
			y = this.s;

	} else {

		var x = this.s,
			y = this.p;		

	}


	context.beginPath();

	context.moveTo(x + this.parent.corner_drag_radius, y);
	context.arc(x, y, this.parent.corner_drag_radius, 0, 2 * Math.PI);

	context.stroke();

};


CornerDraggable.prototype.onactivestart = function() {

	this.strokeColor = '#FF0000';

};


CornerDraggable.prototype.onactiveend = function() {

	this.strokeColor = '#000000';

};


CornerDraggable.prototype.onmouseup = function() {

	this.prevDragX = undefined;
	this.prevDragY = undefined;

};


CornerDraggable.prototype.ondrag = function(x, y) {

	if(this.prevDragX !== undefined) {


		// Disable corners if corners are within dragging threshold

		if(Math.abs(this.parent.endP - this.parent.startP) < this.parent.corner_drag_thresh) {

			this.onmouseup();
			return;

		}


		if(this.parent.axis.orientation) {

			var dp = x - this.prevDragX,
				p = x;

		} else {

			var dp = y - this.prevDragY,
				p = y;

		}


		// convertSliderToCanvas




		var graphDistance = this.parent.axis.canvasToGraphInterval(p, dp);

		this.parent.axis.panGraphMinMax(-2 * graphDistance, this.bound_type);

	}

	this.prevDragX = x;
	this.prevDragY = y;

};




function RangeSlider(principal_axis, secondary_axis, specialLabels) {

	this.axis = principal_axis;
	this.saxis = secondary_axis;

	this.specialLabels = specialLabels;

	this.strokeColor;

	this.startP;
	this.endP;
	this.midS;
	this.minP;
	this.maxP;

	this.prevDragX = undefined;
	this.prevDragY = undefined;


	// Disable corner dragging at this length (px) 
	this.corner_drag_thresh = 20;
	this.corner_drag_radius = 3;

	this.corner_min = new CornerDraggable(this, 'min');
	this.corner_max = new CornerDraggable(this, 'max');

	this._enabledCornerDrag = null;


	// Bounding box

	this.bb_height = 20;
	this.bb_side_padding = 25;


	this.onactiveend();

}


RangeSlider.prototype._drawBB = function(context, toX, toY) {

	if(this.axis.orientation) {

		var toP = toX,
			toS = toY;
		
		var startX = 0,
		    startY = toY(this.saxis.max) - this.bb_height,
		    width = toX(this.axis.max),
		    height = this.bb_height;

	} else {

		var toP = toY,
			toS = toX;
	
		var startX = toX(this.saxis.max) - this.bb_height,
		    startY = 0,
		    width = this.bb_height,
		    height = toY(this.axis.max);

	}

	context.fillStyle = '#F5F5F5';
	context.fillRect(startX, startY, width, height);


	// These parameters provide padding from the canvas boundaries to the
	// computed mins and maxes. i.e. min is inset 20px from the extreme left.

	this.minP = this.bb_side_padding,
	this.maxP = toP(this.axis.max) - this.bb_side_padding;
	this.midS = toS(this.saxis.max) - (this.bb_height / 2);

};


RangeSlider.prototype.graphToSlider = function(p) {

	var diff = this.maxP - this.minP;

	return this.minP + this.axis.interpolateGlobal(p) * diff;

};


RangeSlider.prototype.sliderToGraph = function(p) {

	var diff = this.maxP - this.minP;

	return this.axis.interpolateGlobalInverse((p - this.minP) / diff);

};


RangeSlider.prototype.canvasToSlider = function(p) {

	return this.graphToSlider(this.axis.canvasToGraph(p));

};


RangeSlider.prototype.sliderToCanvas = function(p) {

	return this.axis.graphToCanvas(this.sliderToGraph(p));

};


RangeSlider.prototype._drawSpecialLines = function(context, toX, toY) {

	for(var i = 0; i < this.specialLabels.length; i++) {

		var sl = this.specialLabels[i];


		var p = this.graphToSlider(sl[0]);


		context.beginPath();

		context.beginPath();
		context.strokeStyle = sl[2];

		if(sl.length === 4) {

			context.setLineDash(sl[3]);

		}


		if(this.axis.orientation) {

			var startX = p,
				startY = toY(this.saxis.max) - this.bb_height,
				endX = p,
				endY = toY(this.saxis.max);

		} else {

			var startX = toX(this.saxis.max) - this.bb_height,
				startY = p,
				endX = toX(this.saxis.max),
				endY = p;

		}


		context.moveTo(startX, startY);
		context.lineTo(endX, endY);


		context.stroke();
		context.setLineDash([]);

	}

};


RangeSlider.prototype._recomputeStartEndP = function() {


	this.startP = this.graphToSlider(this.axis.min);
	this.endP = this.graphToSlider(this.axis.max);


	// Circles should not overlap
	if(this.endP - this.startP < this.corner_drag_radius * 2) {

		var avg = (this.endP + this.startP) / 2;
		this.startP = avg - this.corner_drag_radius;
		this.endP = avg + this.corner_drag_radius;

	}

};



RangeSlider.prototype._drawCornerCircles = function(context, toX, toY) {

	this.corner_max.p = this.endP;
	this.corner_max.s = this.midS;

	this.corner_min.p = this.startP;
	this.corner_min.s = this.midS;

	this.corner_min.draw(context);
	this.corner_max.draw(context);

};


RangeSlider.prototype._drawConnectingLine = function(context, toX, toY) {

	context.strokeStyle = this.strokeColor;
	context.beginPath();


	if(this.axis.orientation) {

		context.moveTo(this.startP + this.corner_drag_radius, this.midS);
		context.lineTo(this.endP - this.corner_drag_radius, this.midS);

	} else {

		context.moveTo(this.midS, this.startP + this.corner_drag_radius);
		context.lineTo(this.midS, this.endP - this.corner_drag_radius);

	}

	context.stroke();

};


RangeSlider.prototype.draw = function(context, toX, toY) {

	this._drawBB(context, toX, toY);
	this._drawSpecialLines(context, toX, toY);

	this._recomputeStartEndP();
	this.updateCornerDrag();

	this._drawCornerCircles(context, toX, toY);
	this._drawConnectingLine(context, toX, toY);


};

RangeSlider.prototype.distanceTo = function(x, y) {

	if(this.axis.orientation) {
		var p = x,
			s = y;
	} else {
		var s = x,
			p = y;
	}


	var startP = this.startP,
		endP = this.endP;

	if(this._enabledCornerDrag) {

		startP += this.corner_drag_radius;
		endP -= this.corner_drag_radius; 
	
	}


	if(p < startP) {

		return Math.sqrt((startP - p) * (startP - p) + (this.midS - s) * (this.midS - s));
	
	} else if(p > endP) {

		return Math.sqrt((endP - p) * (endP - p) + (this.midS - s) * (this.midS - s));

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


		// Revise here
		// Consider updating both corner draggables


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
	this._updateCornerColors();

};

RangeSlider.prototype.onactiveend = function() {

	this.strokeColor = '#000000';
	this._updateCornerColors();

};


RangeSlider.prototype.ondblclick = function() {
	this.axis.min = this.axis.minLimit;
	this.axis.max = this.axis.maxLimit;
};


RangeSlider.prototype.addMouseControl = function(mousecontrol) {

	this._mousecontrol = mousecontrol;

	mousecontrol.addObject(this);

};

RangeSlider.prototype._enableCornerDrag = function() {

	this._enabledCornerDrag = true;
	this._mousecontrol.addObject(this.corner_min);
	this._mousecontrol.addObject(this.corner_max);

	this._updateCornerColors();

};


RangeSlider.prototype._disableCornerDrag = function() {

	this._enabledCornerDrag = false;
	this._mousecontrol.removeObject(this.corner_min);
	this._mousecontrol.removeObject(this.corner_max);

	this._updateCornerColors();

};

RangeSlider.prototype.updateCornerDrag = function() {

	if(this.endP - this.startP < this.corner_drag_thresh) {

		if(this._enabledCornerDrag || this._enabledCornerDrag === null) {

			this._disableCornerDrag();

		}

	} else {

		if(!this._enabledCornerDrag || this._enabledCornerDrag === null) {

			this._enableCornerDrag();

		}

	}

};


RangeSlider.prototype._updateCornerColors = function() {

	if(!this._enabledCornerDrag) {

		this.corner_min.strokeColor = this.strokeColor;
		this.corner_max.strokeColor = this.strokeColor;

	} else {

		this.corner_min.onactiveend();
		this.corner_max.onactiveend();

	}

};


module.exports = RangeSlider;

},{}],21:[function(require,module,exports){
var ReferenceLinesAxis = require('./referencelinesaxis.js');


function ReferenceLines(principal_axis, secondary_axis) {

	this.xRef = new ReferenceLinesAxis(principal_axis, secondary_axis);
	this.yRef = new ReferenceLinesAxis(secondary_axis, principal_axis);

	this.xRef.minimum_label_distance = 60;
	this.yRef.minimum_label_distance = 25;
}




// Take rate of change at point (in canvas-space), expanded to encompass the whole canvas,
// and return log in base of line_multiples.

// ex. If non-linear scale has rate of change 10 at point P, and canvas is 100 pixels,
// then this returns log_{line_multiples} 1000.

// Point argument is irrelevant for linear scaling.

ReferenceLines.prototype._getScaleFactor = function(point, ref) {

	var span = ref.axis.canvasToGraphInterval(point, ref.axis.get_full_extent());

	return Math.log(span) / Math.log(ref.line_multiples);

}



// Generate array of shades and drawing callables
ReferenceLines.prototype._getDrawingArray = function(ref) {


	// scale- before variables refers to logarithmic values

	// Screen span

	var scalefactorTop = this._getScaleFactor(0, ref),
		scalefactorBottom = this._getScaleFactor(ref.axis.get_full_extent(), ref);


	// Draw this many scale levels below min 

	var scalefactorCutoff = 1.5;


	var scalefactorMin = Math.min(scalefactorTop, scalefactorBottom) - scalefactorCutoff,
		scalefactorMax = Math.max(scalefactorTop, scalefactorBottom);


	scalefactorMin = Math.floor(scalefactorMin);
	scalefactorMax = Math.ceil(scalefactorMax);



	var a = [];

	for(var scale = scalefactorMin; scale < scalefactorMax; scale++) {


		a.push([scale, function(scale, context, toX, toY) {
			ref.drawLinesAtScale(context, toX, toY, scale);
		}.bind(this, scale)]);


		a.push([scale - 100, function(scale, context, toX, toY) {
			ref.drawLabelsAtScale(context, toX, toY, scale);
		}.bind(this, scale)]);

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
		a[i][1](context, toX, toY);
	}



	this.xRef.drawSpecialLines(context, toX, toY);
	this.yRef.drawSpecialLines(context, toX, toY);

	this.xRef.drawSpecialLabels(context, toX, toY);
	this.yRef.drawSpecialLabels(context, toX, toY);



};


module.exports = ReferenceLines;
},{"./referencelinesaxis.js":22}],22:[function(require,module,exports){


function ReferenceLinesAxis(principal_axis, secondary_axis) {
	this.axis = principal_axis;

	// Required only for drawing
	this.saxis = secondary_axis;

	// How many small lines between large lines (recursive)
	this.line_multiples = 10;

	// Increase this to see less frequent 
	this.minimum_label_distance = 100; //px


	// [[labelCoord, text, strokeStyle, <dashing> (optional)], ...]
	this.specialLabels = [];
}


ReferenceLinesAxis.prototype._iterateIntervalOverAxis = function(interval, f) {

	var begin = Math.floor(this.axis.min / interval) * interval,
		end = Math.ceil(this.axis.max / interval) * interval;


	for(var j = begin; j <= end; j += interval) {

		if(f.call(this, j)) {

			break;

		}

	}

};


ReferenceLinesAxis.prototype.getShade = function(scale, refPoint) {

	// Get canvas distance

	var interval = Math.pow(this.line_multiples, scale);

	var cd = this.axis.graphToCanvasInterval(refPoint, interval);


	// At this distance, lines appear completely black.
	// Linear interpolation from this to zero.

	var black_width = 200;

	return 1 - Math.max(0, Math.min(1, Math.abs(cd) / black_width));

};


ReferenceLinesAxis.prototype.drawLine = function(context, toX, toY, j) {

	function moveTo(x, y) {
		context.moveTo(toX(x), toY(y));
	}

	function lineTo(x, y) {
		context.lineTo(toX(x), toY(y));
	}


	var startP = j,
		endP = j,
		startS = this.saxis.min,
		endS = this.saxis.max;

	
	this.axis.orientationf(moveTo, startP, startS);
	this.axis.orientationf(lineTo, endP, endS);

};


// Eliminate duplication in this method

ReferenceLinesAxis.prototype.drawLinesAtScale = function(context, toX, toY, scale) {
	
	var interval = Math.pow(this.line_multiples, scale);


	if(this.axis.type === this.axis.TYPE_LINEAR) {


		context.beginPath();


		var shade = this.getShade(scale, 0);

		var hex = Math.floor((1 - shade) * 255);

		var color = 'rgba(0, 0, 0, ' + (1 - shade) + ')';
		context.strokeStyle = color;


		var that = this;
		this._iterateIntervalOverAxis(interval, function(j) {

			for(var i = 0; i < this.specialLabels.length; i++) {

				if(Math.abs(j - this.specialLabels[i][0]) < 1e-10) {

					return false;

				}

			}


			that.drawLine(context, toX, toY, j);

		});

		context.stroke();



	} else if(this.axis.type === this.axis.TYPE_LOG) {


		var pixelThresh = 3;


		var that = this;
		this._iterateIntervalOverAxis(interval, function(j) {

			for(var i = 0; i < this.specialLabels.length; i++) {

				if(Math.abs(j - this.specialLabels[i][0]) < 1e-10) {

					return false;

				}

			}


			if(this.axis.graphToCanvasInterval(j, interval) < pixelThresh) {

				return true;

			}


			context.beginPath();


			var shade = this.getShade(scale, j);

			var hex = Math.floor((1 - shade) * 255);

			var color = 'rgba(0, 0, 0, ' + (1 - shade) + ')';
			context.strokeStyle = color;



			that.drawLine(context, toX, toY, j);

			context.stroke();

		});


	}

};


ReferenceLinesAxis.prototype.drawSpecialLines = function(context, toX, toY) {

	// Draw special lines

	for(var i = 0; i < this.specialLabels.length; i++) {

		var sl = this.specialLabels[i];

		context.beginPath();
		context.strokeStyle = sl[2];

		if(sl.length === 4) {

			context.setLineDash(sl[3]);

		}


		this.drawLine(context, toX, toY, sl[0]);


		context.stroke();
		context.setLineDash([]);

	}

};


ReferenceLinesAxis.prototype.drawLabel = function(context, toX, toY, offset, text, weight) {

	var centerX,
		centerY;

	var height = 14,
		inset = 20;

	if(this.axis.orientation) {
		centerX = toX(offset);
		centerY = inset;
	} else {
		centerX = inset;
		centerY = toY(offset);
	}


	context.textAlign = 'center';
	context.textBaseline = 'middle';
	
	var width = context.measureText(text).width + 4;

	// var width = 40;

	context.fillStyle = 'rgba(245, 245, 245, ' + weight + ')';
	context.fillRect(centerX - (width / 2), 
		centerY - (height / 2), 
		width, 
		height);


	context.fillStyle = 'rgba(0, 0, 0, ' + weight + ')';
	context.fillText(text, centerX, centerY);

};


ReferenceLinesAxis.prototype._isIntersectingSpecialLabel = function(j) {

	for(var i = 0; i < this.specialLabels.length; i++) {

		var d = this.axis.graphToCanvas(j) - this.axis.graphToCanvas(this.specialLabels[i][0]);
		
		var intersectSpecialLabel = Math.abs(d) < this.minimum_label_distance;


		if(intersectSpecialLabel) {

			return true;

		}

	}


	return false;

};


ReferenceLinesAxis.prototype.drawLabelsAtScale = function(context, toX, toY, scale) {


	var interval = Math.pow(this.line_multiples, scale);


	var that = this;
	this._iterateIntervalOverAxis(interval, function(j) {
		
		
		if(this._isIntersectingSpecialLabel(j)) {

			return false;

		}



		d = Math.abs(that.axis.graphToCanvasInterval(j, interval));

		var intersectOtherLabels = d < that.minimum_label_distance;

		if(intersectOtherLabels) {

			return true;

		}


		var weight = Math.abs(d - that.minimum_label_distance) / 20;

		that.drawLabel(context, toX, toY, j, (Math.round(j * 1e10) / 1e10).toExponential(), weight);

	});

};


ReferenceLinesAxis.prototype.drawSpecialLabels = function(context, toX, toY) {

	for(var i = 0; i < this.specialLabels.length; i++) {

		var sl = this.specialLabels[i];
		this.drawLabel(context, toX, toY, sl[0], sl[1], 1);

	}

};


module.exports = ReferenceLinesAxis;
},{}]},{},[15]);
