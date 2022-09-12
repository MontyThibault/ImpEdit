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