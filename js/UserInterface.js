(function() {

function UserInterface(width, height) {
	this.Container_constructor(); // Basically: super();
		
	this.color = 'BLACK';
	this.width = width;
	this.height = height; 	

	this.frameDisplay;
	this.levelDisplay;

	this.updateFrames = function(framesLeft) {
		this.frameDisplay.text = framesLeft;
		if (framesLeft < 100) {
			this.frameDisplay.color = 'RED';
			this.frameDisplay.shadow.color = "RED";
		} else if (framesLeft < 200) {
			this.frameDisplay.color = 'ORANGE';
			this.frameDisplay.shadow.color = "ORANGE";
		} else {
			this.frameDisplay.color = "BLACK";
			this.frameDisplay.shadow.color = "BLACK";
		}
	}

	this.updateLevels = function(currentLevel) {
		this.levelDisplay.text = "SCORE: " + currentLevel;
/*		var fontSize = currentLevel + 48;
		this.levelDisplay.font = fontSize + "px Anton"; */
	}

	this.setup();
}
// Basically: ... Button extends Container ...  
var p = createjs.extend(UserInterface, createjs.Container); 


p.setup = function() {

	this.levelDisplay = new createjs.Text("SCORE: 1", "48px Anton", "BLACK");
	this.levelDisplay.x = this.width / 2;
	this.levelDisplay.y = this.height * 0.2;	
	this.levelDisplay.textAlign = "center";
	this.levelDisplay.alpha = 0.7;
	var shadow = new createjs.Shadow("#000000", 0, 0, 10);
	this.levelDisplay.shadow = shadow;

	this.frameDisplay = new createjs.Text("250", "72px Anton", "BLACK");
	this.frameDisplay.x = this.width / 2;
	this.frameDisplay.y = this.height / 2;
	this.frameDisplay.textAlign = "center";
	this.frameDisplay.alpha = 0.7;
	var frameShadow = new createjs.Shadow("#000000", 0, 0, 10);
	this.frameDisplay.shadow = frameShadow;

	// Container 
	// Off screen until startFrame is reached
	this.x = this.initialX;
	this.y = this.initialY;

	// Children
	this.addChild(this.frameDisplay, this.levelDisplay);

	// Disable interaction with child (only interact as a whole)
	this.mouseChildren = false;
} ;

// Allows things out of scope to use this now (all of the above cannot be called directly)
window.UserInterface = createjs.promote(UserInterface, "Container");
}());