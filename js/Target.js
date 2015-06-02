(function() {

function Target() {
	this.Container_constructor(); // Basically: super();
		
	this.radius = 35;
	this.color = "RED";
	this.snapShots = [];

	this.pixelsPerSecond = 100;
	// Location where possesion occurs
	this.initialX = getRandomInt(canvasWidth * 0.10, canvasWidth * 0.90);
	this.initialY = getRandomInt(canvasHeight * 0.10, canvasHeight * 0.90);

	this.xVel = getRandomInt(-10, 10);
	this.yVel = getRandomInt(-10, 10);

	this.shape;

	// Reuses the target for the "new" one
	this.reroll = function() {
		this.initialX = getRandomInt(0, canvasWidth * 0.80);
		this.initialY = getRandomInt(0, canvasHeight * 0.80);
		this.x = this.initialX;
		this.y = this.initialY;
		this.xVel = getRandomInt(-10, 10);
		this.yVel = getRandomInt(-10, 10);	
		this.snapShots = new Array();
	}

	this.addSnapShot = function() {
		this.snapShots.push(new SnapShot(this.x, this.y));
	}

	this.movementCalculation = function(delta) {
		return (delta / 1000) * this.pixelsPerSecond;
    }

	this.move = function(xDelta, yDelta) {
		// Reverse velocity if off screen (ie. Bounce off edges)
		if (this.x + this.radius >= canvasWidth || this.x - this.radius <= 0) { 
			console.log("off x screen vel: " + this.xVel );
			this.xVel = this.xVel * -1; 
		} 
		if (this.y + this.radius >= canvasHeight || this.y - this.radius <= 0) { 
			console.log("off y screen");
			this.yVel = this.yVel * -1; } 
		// Move the target
		this.x += this.xVel;
		this.y += this.yVel;
	}

	this.animatePossession = function() {
		TweenLite.to(this.shape, 1, { easel:{tint:0x0000FF} });
	}

	this.animateNormal = function() {
		this.alpha = 0;
		this.scaleX = this.scaleY = 1.2;
		TweenLite.to(this, 0.7, { alpha: 1, scaleX: 1, scaleY: 1});
		TweenLite.to(this.shape, 0, { easel:{tint:0xFF0000} });
	}

	this.setup();
}
// Basically: ... Button extends Container ...  
var p = createjs.extend(Target, createjs.Container); 


p.setup = function() {

	// Container 
	this.x = this.initialX;
	this.y = this.initialY;

	// Children
	this.shape = new createjs.Shape();
	this.shape.graphics.beginFill(this.color).drawCircle(0, 0, this.radius);
	this.shape.cache(-this.radius, -this.radius, this.radius * 2, this.radius * 2);

	var shadow = new createjs.Shadow("#000000", 0, 0, 10);
	this.shape.shadow = shadow;

	this.addChild(this.shape);

	// Disable interaction with child (only interact as a whole)
	this.mouseChildren = false;
} ;


// Allows things out of scope to use this now (all of the above cannot be called directly)
window.Target = createjs.promote(Target, "Container");
}());