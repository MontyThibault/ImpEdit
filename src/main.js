
console.log("hello, world!");

var canvas = document.getElementById('screen');
var context = canvas.getContext('2d');

window.onresize = function() {

	canvas.width = window.innerWidth;
	canvas.height = 500;

	context.fillStyle = '#FF0000';
	context.fillRect(0, 0, canvas.width, canvas.height);


	// redraw();



};

window.onresize();