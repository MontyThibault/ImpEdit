
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



function MouseControl(graph) {

	this.active = false;
	this.mousedown = false;

	this.objects = [];
	this.graph = graph;

	// Pixels from nearest object before it's not active.
	this.threshold = 15;

	this.oldClientX = 0;
	this.oldClientY = 0;

}

MouseControl.prototype._getX = function(e) {
	return e.clientX - this.graph.canvas.getBoundingClientRect().left;
};

MouseControl.prototype._getY = function(e) {
	return e.clientY - this.graph.canvas.getBoundingClientRect().top;
};


MouseControl.prototype._updateActive = function(e) {

	var closest = undefined,
		distance = 999;

	var x = this._getX(e);
	var y = this._getY(e);

	for(var i = 0; i < this.objects.length; i++) {

		var distToObj = this.objects[i].distanceTo(x, y);

		if(distToObj < distance) {
			distance = distToObj;
			closest = this.objects[i];
		}
	}

	if(distance <= this.threshold) {
		this._setActive(closest);
	} else {
		this._setActive(false);
	}

};

MouseControl.prototype._setActive = function(o) {

	if(this.active !== o) {
		if(this.active !== false) {
			this.active.onactiveend();
		}

		if(o !== false) {
			o.onactivestart();
		}


		this.graph.needsUpdate = true;
	}

	this.active = o;
};

MouseControl.prototype.addObject = function(o) {
	this.objects.push(o);
};

MouseControl.prototype.removeObject = function(o) {

	var i = this.objects.indexOf(o);

	if(i > -1) {
		this.objects.splice(i, 1);
	}
};

MouseControl.prototype.onmousemove = function(e) {

	if(this.active && this.mousedown) {

		var x = this._getX(e);
		var y = this._getY(e);

		this.active.ondrag(x, y);
		this.graph.needsUpdate = true;

	
	} else if(this.mousedown) {

		var x = this._getX(e);
		var y = this._getY(e);

		this.graph.pan(x - this.oldClientX, y - this.oldClientY);

		this.oldClientX = x;
		this.oldClientY = y;

	} else {
		this._updateActive(e);
	}

};

MouseControl.prototype.onmousedown = function(e) {
	this.mousedown = true;

	this.oldClientX = this._getX(e);
	this.oldClientY = this._getY(e);
};

MouseControl.prototype.onmouseup = function(e) {
	this.mousedown = false;

	if(this.active && this.active.onmouseup) {
		this.active.onmouseup();
	}
};

MouseControl.prototype.ondblclick = function(e) {

	if(this.active) {
		this.active.ondblclick(e);
	} else {
		this.graph.addControlPoint(this._getX(e), this._getY(e));
	}

	this.graph.needsUpdate = true;

};

MouseControl.prototype.onscroll = function(e) {

	if(e.wheelDelta > 0) {
		this.graph.zoomIn();
	} else if(e.wheelDelta < 0) {
		this.graph.zoomOut();
	}

};


module.exports = MouseControl; // Singleton