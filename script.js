const gameBoard = document.querySelector("#gameBoard");
const ctx = gameBoard.getContext("2d");
const scoreText = document.querySelector("#scoreText");
const resetBtn = document.querySelector("#resetBtn");
let audio = document.getElementById("bgMusic");
const clickSound = new Audio("click.wav"); // Load the sound file
const eatSound = new Audio("eat.wav"); // Load the sound file
const gameWidth = gameBoard.width;
const gameHeight = gameBoard.height;
const boardBackground = "darkslategray";
const snakeColor = "lightgreen";
const snakeBorder = "black";
const foodColor = "red";
const unitSize = 25;
let running = false;
let xVelocity = unitSize;
let yVelocity = 0;
let foodX;
let foodY;
let score = 0;
defaultTickSpeed=75;
let tickSpeed;
let ticker;
let immortal=false;
let paused=false;
let pausedTextIsVisible=false;
const LEFT = 37;
const UP = 38;
const RIGHT = 39;
const DOWN = 40;

// Adding WASD keys
const KEY_W = 87;
const KEY_A = 65;
const KEY_S = 83;
const KEY_D = 68;

// Adding Z and X keys
const KEY_Z = 90;
const KEY_X = 88;
const KEY_ENTER = 13;
const SPACE = 32;
let snake = [
    {x:unitSize * 4, y:0},
    {x:unitSize * 3, y:0},
    {x:unitSize * 2, y:0},
    {x:unitSize, y:0},
    {x:0, y:0}
];

document.addEventListener("visibilitychange", () => {
    if(document.hidden){
        paused = true;
    }  
});

document.getElementById("unmuteBtn").addEventListener("click", function() {
    playClickSound();
    if(!running || paused){
        return;
    }
    if (audio.muted) {
        this.textContent = "🔊"; // Unmute icon
        audio.muted = false;
        audio.play();
    } else {
        this.textContent = "🔇"; // Mute icon
        audio.muted = true;
        audio.pause();
    }
});

window.addEventListener("keydown", changeDirection);
resetBtn.addEventListener("click", resetGame);
document.getElementById("upBtn").addEventListener("touchstart", () => touchMove("ArrowUp"));
document.getElementById("downBtn").addEventListener("touchstart", () => touchMove("ArrowDown"));
document.getElementById("leftBtn").addEventListener("touchstart", () => touchMove("ArrowLeft"));
document.getElementById("rightBtn").addEventListener("touchstart", () => touchMove("ArrowRight"));
document.getElementById("gameBoard").addEventListener("touchstart", () => touchMove("SPACE"));


gameStart();

function gameStart(){
    tickSpeed = defaultTickSpeed;
    running= true;
    scoreText.textContent = score;
    createFood();
    drawFood();
    nextTick();
}

async function nextTick(){
    if(running){

        ticker = setTimeout(()=>{
            if(!paused){
                clearBoard();
                drawFood();
                moveSnake();
                drawSnake();
                checkGameOver();
            }
            checkPaused();
            checkAudio(); 
            nextTick();
        }, tickSpeed);
    
    }
    else{
        displayGameOver();
    }
}

function checkAudio(){
    if(paused || !running || audio.muted){
        audio.pause();
    }
    else{
        audio.play();
    }
}
function clearBoard(){
    ctx.fillStyle = boardBackground;
    ctx.fillRect(0, 0, gameWidth, gameHeight);
}

function createFood(){
    function randomFood(min, max){
        const randNum = Math.round((Math.random() * (max - min) + min) / unitSize) * unitSize;
        return randNum;
    }
    foodX = randomFood(0, gameWidth - unitSize);
    foodY = randomFood(0, gameWidth - unitSize);
}

function drawFood(){
    ctx.fillStyle = foodColor;
    ctx.fillRect(foodX, foodY, unitSize, unitSize);
}
function drawBg(){
    const img = new Image();
    img.src = "grass.jpg";
    img.onload = function() {
        const pattern = ctx.createPattern(img, "repeat"); // "repeat", "repeat-x", "repeat-y", "no-repeat"
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, gameBoard.width, gameBoard.height);
    };
}

function moveSnake(){
    const head = {
        x: snake[0].x + xVelocity,
        y: snake[0].y + yVelocity
    };
    snake.unshift(head);
    //if food is eaten
    if(snake[0].x == foodX && snake[0].y == foodY){
        score+=1;
        scoreText.textContent = score;
        playEatSound();
        createFood();
        tickSpeed = tickSpeed - 1;
    }
    else{
        snake.pop();
    }     
}

function drawSnake(){
    ctx.fillStyle = snakeColor;
    ctx.strokeStyle = snakeBorder;
    snake.forEach(snakePart => {
        ctx.fillRect(snakePart.x, snakePart.y, unitSize, unitSize);
        ctx.strokeRect(snakePart.x, snakePart.y, unitSize, unitSize);
    })
}

function changeDirection(event){
    const keyPressed = event.keyCode;
    //console.log(event.key);
    const goingUp = (yVelocity == -unitSize);
    const goingDown = (yVelocity == unitSize);
    const goingRight = (xVelocity == unitSize);
    const goingLeft = (xVelocity == -unitSize);

    switch(true){
        case(!goingRight && (keyPressed == LEFT || keyPressed == KEY_A || event.key == "ArrowLeft")):
            xVelocity = -unitSize;
            yVelocity = 0;
            break;
        case(!goingDown && (keyPressed == UP || keyPressed == KEY_W || event.key == "ArrowUp")):
            xVelocity = 0;
            yVelocity = -unitSize;
            break;
        case(!goingLeft &&(keyPressed == RIGHT || keyPressed == KEY_D || event.key == "ArrowRight")):
            xVelocity = unitSize;
            yVelocity = 0;
            break;
        case(!goingUp && (keyPressed == DOWN || keyPressed == KEY_S || event.key == "ArrowDown")):
            xVelocity = 0;
            yVelocity = unitSize;
            break;
        // case (keyPressed == KEY_Z):
        //     tickSpeed = 250;
        //     break;
        // case (keyPressed == KEY_X):
        //     immortal = true;
        //     break;
        case (keyPressed == KEY_ENTER):
            resetGame();
            break;
        case (keyPressed == SPACE || event.key == "SPACE"):
            if(!running){
                resetGame();
                return;
            }
            playClickSound();
            pausedTextIsVisible = false;
            paused = !paused;
            break;
        default:
            break;
    }
    //console.log(keyPressed);
}

function checkPaused(){
    if(paused && running && !pausedTextIsVisible){
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, gameWidth, gameHeight);
        ctx.font = "50px MV Boli";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText("PAUSED", gameWidth / 2, gameHeight / 2);
        pausedTextIsVisible = true;
    }
}
function checkGameOver(){
    switch(true){
        case (snake[0].x < 0):
            snake[0].x = gameWidth;
            break;
        case (snake[0].x >= gameWidth):
            snake[0].x = 0;
            break;
        case (snake[0].y < 0):
            snake[0].y = gameHeight;
            break;
        case (snake[0].y >= gameHeight):
            snake[0].y = 0;
            break;
    }
    for(let i = 1; i < snake.length; i+=1){
        if(snake[i].x == snake[0].x && snake[i].y == snake[0].y){
            running = immortal;
        }
    }
}

function displayGameOver(){
    ctx.font = "50px MV Boli";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER!", gameWidth / 2, gameHeight / 2);
    running = false;
}

function resetGame(){
    playClickSound();
    tickSpeed = defaultTickSpeed;
    paused = false;
    clearTimeout(ticker);
    score = 0;
    xVelocity = unitSize;
    yVelocity = 0;
    snake = [
        {x:unitSize * 4, y:0},
        {x:unitSize * 3, y:0},
        {x:unitSize * 2, y:0},
        {x:unitSize, y:0},
        {x:0, y:0}
    ];
    gameStart();
    
}

function playEatSound() {
    
    eatSound.play().catch(error => console.error("Playback error:", error));
}

function playClickSound() {
    clickSound.play().catch(error => console.error("Playback error:", error));
}
function touchMove(direction) {
    const event = new KeyboardEvent("keydown", { key: direction });
    //console.log(event);
    window.dispatchEvent(event);
}

