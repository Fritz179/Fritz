const game = createGame({type: 'pacman', levels: true)

function preload() {
  game.setMapSpriteSheet('tiles')
  game.addSpriteSheet('player')
  game.loadLevel('level_0')
}

function setup() {

  const player = game.spawn('player', Player)
  player.setPos(64, 64)

  const blueSpawner = game.createSpawner('blue', Blue)
  const bulletsPool = createPool('bullet', Bullet, {max: 15, overflow: 'stop'}) //stop, create, reuse

  game.start({fps: 60, ups: 60})
  game.stop()
  // createPool('')
}

class Player extends Entity {
  constructor(x) {
    super()
    this.setSize(16, 16)
  }

  fixedUpdate() {

  }

  update() {

  }

  onCollision(collider) {
    
  }

  onHitboxEntry() {

  }

  getSprite() {

  }
}

class Blue extends Entity {
  constructor(x) {
    super()
    this.setSize(16, 16)
  }

  fixedUpdate() {

  }

  update() {

  }

  onCollision() {

  }

  onHitboxEntry() {

  }
}


/*
// TODO: createSpawner and createPool => set global reference, return reference add to game.pools or game.spawners (pool class with reset)
// spawer return => {spawn}
// pool return => {pool, storeAll, poolSize, activeSize, set(options)}

// TODO: setMapSpriteSheet =>

// TODO: createGame => levels

// TODO: game.screen {x, y, width, height, follow(), }

// TODO: loadLevel retunrs {start()}

// TODO: inputs...


*/
