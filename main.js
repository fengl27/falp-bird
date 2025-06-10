
var buttonEl = document.getElementById("button");
var fileEl = document.getElementById("file");
var canvas = document.getElementById("canvas");
var previewEl = document.getElementById("preview");
var entropyRangeInput = document.getElementById("entropy-range");
var useRotationsInput = document.getElementById("use-rotations");
var DIMInput = document.getElementById("dim-input");

canvas.width = window.outerWidth;
canvas.height = window.outerHeight;
canvas.onclick = function() {
    canvas.requestFullscreen();
};
var ctx = canvas.getContext("2d", {willReadFrequently: true});
ctx.imageSmoothingEnabled = false;

var data = [];
var DIM = 60;//60x60 output :)
var pixelSize = Math.floor(canvas.height / DIM);

var totalTiles = 0;
var maxOptionsLength = 0;

var grid = [];

var changes = [];

var doLoop = true;

var buttonClicked = function() {
    console.log("You clicked a button. Wow.");
    var file = fileEl.files[0];
    if(file) {
        var url = URL.createObjectURL(file);
        previewEl.src = url;
        previewEl.crossOrigin = "Anonymous";
        DIM = parseInt(DIMInput.value);
        pixelSize = Math.floor(canvas.height / parseInt(DIMInput.value));
        previewEl.onload = function() {
            console.log("began at " + performance.now());
            var size = {x: previewEl.naturalWidth, y: previewEl.naturalHeight};
            ctx.drawImage(previewEl, 0, 0);
            ctx.drawImage(previewEl, size.x, 0);
            ctx.drawImage(previewEl, 0, size.y);
            ctx.drawImage(previewEl, size.x, size.y);//make 4 of them
            
            console.log(ctx.getImageData(0, 0, size.x + tileSize - tileCenter, size.y + tileSize - tileCenter));

            extractTiles(ctx.getImageData(0, 0, size.x + tileSize - tileCenter, size.y + tileSize - tileCenter), size, tileSize);
            //console.log(tiles.length);
            totalTiles = tiles.length;
            tiles = deduplicate(tiles);
            maxOptionsLength = tiles.length;

            for(var i = 0; i < tiles.length; i ++) {
                var P = tiles[i].appearences / totalTiles;
                tiles[i].entropy = P * Math.log(P);
            }
            //console.log(tiles);
            for(var i = 0; i < tiles.length; i ++) {
                tiles[i].calculateNeighbors(tiles);
            }

            var temp = getEntropy(new Cell(tiles, 0, 0, pixelSize, 0, 0));//entropy of all default cells
            var id = 0;
            for(var j = 0; j < DIM; j ++) {
                for(var i = 0; i < DIM; i ++) {
                    grid.push(new Cell(tiles, i * pixelSize, j * pixelSize, pixelSize, id, temp));//could replace this nested for loop later for optimization :D
                    id ++;//instead of id I could use grid.length >:)
                }
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            /*
            var id = 0; 
            var x = 0;
            var y = 0;
            while(id < tiles.length) {
                drawArr(tiles[id].img, {x: tileSize, y: tileSize}, x * 4, y * 4);
                id ++;
                x ++;
                if(x === 10) {
                    x = 0;
                    y ++;
                }
            }
            */
           
            /*
            drawArr(tiles[2].img, {x: tileSize, y: tileSize}, 0, 0);
            for(var j = 0; j < 4; j ++) {
                for(var i = 0; i < tiles[2].neighbors[j].length; i ++) {
                    drawArr(tiles[tiles[2].neighbors[j][i]].img, {x: tileSize, y: tileSize}, 4 * (j + 1), i * 4);
                }
            }
            */
            //ctx.putImageData(new ImageData(new Uint8ClampedArray(tiles[0].img), tileSize, tileSize), 400, 0);
            console.log("ended setup at " + performance.now());

            var randCell = grid[DIM * DIM - 1];
            collapseTile(grid, randCell);

            window.requestAnimationFrame(frame);//start the draw loop! (or at least request to :D)
        };
    }
    else {
        alert("Um. There isn't a file.")
    }
};
buttonEl.addEventListener("click", buttonClicked);

var reduceEntropy = function(grid, cell, limit) {
    if(limit === 0) {
        return false;
    }
    var idx = cell.index;
    var i = idx % DIM;//haha i do not need a math.flor here >:) (my spelling is great)
    var j = Math.floor(idx / DIM);

    var things = [
        [1, 0],
        [-1, 0],
        [0, -1],
        [0, 1]
    ];//jank

    for(var k = 0; k < 4; k ++) {
        var ni = i + things[k][0];//extremely not racist coding :)
        var nj = j + things[k][1];
        if(ni < DIM && ni >= 0 && nj < DIM && nj >= 0) {
            var rightCell = grid[ni + nj * DIM];//right cell is not always right (it could be left (not wrong))
            if(!rightCell.collapsed) {
                //find rightcell's options :)

                var validOptions = [];
                if(cell.options.length > 0) {
                    for(var option of cell.options) {
                        //console.log(option);
                        //console.log(tiles[option]);
                        if(tiles[option]) {
                            validOptions.push(...tiles[option].neighbors[k]);//concat
                        }
                        else {
                            return true;
                        }
                    }
                    rightCell.options = rightCell.options.filter(elt => validOptions.includes(elt));
                    rightCell.entropy = getEntropy(rightCell);//get entropy again once you change the options
                    if(reduceEntropy(grid, rightCell, limit - 1)) {//if it ran into conflict
                        return true;
                    }
                }
                else {
                    return true;
                }
            }
        }
    }
};

var resetGrid = function() {
    grid = [];
    var id = 0;
    for(var j = 0; j < DIM; j ++) {
        for(var i = 0; i < DIM; i ++) {
            grid.push(new Cell(tiles, i * pixelSize, j * pixelSize, pixelSize, id));//could replace this nested for loop later for optimization :D
            id ++;//instead of id I could use grid.length >:)
        }
    }
    var randCell = grid[DIM * DIM - 1];
    collapseTile(grid, randCell);
};
var backprop = function() {//it's supposed to be backtrack (sorry)
    console.log("backtracked");
    //go backwards
    var change = changes[changes.length - 1];//the latest change
    changes.splice(changes.length - 1, 1);//delete it (I don't think we need this, actually :0)
    for(var thing = 0; thing < change.length; thing ++) {
        if(grid[thing].collapsed && change[thing][0].length > 1) {
            //got collapsed by the change
            //remove the change from the options
            var temp = grid[thing].options[0];//the thing it collapsed into
            grid[thing].options = change[thing][0];//revert change
            grid[thing].options.splice(grid[thing].options.indexOf(temp), 1);//remove the thing that caused the cringe
        }
        else {
            grid[thing].options = change[thing][0];
        }
        grid[thing].entropy = getEntropy(grid[thing]);
        //grid[thing].collapsed = false;
        grid[thing].collapsed = change[thing][1];//reset change
        //console.log(grid[thing]);
    }
    //doLoop = false;//pause the frame loop
};

var collapseTile = function(grid, randCell, shouldSave) {
    if(shouldSave) {
        changes.push([]);
        if(changes.length > 80) {
            changes.splice(0, 1);//delete the ones too far back (they probably don't matter (I hope))
        }
        for(var i = 0; i < grid.length; i ++) {
            changes[changes.length - 1][i] = [grid[i].options.slice(), grid[i].collapsed];
        }
    }
    randCell.collapsed = true;
    randCell.options = [randCell.options[Math.floor(Math.random() * randCell.options.length)]];
    //add propagation of the entroyp thing
    if(reduceEntropy(grid, randCell, parseInt(entropyRangeInput.value))) {
        console.log("reducing entropy sorta didn't work :(");
        //probably reset the grid :0
        backprop();
    }
};

var getEntropy = function(cell) {
    var totalEntropy = 0;
    for(var i = 0; i < cell.options.length; i ++) {
        totalEntropy -= tiles[cell.options[i]].entropy;
    }
    return totalEntropy;
}

var wfc = function() {
    //Collapse the wave :)))))))))

    var leastEntropy = 10000000;
    var leastEntropyIds = [];
    for(var i = 0; i < grid.length; i ++) {
        if(grid[i].options.length === 1 && !grid[i].collapsed) {
            collapseTile(grid, grid[i], false);
        }
        else if(!grid[i].collapsed && grid[i].options.length !== maxOptionsLength) {
            if(grid[i].entropy < leastEntropy) {
                //delete the other ones because they have a higher entropy than this one
                leastEntropyIds = [i];
                leastEntropy = grid[i].entropy;
            }
            else if(grid[i].entropy === leastEntropy) {
                //this new one is tied for first, just add it to the arr
                leastEntropyIds.push(i);
            }
        }
    }
    //yay :)
    if(leastEntropyIds.length > 0) {
        if(leastEntropy === 0) {
            console.log("oh no");
            backprop();
            return;
        }
        var randCell = grid[leastEntropyIds[Math.floor(Math.random() * leastEntropyIds.length)]];
        collapseTile(grid, randCell, true);
    }
};

var frame = function() {
    //this executes every frame after the setup (which happens after you click the button)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    wfc();//run the wave function collapsation
    for(var i = 0; i < grid.length; i ++) {
        grid[i].show();//displaying :)
    }

    if(doLoop) {
        window.requestAnimationFrame(frame);
    }
};
