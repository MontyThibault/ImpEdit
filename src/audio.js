
var jsfft = require('jsfft');


class Audio {


	constructor() {

		this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

		var myAudio = document.querySelector('audio');
		this.source = this.audioContext.createMediaElementSource(myAudio);	

		this.block_size = 16384;
		this.lowpass_cutoff = 500; // Hz


		var z_array = new jsfft.ComplexArray(this.block_size, Float32Array);



		var lowpass_map = function(freq, i, n) {

			var hz = (this.audioContext.sampleRate / this.block_size)  * (i + 1); 


			if(hz > this.lowpass_cutoff) {
				freq.real = 0;
				freq.imag = 0;
			}

		}.bind(this);



		this.fft_processor = this.audioContext.createScriptProcessor(this.block_size, 2, 2);
		this.fft_processor.onaudioprocess = function(audioProcessingEvent) {

			var inputBuffer = audioProcessingEvent.inputBuffer;
			var outputBuffer = audioProcessingEvent.outputBuffer;

			for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {

				z_array.real = inputBuffer.getChannelData(channel);
				z_array.imag.fill(0);

				z_array.frequencyMap(lowpass_map);

				this._blendBlock(z_array.real, channel);
				this._previousBlend[channel] = z_array.real[z_array.real.length - 1];

			    outputBuffer.copyToChannel(z_array.real, channel, 0);

		    }

		}.bind(this);

		this._previousBlend = [0, 0];



		this.convolver = this.audioContext.createConvolver();
		this.convolver.buffer = this.audioContext.createBuffer(1, 96000, this.audioContext.sampleRate);

		this.convolver.loop = false;
		this.convolver.normalize = false;


		this.gainNode = this.audioContext.createGain();


		this.oscillatorNode = this.audioContext.createOscillator();
		this.oscillatorNode.type = 'sine';
		this.oscillatorNode.frequency.value = 3000;
		this.oscillatorNode.start();


		this.oscillatorOverride = false;
		this.convolve = false;
		this.fft = false;


		this.reconnect();

	}


	_blendBlock(buffer, channel) {


		// Quadratic blending.

		function factor(i) {

			return i * i;

		}


		// Smooth the beginning

		var blendLength = 30;
		var f;

		for(var i = 0; i < blendLength; i++) {

			f = factor(i / blendLength);

			buffer[i] = f * buffer[i] + (1 - f) * this._previousBlend[channel];

		}


		// Smooth the end

		var end = buffer.length - 1;
		var last = buffer[end];

		for(i = 0; i < blendLength; i++) {

			f = factor(i / blendLength);

			buffer[end - i] = f * buffer[end - i] + (1 - f) * last;

		}


	}


	updateConvolver(arrayBuffer) {

		// Simply this.convolver.buffer.copyToChannel(this.convolutionBufferArray, 0, 0);
		// does not work for some reason. But enter as a local variable

		var convlutionBuffer = this.convolver.buffer;

		convlutionBuffer.copyToChannel(arrayBuffer, 0, 0);

		this.convolver.buffer = convlutionBuffer;

	}


	refreshConvolver() {

		var cb = this.convolver.buffer;
		this.convolver.buffer = cb;

	}



	convolveEnable() {

		this.convolve = true;
		this.reconnect();

	}


	convolveDisable() {

		this.convolve = false;
		this.reconnect();

	}


	fftEnable() {

		this.fft = true;
		this.reconnect();

	}


	fftDisable() {

		this.fft = false;
		this.reconnect();

	}


	normalizationEnable() {

		this.convolver.normalize = true;

		this.refreshConvolver();

		this.reconnect();

	}


	normalizationDisable() {

		this.convolver.normalize = false;

		this.refreshConvolver();

		this.reconnect();

	}


	reconnect() {

		this.source.disconnect();
		this.fft_processor.disconnect();
		this.gainNode.disconnect();
		this.convolver.disconnect();
		this.oscillatorNode.disconnect();


		var last = this.source;

		if(this.fft) {

			last.connect(this.fft_processor);
			last = this.fft_processor;

		}


		if(!this.convolver.normalize) {

			last.connect(this.gainNode);
			last = this.gainNode;

		}


		if(this.convolve) {

			last.connect(this.convolver);
			last = this.convolver;

		}


		if(this.oscillatorOverride) {

			last = this.oscillatorNode;

			if(!this.convolver.normalize) {

				this.gainNode.disconnect();

				last.connect(this.gainNode);
				last = this.gainNode;

			}


		}

		last.connect(this.audioContext.destination);

	}

}


module.exports = Audio;