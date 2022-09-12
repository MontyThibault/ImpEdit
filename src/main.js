

var Graph = require("./graph.js");
var Audio = require("./audio.js");


var graph_canvas = document.getElementById('screen');
var graph_context = graph_canvas.getContext('2d');


var graph = new Graph(graph_canvas);


window.onresize = function() {

	graph_canvas.width = window.innerWidth;
	graph_canvas.height = 500;

	draw();
};

function draw() {

	graph_context.fillStyle = '#F5F5F5';
	graph_context.fillRect(0, 0, graph_canvas.width, graph_canvas.height);

	graph.draw(graph_context);
	requestAnimationFrame(draw);

}

window.onresize();




///////////////////////

var eq_canvas = document.getElementById('eq');
var eq_context = eq_canvas.getContext('2d');

Audio(eq_canvas, eq_context);