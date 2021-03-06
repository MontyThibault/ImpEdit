var Graph = require('./graph.js');
var HzEditor = require('./hzeditor.js');
var LogAxis = require('./logaxis.js');
var Axis = require('./axis.js');


var vsSource = require('./vShaderGLSL.js');
var fsSource = require('./fShaderGLSL.js');



class FrequencyGraph extends Graph {


	constructor(onscreen2dCanvas, onscreen3dCanvas) {

		super(onscreen2dCanvas);

		this.onscreen3dCanvas = onscreen3dCanvas;
		this.onscreen3dContext = onscreen3dCanvas.getContext('2d');

		
		this.xAxis = new LogAxis(true, 100, 10000, function() { return this.canvas.width; }.bind(this));
		this.yAxis = new LogAxis(false, -100000, -100, function() { return this.canvas.height; }.bind(this));

		this.initAxes(this.xAxis, this.yAxis);

		this.reference.xRef.addSpecialLabel({

			coord: 75,
			coord_system: 'canvas',
			text: 'F (Hz) (Log)',

		});

		this.reference.yRef.addSpecialLabel({

			coord: 50,
			coord_system: 'canvas',
			text: '\u03bb (Log)',

		});


		this.editor = null;
		this.laplaceEnabled = true;

		this.canvas3d = document.createElement('canvas');
		this.gl = this.canvas3d.getContext('webgl', {
			antialias: true
		});

		if(!this.gl) {

			alert("Unable to initialize WebGL");

		}


		this._initiateWebGL();

	}


	_drawElements(context, toX, toY) {

		context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.gl.clearColor(1.0, 1.0, 1.0, 1.0); 
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);


		if(this.laplaceEnabled) {

			this._drawLaplace(toX, toY);

		}


		this.reference.draw(context, toX, toY);

		this.editor.draw(context, toX, toY);

		this.xAxisRange.draw(context, toX, toY);
		this.yAxisRange.draw(context, toX, toY);

	}


	copyToCanvas(context) {

		super.copyToCanvas(context);

		this.onscreen3dContext.clearRect(0, 0, this.onscreen3dCanvas.width, this.onscreen3dCanvas.height);
		this.onscreen3dContext.drawImage(this.canvas3d, 0, 0, this.canvas3d.width, this.canvas3d.height);

	}


	setWidthHeight(w, h) {

		super.setWidthHeight(w, h);

		this.canvas3d.width = w * window.devicePixelRatio;
		this.canvas3d.height = h * window.devicePixelRatio;


		this.gl.viewport(0, 0, w * window.devicePixelRatio, h * window.devicePixelRatio);


	}


	_drawLaplace(toX, toY) {

		// this.gl.clearColor(1.0, 0.0, 0.0, 1.0);
		// this.gl.clear(this.gl.COLOR_BUFFER_BIT);


		{

			const numComponents = 2;  // pull out 2 values per iteration
			const type = this.gl.FLOAT;    // the data in the buffer is 32bit floats
			const normalize = false;  // don't normalize
			const stride = 0;         // how many bytes to get from one set of values to the next
									  // 0 = use type and numComponents above
			const offset = 0;         // how many bytes inside the buffer to start from
			

			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.screenPosition);
			
			this.gl.vertexAttribPointer(
				this.programInfo.attribLocations.vertexScreenPosition,
				numComponents,
				type,
				normalize,
				stride,
				offset);
			
			this.gl.enableVertexAttribArray(
				this.programInfo.attribLocations.vertexScreenPosition);

		}


		{

			const numComponents = 2;  // pull out 2 values per iteration
			const type = this.gl.FLOAT;    // the data in the buffer is 32bit floats
			const normalize = false;  // don't normalize
			const stride = 0;         // how many bytes to get from one set of values to the next
									  // 0 = use type and numComponents above
			const offset = 0;         // how many bytes inside the buffer to start from
			

			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.graphPosition);


			this.graphPositions[0] = this.xAxis.max;
			this.graphPositions[1] = this.yAxis.min;
			this.graphPositions[2] = this.xAxis.min;
			this.graphPositions[3] = this.yAxis.min;
			this.graphPositions[4] = this.xAxis.max;
			this.graphPositions[5] = this.yAxis.max;
			this.graphPositions[6] = this.xAxis.min;
			this.graphPositions[7] = this.yAxis.max;


			this.gl.bufferData(this.gl.ARRAY_BUFFER, 
						this.graphPositions,
						this.gl.DYNAMIC_DRAW);


			
			this.gl.vertexAttribPointer(
				this.programInfo.attribLocations.vertexGraphPosition,
				numComponents,
				type,
				normalize,
				stride,
				offset);
			
			this.gl.enableVertexAttribArray(
				this.programInfo.attribLocations.vertexGraphPosition);

		}


		{
			this.gl.uniform1fv(this.programInfo.uniformLocations.ir, this.vizIR);

		}


		{

			this.gl.uniform1iv(this.programInfo.uniformLocations.axisTypes, this.axisTypes);

		}


		this.gl.useProgram(this.shaderProgram);


		const offset = 0;
		const vertexCount = 4;

		this.gl.drawArrays(this.gl.TRIANGLE_STRIP, offset, vertexCount);

	}


	_initiateWebGL() {

		this.gl.viewport(0, 0, this.canvas3d.width, this.canvas3d.height);


		this._initShaderProgram(vsSource, fsSource);
		this._initBuffers();

	}

	_initBuffers() {

		  // Create a buffer for the square's positions.

		const screenBuffer = this.gl.createBuffer();

		// Select the screenBuffer as the one to apply buffer
		// operations to from here out.

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, screenBuffer);

		// Now create an array of positions for the square.

		const screenPositions = [
			 1.0,  1.0,
			-1.0,  1.0,
			 1.0, -1.0,
			-1.0, -1.0,
		];

		// Now pass the list of screenPositions into WebGL to build the
		// shape. We do this by creating a Float32Array from the
		// JavaScript array, then use it to fill the current buffer.

		this.gl.bufferData(this.gl.ARRAY_BUFFER,
					new Float32Array(screenPositions),
					this.gl.STATIC_DRAW);



		/////////////////////

		this.graphPositions = new Float32Array(screenPositions);

		const graphBuffer = this.gl.createBuffer();

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, graphBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, 
					this.graphPositions,
					this.gl.DYNAMIC_DRAW);



		////////////////////

		this.axisTypes = new Int32Array(2);

		this.axisTypes[0] = this.xAxis.type;
		this.axisTypes[1] = this.yAxis.type;


		if(this.xAxis.sign === -1) {

			this.axisTypes[0] = 2;

		}

		if(this.yAxis.sign === -1) {

			this.axisTypes[1] = 2;

		}


		const axisBuffer = this.gl.createBuffer();

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, axisBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, 
					this.axisTypes,
					this.gl.STATIC_DRAW);



		this.buffers = {

			screenPosition: screenBuffer,
			graphPosition: graphBuffer,
			axisTypes: axisBuffer

		};

	}


	_initShaderProgram(vsSource, fsSource) {

		const vertexShader = this._loadShader(this.gl.VERTEX_SHADER, vsSource);
		const fragmentShader = this._loadShader(this.gl.FRAGMENT_SHADER, fsSource);


		// Create the shader program

		this.shaderProgram = this.gl.createProgram();

		this.gl.attachShader(this.shaderProgram, vertexShader);
		this.gl.attachShader(this.shaderProgram, fragmentShader);
		this.gl.linkProgram(this.shaderProgram);

		// If creating the shader program failed, alert

		if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)) {

			alert('Unable to initialize the shader program: ' + this.gl.getProgramInfoLog(this.shaderProgram));

		}


		this.programInfo = {

			attribLocations: {

				vertexScreenPosition: this.gl.getAttribLocation(this.shaderProgram, 'aVertexScreenPosition'),
				vertexGraphPosition: this.gl.getAttribLocation(this.shaderProgram, 'aVertexGraphPosition')

			},

			uniformLocations: {

				ir: this.gl.getUniformLocation(this.shaderProgram, 'uIR'),
				axisTypes: this.gl.getUniformLocation(this.shaderProgram, 'uAxisTypes')

			}

		};


		this.gl.useProgram(this.shaderProgram);

	}


	_loadShader(type, source) {

		const s = this.gl.createShader(type);
		this.gl.shaderSource(s, source);
		this.gl.compileShader(s);

		if (!this.gl.getShaderParameter(s, this.gl.COMPILE_STATUS)) {

			alert('An error occurred compiling the shaders: ' + this.gl.getShaderInfoLog(s));

		}

		return s;

	}


	addControlPoint(x, y) {

		var fromX = this.xAxis.canvasToGraph(x),
			fromY = this.yAxis.canvasToGraph(y);


		return this.editor.parent.addControlPointEditor(fromX, fromY);

	}


}


module.exports = FrequencyGraph;
