
var canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

window.setInterval(() => {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    ctx.imageSmoothingEnabled = false;
}, 1000);

var assets = {
    bird: {
        img: document.getElementsByClassName("bird"),
        size: [document.getElementsByClassName("bird")[0].offsetWidth, document.getElementsByClassName("bird")[0].offsetHeight],
        animOrder: [0, 1, 2, 1]
    },
    background: {
        img: document.getElementById("background"),
        size: [0, 0]
    },
    floor: {
        img: document.getElementById("floor"),
        size: [0, 0],
        floorScale: canvas.width / 325
    },
    tube: {
        img: document.getElementById("tube"),
        size: [0, 0]
    },
    play: {
        img: document.getElementById("play"),
        flipped: document.getElementById("play-flipped"),
        size: [0, 0]
    },
    gameOver: {
        img: document.getElementById("game-over"),
        size: [0, 0]
    },
    numbers: {
        img: document.getElementById("numbers"),
        size: [0, 0]
    },
    scoreThing: {
        img: document.getElementById("score-thing"),
        size: [0, 0]
    },
    smallNumbers: {
        img: document.getElementById("small-numbers"),
        size: [0, 0]
    },
};
var drawNumber = function(num, x, y, scale) {//center x align, hanging y align
    var nums = num.toString().split("");//get each letter
    var numWidth = assets.numbers.size[0] / 10;
    var currOffset = x-numWidth * nums.length / 2 * scale;//half the total width of the num
    for(var i = 0; i < nums.length; i ++) {
        var xOffset = numWidth * parseInt(nums[i]);
        ctx.drawImage(
            assets.numbers.img,//image
            xOffset, 0,//texture x y
            numWidth, assets.numbers.size[1],//texture sample size

            currOffset, y,//x, y
            numWidth * scale,//width
            assets.numbers.size[1] * scale//height
        );
        currOffset += numWidth * scale;
    }
};
var drawSmallNumber = function(num, x, y, scale) {//right x align, hanging y align
    var nums = num.toString().split("");//get each letter
    var numWidth = assets.smallNumbers.size[0] / 10;
    var currOffset = x-numWidth * nums.length * scale;//half the total width of the num
    for(var i = 0; i < nums.length; i ++) {
        var xOffset = numWidth * parseInt(nums[i]);
        ctx.drawImage(
            assets.smallNumbers.img,//image
            xOffset, 0,//texture x y
            numWidth, assets.smallNumbers.size[1],//texture sample size 

            currOffset, y,//x, y
            numWidth * scale,//width
            assets.smallNumbers.size[1] * scale//height
        );
        currOffset += Math.floor(numWidth * scale);
    }
};
var loadAssets = () => {
    var allLoaded = true;
    for(var id in assets) {
        var asset = assets[id];
        if(id === "bird") {
            asset.size = [asset.img[0].offsetWidth, asset.img[0].offsetHeight];//bird has multiple imgs
        }
        else {
            asset.size = [asset.img.offsetWidth, asset.img.offsetHeight];
        }
        var temp = asset.size.join(", ");
        if(temp === "0, 0" || temp === ", ") {
            allLoaded = false;
        }
    }
    if(allLoaded) {
        frame();
    }
    else {
        window.setTimeout(loadAssets, 20);
    }
}
window.setTimeout(loadAssets, 20);

var resetMatrix = function() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
};
var drawBird = function(x, y, rot, scale) {
    ctx.translate(x, y);
    ctx.rotate(rot);
    var size = assets.bird.size;
    ctx.drawImage(assets.bird.img[assets.bird.animOrder[Math.floor(performance.now() / 200) % assets.bird.animOrder.length]], -size[0] / 2 * scale, -size[1] / 2 * scale, size[0] * scale, size[1] * scale);
    resetMatrix();
};
var getBackgroundWidth = function() {
    return assets.background.size[0] * canvas.height / assets.background.size[1];
};
var getGroundLevel = function() {
    return canvas.height - assets.floor.floorScale * assets.floor.size[1];
};
var drawBackground = function(x, width) {
    var scale = width / assets.background.size[0];
    ctx.drawImage(assets.background.img, x, getGroundLevel() - scale * assets.background.size[1], assets.background.size[0] * scale, assets.background.size[1] * scale);
};
var drawFloor = function(x) {
    ctx.drawImage(assets.floor.img, x, getGroundLevel(), assets.floor.size[0] * assets.floor.floorScale, assets.floor.size[1] * assets.floor.floorScale);
};

var moveSpeed = canvas.width / 250;
var actualMoveSpeed = moveSpeed;
var totalScrollX = 0;

var tubes = [];
var score = 0;
var temp = parseInt(window.localStorage.getItem("flappyHighScore"));
var highScore = temp? temp: 0;

var gameState = "game";//game, menu, dead

var deathTimer = 0;

var player = createPlayer();//using bird.js

function reset() {
    //reset the game
    player = createPlayer();
    actualMoveSpeed = moveSpeed;
    score = 0;
    tubes = [];
}
var lastMillis = performance.now();
var displayFrame = function(newMillis, dt) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var width = Math.floor(getBackgroundWidth());
    for(var x = (-totalScrollX / 3) % width; x < canvas.width; x += width) {
        drawBackground(Math.floor(x), width);
    }

    //tubes displayed between background and ground
    for(var i = tubes.length - 1; i >= 0; i --) {
        tubes[i].update(dt);
        tubes[i].display();
        if(tubes[i].pos[0] < -tubes[i].size) {
            tubes.splice(i, 1);
        }
    }

    var width = Math.floor(assets.floor.size[0] * assets.floor.floorScale);
    for(var x = Math.round((-totalScrollX) % width); x < canvas.width; x += width) {
        drawFloor(x);
    }
    player.update(dt);
    player.display();
};
var mouseReleased = function(x, y) {
    //console.log(x + ", " + y);
    //something released at x, y
    if(gameState === "dead" && deathTimer > 180) {
        var playButtonSize = assets.play.size;
        var playButtonScale = canvas.height / 8 / playButtonSize[1];
        var topLeft = [canvas.width / 2 - playButtonSize[0] * playButtonScale / 2, canvas.height * 4/5];
        var size = [playButtonSize[0] * playButtonScale, playButtonSize[1] * playButtonScale];
        //console.log(topLeft);
        //console.log(size);
        if(x + 25 > topLeft[0] &&
            x - 25 < topLeft[0] + size[0] &&
            y + 25 > topLeft[1] &&
            y - 25 < topLeft[1] + size[1]
        ) {
            //console.log("hello");
            gameState = "game";
            reset();
        }
    }
};
var frame = function() {
    var newMillis = performance.now();
    var dt = (newMillis - lastMillis) * 60 / 1000;//deltatime (how laggy it is)
    var fps = 1000 / (newMillis - lastMillis);
    if(dt > 10) {
        dt = 1;
    }
    switch(gameState) {
        case "game":
            var lastTSX = totalScrollX;
            totalScrollX += actualMoveSpeed * dt;
            actualMoveSpeed += dt * 0.005;
            if(totalScrollX % Math.floor(canvas.width / 3) < lastTSX % Math.floor(canvas.width / 3)) {
                //spawn a tubular object
                var tubeHeight = player.size[1] * 4;//big tube
                var tubeWidth = assets.tube.size[0] * player.scale / 2;
                var tubeY = Math.random() * (getGroundLevel() - tubeHeight * 2) + tubeHeight;
                var tube = new Tube(tubeY, tubeHeight, tubeWidth);
                tubes.push(tube);
            }
            displayFrame(newMillis, dt);
            drawNumber(score, canvas.width / 2, canvas.height / 64, assets.floor.floorScale / 2);
            if(player.dead) {
                if(score > highScore) {
                    highScore = score;
                    window.localStorage.setItem("flappyHighScore", highScore);
                }
                gameState = "dead";
                deathTimer = 0;//timer for when the play button shows up (and hopefully some animations?)
            }
            break;
        case "dead":
            totalScrollX += actualMoveSpeed * dt;
            displayFrame(newMillis, dt);
            actualMoveSpeed *= 0.95;
            deathTimer += dt;
            if(deathTimer > 20) {
                //game over text falls from the sky
                var aTime = 0;
                var vel = 0;
                for(var i = 0; i < deathTimer - 20; i ++) {
                    vel += 1/40;
                    aTime += vel;
                    if(aTime > 1) {
                        vel *= -0.8;
                        aTime = 1;
                    }
                }

                aTime = 1 - aTime;

                var gameOverSize = assets.gameOver.size;
                var gameOverScale = canvas.height / gameOverSize[1] / 6;
                var topLeft = [canvas.width / 2 - gameOverSize[0] * gameOverScale / 2, canvas.height / 20 - canvas.height / 5 * aTime];
                var size = [gameOverSize[0] * gameOverScale, gameOverSize[1] * gameOverScale];
                ctx.drawImage(assets.gameOver.img, ...topLeft, ...size);
            }
            if(deathTimer > 90) {//1.5 second
                //show the score thing
                var scoreThingSize = assets.scoreThing.size;
                var scoreThingScale = canvas.height * 0.35 / scoreThingSize[1];
                var topLeft = [canvas.width / 2 - scoreThingSize[0] * scoreThingScale / 2, canvas.height / 3];
                var size = [scoreThingSize[0] * scoreThingScale, scoreThingSize[1] * scoreThingScale];
                ctx.drawImage(assets.scoreThing.img, ...topLeft, ...size);//use the spread operator to simplify code?

                //score is 11 pixels from the right, 17 pixels from the top
                var scoreTopRight = [
                    topLeft[0] + size[0] - 17 * scoreThingScale,
                    topLeft[1] + 34 * scoreThingScale 
                ];
                drawSmallNumber(score, ...scoreTopRight, scoreThingScale);
                var scoreTopRight = [
                    topLeft[0] + size[0] - 17 * scoreThingScale,
                    topLeft[1] + 76 * scoreThingScale 
                ];
                drawSmallNumber(highScore, ...scoreTopRight, scoreThingScale);
            }
            if(deathTimer > 180) {//3 second
                //play button shows up :)
                var playButtonSize = assets.play.size;
                var playButtonScale = canvas.height / 6 / playButtonSize[1];
                var topLeft = [canvas.width / 2 - playButtonSize[0] * playButtonScale / 2, canvas.height * 4/5];
                var size = [playButtonSize[0] * playButtonScale, playButtonSize[1] * playButtonScale];
                //ctx.fillRect(...topLeft, ...size);
                var isFlipped = false;
                for(var i = 0; i < currentTouches.length; i ++) {
                    if(currentTouches[i].pageX + 25 > topLeft[0] &&
                        currentTouches[i].pageX - 25 < topLeft[0] + size[0] &&
                        currentTouches[i].pageY + 25 > topLeft[1] &&
                        currentTouches[i].pageY - 25 < topLeft[1] + size[1]
                    ) {
                        isFlipped = true;
                        break;
                    }
                }
                ctx.drawImage(isFlipped? assets.play.flipped: assets.play.img,
                    ...topLeft,
                    ...size
                );
            }
            break;
    }
    /*
    ctx.font = "20px mainfont";
    ctx.fillStyle = "black";
    ctx.fillText(canvas.width + ", " + canvas.height, 0, 20);
    */
    
    for(var i = 0; i < currentTouches.length; i ++) {
        ctx.fillRect(currentTouches[i].pageX, currentTouches[i].pageY, 10, 10);
    }
    
    
    lastMillis = newMillis;
    window.requestAnimationFrame(frame);
};
//window.requestAnimationFrame(frame);
