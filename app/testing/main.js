const game = createGame({type: 'pacman', levels: true, tileWidth: 16, cameraMode: 'multiple', cameraRatio: 16/9, cameraWidth: 480})
let player;

function preload() {
  addSpriteSheet('tiles')
  addSpriteSheet('_player')
  loadMap('level_0')
}

function start() {
  console.log('Sprites:\n', sprites);

  const playerSpawner = game.createSpawner(Player)
  // spawners.player.spawn().setPos(200, 200)
  player = playerSpawner.spawn()
  player.setPos(200, 300)
  // game.spawnOne(Player)
  follow(player)
  listenInput(player)
  // setTimeout(() => { player.kill() }, 3000)
}


class Player extends Entity {
  constructor() {
    super()
    this.setSprite(sprites._player)
    this.setSize(16, 16)
    this.speed = 15
    this.setVel(this.speed, this.speed)
  }

  fixedUpdate() {
    // console.log(this.sprite);
  }

  update() {
    // console.log(this.x, this.y);
    // if (this.y > maps.h * maps.s) this.y = 0
    // if (this.y < 0) this.y = maps.h * maps.s
    // if (this.x > maps.w * maps.s) this.x = 0
    // if (this.x < 0) this.x = maps.w * maps.s
  }

  onInput(input) {
    if (!this.moving) {
      switch (input) {
        case 'up': this.setVel(0, -this.speed); break;
        case 'right': this.setVel(this.speed, 0); break;
        case 'down': this.setVel(0, this.speed); break;
        case 'left': this.setVel(-this.speed, 0); break;
        case 'p': console.log(this.x, this.y, this.xv, this.yv); break;
      }
    }
  }

  onCollisionEntry(event) {
    //console.log('colliding with', event.collider.className);
  }

  getSprite() {
    return this.sprite.idle
  }
}
