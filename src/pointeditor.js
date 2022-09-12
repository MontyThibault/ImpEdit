var ControlPoint = require('./controlpoint.js');


class PointEditor {

	constructor(graph) {

		this.controlpoints = [];

		this.graph = graph;

	}


	draw(context, toX, toY) {

		for(var i = 0; i < this.controlpoints.length; i++) {
			this.controlpoints[i].draw(context, toX, toY);
		}

	}


	addControlPoint(x, y) {

		var cp = new ControlPoint(x, y, this, this.graph);

		this.controlpoints.push(cp);
		this.graph.mousecontrol.addObject(cp);


	}


	removeControlPoint(o) {

		this.graph.mousecontrol.removeObject(o);

		var i = this.controlpoints.indexOf(o);

		if(i > -1) {
			this.controlpoints.splice(i, 1);
		}

	}


	onPointMove() {

		
		
	}

}


module.exports = PointEditor;