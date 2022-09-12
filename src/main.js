

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




/////
var hz_editor = new HzEditor(fg, og);

fg.editor = hz_editor.subEditor;
og.editor = hz_editor.subEditor0;
/////



window.onresize = function() {


	var height = 410;


	ir_canvas.width = window.innerWidth;
	ir_canvas.height = 410;


	ir.needsUpdate = true;


	fg_canvas2d.width = window.innerWidth / 2;
	fg_canvas2d.height = 410;

	fg_canvas3d.width = window.innerWidth / 2 - 20;
	fg_canvas3d.height = 410;

	fg_div.style = 'height: 410px; width: ' + fg_canvas2d.width + 'px;';

	fg.needsUpdate = true;

	fg.gl.viewport(0, 0, fg_canvas3d.width, fg_canvas3d.height);


	og_canvas.width = window.innerWidth / 2 - 20;
	og_canvas.height = 410;

	og.needsUpdate = true;


	draw();
};






var totalBuffer = new BufferSum(hz_editor, ir.editor);

ir.setVizIR(totalBuffer.buffer);
fg.setVizIR(totalBuffer.buffer);


//////////////////////////


var audio = new Audio();
attachAudioDOM(audio);



// Change debounce 

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

}, 1000));



var m = 0;

function draw() {

	requestAnimationFrame(draw);


	ir.needsUpdate = fg.needsUpdate = og.needsUpdate = ir.needsUpdate || fg.needsUpdate || og.needsUpdate;;


	ir.draw();
	fg.draw();
	og.draw();
}

window.onresize();



///////////////////////



