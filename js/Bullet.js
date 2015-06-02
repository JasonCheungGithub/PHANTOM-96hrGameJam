(function() {

function Bullet(xInit, yInit, angle, currentFrame) {
	this.Container_constructor(); // Basically: super();
		
	this.radius = 15;
	this.color = "ORANGE";
	
	this.angle = angle;
	this.pixelsPerSecond = 10;

	this.xVel = this.pixelsPerSecond * (Math.sin(angle));
	this.yVel = this.pixelsPerSecond * (Math.cos(angle));

	this.initialX = xInit + (this.xVel * 6);
	this.initialY = yInit + (this.yVel * 6);

	this.snapShots = [];
	this.startFrame = currentFrame;
	// Put bullet offscreen until startFrame (when shot)
	var bi = 0;
	while (bi < this.startFrame) {
		this.snapShots.push(new SnapShot(-9999, -9999)); 
		bi++;
	}
	this.snapShots.push(new SnapShot(xInit, yInit));
	
	this.addSnapShot = function() {
		this.snapShots.push(new SnapShot(this.x, this.y));
	}

	this.movementCalculation = function(delta) {
		return (delta / 1000) * this.pixelsPerSecond;
    }

	this.move = function() {
		// Do nothing if off screen
/*		if (this.x >= canvasWidth || this.x <= 0 
			|| this.y >= canvasHeight || this.y <= 0) { 
			console.log("Bullet off screen");
		}*/

		// Move the bullet
		this.x += this.xVel;
		this.y += this.yVel;
	}

	this.setup();
}
// Basically: ... Button extends Container ...  
var p = createjs.extend(Bullet, createjs.Container); 


p.setup = function() {

	// Container 
	// Off screen until startFrame is reached
	this.x = this.initialX;
	this.y = this.initialY;

	// Children
	var shape = new createjs.Shape();
	shape.graphics.beginFill(this.color).drawCircle(0, 0, this.radius);

	this.addChild(shape);

	// Disable interaction with child (only interact as a whole)
	this.mouseChildren = false;
} ;

// Allows things out of scope to use this now (all of the above cannot be called directly)
window.Bullet = createjs.promote(Bullet, "Container");
}());