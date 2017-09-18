

var Graph = require("./graph.js");
var Audio = require("./audio.js");
var attachAudioDOM = require("./audioDOM.js");


var ir_canvas = document.getElementById('ir_graph');
var ir_context = ir_canvas.getContext('2d');


var hz_canvas = document.getElementById('hz_graph');
var hz_context = hz_canvas.getContext('2d');



var ir = new Graph(ir_canvas);
var hz = new Graph(hz_canvas);


window.onresize = function() {

	ir_canvas.width = window.innerWidth;
	ir_canvas.height = 500;

	ir.needsUpdate = true;


	hz_canvas.width = window.innerWidth;
	hz_canvas.height = 500;

	hz.needsUpdate = true;


	draw();
};

function draw() {

	requestAnimationFrame(draw);

	ir.draw(ir_context);
	hz.draw(hz_context);

}

window.onresize();



///////////////////////



var audio = new Audio();
attachAudioDOM(audio);