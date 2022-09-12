
var jsfft = require('jsfft');



function Audio(canvas, context) {

	var audioContext = new (window.AudioContext || window.webkitAudioContext)();


	var myAudio = document.querySelector('audio');


	var source = audioContext.createMediaElementSource(myAudio);	

	var block_size = 16384;

	var z_array = new jsfft.ComplexArray(block_size, Float32Array);


	window.cutoff = 500;



	var processor = audioContext.createScriptProcessor(block_size, 2, 2);
	processor.onaudioprocess = function(audioProcessingEvent) {

		var inputBuffer = audioProcessingEvent.inputBuffer;
		var outputBuffer = audioProcessingEvent.outputBuffer;

		for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {

			z_array.real = inputBuffer.getChannelData(channel);
			z_array.imag.fill(0);

			z_array.frequencyMap((freq, i, n) => {

				if(i > window.cutoff) {
					freq.real = 0;
					freq.imag = 0;
				}

			});


		    outputBuffer.copyToChannel(z_array.real, channel, 0);
		    lastSamples[channel] = z_array.real[block_size - 2];

	    }

	};


	source.connect(processor);
	processor.connect(audioContext.destination);



	
	

	// var dataArray = new Float32Array(block_size);

	// // draw an oscilloscope of the current audio source

	// function draw() {

	// drawVisual = requestAnimationFrame(draw);

	// 	analyser.getByteTimeDomainData(dataArray);

	// 	context.fillStyle = 'rgb(200, 200, 200)';
	// 	context.fillRect(0, 0, canvas.width, canvas.height);

	// 	context.lineWidth = 2;
	// 	context.strokeStyle = 'rgb(0, 0, 0)';

	// 	context.beginPath();

	// 	var sliceWidth = canvas.width * 1.0 / bufferLength;
	// 	var x = 0;

	// 	for (var i = 0; i < bufferLength; i++) {

	// 			var v = dataArray[i] / 128.0;
	// 		var y = v * canvas.height / 2;

	// 		if (i === 0) {
	// 		  context.moveTo(x, y);
	// 		} else {
	// 		  context.lineTo(x, y);
	// 		}

	// 		x += sliceWidth;
	// 	}

	// 	// context.lineTo(canvas.width, canvas.height / 2);
	// 	context.lineTo(canvas.width, y);

	// 	context.stroke();
	// };

	// draw();
	

}




module.exports = Audio;