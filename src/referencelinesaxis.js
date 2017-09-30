

class ReferenceLinesAxis {


	constructor(principal_axis, secondary_axis) {

		this.axis = principal_axis;

		// Required only for drawing
		this.saxis = secondary_axis;

		// How many small lines between large lines (recursive)
		// For 10, we have 1, 10, 100, 1000... major scales.
		this.line_multiples = 10;

		// Increase this to see less frequent 
		this.minimum_label_distance = 100; //px

		this.specialLabels = [];

	}


	_specialLabelDefaults(sl) {

		sl.coord = sl.coord || 0;
		
		sl.coord_system = sl.coord_system || 'graph'; // graph or canvas

		sl.text = sl.text || ''; // No label if blank
		
		sl.strokeStyle = sl.strokeStyle || ''; 
		
		sl.dash = sl.dash || [];

		return sl;

	}


	addSpecialLabel(sl) {

		this.specialLabels.push(this._specialLabelDefaults(sl));

	}


	_iterateIntervalOverAxis(interval, f) {

		var min = Math.min(this.axis.min, this.axis.max),
			max = Math.max(this.axis.min, this.axis.max);



		var begin = Math.round(min / interval) * interval,
			end = Math.round(max / interval) * interval;


		// In this case, we wish to begin from the top and iterate downwards
		// as to not disrupt the order of the breaking functionality.

		if(this.axis.type === this.axis.TYPE_LOG && this.axis.min < 0) {

			for(var j = end; j >= begin; j -= interval) {

				if(f.call(this, j)) {

					break;

				}

			}

			return;

		}


		// Regular iteration

		for(var j = begin; j <= end; j += interval) {

			if(f.call(this, j)) {

				break;

			}

		}

	}


	getShade(scale, refPoint) {

		// Get canvas distance

		var interval = Math.pow(this.line_multiples, scale);

		var cd = this.axis.graphToCanvasInterval(refPoint, interval);


		// At this distance, lines appear completely black.
		// Linear interpolation from this to zero.

		var black_width = 200;

		return 1 - Math.max(0, Math.min(1, Math.abs(cd) / black_width));

	}


	drawLine(context, toX, toY, j) {

		function moveTo(x, y) {
			context.moveTo(toX(x), toY(y));
		}

		function lineTo(x, y) {
			context.lineTo(toX(x), toY(y));
		}



		var startP = j,
			endP = j,
			startS = this.saxis.min,
			endS = this.saxis.max;

		
		this.axis.orientationf(moveTo, startP, startS);
		this.axis.orientationf(lineTo, endP, endS);

	}


	_iterateIntervalOverAxisWithoutSLIntersection(interval, f) {


		this._iterateIntervalOverAxis(interval, function(j) {

			for(var i = 0; i < this.specialLabels.length; i++) {

				var sl = this.specialLabels[i];


				if(sl.strokeStyle === '') {

					continue;

				}



				if(sl.coord_system === 'graph') {

					var graphCoord = sl.coord;

				} else if(sl.coord_system === 'canvas') {

					var graphCoord = this.axis.canvasToGraph(sl.coord);

				}


				if(Math.abs(j - graphCoord) < 1e-10) {


					// Stop iterating

					return false;

				}

			}

			f(j);

		}.bind(this));

	}


	drawLinesAtScale(context, toX, toY, scale) {
		
		var interval = Math.pow(this.line_multiples, scale);


		if(this.axis.type === this.axis.TYPE_LINEAR) {


			context.beginPath();


			var shade = this.getShade(scale, 0);

			var hex = Math.floor((1 - shade) * 255);

			var color = 'rgba(0, 0, 0, ' + (1 - shade) + ')';
			context.strokeStyle = color;


			this._iterateIntervalOverAxisWithoutSLIntersection(interval, function(j) {

				this.drawLine(context, toX, toY, j);

			}.bind(this));


			context.stroke();



		} else if(this.axis.type === this.axis.TYPE_LOG) {


			var pixelThresh = 3;

			this._iterateIntervalOverAxisWithoutSLIntersection(interval, function(j) {


				if(Math.abs(this.axis.graphToCanvasInterval(j, interval)) < pixelThresh) {

					return true;

				}


				context.beginPath();


				var shade = this.getShade(scale, j);

				var hex = Math.floor((1 - shade) * 255);

				var color = 'rgba(0, 0, 0, ' + (1 - shade) + ')';
				context.strokeStyle = color;



				this.drawLine(context, toX, toY, j);

				context.stroke();


			}.bind(this));

		}

	}


	drawSpecialLines(context, toX, toY) {

		// Draw special lines

		for(var i = 0; i < this.specialLabels.length; i++) {

			var sl = this.specialLabels[i];

			context.beginPath();
			context.strokeStyle = sl.strokeStyle;


			context.setLineDash(sl.dash);



			if(sl.coord_system === 'graph') {

				this.drawLine(context, toX, toY, sl.coord);

			} else if(sl.coord_system === 'canvas') {

				var id = function(x) { return x; };

				if(this.axis.orientation) {

					this.drawLine(context, id, toY, sl.coord);

				} else {

					this.drawLine(context, toX, id, sl.coord);

				}
				

			}


			context.stroke();
			context.setLineDash([]);

		}

	}


	drawLabel(context, toX, toY, offset, text, opacity) {

		var centerX,
			centerY;

		var height = 14,
			inset = 22;

		if(this.axis.orientation) {
			centerX = toX(offset);
			centerY = inset;
		} else {
			centerX = inset;
			centerY = toY(offset);
		}


		context.textAlign = 'center';
		context.textBaseline = 'middle';
		
		var width = context.measureText(text).width + 4;

		// var width = 40;

		context.fillStyle = 'rgba(245, 245, 245, ' + opacity + ')';
		context.fillRect(centerX - (width / 2), 
			centerY - (height / 2), 
			width, 
			height);


		context.fillStyle = 'rgba(0, 0, 0, ' + opacity + ')';
		context.fillText(text, centerX, centerY);

	}


	_isIntersectingSpecialLabel(j) {

		for(var i = 0; i < this.specialLabels.length; i++) {

			var sl = this.specialLabels[i];


			if(sl.text === '') {

				continue;

			}



			if(sl.coord_system === 'graph') {

				var coord = this.axis.graphToCanvas(sl.coord);

			} else if(sl.coord_system === 'canvas') {

				var coord = sl.coord;

			}


			var d = this.axis.graphToCanvas(j) - coord;
			
			var intersectSpecialLabel = Math.abs(d) < this.minimum_label_distance;


			if(intersectSpecialLabel) {

				return true;

			}

		}


		return false;

	}


	drawLabelsAtScale(context, toX, toY, scale) {


		var interval = Math.pow(this.line_multiples, scale);


		var that = this;
		this._iterateIntervalOverAxis(interval, function(j) {
			
			
			if(this._isIntersectingSpecialLabel(j)) {

				return false;

			}



			var d = Math.abs(that.axis.graphToCanvasInterval(j, interval));

			var intersectOtherLabels = d < that.minimum_label_distance;

			if(intersectOtherLabels) {

				return true;

			}


			var opacity = Math.abs(d - that.minimum_label_distance) / 20;

			that.drawLabel(context, toX, toY, j, (Math.round(j * 1e10) / 1e10).toExponential(), opacity);

		});

	}


	drawSpecialLabels(context, toX, toY) {

		for(var i = 0; i < this.specialLabels.length; i++) {

			var sl = this.specialLabels[i];


			if(sl.text === '') {

				continue;

			}


			if(sl.coord_system === 'canvas') {


				var id = function(x) { return x; };

				if(this.axis.orientation) {

					toX = id;

				} else {

					toY = id;

				}

			}


			this.drawLabel(context, toX, toY, sl.coord, sl.text, 1);

		}

	}

}


module.exports = ReferenceLinesAxis;