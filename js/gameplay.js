// -- FIELDS --
// Stage & Canvas
var canvasWidth, canvasHeight;
var canvas;
var stage;
// Layers
var backgroundLayer = new createjs.Container();
var phantomlayer = new createjs.Container();
var characterLayer = new createjs.Container();
var bulletLayer = new createjs.Container();
var playerBulletLayer = new createjs.Container();
// Update handling / Game state
var paused = false;
var recording = false;
var timeFrozen = true;
var rewindClock;
var rewindSpeed = 3;
var allowedInput = true;    // Disabled when rewinding
var currentFrame = 0;
var MAX_FRAMES = 250;
var FRAME_INCREASE = 50;
var framesLeft = MAX_FRAMES; // Basically timer before game over
var currentLevel = 1;

// Entities
var background;
var UI;
var gameOverScreen;
var thePlayer;
var theTarget;

// Audio
var bgm;
var bgmReversed;
var audioReversed = false;

// -- CONSTRUCTOR --
function init() {
    console.log("init()");

    // Stage info
    canvas = document.getElementById("canvas");
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;
    stage = new createjs.Stage(canvas);
    stage.enableDOMEvents(true);    
    stage.addChild(backgroundLayer, phantomlayer, characterLayer, bulletLayer, playerBulletLayer); // And then player and target with init game.
    // Background & UI
    background = new Background(canvasWidth, canvasHeight);
    UI = new UserInterface(canvasWidth, canvasHeight);
    backgroundLayer.addChild(background, UI);
    // Game over dialog
    gameOverScreen = new GameOverScreen(canvasWidth, canvasHeight, currentLevel);
    stage.addChild(gameOverScreen);

    // Initialize objects and variables
    initializeGame();

    // Looper
    createjs.Ticker.setFPS(60);
    // Handles all the update logic
    createjs.Ticker.on("tick", update);
    
    // Detection    
    document.onkeydown = handleKeyDown;
    stage.on("stagemouseup", function(evt) {shoot(evt); });
    stage.enableMouseOver(10); // Check for hover 10 times per second

    bgm = document.getElementById("bgm");
    bgm.volume = 0.5;
    bgm.play();

    bgmReversed = document.getElementById("bgm-reversed");
    bgmReversed.defaultPlaybackRate = 1.0;
    bgmReversed.volume = 0.5;
}


// -- HANDLERS --
function update(event) {
    // Render
    stage.update();
    
    // No updates if paused
    if (paused) { return; }

    // Scan for user key input)
    movement(event);

    // Progress the game with player is moving (key input detected)
    if (!timeFrozen) {
        console.log("currentFrame: " + currentFrame);

        // Update frames framesLeft
        currentFrame++;
        framesLeft--;
        UI.updateFrames(framesLeft);

        if (framesLeft <= 0) {
            framesLeft = "GAME OVER";
            gameOver();
        }

        // Anything with history replay it (phantoms and bullets)
        replay();

        // MOVEMENTS
        // Move bullets 
        for (pBul = 0; pBul < playerBulletLayer.children.length; pBul++) {
            playerBulletLayer.getChildAt(pBul).move();
        }
        // Move target
        theTarget.move();

        // Record all history
        snapAllObjects();   

        // COLLISION
        // Check if bullet hit target
        for (pBul2 = 0; pBul2 < playerBulletLayer.children.length; pBul2++) {
            var currentPlayerBullet = playerBulletLayer.getChildAt(pBul2);

            if (checkCollision(currentPlayerBullet, theTarget)) {
                console.log("target hit!");

                // Disable detection
                allowedInput = false;
                // Reverse audio
                toggleAudioReverse();

                // Rewind everything
                currentFrame--;     // B/c update still increments, we need to counteract
                rewindClock = setInterval(function() { rewind(); }, 17);
                thePlayer.animateDeath();
                theTarget.animatePossession();
            }
        }    

        // Check if bullet hit player
        for (bul = 0; bul < bulletLayer.children.length; bul++) {
            var currentBullet = bulletLayer.getChildAt(bul);

            if (checkCollision(currentBullet, thePlayer)) {
                console.log("Player hit!");
                gameOver();
            }
        } 
        
        // Check if target hit (kills) player
        if (checkCollision(thePlayer, theTarget)) {
            console.log("Player hit!");
            gameOver();
        } 
    }
    
    // Reset freeze
    timeFrozen = true;
}

function gameOver() {
    paused = true;
    gameOverScreen.show(currentLevel);
}

function shoot(evt) {
    console.log("you shot!");
    // Fast return if disabled
    if (!allowedInput) { return; }

    // Play the sound
    var shotSFX = new Audio("sound/shot.mp3");
    shotSFX.play();

    // Calculate the angle....
    var playerX = thePlayer.x;
    var playerY = thePlayer.y;
    var clickX = evt.stageX;
    var clickY = evt.stageY; 

    var height = clickY - playerY;
    var width = clickX - playerX;

    var angle = Math.atan2(width, height);
    console.log("Angle: " + angle);

    playerBulletLayer.addChild(new Bullet(playerX, playerY, angle, currentFrame));
    console.log("Player bullets active: " + playerBulletLayer.children.length);
}

function movement(event) {
    // Fast return if unavailable
    if (!allowedInput) { return; }

    if (key.isPressed('up') || key.isPressed('w')) {
        timeFrozen = false;
        thePlayer.move(0, -event.delta);
    }
    if (key.isPressed('down') || key.isPressed('s')) {
        timeFrozen = false;
        thePlayer.move(0, event.delta);
    }
    if (key.isPressed('left') || key.isPressed('a')) {
        timeFrozen = false;
        thePlayer.move(-event.delta, 0);
    }
    if (key.isPressed('right') || key.isPressed('d')) {
        timeFrozen = false;
        thePlayer.move(event.delta, 0);
    }
}

function handleKeyDown(event) {
    // Spacebar
    if (event.keyCode == 32) {
        currentFrame--;     // B/c update still increments, we need to counteract
        // Rewind everything
        rewindClock = setInterval(function() { rewind(); }, 10000);
    }
}

function targetHit() {

}

function playerHit() {

}


// -- METHODS -- 
function checkCollision(circle1, circle2) {
    var xDist = circle1.x - circle2.x;
    var yDist = circle1.y - circle2.y;

    // This is the distance between the center of the balls.
    var distance = Math.sqrt(xDist*xDist + yDist*yDist); // Using pythagorus

    // Check if the balls are within a certain distance, based on the 2 radiuses
    return (distance < circle1.radius + circle2.radius);
}


function snapAllObjects() {
    thePlayer.addSnapShot();
    theTarget.addSnapShot();
    for (index = 0; index < phantomlayer.children.length; index++) {
        var phantomChild = phantomlayer.getChildAt(index);
        // Checking if we've reached the end of history, if so create more
        if (currentFrame >= phantomChild.snapShots.length) {
            phantomChild.addSnapShot();    
        } else {
            // Phatom has some history already, don't do anything
        }
    }
    for (pbIndex = 0; pbIndex < playerBulletLayer.children.length; pbIndex++) {
        var bulletChild = playerBulletLayer.getChildAt(pbIndex);
        if (currentFrame >= bulletChild.snapShots.length) {
            bulletChild.addSnapShot();
        } 
    }
}

function rewind() {
    console.log("Rewind currentFrame: " + currentFrame);

    // Rewind phantoms
    for (eIndex = 0; eIndex < phantomlayer.children.length; eIndex++) {
        var phantomChild = phantomlayer.getChildAt(eIndex);
        phantomChild.x = phantomChild.snapShots[currentFrame].xPos;
        phantomChild.y = phantomChild.snapShots[currentFrame].yPos; 
    }
    // Rewind player
    thePlayer.x = thePlayer.snapShots[currentFrame].xPos;
    thePlayer.y = thePlayer.snapShots[currentFrame].yPos;
    // Rewind target
    theTarget.x = theTarget.snapShots[currentFrame].xPos;
    theTarget.y = theTarget.snapShots[currentFrame].yPos;    
    // Rewind player bullets
    for (pbIndex = 0; pbIndex < playerBulletLayer.children.length; pbIndex++) {
        var pBulletChild = playerBulletLayer.getChildAt(pbIndex);
        pBulletChild.x = pBulletChild.snapShots[currentFrame].xPos;
        pBulletChild.y = pBulletChild.snapShots[currentFrame].yPos; 
    }
    // Rewind phantom bullets
    for (bIndex = 0; bIndex < bulletLayer.children.length; bIndex++) {
        var bulletChild = bulletLayer.getChildAt(bIndex);
        bulletChild.x = bulletChild.snapShots[currentFrame].xPos;
        bulletChild.y = bulletChild.snapShots[currentFrame].yPos; 
    }

    // Move on to the next frame, unless finished.
    rewindSpeed = Math.ceil(currentFrame / 25);
    if (rewindSpeed > 6) { rewindSpeed = 6; }

    currentFrame -= rewindSpeed; 
    UI.updateFrames(framesLeft++);

    if (currentFrame <= 0) { 
        clearInterval(rewindClock); 
        nextLevel();
        currentFrame = 0;   // Incase it goes below 0
    }
}

function replay() {
    // Replay the phantoms
    for (index = 0; index < phantomlayer.children.length; index++) {
        var phantomChild = phantomlayer.getChildAt(index);
        if (currentFrame >= phantomChild.snapShots.length) {
            // If no recorded history don't do anything
        } else {
            phantomChild.x = phantomChild.snapShots[currentFrame].xPos;
            phantomChild.y = phantomChild.snapShots[currentFrame].yPos;
        }
    }

    // Replay any bullets
    for (bIndex = 0; bIndex < bulletLayer.children.length; bIndex++) {
        var bulletChild = bulletLayer.getChildAt(bIndex)
        if (currentFrame >= bulletChild.snapShots.length) {
            // If no recorded history move manually
            bulletChild.move();
            bulletChild.addSnapShot();
        } else {
            bulletChild.x = bulletChild.snapShots[currentFrame].xPos;
            bulletChild.y = bulletChild.snapShots[currentFrame].yPos;
        }
    }
}

function nextLevel() {
    // Increase score and time
    currentLevel++;
    UI.updateLevels(currentLevel);
    framesLeft += FRAME_INCREASE;
    UI.updateFrames(framesLeft);
    // Change bg color
    background.cycleColor();

    // Create phantom
    phantomlayer.addChild(thePlayer.leaveGhost());
    // Possess target
    thePlayer.animateNormal();
    thePlayer.x = theTarget.initialX;
    thePlayer.y = theTarget.initialY;
    // Create new target
    theTarget.reroll();
    theTarget.animateNormal();
    // All player bullets into (hostile) bullets
    // Note: addChild from another container KIDNAPS THAT CHILD
    while (playerBulletLayer.children.length > 0) {
        var transBullet = playerBulletLayer.getChildAt(0);
        // Change bullet color from orange to black
        transBullet.getChildAt(0).graphics.clear().beginFill('BLACK').drawCircle(0, 0, transBullet.radius);
        // Add to the hostile bullet layer
        bulletLayer.addChild(transBullet);
    }

    // Renable input
    allowedInput = true;
    // Audio back to normal
    toggleAudioReverse();
}

function restartGame() {
    // All components
    framesLeft = MAX_FRAMES;
    currentFrame = 0;
    currentLevel = 1;

    phantomlayer.removeAllChildren();
    bulletLayer.removeAllChildren();
    playerBulletLayer.removeAllChildren();
    characterLayer.removeAllChildren();

    initializeGame();

    // Hide 
    gameOverScreen.hide();

    // Resume
    paused = false;
}

function toggleAudioReverse() {
    // BGM is playing normally
    if (!audioReversed) {
        // This audio file is literally the bgm reversed.
        bgmReversed.currentTime = bgmReversed.duration - bgm.currentTime;
        bgm.pause();
        bgmReversed.play();
        audioReversed = true;
    } else {
        bgm.currentTime = bgm.duration - bgmReversed.currentTime;
        bgmReversed.pause();
        bgm.play();
        audioReversed = false;
    }

}

// OBJECTS
function SnapShot(x, y) {
    this.xPos = x;
    this.yPos = y;
}

// INITIALIZERS
function initializeGame() {
    thePlayer = new Player();
    characterLayer.addChild(thePlayer);
    theTarget = new Target();
    characterLayer.addChild(theTarget);

    while (checkCollision(theTarget, thePlayer)) {
        console.log("Spawn kill");
        theTarget = new Target();
    }
}

// UTILITY
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}