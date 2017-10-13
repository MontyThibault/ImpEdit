module.exports = function(ir, fg, og, hz_editor) {


	var gui = new dat.GUI({

		width: 400

	});


	var i = 0;



	function addControlPointToGUI(op) {

		var f = gui.addFolder('CP ' + i++);

		var op = op || hz_editor.addControlPointDefault();
		op.fname = f.name;



		f.sendFreqToBufferOverride = false;


		var freqC = f.add(op.cp, 'x', fg.xAxis.minLimit, fg.xAxis.maxLimit).onChange(f.updateFreq).name('Frequency');

		freqC.log = true;
		freqC.updateDisplay();

		f.updateFreq = function() {

			if(f.sendFreqToBufferOverride) {

				audio.oscillatorNode.frequency.value = freqC.getValue();

			}

		};


		var dampC = f.add(op.cp, 'y', fg.yAxis.minLimit, fg.yAxis.maxLimit).name('Damping');
		var phaseC = f.add(op.cp0, 'x', og.xAxis.minLimit, og.xAxis.maxLimit).name('Phase');
		var ampC = f.add(op.cp0, 'y', og.yAxis.minLimit, og.yAxis.maxLimit).name('Amplitude');


		f.addColor(op.cp, 'nonactiveColor').onChange(function(value) {

			op.cp0.nonactiveColor = value;


			// Let us assume that the point is not active while the user is
			// changing the color.

			op.cp.strokeColor = op.cp.nonactiveColor;
			op.cp0.strokeColor = op.cp.nonactiveColor;

		}).name('Color').listen();



		// These are broken in the event that the cp0 value is changed from
		// elsewhere than this GUI.

		f.add(op.cp, 'outline').onChange(function(value) {

			op.cp0.outline = value;

		}).name('Outline');


		f.add(op, 'disabled').name('Disable');


		f.add({

			'Toggle Tone': false


		}, 'Toggle Tone').onChange(function(value) {


			f.sendFreqToBufferOverride = value;
			audio.oscillatorOverride = value;
			audio.reconnect();


			// Propagate change to buffer override (see freqC controller above)

			freqC.setValue(freqC.getValue());


		});



		f.onChange(function() {

			hz_editor.notifyObservers();

		});


		f.onFinishChange(function() {

			hz_editor.notifyObservers();

		});



		f.add({

			'removePoint': function() {

				hz_editor.removeControlPoint(op);

			}

		}, 'removePoint').name('Remove Oscillator');


	}


	hz_editor.addObserver(function() {

		for(var i in gui.__folders) {

			var f = gui.__folders[i];

			f.updateDisplay();


			if(f.updateFreq) {

				f.updateFreq();

			}

		}

	});



	gui.add({

		'newControlPoint': addControlPointToGUI

	}, 'newControlPoint').name('New Oscillator');





	function amendAddControlPoint(graph) {

		var f = graph.addControlPoint;

		graph.addControlPoint = function() {

			var oscillatorPoint = f.apply(graph, arguments);

			addControlPointToGUI(oscillatorPoint);

			return oscillatorPoint;

		}

	}

	amendAddControlPoint(fg);
	amendAddControlPoint(og);



	var f = hz_editor.removeControlPoint;

	hz_editor.removeControlPoint = function(op) {

		gui.removeFolder(op.fname);
		f.call(hz_editor, op);

	};

};