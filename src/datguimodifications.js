

// Overwrite dat.GUI close button position
// By default set to absolute (not sure why...) and messes with floating.

var style = document.createElement('style');
document.head.appendChild(style);

style.sheet.insertRule('.dg.main .close-button.close-bottom { position: static; }');




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


dat.controllers.NumberControllerSlider.prototype.disable = function() {

	this.domElement.style.pointerEvents = "none";
	this.domElement.style.opacity = 0.5;

};


dat.controllers.NumberControllerSlider.prototype.enable = function() {

	this.domElement.style.pointerEvents = "auto";
	this.domElement.style.opacity = 1.0;

};


module.exports = undefined;