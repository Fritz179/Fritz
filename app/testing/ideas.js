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

game loop:
init FritzApp
load images + map
init map + entities
init camera
draw
setup
draw
update
draw
update

//nal createGame al po esa cambiù li funzion in base al tipu da giöc, tipu mapParser = mapParser_pacamn,
//insi ca al mapParser al sarà giüst in tüc i casi...

//sa po duperà un array da funzion ca ian da esa ciamadi?
//tipu sa al ghe al mapParser ca al ga bisöin da tanti funzion in cumun, al po esa un array?
//tipu la roba in paralel cuma funzion diferenti, ma la roba in serie in array...
//par la telecamera, la da esa centru o scalu in vari modi...

/*
// TODO: createSpawner and createPool => set global reference, return reference add to game.pools or game.spawners (pool class with reset)
// spawer return => {spawn}
// pool return => {pool, storeAll, poolSize, activeSize, set(options)}

// TODO: setMapSpriteSheet =>

// TODO: createGame => levels

// TODO: game.screen {x, y, width, height, follow(), }

// TODO: loadLevel retunrs {start()}

// TODO: inputs...


// TODO: camera...

*/
