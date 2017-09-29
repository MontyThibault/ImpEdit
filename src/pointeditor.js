var ControlPoint = require('./controlpoint.js');
var Observable = require('./observable.js');


class PointEditor extends Observable {

	constructor(graph) {

		super();

		this.controlpoints = [];

		this.graph = graph;

		this.defaultX = 0;
		this.defaultY = 0;

	}


	draw(context, toX, toY) {

		for(var i = 0; i < this.controlpoints.length; i++) {

			this.controlpoints[i].draw(context, toX, toY);

		}

	}


	_addControlPointNoUpdate(x, y) {

		if(x === undefined) {

			x = this.defaultX;

		}

		if(y === undefined) {

			y = this.defaultY;

		}

		var cp = new ControlPoint(x, y, this, this.graph);

		this.controlpoints.push(cp);
		this.graph.mousecontrol.addObject(cp);

		return cp;

	}


	addControlPoint(x, y) {

		var cp = this._addControlPointNoUpdate(x, y);

		this.notifyObservers();

		return cp;

	}


	_removeControlPointNoUpdate(o) {

		this.graph.mousecontrol.removeObject(o);

		var i = this.controlpoints.indexOf(o);

		if(i > -1) {
			this.controlpoints.splice(i, 1);
		}

	}

	removeControlPoint(o) {

		this._removeControlPointNoUpdate(o);

		this.notifyObservers();

	}


	onPointMove() {

		this.notifyObservers();
		
	}

}


module.exports = PointEditor;