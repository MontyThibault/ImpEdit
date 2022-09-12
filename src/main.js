

var Graph = require("./graph.js");
var Audio = require("./audio.js");
var attachAudioDOM = require("./audioDOM.js");


var graph_canvas = document.getElementById('screen');
var graph_context = graph_canvas.getContext('2d');


var graph = new Graph(graph_canvas);


window.onresize = function() {

	graph_canvas.width = window.innerWidth;
	graph_canvas.height = 500;

	graph.needsUpdate = true;

	draw();
};

function draw() {

	graph.draw(graph_context);
	requestAnimationFrame(draw);

}

window.onresize();



///////////////////////



var audio = new Audio();
attachAudioDOM(audio);