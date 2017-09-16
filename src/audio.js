
function Audio(canvas, context) {

	var audioContext = new (window.AudioContext || window.webkitAudioContext)();


	var myAudio = document.querySelector('audio');


	var source = audioContext.createMediaElementSource(myAudio);
	
	var analyser = audioContext.createAnalyser();


	source.connect(analyser);
	analyser.connect(audioContext.destination);

	/////////////////////////



	analyser.fftSize = 2048;
	var bufferLength = analyser.frequencyBinCount;
	var dataArray = new Uint8Array(bufferLength);
	analyser.getByteTimeDomainData(dataArray);


	// draw an oscilloscope of the current audio source

	function draw() {

	  drawVisual = requestAnimationFrame(draw);

	  window.crypto.getRandomValues(dataArray);

	  analyser.getByteTimeDomainData(dataArray);

	  context.fillStyle = 'rgb(200, 200, 200)';
	  context.fillRect(0, 0, canvas.width, canvas.height);

	  context.lineWidth = 2;
	  context.strokeStyle = 'rgb(0, 0, 0)';

	  context.beginPath();

	  var sliceWidth = canvas.width * 1.0 / bufferLength;
	  var x = 0;

	  for (var i = 0; i < bufferLength; i++) {

	    var v = dataArray[i] / 128.0;
	    var y = v * canvas.height / 2;

	    if (i === 0) {
	      context.moveTo(x, y);
	    } else {
	      context.lineTo(x, y);
	    }

	    x += sliceWidth;
	  }

	  context.lineTo(canvas.width, canvas.height / 2);
	  context.stroke();
	};

	draw();





	// EQ draw

	

}




module.exports = Audio;