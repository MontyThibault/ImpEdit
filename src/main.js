

var IRGraph = require("./irgraph.js");
var FrequencyGraph = require("./frequencygraph.js");
var OffsetGraph = require('./offsetgraph.js');

var Audio = require("./audio.js");
var attachAudioDOM = require("./audioDOM.js");
var BufferSum = require('./buffersum.js');





var HzEditor = require('./hzeditor.js');

var ir_canvas = document.getElementById('ir_graph');
var fg_canvas2d = document.getElementById('fg_graph2d');
var fg_canvas3d = document.getElementById('fg_graph3d');
var fg_div = document.getElementById('fg_div');
var og_canvas = document.getElementById('og_graph');




var ir = new IRGraph(ir_canvas);
var fg = new FrequencyGraph(fg_canvas2d, fg_canvas3d);
var og = new OffsetGraph(og_canvas);


var hz_editor = new HzEditor(fg, og);

fg.editor = hz_editor.subEditor;
og.editor = hz_editor.subEditor0;


ir.mouseBindings(ir_canvas);
fg.mouseBindings(fg_canvas2d);
og.mouseBindings(og_canvas);



window.onresize = function() {


	var height = 410,
		width = $(window).width(),
		halfwidth = $(window).width() / 2;


	ir.setWidthHeight(width, height);
	fg.setWidthHeight(halfwidth, height);
	og.setWidthHeight(halfwidth, height);

	fg_div.style = 'height: 410px; width: ' + halfwidth + 'px;';

	ir_canvas.width = width;
	ir_canvas.height = height;

	fg_canvas2d.width = halfwidth;
	fg_canvas2d.height = height;

	fg_canvas3d.width = halfwidth;
	fg_canvas3d.height = height;

	og_canvas.width = halfwidth;
	og_canvas.height = height;
	


	draw();
};






var totalBuffer = new BufferSum(hz_editor, ir.editor);

ir.setVizIR(totalBuffer.buffer);
fg.setVizIR(totalBuffer.buffer);


//////////////////////////


var audio = new Audio();
attachAudioDOM(audio);



function debounce(f, delay) {
  var timer = null;

  return function () {
    var context = this, 
    	args = arguments;

    clearTimeout(timer);

    timer = setTimeout(function () {
      f.apply(context, args);
    }, delay);
  };
}



totalBuffer.addObserver(debounce(function() {

	audio.updateConvolver(this.buffer);

}, 200));


totalBuffer.addObserver(function() {

	ir.needsUpdate = true;
	fg.needsUpdate = true;

});


hz_editor.addObserver(function() {

	this.subEditor.graph.needsUpdate = true;
	this.subEditor0.graph.needsUpdate = true;

});





function draw() {

	requestAnimationFrame(draw);


	ir.draw();
	fg.draw();
	og.draw();

	
}

window.onresize();

