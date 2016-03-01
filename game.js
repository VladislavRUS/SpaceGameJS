window.onload = init;

var map;
var ctxMap;

var pl;
var ctxPl;

var enemyCanvas;
var ctxEnemy;

var drawBtn;
var clearBtn;

var stats;
var ctxStats;

var gameWidth = 800;
var gameHeight = 500;

var background = new Image();
background.src = "images/background.jpg";

var background1 = new Image();
background1.src = "images/background.jpg";

var tiles;
tiles = new Image();
tiles.src = "images/tiles.png";

var player;
var enemies = [];

var isPlaying;
var health;

var mapX = 0;
var map1X = gameWidth;

//for creating enemies
var spawnInterval;
var spawnTime = 7000;
var spawnAmount = 3;

var mouseX;
var mouseY;
var mouseControl = false;

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

    ctxMap = map.getContext("2d");
    ctxPl = pl.getContext("2d");
    ctxEnemy = enemyCanvas.getContext("2d");
    ctxStats = stats.getContext("2d");

    map.width = gameWidth;
    map.height = gameHeight;
    pl.width = gameWidth;
    pl.height = gameHeight;
    enemyCanvas.width = gameWidth;
    enemyCanvas.height = gameHeight;
    stats.width = gameWidth;
    stats.height = gameHeight;

    ctxStats.fillStyle = "#FFFFFF";
    ctxStats.font = "bold 35pt Arial";

    drawBtn  = document.getElementById("drawBtn");
    clearBtn = document.getElementById("clearBtn");

    drawBtn.addEventListener("click", drawRect, false);
    clearBtn.addEventListener("click", clearRect, false);

    document.addEventListener("keydown", checkKeyDown, false);
    document.addEventListener("keyup", checkKeyUp, false);
    document.addEventListener("mousemove", mouseMove, false);
    document.addEventListener("click", mouseClick, false);

    player = new Player();
    resetHealth();

    startLoop();
    health = 100;
}

function resetHealth(){
    health = 100;
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
}

function update(){
    moveBg();
    player.update();
    for(var i = 0; i < enemies.length; i++){
        enemies[i].update();
    }
    updateStats();
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
    if(health < 0){
        resetHealth();
    }
    
    if(this.drawX < 0)
        this.drawX = 0;
    if(this.drawX > gameWidth - this.width)
        this.drawX = gameWidth - this.width;
    if(this.drawY < 0)
        this.drawY = 0;
    if(this.drawY > gameHeight - this.height)
        this.drawY = gameHeight - this.height;

    for(var i = 0; i < enemies.length; i++){
        if( this.drawX >= enemies[i].drawX &&
            this.drawY >= enemies[i].drawY &&
            this.drawX <= enemies[i].drawX
                       + enemies[i].width &&
            this.drawX <= enemies[i].drawY
                       + enemies[i].height){
            health --;
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

    this.speed = 3;
}

Enemy.prototype.draw = function(){
    ctxEnemy.drawImage(
        tiles,
        this.srcX, this.srcY, this.width, this.height,
        this.drawX, this.drawY, this.width, this.height
    );
};

Enemy.prototype.update = function(){
    if(this.drawX + this.width < 0 ){
        this.destroy();
    }
    this.drawX -= 7;
};

Enemy.prototype.destroy = function(){
    enemies.splice(enemies.indexOf(this), 1);
};

function spawnEnemy(count){
    for(var i = 0; i < count; i++){
        enemies[i] = new Enemy();
    }
}

function startCreatingEnemies(){
    stopCreatingEnemies();
    spawnInterval = setInterval(function(){spawnEnemy(spawnAmount)},spawnTime);
}

function stopCreatingEnemies(){
        clearInterval(spawnInterval);
}

//Other
function updateStats(){
    ctxStats.clearRect(0, 0, gameWidth, gameHeight);
    ctxStats.fillText("Health: " + health, 550, 50);
}

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
