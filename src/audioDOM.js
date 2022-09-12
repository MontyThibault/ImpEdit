require('./datguimodifications.js');


module.exports = function(audio) {


	var helpbox = document.getElementById('helpbox'),
		helptext = document.getElementById('helptext');


	helpbox.onclick = function(e) {

		if(helptext.style.visibility === 'visible') {

			helptext.style.visibility = 'hidden';

		} else {

			helptext.style.visibility = 'visible';

		}

	};

	var file_input = document.createElement('input');
	file_input.setAttribute('type', 'file');


	var params = {

		'Convolution Enabled': true,
		'Normalization Enabled': true,
		'FFT Enabled': false,
		'Gain': 0.1,
		'FFT Frequency': 1000

	};



	var audioGUI = new dat.GUI({

		width: 300

	});


	audioGUI.add({

		'Choose File': function() {

			file_input.click();

		}

	}, 'Choose File');


	var convC = audioGUI.add(params, 'Convolution Enabled').onChange(function(v) {

		if(v) {

			audio.convolveEnable();

		} else {

			audio.convolveDisable();

		}

	});


	var normC = audioGUI.add(params, 'Normalization Enabled');

	var gainC = audioGUI.add(params, 'Gain', 0.001, 1).onChange(function(v) {

		audio.gainNode.gain.value = v;

	});

	gainC.log = true;


	normC.onChange(function(v) {

		if(v) {

			audio.normalizationEnable();
			gainC.disable();

		} else {

			audio.normalizationDisable();
			gainC.enable();

		}

	});


	var fftEnblC = audioGUI.add(params, 'FFT Enabled');

	var fftFreqC = audioGUI.add(params, 'FFT Frequency', 100, 13000).onChange(function(v) {

		audio.lowpass_cutoff = v;
	
	});

	fftFreqC.log = true;


	fftEnblC.onChange(function(v) {

		if(v) {

			audio.fftEnable();
			fftFreqC.enable();

		} else {

			audio.fftDisable();
			fftFreqC.disable();

		}

	});


	// Defaults

	convC.setValue(convC.getValue());
	normC.setValue(normC.getValue());
	gainC.setValue(gainC.getValue());
	fftEnblC.setValue(fftEnblC.getValue());
	fftFreqC.setValue(fftFreqC.getValue());




	// Check for BlobURL support
	var blob = window.URL || window.webkitURL;

    if (!blob) {
        console.log('Your browser does not support Blob URLs. File selection disabled.');
        return;           
    } 



	// http://jsfiddle.net/adamazad/0oy5moph/
	file_input.onchange = function(e) {

		var file =  file_input.files[0];
		var fileURL = blob.createObjectURL(file);

		var myAudio = document.querySelector('audio');
		myAudio.src = fileURL;

	};


};