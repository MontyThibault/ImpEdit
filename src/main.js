

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



totalBuffer.addObserver(throttle(function() {

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


window.onload = window.onresize;
window.onfocus = window.onresize;




/////////////////

dat.GUI.prototype.removeFolder = function(name) {

  var folder = this.__folders[name];


  if (!folder) {

    return;

  }

  folder.close();

  this.__ul.removeChild(folder.domElement.parentNode);
  delete this.__folders[name];
  this.onResize();

}


var gui = new dat.GUI();


var i = 0;


function addControlPointToGUI(op) {

	var f = gui.addFolder('CP ' + i++);

	var op = op || hz_editor.addControlPointDefault();
	op.fname = f.name;

	f.add(op.cp, 'x', fg.xAxis.minLimit, fg.xAxis.maxLimit).name('Frequency').listen();
	f.add(op.cp, 'y', fg.yAxis.minLimit, fg.yAxis.maxLimit).name('Damping').listen();
	f.add(op.cp0, 'x', og.xAxis.minLimit, og.xAxis.maxLimit).name('Phase').listen();
	f.add(op.cp0, 'y', og.yAxis.minLimit, og.yAxis.maxLimit).name('Amplitude').listen();


	f.addColor(op.cp, 'nonactiveColor').onChange(function(value) {

		op.cp0.nonactiveColor = value;


		// Let us assume that the point is not active while the user is
		// changing the color.

		op.cp.strokeColor = op.cp.nonactiveColor;
		op.cp0.strokeColor = op.cp.nonactiveColor;

	}).name('Color').listen();


	f.add(op.cp, 'outline').onChange(function(value) {

		op.cp0.outline = value;

	}).name('Outline').listen();


	f.onChange(function() {

		hz_editor.notifyObservers();

	});


	f.add({

		'removePoint': function() {

			hz_editor.removeControlPoint(op);

		}

	}, 'removePoint').name('Remove Control Point');

}


gui.add({

	'newControlPoint': addControlPointToGUI

}, 'newControlPoint').name('New Control Point');





function amendAddControlPoint(graph) {

	var f = graph.addControlPoint;

	graph.addControlPoint = function() {

		var oscillatorPoint = f.apply(graph, arguments);

		addControlPointToGUI(oscillatorPoint);

		return oscillatorPoint;

	}

}

amendAddControlPoint(fg);
amendAddControlPoint(og);



var f = hz_editor.removeControlPoint;

hz_editor.removeControlPoint = function(op) {

	gui.removeFolder(op.fname);
	f.call(hz_editor, op);

};



/////////////////////////



var gui2 = new dat.GUI();


// Overwrite dat.GUI close button position
// By default set to absolute (not sure why...) and messes with floating.

var style = document.createElement('style');
document.head.appendChild(style);

style.sheet.insertRule('.dg.main .close-button.close-bottom { position: static; }');
