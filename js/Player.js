(function() {

function Player() {
	this.Container_constructor(); // Basically: super();
		
	this.radius = 35;
	this.color = "BLUE";
	this.snapShots = [];

	this.shape;

	this.pixelsPerSecond = 200;

	this.addSnapShot = function() {
		this.snapShots.push(new SnapShot(this.x, this.y));
	}

	this.movementCalculation = function(delta) {
		return (delta / 1000) * this.pixelsPerSecond;
    }

	this.move = function(xDelta, yDelta) {
		if (this.x + this.radius <= canvasWidth && this.x - this.radius >= 0) {
			this.x += this.movementCalculation(xDelta);
		} else { console.log ('out of bounds');}
		if (this.y + this.radius <= canvasHeight && this.y - this.radius >= 0) {
			this.y += this.movementCalculation(yDelta);
		}
	}

	this.leaveGhost = function(layer) {
		// Create the new ghost
		var newGhost = new Ghost(this.snapShots);
		// Clean out players movement history
		this.snapShots = new Array();

		return newGhost;
	}

	this.animateDeath = function() {
		TweenLite.to(this.shape, 1, { easel:{tint:0x000000} });
	}

	this.animateNormal = function() {
		TweenLite.to(this.shape, 0, { easel:{tint:0x0000FF} });
	}

	this.setup();
}
// Basically: ... Button extends Container ...  
var p = createjs.extend(Player, createjs.Container); 


p.setup = function() {

	// Container 
	this.x = canvasWidth / 2 - this.radius;
	this.y = canvasHeight / 2 - this.radius;

	// Children
	this.shape = new createjs.Shape();
	this.shape.graphics.beginFill(this.color).drawCircle(0, 0, this.radius);
	this.shape.cache(-this.radius, -this.radius, this.radius * 2, this.radius * 2);

	var shadow = new createjs.Shadow("#000000", 0, 0, 10);
	this.shape.shadow = shadow;

	this.addChild(this.shape);

	// Disable interaction with child (only interact as a whole)
	this.mouseChildren = false;
};

// Allows things out of scope to use this now (all of the above cannot be called directly)
window.Player = createjs.promote(Player, "Container");
}());