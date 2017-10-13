

require('./checkchrome.js');

var IRGraph = require("./irgraph.js");
var FrequencyGraph = require("./frequencygraph.js");
var OffsetGraph = require('./offsetgraph.js');

var Audio = require("./audio.js");
var attachAudioDOM = require("./audioDOM.js");
var oscillatorDOM = require('./oscillatorDOM.js');
var BufferSum = require('./buffersum.js');


var HzEditor = require('./hzeditor.js');

var ir_canvas = document.getElementById('ir_graph'),
	fg_canvas2d = document.getElementById('fg_graph2d'),
	fg_canvas3d = document.getElementById('fg_graph3d'),
	fg_div = document.getElementById('fg_div'),
	og_canvas = document.getElementById('og_graph');


var ir_context = ir_canvas.getContext('2d'),
	fg_context = fg_canvas2d.getContext('2d'),
	og_context = og_canvas.getContext('2d');




// Canvas setup


var ir = new IRGraph(ir_canvas);
var fg = new FrequencyGraph(fg_canvas2d, fg_canvas3d);
var og = new OffsetGraph(og_canvas);


var hz_editor = new HzEditor(fg, og);


fg.editor = hz_editor.subEditor;
og.editor = hz_editor.subEditor0;


ir.mouseBindings();
fg.mouseBindings();
og.mouseBindings();



window.onresize = function() {


	var height = ($(window).height() - $('audio').height()) / 2 - 5;

	var width = $(window).width(),
		halfwidth = $(window).width() / 2;


	ir.setWidthHeight(width, height);
	fg.setWidthHeight(halfwidth, height);
	og.setWidthHeight(halfwidth, height);

	fg_div.style = 'height: ' + height + 'px; width: ' + halfwidth + 'px;';

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



function draw() {

	requestAnimationFrame(draw);


	if(ir.draw()) {

		ir.copyToCanvas(ir_context);

	}
	

	if(og.draw()) {

		og.copyToCanvas(og_context);

	}
	

	if(fg.draw()) {

		fg.copyToCanvas(fg_context);

	}

}


window.onload = window.onresize;
window.onfocus = window.onresize;



// Buffers & audio setup


var totalBuffer = new BufferSum(hz_editor, ir.editor);

ir.setVizIR(totalBuffer.buffer);
fg.setVizIR(totalBuffer.buffer);



var audio = new Audio();


function throttle(fn, threshhold, scope) {
  threshhold || (threshhold = 250);
  var last,
      deferTimer;
  return function () {
    var context = scope || this;

    var now = +new Date,
        args = arguments;
    if (last && now < last + threshhold) {
      // hold on to it
      clearTimeout(deferTimer);
      deferTimer = setTimeout(function () {
        last = now;
        fn.apply(context, args);
      }, threshhold);
    } else {
      last = now;
      fn.apply(context, args);
    }
  };
}



totalBuffer.addObserver(function() {

	// Dirac-delta
	this.buffer[0] = 1;

});



totalBuffer.addObserver(throttle(function() {

	audio.updateConvolver(this.buffer);

}, 200));


// Prepare default buffer.

totalBuffer.notifyObservers();



totalBuffer.addObserver(function() {

	ir.needsUpdate = true;
	fg.needsUpdate = true;

});


oscillatorDOM(ir, fg, og, hz_editor);
attachAudioDOM(audio);