const game = createGame({type: 'pacman', levels: true, tileWidth: 16, cameraMode: 'multiple', cameraRatio: 16/9, cameraWidth: 256})

function preload() {
  addSpriteSheet('tiles')
  addSpriteSheet('_player')
}

function start() {
  frameRate(60)
  console.log('Sprites:\n', sprites);
  loadMap('level_0')

  setTimeout(llll, 300)
}
function llll() {
  const playerSpawner = game.createSpawner(Player)
  // spawners.player.spawn().setPos(200, 200)
  const player = playerSpawner.spawn()
  player.setPos(200, 300)
  // game.spawnOne(Player)
  follow(player)
  console.log('lll');
}

class Player extends Entity {
  constructor() {
    super()
    this.setSprite(sprites._player)
    this.setSize(16, 16)

    this.setVel(2, 2)
  }

  fixedUpdate() {
    // console.log(this.sprite);
  }

  update() {
    if (this.y > maps.h * maps.s) this.y = 0
    if (this.y < 0) this.y = maps.h * maps.s
    if (this.x > maps.w * maps.s) this.x = 0
    if (this.x < 0) this.x = maps.w * maps.s
  }

  onCollisionEntry(event) {
    //console.log('colliding with', event.collider.className);
  }

  getSprite() {
    return this.sprite.idle
  }
}
