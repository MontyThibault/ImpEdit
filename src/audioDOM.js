module.exports = function(audio) {

	var convolution_enabled = document.getElementById('convolution_enabled'),
		fft_enabled = document.getElementById('fft_enabled'),
		range_label = document.getElementById('range_label'),
		range_slider = document.getElementById('range_slider'),
		normalization_enabled = document.getElementById('normalization_enabled'),
		gain_label = document.getElementById('gain_label'),
		gain_slider = document.getElementById('gain_slider');


	var audio_file = document.getElementById('audio_file');


	// Check for BlobURL support
	var blob = window.URL || window.webkitURL;

    if (!blob) {
        console.log('Your browser does not support Blob URLs. File selection disabled.');
        return;           
    } 


	convolution_enabled.onclick = function(e) {

		if(convolution_enabled.checked) {

			audio.convolveEnable();
		
		} else {

			audio.convolveDisable();

		}

	};


	fft_enabled.onclick = function(e) {

		if(fft_enabled.checked) {

			audio.fftEnable();
			range_label.style.visibility = "visible";
			range_slider.style.visibility = "visible";
		
		} else {

			audio.fftDisable();
			range_label.style.visibility = "hidden";
			range_slider.style.visibility = "hidden";

		}

	};


	normalization_enabled.onclick = function(e) {

		if(normalization_enabled.checked) {

			audio.normalizationEnable();
			gain_label.style.visibility = "hidden";
			gain_slider.style.visibility = "hidden";

		} else {

			audio.normalizationDisable();
			gain_label.style.visibility = "visible";
			gain_slider.style.visibility = "visible";

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



	gain_slider.oninput = function() {

		audio.gainNode.gain = this.value;

		gain_label.innerHTML = 'Gain: ' + this.value;

	};


	// http://jsfiddle.net/adamazad/0oy5moph/
	audio_file.onchange = function(e) {

		var file =  audio_file.files[0];
		var fileURL = blob.createObjectURL(file);

		var myAudio = document.querySelector('audio');
		myAudio.src = fileURL;

	};






	// Defaults

	normalization_enabled.checked = true;
	normalization_enabled.onclick();

	convolution_enabled.checked = false;
	convolution_enabled.onclick();

	fft_enabled.checked = false;
	fft_enabled.onclick();


};