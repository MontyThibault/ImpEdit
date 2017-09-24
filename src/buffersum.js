var Observable = require('./observable.js');


class BufferSum extends Observable {

	constructor(bufferClassA, bufferClassB) {

		super();
		

		// Here a "bufferClass" is any class that implements
		// the method toBuffer(buffer, samplerate) and extends
		// Observable.

		this.bufferClassA = bufferClassA;
		this.bufferClassB = bufferClassB;


		this.bufferClassA.addObserver(this.notifyObservers.bind(this));
		this.bufferClassB.addObserver(this.notifyObservers.bind(this));


		this.buffer = new Float32Array(96000);

		this.addObserver(function() {

			this.toBuffer();

		});

	}



	toBuffer() {

		for(var i = 0; i < this.buffer.length; i++) {

			this.buffer[i] = this.bufferClassA.buffer[i] + this.bufferClassB.buffer[i];

		}

	}

}


module.exports = BufferSum;