var mouseId = 1234567;
var executeTouchEvent = function(x, y, name, id) {
    var touch = new Touch({
        identifier: id,
        target: canvas,
        pageX: x,
        pageY: y,
        screenX: x,
        screenX: y
    });
    var touchEvent = new TouchEvent(name, {
        touches: [touch],
        targetTouches: [touch],
        changedTouches: [touch],
        bubbles: true,
        cancelable: true,
        view: window
    });
    canvas.dispatchEvent(touchEvent);
};
var mouseIsPressed = false;
var mousePos = [0, 0];
var keyIsPressed = false;
canvas.addEventListener("mousedown", (e) => {
    mouseIsPressed = true;
    mouseId = 1000000 + Math.floor(8999999 * Math.random());
    executeTouchEvent(e.clientX, e.clientY, "touchstart", mouseId);
});
canvas.addEventListener("mousemove", (e) => {
    mousePos = [e.clientX, e.clientY];
    if(mouseIsPressed) {
        executeTouchEvent(e.clientX, e.clientY, "touchmove", mouseId);
    }
});
canvas.addEventListener("mouseup", (e) => {
    mouseIsPressed = false;
    executeTouchEvent(e.clientX, e.clientY, "touchend", mouseId);
});
document.body.addEventListener("keydown", () => {
    if(!keyIsPressed) {
        keyIsPressed = true;
        executeTouchEvent(...mousePos, "touchstart", 999999999999);//key id lol
    }
});
document.body.addEventListener("keyup", () => {
    if(keyIsPressed) {
        keyIsPressed = false;
        executeTouchEvent(1, 1, "touchend", 999999999999);//key id lol
    }
});


var currentTouches = [];
var copyTouch = function({identifier, pageX, pageY}) {
    return {identifier, pageX, pageY};
}
var getTouchId = function(target) {
    for(var j = 0; j < currentTouches.length; j ++) {
        if(currentTouches[j].identifier === target) {
            return j;
        }
    }
    return -1;//not found
};
var handleTouchStart = (e) => {
    e.preventDefault();
    if(gameState === "game") {
        player.jump();
    }
    var touches = e.changedTouches;
    for(var i = 0; i < touches.length; i ++) {
        if(touches[i].pageX < 50 && touches[i].pageY < 50) {
            navigator.serviceWorker.getRegistrations()
                .then(registrations => {
                    registrations.map(r => {
                        r.unregister()
                    }) 
                })
        }
        currentTouches.push(copyTouch(touches[i]));
        //text(touches[i].identifier, touches[i].pageX, touches[i].pageY);
    }
};
var handleTouchMove = (e) => {
    e.preventDefault();
    var touches = e.changedTouches;
    for(var i = 0; i < touches.length; i ++) {
        var id = getTouchId(touches[i].identifier);
        //line(currentTouches[id].pageX, currentTouches[id].pageY, touches[i].pageX, touches[i].pageY);
        currentTouches.splice(id, 1, copyTouch(touches[i]));
    }
};
var handleTouchEnd = (e) => {
    e.preventDefault();
    var touches = e.changedTouches;
    for(var i = 0; i < touches.length; i ++) {
        //text(touches[i].identifier, touches[i].pageX, touches[i].pageY);
        var id = getTouchId(touches[i].identifier);
        //line(currentTouches[id].pageX, currentTouches[id].pageY, touches[i].pageX, touches[i].pageY);
        var ctouch = currentTouches[id];
        mouseReleased(ctouch.pageX, ctouch.pageY);
        currentTouches.splice(id, 1);
    }
};
var handleTouchCancel = (e) => {
    e.preventDefault();
    var touches = e.changedTouches;
    for(var i = 0; i < touches.length; i ++) {
        var id = getTouchId(touches[i].identifier);
        currentTouches.splice(id, 1);
    }
};
canvas.addEventListener("touchstart", handleTouchStart);
canvas.addEventListener("touchmove", handleTouchMove);
canvas.addEventListener("touchend", handleTouchEnd);
canvas.addEventListener("touchcancel", handleTouchCancel);
