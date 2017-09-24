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