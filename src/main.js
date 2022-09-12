

var Graph = require("./graph.js");


var canvas = document.getElementById('screen');
var context = canvas.getContext('2d');


var graph = new Graph(canvas);


window.onresize = function() {

	canvas.width = window.innerWidth;
	canvas.height = 500;

	draw();
};

function draw() {

	context.fillStyle = '#F5F5F5';
	context.fillRect(0, 0, canvas.width, canvas.height);

	graph.draw(context);
	requestAnimationFrame(draw);

}

window.onresize();