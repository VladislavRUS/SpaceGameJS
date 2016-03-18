window.onload = init;

var map;
var ctxMap;

var pl;
var ctxPl;

var enemyCanvas;
var ctxEnemy;

var stats;
var ctxStats;

var fire;
var ctxFire;

var gameWidth = 1000;
var gameHeight = 500;

var background = new Image();
background.src = "images/background.jpg";

var background1 = new Image();
background1.src = "images/background.jpg";

var fireImage = new Image;
fireImage.src = "images/fire.png";

var tiles;
tiles = new Image();
tiles.src = "images/tiles.png";

var fireBalls = new Array;

var player;
var enemies = [];

var isPlaying;

var mapX = 0;
var map1X = gameWidth;

//for creating enemies
var spawnInterval;
var spawnTime = 1000;
var spawnAmount = 3;

var mouseX;
var mouseY;
var mouseControl = false;

var scoreText = "Your score is: ";
var score = 0;

var requestAnimFrame = window.requestAnimFrame ||
                       window.webkitRequestAnimationFrame ||
                       window.mozRequestAnimationFrame ||
                       window.oRequestAnimationFrame ||
                       window.msRequestAnimationFrame;



function init(){
    map = document.getElementById("map");
    pl = document.getElementById("player");
    enemyCanvas = document.getElementById("enemy");
    stats = document.getElementById("stats");
    fire = document.getElementById("fire");


    ctxMap = map.getContext("2d");
    ctxPl = pl.getContext("2d");
    ctxEnemy = enemyCanvas.getContext("2d");
    ctxStats = stats.getContext("2d");
    ctxFire = fire.getContext("2d");

    map.width = gameWidth;
    map.height = gameHeight;
    pl.width = gameWidth;
    pl.height = gameHeight;
    enemyCanvas.width = gameWidth;
    enemyCanvas.height = gameHeight;
    stats.width = gameWidth;
    stats.height = gameHeight;
    fire.width = gameWidth;
    fire.height = gameHeight;

    ctxStats.fillStyle = "#FFFFFF";
    ctxStats.font = "bold 35pt Arial";

    document.addEventListener("keydown", checkKeyDown, false);
    document.addEventListener("keyup", checkKeyUp, false);
    document.addEventListener("mousemove", mouseMove, false);
    document.addEventListener("click", mouseClick, false);

    document.getElementById("score").innerHTML = scoreText + score;
    player = new Player();

    startLoop();
}

function mouseMove(e){
    if(!mouseControl){
        return;
    }
    mouseX = e.pageX - map.offsetLeft;
    mouseY = e.pageY - map.offsetTop;

    player.drawX = mouseX - player.width/4;
    player.drawY = mouseY - player.height/2;
    document.getElementById("gameName").innerHTML = "X: " + mouseX + " Y: " + mouseY;
}

function mouseClick(){
    if(!mouseControl){
        mouseControl = true;
    }
    else{
        mouseControl = false;
    }
}

//Game functions
function loop(){
    if(isPlaying){
        draw();
        update();
        requestAnimFrame(loop);
    }
}

function startLoop(){
    isPlaying = true;
    loop();
    startCreatingEnemies();
}

function stopLoop(){
    isPlaying = false;
}

function draw(){
    player.draw();
    clearCtxEnemy();
    for(var i = 0; i < enemies.length; i++){
        enemies[i].draw();
    }
    for (var j = 0; j < fireBalls.length; j++) {
        fireBalls[j].draw();
    }
}

function update(){
    moveBg();
    player.update();
    for(var i = 0; i < enemies.length; i++){
        enemies[i].update();
    }

    for (var j = 0; j < fireBalls.length; j++) {
        fireBalls[j].update();
    }
    drawBg();
}

function moveBg(){
    var vel = 4;
    mapX -= vel;
    map1X -= vel;

    if(mapX  + gameWidth < 0){
        mapX = gameWidth;
    }
    if(map1X + gameWidth < 0){
        map1X = gameWidth;
    }
}
//Player
function Player(){
    this.srcX = 0;
    this.srcY = 0;
    this.drawX = 0;
    this.drawY = 0;
    this.width = 320;
    this.height = 150;

    this.speed = 8;

    this.isUp = false;
    this.isDown = false;
    this.isRight = false;
    this.isLeft = false;
}

Player.prototype.draw = function(){
    clearCtxPlayer();
    ctxPl.drawImage(
        tiles,
        this.srcX, this.srcY, this.width, this.height,
        this.drawX, this.drawY, this.width, this.height
    );
};

Player.prototype.update = function(){
    
    if(this.drawX < 0)
        this.drawX = 0;
    if(this.drawX > gameWidth - this.width)
        this.drawX = gameWidth - this.width;
    if(this.drawY < 0)
        this.drawY = 0;
    if(this.drawY > gameHeight - this.height)
        this.drawY = gameHeight - this.height;

    for(var i = 0; i < enemies.length; i++){
        if(overlaps(enemies[i], this)){
            alert('You lose!');
            stopLoop();
        }
    }
    this.chooseDir();
};

Player.prototype.chooseDir = function(){
    if(this.isUp){
        this.drawY -= this.speed;
    }
    if(this.isDown){
        this.drawY += this.speed;
    }
    if(this.isLeft){
        this.drawX -= this.speed;
    }
    if(this.isRight){
        this.drawX += this.speed;
    }
};

function checkKeyDown(e){
    var keyID = e.keyCode || e.which;
    var keyChar = String.fromCharCode(keyID);

    if(keyChar == 'W'){
        player.isUp = true;
        e.preventDefault();
    }
    if(keyChar == 'S'){
        player.isDown = true;
        e.preventDefault();
    }
    if(keyChar == 'A'){
        player.isLeft = true;
        e.preventDefault();
    }
    if(keyChar == 'D'){
        player.isRight = true;
        e.preventDefault();
    }

    if(keyID == 32){
        var ball = new Fire(player.drawX, player.drawY + player.width / 5);
        fireBalls.push(ball);
    }
}

function checkKeyUp(e){
    var keyID = e.keyCode || e.which;
    var keyChar = String.fromCharCode(keyID);
    if(keyChar == 'W'){
        player.isUp = false;
        e.preventDefault();
    }
    if(keyChar == 'S'){
        player.isDown = false;
        e.preventDefault();
    }
    if(keyChar == 'A'){
        player.isLeft = false;
        e.preventDefault();
    }
    if(keyChar == 'D'){
        player.isRight = false;
        e.preventDefault();
    }
}

//Enemy
function Enemy(){
    this.srcX = 0;
    this.srcY = 160;
    this.drawX = Math.floor(Math.random()*gameWidth + gameWidth);
    this.drawY = Math.floor(Math.random()*gameHeight);
    this.width = 320;
    this.height = 150;

    this.speed = 10;
}

Enemy.prototype.draw = function(){
    ctxEnemy.drawImage(
        tiles,
        this.srcX, this.srcY, this.width, this.height,
        this.drawX, this.drawY, this.width, this.height
    );
};

Enemy.prototype.update = function(){
    if(this.drawX + this.width < -100 ){
        this.destroy();
    }

    this.drawX -= this.speed;

    for(var i = 0; i < fireBalls.length; i++){
        if(overlaps(fireBalls[i], this)){
            this.destroy();
            fireBalls[i].drawX = 1000;
            score++;
            scoreUp();
        }
    }
};

Enemy.prototype.destroy = function(){
    enemies.splice(enemies.indexOf(this), 1);
};

function spawnEnemy(count){
    var en = new Enemy();
    enemies.push(en);
}

function startCreatingEnemies(){
    spawnInterval = setInterval(function(){
        spawnEnemy(spawnAmount)
    },spawnTime);
}

function Fire(x, y){
    this.drawX = x;
    this.drawY = y;

    this.width = 50;
    this.height = 50;

    this.speed = 20;
}

Fire.prototype.update = function(){
    this.drawX += this.speed;

    if(this.drawX > gameWidth * 1.5){
        fireBalls.splice(fireBalls.indexOf(this), 1);
    }
}

Fire.prototype.draw = function(){
    ctxFire.clearRect(0, 0, gameWidth, gameHeight);
    ctxFire.drawImage(
        fireImage,
        0, 0, 88, 88,
        this.drawX, this.drawY, this.width, this.height
    );
};


function drawRect(){
    ctxMap.fillStyle = "#3D3D3D";
    ctxMap.fillRect(10, 10, 100, 100);
}

function clearRect(){
    ctxMap.clearRect(0, 0, 800, 500);
}

function clearCtxPlayer(){
    ctxPl.clearRect(0, 0, gameWidth, gameHeight);
}

function clearCtxEnemy(){
    ctxEnemy.clearRect(0, 0, gameWidth, gameHeight);
}

function drawBg(){
    ctxMap.clearRect(0, 0, gameWidth, gameHeight);
    ctxMap.drawImage(
        background,
        0, 0, 800, 500,
        mapX, 0, gameWidth, gameHeight
    );
    ctxMap.drawImage(
        background1,
        0, 0, 800, 500,
        map1X, 0, gameWidth, gameHeight
    );
}

function overlaps(object, anotherObject){
    var left = anotherObject.drawX;
    var right = anotherObject.drawX + anotherObject.width;
    var top = anotherObject.drawY;
    var bottom = anotherObject.drawY + anotherObject.height;

    var objectX_center = object.drawX + object.width/2;
    var objectY_center = object.drawY + object.height/2;

    if(objectX_center > left && objectX_center < right){
        if(objectY_center > top && objectY_center < bottom){
            return true;
        }
        else{
            return false;
        }
    }
    else{
        return false;
    }
}

function scoreUp(){
    document.getElementById("score").innerHTML = scoreText + score;
}
