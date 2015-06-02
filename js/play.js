// -- PRELOAD --
// Note: Waiting for init() call
var preload = new createjs.LoadQueue();
preload.on("progress", handleOverallProgress, this);
preload.on("complete", handleComplete, this);
var manifest = [
    {src: 'img/bg.png', id: 'bg'},
    {src: 'img/life.png', id: 'life'},
    {src: 'img/no_life.png', id: 'nolife'},
    {src: 'img/answer.png', id: 'ans'}
];

function handleOverallProgress(event) {
    var progressPercent = (preload.progress * 100).toFixed(2) + "%";
    $("#loading-indicator").text(progressPercent);
}

function handleComplete(event) {
    console.log("All files loaded");
    $("#loading-div").hide();
    initGame();
}
// -- END PRELOAD --

// -- FIELDS -- 
// EaselJS 
var canvas, stage;

// GAME INFO
var questions = [];
var answers = [];
var currentAnswer; // Note: This is an object, to access the answer value use currentAnswer.answer
var OPERATORS = ["+", "-", "x", "/"];
// Score
var BASE_GAIN = 10; // Minimum point gain on correct answer
var score = 0;
// Lives
var MAX_LIVES = 5;
var livesRemaining = MAX_LIVES;  
// Time
var MAX_TIME = 10000; // 10 Seconds
var remainingTime = MAX_TIME;
var startTime;
// Difficulty
var termRange = {min: 2, max: 2};       // Only supports 2-3 terms
var operatorRange = { min: 0, max: 1};  // 0 = +, 1 = -, 2 = x, 3 = / 
var LEVEL1 = 0;     // 2 Term + -
var LEVEL2 = 2000;  // 2 Term + - x / 
var LEVEL3 = 4000;  // 2-3 Term + -
var LEVEL4 = 6000;  // 2-3 Term + - x /
var LEVEL5 = 10000;  // 3 Term + - x / 

// Layers
var overlayLayer = new createjs.Container();
var foregroundLayer = new createjs.Container(); 
var midLayer = new createjs.Container(); // Only contains questions
var backgroundLayer = new createjs.Container();
// DisplayObjects
var scoreDisplay;
var timerDisplay;
var livesDisplay;

// Achievements 
var consecutive;
// Audio
var sfxEnabled, bgmEnabled; 

// -- INITIALIZATION -- 
// Sets up the canvas, stage, and preloads all the assets.
function init() {
    // Initialize all base variables and preload assets. Once assets are loaded it will call initGame() 
    console.log("init()");

    // Canvas info
    canvas = document.getElementById("canvas"); 
    fullScreenCanvas(canvas);                           // Sets width and height to fill screen
    // Stage info
    stage = new createjs.Stage(canvas);                 // Creates a EaselJS Stage for drawing
    stage.addChild(backgroundLayer, midLayer, foregroundLayer, overlayLayer);   // Add layers
    // Detection
    createjs.Touch.enable(stage);   

    // Initialize global variables for layout and sizing
    initializeVariables(canvas.width, canvas.height);

    // Preload all assets (crucial for first rendering)
    preload.loadManifest(manifest);
}

// Initializes all the game components and functions
function initGame() {
    // Audio:
    sfxEnabled = (localStorage.getItem("sfx-muted") == "true") ? false : true;
    bgmEnabled = (localStorage.getItem("bgm-muted") == "true") ? false : true;
    console.log("sfx: " + sfxEnabled + " bgm: " + bgmEnabled);

    createjs.Sound.initializeDefaultPlugins();
    var audiopath ="sound/";
    var sounds = [
        {src:"game_bgm.wav", id:"bg_music"},
        {src:"hitsound1.wav", id:"correct"},
        {src:"miss.wav", id:"incorrect"},
        {src:"failsound.mp3", id:"gameover"},
        {src:"achievement.mp3", id:"achieved"}
    ];
    createjs.Sound.addEventListener("fileload", bgm);   // Will call bgm() when loaded
    createjs.Sound.registerSounds(sounds, audiopath);

    // Background
    var bgImage = preload.getResult("bg");
    var background = new createjs.Bitmap(bgImage);
    setScaleFactor(background, canvas.width, canvas.height);
    backgroundLayer.addChild(background);

    // Timer stuff
    startTime = new Date().getTime();
    timerDisplay = foregroundLayer.addChild(new Timer());
    // Score stuff
    scoreDisplay = foregroundLayer.addChild(new Score());
    // Lives stuff
    livesDisplay = foregroundLayer.addChild(new Lives());

    // Answers and questions (in this order)
    initializeAnswers();
    initializeQuestions(); 
    updateCurrentAnswer();
    // Initial positions and sizing
    initializeAnswerPositions();
    initializeQuestionPositions();

    // Looper
    createjs.Ticker.setFPS(60);
    // Handles all the update logic
    createjs.Ticker.on("tick", handleTick); 
}

// -- HANDLERS --
function handleTick(event) {
    if (!event.paused) {
        // Update (kinda)
        updateTimeRemaining();
        // Render 
        stage.update();
    }
}

// -- METHODS --
// INITIALIZERS
function initializeAnswers() {
    for (i = 0; i < 5; i++) {
        var nextAnswer = generateNextAnswer();
        nextAnswer.index = i; // We need the index so we can replace them properly
        answers.push(nextAnswer);
    }
}

function initializeQuestions() {
    for (i = 0; i < 3; i++) {
        questions.push(generateNextQuestion());
    }
}

function initializeQuestionPositions() {
    for (q=0; q<3; q++) {
        switch (q) {
            case 0:
                questions[q].y = layout.MID3; // Lowest
                questions[q].scaleY = 1.66;
                questions[q].txt.scaleY = 1.00;
                questions[q].txt.scaleX = 1.66;
                break;
            case 1: 
                questions[q].y = layout.MID2;
                questions[q].txt.scaleX = questions[q].txt.scaleY = 1.00;
                break;
            case 2: 
                questions[q].y = layout.MID1; // Most upper
                break;
            default: 
                console.log("Something went wrong with loadQuestions()");
                break;
        } 
        console.log("Ques x: " + questions[q].x + " y: " + questions[q].y );
    }
}

function initializeAnswerPositions() {
    for (a = 0; a < 5; a++) {
        // x and y of the CENTER of the container. (not top left)
        answers[a].x = (properties.ANS_SIZE / 2) + (a)*(properties.ANS_SIZE);

        console.log("Ans x: " + answers[a].x + " y: " + answers[a].y);
    }
}


// AUDIO
function bgm(event){
    console.log("Audio loaded");
    if(bgmEnabled){
        var instance = createjs.Sound.play("bg_music", { interrupt: "none", loop: -1 });
    }
}
function correctSfx() { 
    if (sfxEnabled) { var instance = createjs.Sound.play("correct"); }
}
function incorrectSfx() { 
    if (sfxEnabled) { var instance = createjs.Sound.play("incorrect"); }
}
function gameoverSfx() { 
    if (sfxEnabled) { var instance = createjs.Sound.play("gameover"); }
}
function buttonSound() { 
    if (sfxEnabled) { var sound = new Audio("buttonSound"); }
}


// GAME LOGIC
function increaseScore() {
    console.log("increaseScore()");
    score += Math.round(BASE_GAIN + (Math.round(remainingTime) /10000)) * 10;
    scoreDisplay.txt.text = score;
}

function updateTimeRemaining() {
    // MAX_TIME
    var percentMaxDifficulty = (score > 10000) ? 1.00 : score / 10000;
    MAX_TIME = 10000 - (5000 * percentMaxDifficulty);

    var currentTime = new Date().getTime();
    var elapsedTime = currentTime - startTime;
    // Update time left
    remainingTime = MAX_TIME - elapsedTime;

    // Check if question fail
    if (remainingTime < 0) {
        remainingTime = 0; // Might be unnecessary
        answerIncorrect();
    }

    var percentLeft = remainingTime / MAX_TIME;
    timerDisplay.angle = percentLeft * (Math.PI * 2)

    // Format to two decimal places (rounds too)
    var formattedTime = (remainingTime / 1000).toFixed(2);
    // Display the time left
    timerDisplay.txt.text = formattedTime;
}

// Based on current score
function updateDifficulty() {
    if (score > LEVEL5) {
        termRange.min = 3;
        termRange.max = 3;
        operatorRange.min = 0;
        operatorRange.max = 3;
    } else if (score > LEVEL4) {
        termRange.min = 2;
        termRange.max = 3;
        operatorRange.min = 0;
        operatorRange.max = 3;
    } else if (score > LEVEL3) {
        termRange.min = 2;
        termRange.max = 3;
        operatorRange.min = 0;
        operatorRange.max = 1;
    } else if (score > LEVEL2) {
        termRange.min = 2;
        termRange.max = 2;
        operatorRange.min = 0;
        operatorRange.max = 3;
    } else if (score > LEVEL1) {
        termRange.min = 2;
        termRange.max = 2;
        operatorRange.min = 0;
        operatorRange.max = 1;
    }
}

// Creates the next answer 
function generateNextAnswer() {
    var randInt;
    // Loop until there is no overlap
    outer:
        while (true) {
            // Get the new value
            randInt = getRandomInt(1, 20);

            // Check if it exists already
            for (j = 0; j < answers.length; j++) {
                if (answers[j].answer == randInt) {
                    continue outer; // Yes - retry
                }
            }
            // No - return the value
            break;
        }
        // Create the next answer 

    // Finalize setup 
    var nextAnswer = foregroundLayer.addChild(new Answer(randInt)); // Create the actual object
    if (currentAnswer != null) {
        nextAnswer.index = currentAnswer.index; // Pass on parent index
        nextAnswer.x = currentAnswer.x;         // Pass on parent position
    }
    // Return the displayObject 
    return nextAnswer;
}

// Gathers are all the necessary info before generating the next answer
function prepareNextQuestion() {
    // Obtain information about the current board
    var availableArray = [];
    // Note: foreach loop not working very well
    for (a=0; a<answers.length; a++) {
        if (answers[a].available == true) {
            availableArray.push(answers[a]);
        }
    }

    // Select one of the avaiable numbers
    var randAvailable = availableArray[getRandomInt(0, availableArray.length - 1)];
    // Toggle availibility off
    randAvailable.available = false;
    // Retrieve the answer
    return randAvailable.answer;
}

function generateNextQuestion() {
    console.log("generateNextQuestion()");
    // Init the question     
    var question;
 
    // Retrieve the next answer 
    var answer = prepareNextQuestion();
 
    // Generate a 2 or 3 term question
    var randTerm = getRandomInt(termRange["min"], termRange["max"]);

    // Generating a 2 term question
    if (randTerm == 2) {
        // Initialize the pieces (operands, operators, answer)
        var fullSet = [];
        var numSet = [];
        var operatorSet = [];
        
        // Calculate the pieces
        operatorSet[0] = OPERATORS[getRandomInt(operatorRange["min"], operatorRange["max"])];
        numSet = generateSet(answer, operatorSet[0]);
        
        // Assemble all the pieces
        fullSet[0] = numSet;
        fullSet[1] = operatorSet;
        fullSet[2] = answer;
        
        // Create the question
        question = new Question(fullSet); 
 
    // Generating a 3 term question
    } else {
        // Init
        var fullSet = []; 
        var numSet = [];
        var operatorSet = [];
 
        // Set up (random) operators
        operatorSet[0] = OPERATORS[getRandomInt(operatorRange["min"], operatorRange["max"])];
        operatorSet[1] = OPERATORS[getRandomInt(operatorRange["min"], operatorRange["max"])];

        // Begin generation logic
        var operatorCode = operatorSet[0] + operatorSet[1];
        switch (operatorCode) {
            // Calculate left to right (normal)
            case "++":
            case "+-":
            case "+x":
            case "+/":            
            case "-x":
            case "-/":
            case "xx":
            case "x/":
                var numSetL = generateSet(answer, operatorSet[0]);      // #1 OP #2 OP ?
                // take middle operator and expand                      // #1 OP (#2) OP ?
                var numSetR = generateSet(numSetL[1], operatorSet[1]);  // #1 OP #3 OP #4    
                // Assemble numSet, nsl[0] OP nsr[0] OP nsr[1]
                numSet = [numSetL[0], numSetR[0], numSetR[1]];
                break;
            // Calculate right to left (reversed)
            case "-+":
            case "--":
            case "x+":
            case "x-":
            case "/+":
            case "/-":
            case "/x":
            case "//":
                // Calculate right to left
                var numSetR = generateSet(answer, operatorSet[1]);      // ? OP #1 OP #2
                    // take middle operator and expand                  // ? OP (#1) OP #2
                var numSetL = generateSet(numSetR[0], operatorSet[0]);  // #3 OP #4 OP #2    
                // Assemble, nsl[0] +- nsl[1] x/ nsr[1];
                numSet = [numSetL[0], numSetL[1], numSetR[1]];  
                break;
        }
 
        // Assemble numbers and operators
        fullSet[0] = numSet;
        fullSet[1] = operatorSet;
        fullSet[2] = answer; // From above
 
        // Create the question with the set
        question = new Question(fullSet);
    }
 
    // Return the display object 
    return midLayer.addChild(question);
}

// Returns an array of numbers, and an array of operators (for the question).
function generateSet(answer, operator) {
    switch (operator) {
        case "+":
            return generateSum(answer);
            break;
        case "-":
            return generateMinus(answer);
            break;
        case "x":
            return generateMultiplication(answer);
            break;
        case "/":
            return generateDivision(answer);
            break;
        default:
            console.log("something went wrong with generateNextQuestion()");
            break;
    }
}

function generateSum(answer) {
    var numA = getRandomInt(0, answer);
    var numB = answer - numA;
    var numSet = [numA, numB];     // [[nums][operators]answer];
    return numSet;
}
function generateMinus(answer) {
    var numA = getRandomInt(answer, answer + 20);
    var numB = numA - answer;
    var numSet = [numA, numB];
    return numSet;
}
function generateMultiplication(answer) {
    do {
        var numA = getRandomInt(1,10);
    } while (answer%numA != 0)
    
    var numB = answer / numA;
    var numSet = [numA, numB];
    return numSet;
}
function generateDivision(answer) {
    var numA = getRandomInt(1, 10);
    var numB = answer * numA;
    var numSet = [numB, numA];
    return numSet;
}

// Move all objects up one position (overwritting the first)
function advanceRows(newQuestion) {
    // Animations: (Individually animate each one)
    // Bottom question
    questions[0].animateGone();
    // 2nd question
    questions[1].animate1stPosition();
    // 3rd question
    questions[2].animate2ndPosition();
    // New question
    newQuestion.animate3rdPosition();

    // Advance the questions internally
    questions[0] = questions[1];
    questions[1] = questions[2];
    questions[2] = newQuestion
}

function advanceAnswers(nextAnswer) {
    // Animations:
    // Current answer
    currentAnswer.animateGone();
    // Next answer
    nextAnswer.animateNew();

    // Advance (replace) the answer internally
    answers[nextAnswer.index] = nextAnswer; // Replace parent 
}

// Sets the currentAnswer to the answer object for the bottom most question. 
function updateCurrentAnswer() {
    for (a = 0; a < answers.length; a++) {
        if (checkAnswer(answers[a].answer)) {
            currentAnswer = answers[a];
        }
    }
}


// ANSWER CHECKING
function checkAnswer(answer) {
    return (answer == questions[0].answer);
}

function answerCorrect() {
    // GAME-LOGIC(?)
    increaseScore();                        // Update the score
    startTime = new Date().getTime();       // Reset the time (Set the time stamp to now)
    updateDifficulty();

    // Play sound
    correctSfx();

    // GAME-FUNCTIONS
    advanceAnswers(generateNextAnswer());   // Create the next answer, animate, and setup
    advanceRows(generateNextQuestion());    // Create the next question, animate, and setup
    updateCurrentAnswer();

    // Achievements
    // First blood
    // No condition
    checkAchievement(achieve.FIRSTBLOOD_KEY, achieve.FIRSTBLOOD_SRC);

    // Hot Streak
    consecutive++;
    if (consecutive > 15) {
        checkAchievement(achieve.HOTSTREAK_KEY, achieve.HOTSTREAK_SRC);
    } 
}

function answerIncorrect() {
    // GAME-LOGIC
    // Update lives 
    livesRemaining--;
    livesDisplay.updateLivesDisplay(livesRemaining);
    // Reset the time
    startTime = new Date().getTime();

    // Play sound
    incorrectSfx();

    // GAME-FUNCTIONS
    advanceAnswers(generateNextAnswer());   // Create the next answer, animate, and setup
    advanceRows(generateNextQuestion());    // Create the next question, animate, and setup
    updateCurrentAnswer();

    // Achievements
    consecutive = 0;

    // Check if user lost
    if (livesRemaining <= 0) {
        gameOver();
    }
}

function gameOver() {
    // Play sound
    gameoverSfx();
    // Pause the game
    createjs.Ticker.paused = true;
    // Show user's score
    $('#instance-score').text("Score: " + score);
    // Show the dialog 
    $.mobile.changePage("#score-dialog", { role: "dialog" });

    if(score > localStorage.getItem("localscore")){
        localStorage.setItem("localscore", score);
        $('#local-score').text("Personal best: " + score);
    } else {
        $('#local-score').text("Personal best: " + localStorage.getItem("localscore"));
    }
}

function restartGame() {
    // Reset
    scoreDisplay.txt.text = "0";  
    score = 0;

    livesDisplay.updateLivesDisplay(MAX_LIVES);
    livesRemaining = MAX_LIVES;
    
    for (q = 0; q < questions.length; q++) { questions[q].visible = false; }
    for (a = 0; a < answers.length; a++) { answers[a].visible = false; }
    questions.length = 0;
    answers.length = 0;
    currentAnswer = null;

    timerDisplay.txt.text = (MAX_TIME / 1000).toFixed(2);
    startTime = new Date().getTime();
    remainingTime = MAX_TIME;

    // Init again
    // Answers and questions (in this order)
    initializeAnswers();
    initializeQuestions(); 
    updateCurrentAnswer();
    // Initial positions and sizing
    initializeAnswerPositions();
    initializeQuestionPositions();

    // Allow submission again
    $('#submit-button').removeAttr('disabled'); 

    // Resume
    createjs.Ticker.paused = false;
}


// SCORE DIALOG
function submitScore() { 
    var name = document.getElementById("name-input").value;
    var $validIndicator = $('#valid-indicator');
    var submitted = false;

    if (validateName(name)) {
        // Clear any invalid text
        $validIndicator.removeClass('invalid');
        $validIndicator.addClass('valid');
        $validIndicator.text('Score submitted!');

        // Upload to database
        $.ajax({ 
            url: "https://api.mongolab.com/api/1/databases/numrush2910/collections/leaderboard?apiKey=2wY4G3-jDGhBVdvAO7TGBpN2dV27JFoL"
            ,data: JSON.stringify( {"username": name,"score":score} )
            ,type: "POST"
            ,contentType: "application/json" }
        );

        // Prevent submitting again
        $('#submit-button').attr('disabled', "");   // This is actually mixing jQuery and pure js
    } else {
        // Indicate is invalid
        $validIndicator.removeClass('valid');
        $validIndicator.addClass('invalid');
        $('#valid-indicator').text('Please enter a name between 1-20 characters.');
    }
}

// Check if between 1-20 characters
function validateName(name) {
    if (name.length <= 0 || name.length > 20) {
        return false;
    } else {
        return true;
    }
}

// Checks if achievement is unlocked, and creates it if it can
function checkAchievement(key, imageSource) {
    // Not unlocked yet, unlock now!
    if (localStorage.getItem(key) != "true") {
        // Prep the image
        var imageFile = new Image();
        imageFile.src = imageSource
        
        // Wait until done loading
        imageFile.onload = function() {
            var achievement = overlayLayer.addChild(new Achievement(imageFile));
            achievement.animateAchievement();
            if (sfxEnabled) { var instance = createjs.Sound.play("achieved"); }
        }

        // Unlock the achievement
        localStorage.setItem(key, "true");
    }
}
