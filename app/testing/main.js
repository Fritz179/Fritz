const game = createGame({type: 'pacman', levels: true})

function preload() {
  addSpriteSheet('tiles')
  addSpriteSheet('player')
}

function setup() {
  createCanvas(window.innerWidth, window.innerHeight)

  console.log(sprites);
  loadMap('level_0')
  const playerSpawner = game.createSpawner(Player)
  // for (let i = 0; i < 1000; i++) {
  //   playerSpawner.spawn().setPos(random(width), random(height))
  // }
  spawners.player.spawn().setPos(0, 500)
  spawners.player.spawn().setPos(30, 500)
}

class Player extends Entity {
  constructor() {
    super()

    this.setPos(16, 16)
    this.setSprite(sprites.player)
    console.log(this.constructor.className);
  }

  fixedUpdate() {
    // console.log(this.sprite);
  }

  update() {
    this.x += random(20)
    if (this.y > height) this.y = 0
    if (this.y < 0) this.y = height
    if (this.x > width) this.x = 0
    if (this.x < 0) this.x = width
  }

  onCollisionEntry(event) {
    console.log('colliding with', event.collider.className);
  }

  getSprite() {
    return random(this.sprite.running_right)
  }
}
