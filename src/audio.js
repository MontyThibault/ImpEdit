
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