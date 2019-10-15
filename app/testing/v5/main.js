// app\testing\app3, app\testing\v5, !libraries, !app\testing\app3\old

class Player extends Entity {
  constructor() {
    super()
    this.setSize(15, 24)
    this.setSprite('player')

    this.spriteAction = 'run'
    this.speed = 1
    this.autoDir = true
    this.autoWalk = 10
    this.setDrag(0.8, 0.8)
  }

  getSprite() {
    this.spriteName = this.xv ? 'run' : 'idle'
    // this.spriteFrame = round(this.x / 5) % 10
  }

  onKey({name}) {
    switch (name) {
      case 'up': this.ya -= this.speed; break;
      case 'down': this.ya += this.speed; break;
      case 'left': this.xa -= this.speed; break;
      case 'right': this.xa += this.speed; break;
    }
  }

  onKeyUp({name}) {
    switch (name) {
      case 'up': this.ya += this.speed; break;
      case 'down': this.ya -= this.speed; break;
      case 'left': this.xa += this.speed; break;
      case 'right': this.xa -= this.speed; break;
    }
  }
}

class Test extends TileGame {
  constructor() {
    super()
    this.setSize(1920, 1080)
    this.setScale(3, 3)
    this.player = new Player()
    this.addChild(this.player)

    this.collisionTable = [0, 15, 15]
    // this.loadMap({
    //   width: 16,
    //   map: [
    //     0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    //     0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    //     0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    //     0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    //     0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    //     0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    //     0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    //     0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
    //     0, 0, 0, 0, 0, 0, 2, 0, 2, 0, 0, 0, 0, 0, 0, 0,
    //     0, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 0,
    //     0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    //     0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    //     0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    //     0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    //     0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    //     0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
    //   ]
    // })
    this.setChunkLoader(1, 2)

    this.fixedUpdate.addPre(() => {
      logFPS()
    }, 60)
  }

  chunkLoader(x, y) {
    const chunk = {map: []}

    for (let i = 0; i < 16 * 16; i++) {
      chunk.map[i] = random() > 0.1 ? 0 : 1
    }

    return chunk
  }

  update() {
    this.center = this.player.center
  }

  getSprite() {

  }
}


// da sposta in app
class Camera extends SpriteLayer {
  constructor() {
    super('screen')
    this.setSize(1920, 1080)
    this.addChild(this.game = new Test())
    // this.setScale(1 / this.game.xm, 1 / this.game.ym)
    // this.follow(this.game, {mode: ''})
  }

  resize() {
    const w = window.innerWidth
    const h = window.innerHeight
    const rw = w / 1920
    const rh = h / 1080

    const r = rw < rh ? rw : rh

    this.setSize(w, h)
    this.center = {x: 1920 / 2, y: 1080 / 2}
  }

  getSprite() {
    this.clear()

    this.children.forEach(child => {
      const sprite = child.getSprite(this)
      if (sprite) {
        console.log('asdf');
        this.image(sprite, 0, 0)
      } else if (sprite !== false) {
        console.error(child, sprite)
        throw new Error(`illegal getsprite return!!`)
      }
    })

    return false
  }
}

function setup() {
  masterLayer = new Camera()
}
loadSprite('player', './img/sprites')
loadSprite('tiles', {path: './img/sprites', type: 'tiles'})
