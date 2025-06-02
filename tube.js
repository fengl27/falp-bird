class Tube {
    constructor(y, holeSize, width) {
        this.size = width;
        this.textureScale = this.size / assets.tube.size[0] * 2;
        this.holeSize = holeSize;
        this.pos = [canvas.width, y];
        this.passed = false;
    }
    
    getRects() {
        var r1 = [
            [this.pos[0], 0],//pos
            [this.size, this.pos[1] - this.holeSize / 2]//size
        ];
        var r2 = [
            [this.pos[0], this.pos[1] + this.holeSize / 2],//pos
            [this.size, canvas.height - this.pos[1] - this.holeSize / 2]//size
        ]
        return [r1, r2];
    }

    getCollide(player, margin) {//margin is in percent? (but over 100)
        var rects = this.getRects();
        var playerTopLeft = [player.pos[0] - player.size[0] / 2 * margin, player.pos[1] - player.size[1] / 2 * margin];
        var playerSize = [player.size[0] * margin, player.size[1] * margin];
        for(var i = 0; i < rects.length; i ++) {
            if(playerTopLeft[0] + playerSize[0] > rects[i][0][0] 
                && playerTopLeft[0] < rects[i][0][0] + rects[i][1][0]
                && playerTopLeft[1] + playerSize[1] > rects[i][0][1]
                && playerTopLeft[1] < rects[i][0][1] + rects[i][1][1]) {
                return true;
            }
        }
        return false;
    }
    
    display() {
        /*
        var rects = this.getRects();
        for(var i = 0; i < rects.length; i ++) {
            ctx.fillRect(rects[i][0][0], rects[i][0][1], rects[i][1][0], rects[i][1][1]);
        }
        */
        var topLeft = [this.pos[0], this.pos[1] - this.holeSize / 2 - assets.tube.size[1] * this.textureScale];
        ctx.drawImage(assets.tube.img, 0, 0, assets.tube.size[0] / 2, assets.tube.size[1], topLeft[0], topLeft[1], this.size, assets.tube.size[1] * this.textureScale);
        var topLeft = [this.pos[0], this.pos[1] + this.holeSize / 2];
        ctx.drawImage(assets.tube.img, assets.tube.size[0] / 2, 0, assets.tube.size[0] / 2, assets.tube.size[1], topLeft[0], topLeft[1], this.size, assets.tube.size[1] * this.textureScale);
        
    }

    update(dt) {
        this.pos[0] -= actualMoveSpeed * dt;
        if(this.pos[0] + this.size < player.pos[0] && !this.passed) {
            score ++;
            this.passed = true;
        }
    }
}