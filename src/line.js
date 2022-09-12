function Line() {
	this.points = [];
	this.color = '#FF0000';
}

Line.prototype.draw = function(context, toX, toY) {

	context.strokeStyle = this.color;

	context.beginPath();

	context.moveTo(toX(this.points[0].x), toY(this.points[0].y));
	
	for(var i = 1; i < this.points.length; i++) {
		context.lineTo(toX(this.points[i].x), toY(this.points[i].y));
	}

	context.stroke();

};

module.exports = Line;