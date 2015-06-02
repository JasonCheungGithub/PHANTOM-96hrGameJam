(function() {

function Ghost(previousSnaps) {
	this.Container_constructor(); // Basically: super();
		
	this.radius = 35;
	this.color = "BLACK";
	this.snapShots = previousSnaps;

	this.pixelsPerSecond = 100;

	this.xVel = getRandomInt(-100, 100);
	this.yVel = getRandomInt(-100, 100);

	this.addSnapShot = function() {
		this.snapShots.push(new SnapShot(this.x, this.y));
	}

	this.movementCalculation = function(delta) {
		return (delta / 1000) * this.pixelsPerSecond;
    }

	this.move = function(xDelta, yDelta) {
		this.x += this.xVel;
		this.y += this.yVel;
	}

	this.setup();
}
// Basically: ... Button extends Container ...  
var p = createjs.extend(Ghost, createjs.Container); 


p.setup = function() {

	// Container 
	this.x = this.snapShots[0].xPos;
	this.y = this.snapShots[0].yPos;

	// Children
	var shape = new createjs.Shape();
	shape.graphics.beginFill(this.color).drawCircle(0, 0, this.radius);

	var shadow = new createjs.Shadow("#000000", 0, 0, 10);
	shape.shadow = shadow;

	this.addChild(shape);

	// Disable interaction with child (only interact as a whole)
	this.mouseChildren = false;
} ;

// Allows things out of scope to use this now (all of the above cannot be called directly)
window.Ghost = createjs.promote(Ghost, "Container");
}());