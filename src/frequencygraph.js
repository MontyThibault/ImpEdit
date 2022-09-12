var Graph = require('./graph.js');
var HzEditor = require('./hzeditor.js');
var LogAxis = require('./logaxis.js');
var Axis = require('./axis.js');


class FrequencyGraph extends Graph {


	constructor(canvas2d, canvas3d) {

		super(canvas2d);

		this.xAxis = new Axis(true, 1, 10, function() { return canvas2d.width; });
		this.yAxis = new LogAxis(false, 10, 10000, function() { return canvas2d.height; });

		this.yAxis.maxLimit = 10000;
		this.xAxis.minLimit = -100000;
		this.xAxis.maxLimit = 100000;

		this.initAxes(this.xAxis, this.yAxis);


		this.hzeditor = new HzEditor(this);



		this.canvas3d = canvas3d;
		this.gl = canvas3d.getContext('webgl');

		if(!this.gl) {

			alert("Unable to initialize WebGL");

		}


		this.laplaceNeedsUpdate = true;

		this._initiateWebGL();

	}


	_drawElements(context, toX, toY) {

		this.laplaceNeedsUpdate = this.needsUpdate;


		if(this.laplaceNeedsUpdate) {

			this._drawLaplace(toX, toY);
			this.laplaceNeedsUpdate = false;

		}

		super._drawElements(context, toX, toY);

		this.hzeditor.draw(context, toX, toY);

	}


	_drawLaplace(toX, toY) {

		// We need impulse response function eventually

		// this.gl.clearColor(1.0, 0.0, 0.0, 1.0);
		// this.gl.clear(this.gl.COLOR_BUFFER_BIT);

		this.gl.clearColor(1.0, 1.0, 1.0, 1.0); 
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);



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


		const vsSource = `

			uniform lowp int uAxisTypes[2];

			attribute vec2 aVertexScreenPosition;
			attribute vec2 aVertexGraphPosition;

			varying lowp vec2 vVertexGraphPosition;


			void main() {

				gl_Position = vec4(aVertexScreenPosition, 0.0, 1.0);


				vVertexGraphPosition = aVertexGraphPosition;

				if(uAxisTypes[0] == 1) {

					vVertexGraphPosition.x = log(vVertexGraphPosition.x);

				}

				if(uAxisTypes[1] == 1) {

					vVertexGraphPosition.y = log(vVertexGraphPosition.y);

				}

			}			

		`;


		const fsSource = `

			#define buffer_length 1000
			#define samplerate 96000.0
			#define pi 3.1415926536

			uniform lowp int uAxisTypes[2];
			uniform lowp float uIR[buffer_length];

			varying lowp vec2 vVertexGraphPosition;

			
			lowp float computeLaplace(vec2 graphPosition) {


				// Sum over terms f(t)e^st
				// recall e^st = e^(re(s)t)(cos (imag s)t + i sin (imag s)t)

				lowp float re_sum = 0.0;
				lowp float im_sum = 0.0;
				lowp float t;

				for(int i = 0; i < buffer_length; i++) {

					t = float(i) / samplerate;	

					re_sum += exp(graphPosition.x * t) * cos(graphPosition.y * t * 2.0 * pi) * uIR[i];
					im_sum += exp(graphPosition.x * t) * sin(graphPosition.y * t * 2.0 * pi) * uIR[i];

				}

				return re_sum;

			}

			
			lowp vec3 color_interp(lowp float x) {

				lowp vec3 min = vec3(1.0, 1.0, 1.0);
				lowp vec3 max = vec3(1.0, 1.0, 0.0);

				lowp float minX = 0.0;
				lowp float maxX = 10.0;


				if(x <= minX) {
					return min;
				}

				if(x >= maxX) {
					return max;
				}

				return min + (max - min) * ((x - minX) / (maxX - minX));

			}


			void main() {


				lowp vec2 vgp = vVertexGraphPosition;


				if(uAxisTypes[0] == 1) {

					vgp.x = exp(vgp.x);

				}


				if(uAxisTypes[1] == 1) {

					vgp.y = exp(vgp.y);

				}


				lowp float laplace = computeLaplace(vgp);

				gl_FragColor = vec4(color_interp(laplace), 1.0);

			}

		`;


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


	getIR(buffer, samplerate) {

		this.hzeditor.toBuffer(buffer, samplerate);

	}


	addControlPoint(x, y) {

		var fromX = this.xAxis.canvasToGraph(x),
			fromY = this.yAxis.canvasToGraph(y);

		this.hzeditor.addControlPoint(fromX, fromY);

	}


}


module.exports = FrequencyGraph;
