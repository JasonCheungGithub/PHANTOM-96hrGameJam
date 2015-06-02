(function() {

function Background(width, height) {
	this.Container_constructor(); // Basically: super();
		
	this.colors = ["#EE82EE", "#4B0082", "#008000"];
	this.colorIndex = 0;
	this.color = this.colors[this.colorIndex];
	this.width = width;
	this.height = height; 	
	this.shape1;
	this.shape2;
	this.shape3;

	this.cycleColor = function() {
		var prevShape = this.getChildAt(this.colorIndex);
		this.colorIndex = (this.colorIndex == this.colors.length - 1) ? 0 : this.colorIndex + 1;
		var nextShape = this.getChildAt(this.colorIndex);

		TweenLite.to(prevShape, 1.5, { alpha:0 });
		TweenLite.to(nextShape, 1.5, { alpha:1 });
	}

	this.setup();
}
// Basically: ... Button extends Container ...  
var p = createjs.extend(Background, createjs.Container); 


p.setup = function() {

	// Container 
	// Off screen until startFrame is reached
	this.x = this.initialX;
	this.y = this.initialY;

	// Children
	this.shape1 = new createjs.Shape();
	this.shape1.graphics.beginFill(this.colors[0]).drawRect(0, 0, this.width, this.height);
	this.shape1.cache(0, 0, this.width, this.height);
	this.shape2 = new createjs.Shape();
	this.shape2.graphics.beginFill(this.colors[1]).drawRect(0, 0, this.width, this.height);
	this.shape2.cache(0, 0, this.width, this.height);
	this.shape2.alpha = 0;
	this.shape3 = new createjs.Shape();
	this.shape3.graphics.beginFill(this.colors[2]).drawRect(0, 0, this.width, this.height);
	this.shape3.cache(0, 0, this.width, this.height);
	this.shape3.alpha = 0;

	this.addChild(this.shape1, this.shape2, this.shape3);

	// Disable interaction with child (only interact as a whole)
	this.mouseChildren = false;
} ;

// Allows things out of scope to use this now (all of the above cannot be called directly)
window.Background = createjs.promote(Background, "Container");
}());