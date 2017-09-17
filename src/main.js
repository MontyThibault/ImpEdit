

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



var audio = new Audio();



var convolution_enabled = document.getElementById('convolution_enabled');
var fft_enabled = document.getElementById('fft_enabled');
var range_label = document.getElementById('range_label');
var range_slider = document.getElementById('range_slider');


convolution_enabled.onclick = function(e) {

	if(convolution_enabled.checked === true) {
		audio.convolve_enable();
	} else {
		audio.convolve_disable();
	}

};


fft_enabled.onclick = function(e) {

	if(fft_enabled.checked === true) {
		audio.fft_enable();
	} else {
		audio.fft_disable();
	}

};


var range_min = 20;
var range_max = 20000;

var range_log_base = 10;

range_slider.min = Math.log(range_min) / Math.log(range_log_base);
range_slider.max = Math.log(range_max) / Math.log(range_log_base);

range_slider.oninput = function() {

	var n = Math.floor(Math.pow(range_log_base, this.value));

	range_label.innerHTML = n + ' Hz';
	audio.lowpass_cutoff = n;

};

range_slider.value = (Math.log(range_min) + Math.log(range_max)) 
		/ (2 * Math.log(range_log_base));
range_slider.oninput();