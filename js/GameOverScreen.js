(function() {

function GameOverScreen(width, height, text) {
	this.Container_constructor(); // Basically: super();
		
	this.color = "WHITE";
	this.width = width * 0.4;
	this.height = height * 0.60; 	
	this.radius = 25;

	this.score;

	this.setup();

	this.show = function(currentLevel) {
		this.score.text = "GAME OVER\nSCORE: " + currentLevel;
		TweenLite.to(this, 1, { alpha:1 });
	}

	this.hide = function() {
		TweenLite.to(this, 1, { alpha:0 });
	}
}
// Basically: ... Button extends Container ...  
var p = createjs.extend(GameOverScreen, createjs.Container); 


p.setup = function() {

	// Container 
	// Off screen until startFrame is reached
	this.x = this.width * 0.75;
	this.y = this.height * 0.30;

	// Children
	// Dialog box
	var bg = new createjs.Shape();
	bg.graphics.beginFill(this.color).drawRoundRect(0, 0, this.width, this.height, this.radius);
	var shadow = new createjs.Shadow("#000000", 0, 0, 10);
	bg.shadow = shadow;

	// Text
	this.score = new createjs.Text("GAME OVER\n SCORE: 1", "48px Anton", "BLACK");
	this.score.textAlign = "center";
	this.score.x = this.width / 2;
	this.score.y = this.height * 0.20;

	// Button
	var restartButton = new createjs.Shape();
	restartButton.graphics.beginFill("BLACK").drawRoundRect(this.width * 0.20, this.height * 0.60, this.width * 0.60, this.height * 0.10, this.radius);
	restartButton.on("click", this.restartGame);
	restartButton.on("rollover", this.handleRollOver);
	restartButton.on("rollout", this.handleRollOver);
	restartButton.cursor = "pointer";

	var restartText = new createjs.Text("RETRY", "32px Anton", "WHITE");
	restartText.textAlign = "center";
	restartText.x = this.width / 2;
	restartText.y = this.height * 0.60 - 3;	// Rush job ftw

	// Button
	var backButton = new createjs.Shape();
	backButton.graphics.beginFill("BLACK").drawRoundRect(this.width * 0.20, this.height * 0.80, this.width * 0.60, this.height * 0.10, this.radius);
	backButton.on("click", this.handleClick);
	backButton.on("rollover", this.handleRollOver);
	backButton.on("rollout", this.handleRollOver);
	backButton.cursor = "pointer";

	var buttonText = new createjs.Text("BACK", "32px Anton", "WHITE");
	buttonText.textAlign = "center";
	buttonText.x = this.width / 2;
	buttonText.y = this.height * 0.80 - 3;	// Rush job ftw

	// Add all
	this.addChild(bg, this.score, restartButton, restartText, backButton, buttonText);

	// Set to hidden
	this.alpha = 0;
};

p.restartGame = function (event) {
	restartGame();	// Method defined in the main script
}

p.handleClick = function (event) {
	document.location.href = "index.html";
};

p.handleRollOver = function(event) {       
	this.alpha = event.type == ("rollover") ? 0.8 : 1;
};

// Allows things out of scope to use this now (all of the above cannot be called directly)
window.GameOverScreen = createjs.promote(GameOverScreen, "Container");
}());