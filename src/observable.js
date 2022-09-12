
class Observable {

	constructor() {

		this.observers = [];

	}


	addObserver(f) {

		this.observers.push(f);

	}


	removeObserver(f) {

		var i = this.observers.indexOf(f);

		if(i > -1) {
			this.observers.splice(i, 1);
		}

	}


	notifyObservers() {

		for(var i = 0; i < this.observers.length; i++) {

			this.observers[i].call(this);

		}

	}

}


module.exports = Observable;