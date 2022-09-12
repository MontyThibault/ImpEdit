class ControlPoint {

	constructor(x, y, editor, graph) {

		this.x = x;
		this.y = y;

		this.editor = editor;
		this.graph = graph;

		this.strokeColor;
		this.onactiveend();
		
	}


	draw(context, toX, toY) {
	
		// Draw circle
		context.strokeStyle = this.strokeColor;

		context.beginPath();
		context.arc(toX(this.x), toY(this.y), 10, 0, 2 * Math.PI);
		context.stroke();

	}


	distanceTo(x, y) {

		var x_canvas = this.graph.xAxis.graphToCanvas(this.x),
			y_canvas = this.graph.yAxis.graphToCanvas(this.y);

		return Math.sqrt((x_canvas - x) * (x_canvas - x) + 
			(y_canvas - y) * (y_canvas - y));

	}


	ondrag(x, y) {

		this.x = this.graph.xAxis.canvasToGraph(x);
		this.y = this.graph.yAxis.canvasToGraph(y);

		this.editor.onPointMove();

	}


	onactivestart() {

		this.strokeColor = '#FF0000';

	}


	onactiveend() {

		this.strokeColor = '#000000';

	}


	ondblclick() {

		this.editor.removeControlPoint(this);

	}

}


module.exports = ControlPoint;