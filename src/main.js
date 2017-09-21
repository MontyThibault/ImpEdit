

var IRGraph = require("./irgraph.js");
var FrequencyGraph = require("./frequencygraph.js");
var Audio = require("./audio.js");
var attachAudioDOM = require("./audioDOM.js");


var ir_canvas = document.getElementById('ir_graph');

var hz_canvas2d = document.getElementById('hz_graph2d');
var hz_canvas3d = document.getElementById('hz_graph3d');
var hz_div = document.getElementById('hz_div');


var ir = new IRGraph(ir_canvas);
var hz = new FrequencyGraph(hz_canvas2d, hz_canvas3d);


window.onresize = function() {

	ir_canvas.width = window.innerWidth - 20;
	ir_canvas.height = 500;


	ir.needsUpdate = true;


	hz_canvas2d.width = window.innerWidth - 20;
	hz_canvas2d.height = 500;

	hz_canvas3d.width = window.innerWidth - 20;
	hz_canvas3d.height = 500;

	hz_div.style = 'height: 500px';


	hz.needsUpdate = true;

	hz.gl.viewport(0, 0, hz_canvas3d.width, hz_canvas3d.height);


	draw();
};



var irBuffer = new Float32Array(1000);
hz.setVizIR(irBuffer);

var hzBuffer = new Float32Array(1000);
ir.setVizIR(hzBuffer);


function draw() {

	requestAnimationFrame(draw);


	ir.getIR(irBuffer, 96000);
	hz.getIR(hzBuffer, 96000);

	ir.needsUpdate = hz.needsUpdate = ir.needsUpdate || hz.needsUpdate;


	ir.draw();
	hz.draw();

}

window.onresize();



///////////////////////



var audio = new Audio();
attachAudioDOM(audio);
