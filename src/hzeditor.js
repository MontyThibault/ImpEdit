var PointEditor = require('./pointeditor.js');
var OscillatorPoint = require('./oscillatorPoint.js');


class HzEditor extends PointEditor {

	constructor(editorGraph, editor0Graph) {

		super(null);


		this.subEditor = new PointEditor(editorGraph);
		this.subEditor0 = new PointEditor(editor0Graph);


		this.subEditor.addObserver(this.notifyObservers.bind(this));
		this.subEditor0.addObserver(this.notifyObservers.bind(this));


		this.subEditor.defaultX = 1000; // Hz
		this.subEditor.defaultY = -100; // Damping

		this.subEditor0.defaultX = 0.5; // Phase (0 - 2pi)
		this.subEditor0.defaultY = 0.5; // Amplitude

		this.subEditor.parent = this;
		this.subEditor0.parent = this;




		this.buffer = new Float32Array(96000);
		this.samplerate = 96000;

		this.addObserver(function() {

			this.toBuffer();

		});


		this.addObserver(function() {

			this.subEditor.graph.needsUpdate = true;
			this.subEditor0.graph.needsUpdate = true;

		});




		var old_f3 = this.subEditor.removeControlPoint;

		var that = this;
		this.subEditor.removeControlPoint = function(o) {

			that.removeControlPoint(o.parent);

		};


		var old_f4 = this.subEditor0.removeControlPoint;

		this.subEditor0.removeControlPoint = function(o) {

			that.removeControlPoint(o.parent);

		};

	}


	_addControlPointNoUpdate(cp1, cp2) {

		var op = new OscillatorPoint(cp1, cp2);

		this.controlpoints.push(op);

		return op;

	}


	addControlPointDefault() {

		var cp1 = this.subEditor._addControlPointNoUpdate(),
			cp2 = this.subEditor0._addControlPointNoUpdate();

		var op = this._addControlPointNoUpdate(cp1, cp2);

		this.notifyObservers();

		return op;

	}


	addControlPoint(x, y, x0, y0) {

		var cp1 = this.subEditor._addControlPointNoUpdate(x, y),
			cp2 = this.subEditor0._addControlPointNoUpdate(x0, y0);


		var op = this._addControlPointNoUpdate(cp1, cp2);

		this.notifyObservers();

		return op;

	}


	addControlPointEditor(x, y) {

		var cp1 = this.subEditor._addControlPointNoUpdate(x, y),
			cp2 = this.subEditor0._addControlPointNoUpdate();

		var op = this._addControlPointNoUpdate(cp1, cp2);

		this.notifyObservers();

		return op;

	}


	addControlPointEditor0(x, y) {

		var cp1 = this.subEditor._addControlPointNoUpdate(),
			cp2 = this.subEditor0._addControlPointNoUpdate(x, y);

		var op = this._addControlPointNoUpdate(cp1, cp2);

		this.notifyObservers();

		return op;

	}


	_removeControlPointNoUpdate(o) {

		var i = this.controlpoints.indexOf(o);

		if(i > -1) {
			this.controlpoints.splice(i, 1);
		}

	}


	removeControlPoint(o) {

		this.subEditor._removeControlPointNoUpdate(o.cp);
		this.subEditor0._removeControlPointNoUpdate(o.cp0);

		this._removeControlPointNoUpdate(o);

		this.notifyObservers();

	}


	toBuffer(buffer, samplerate) {

		this.buffer.fill(0);


		for(var i = 0; i < this.controlpoints.length; i++) {

			var cp = this.controlpoints[i];

			if(cp.disabled) {

				continue;

			}


			for(var j = 0; j < this.buffer.length; j++) {

				var t = j / this.samplerate;


				this.buffer[j] += cp.reAtTime(t);


			}

		}

	}

}


module.exports = HzEditor;