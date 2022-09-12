var ControlPoint = require('./controlpoint.js');
var Observable = require('./observable.js');


class PointEditor extends Observable {

	constructor(graph) {

		super();

		this.controlpoints = [];

		this.graph = graph;

	}


	draw(context, toX, toY) {

		for(var i = 0; i < this.controlpoints.length; i++) {

			this.controlpoints[i].draw(context, toX, toY);

		}

	}


	_addControlPointNoUpdate(x, y) {

		var cp = new ControlPoint(x, y, this, this.graph);

		this.controlpoints.push(cp);
		this.graph.mousecontrol.addObject(cp);

	}


	addControlPoint(x, y) {

		this._addControlPointNoUpdate(x, y);

		this.notifyObservers();

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