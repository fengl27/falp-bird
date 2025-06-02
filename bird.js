var createPlayer = function() {
    var bob = {
        pos: [canvas.width / 4, canvas.height / 3],
        vel: -canvas.height / 35,
        scale: assets.floor.floorScale,
        dead: false,
        gravity: canvas.height / 500,
        jumpStrength: canvas.height / 48,
        moveBackwards: false,
        display: function() {
            drawBird(this.pos[0], this.pos[1], Math.min(Math.PI / 2, this.vel / canvas.height * 30), this.scale);
        },
        update: function(dt) {
            this.vel += this.gravity * dt;
            this.pos[1] += this.vel * dt;
            //semi-implicit euler integration

            if(this.pos[1] + this.size[1] / 2 > getGroundLevel()) {
                //you die on the floor
                this.pos[1] = getGroundLevel() - this.size[1] / 2;
                this.vel *= -0.3;
                this.dead = true;
                this.moveBackwards = true;
            }
            else if(this.pos[1] - this.size[1] / 2 < 0) {
                //you die on the roof
                this.dead = true;
            }
            for(var i = 0; i < tubes.length; i ++) {
                if(tubes[i].getCollide(this, 0.6)) {//60% size hitbox
                    this.dead = true;
                    this.moveBackwards = true;
                    this.pos[1] -= this.vel * dt;
                    this.vel *= -0.3;
                }
            }
            if(this.moveBackwards) {//after you die
                this.pos[0] -= dt * actualMoveSpeed;
            }
        },
        jump: function() {
            if(!this.dead) {
                this.vel = -this.jumpStrength;
            }
        }
    };
    bob.size = [assets.bird.size[0] * bob.scale, assets.bird.size[1] * bob.scale];
    return bob;
};