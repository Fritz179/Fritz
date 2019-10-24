class Player extends Entity {
  constructor(x, y) {
    super(x, y)
    this.setSize(15, 24)
    this.setSprite('player')

    this.spriteAction = 'idle'
    this.speed = 0.7
    this.autoDir = true
    this.autoWalk = 10
    this.setDrag(0.85, 0.99)
    this.breakBlock = false
    this.deathRadius = 5
    this.createNew = false
    this.jumpRequest = 0
    this.ya = 0.25
  }

  fixedUpdate({updatePhisics}) {
    this.spriteAction = abs(this.movingFor) > 1 ? 'run' : 'idle'
    if (this.createNew) {
      this.createNew = false
      this.layer.addChild(new Player(this.x + random() * 200 - 100, this.y + random() * 200 - 100))
    }

    if (this.jumpRequest > 0) {
      this.jumpRequest--

      if (this.isOnGround()) {
        this.jumpRemanining = 10
        this.yv = -3.5
      }
    }

    if (this.jumpRemanining) {
      this.jumpRemanining--

      if (this.jumpRemanining < 6) {
        this.yv = -4 * (1 + this.jumpRemanining / 180)
      }
    }

    updatePhisics()
  }

  cancelJump() {
    this.jumpRequest = 0
    this.jumpRemanining = 0
    this.ya = 0.25
  }

  onClick({x, y}) {
    console.log(x, y);
  }

  onBlockCollsion({x, y, solveCollision}) {
    if (this.breakBlock) {
      this.layer.setTileAt(x, y, 0)
    } else {
      solveCollision()
    }
  }

  onKey({name}) {
    switch (name) {
      case 'left': this.xa -= this.speed; break;
      case 'right': this.xa += this.speed; break;
      case 'p': console.log(`x: ${round(this.x)}, y: ${round(this.y)}`); break;
      case 'x': this.collideWithMap = !this.collideWithMap; break;
      case 'c': this.breakBlock = !this.breakBlock; break;
      case 'r': masterLayer.changed = true; break;
      case 'n': this.createNew = true; break;
      case 'b': this.explode(); break;
      case ' ': this.jumpRequest = Infinity; break;
    }
  }

  onKeyUp({name}) {
    switch (name) {
      case 'left': this.xa += this.speed; break;
      case 'right': this.xa -= this.speed; break;
      case ' ': this.cancelJump(); break;
    }
  }

  explode() {
    for (let x = -this.deathRadius; x <= this.deathRadius + 1; x++) {
      for (let y = -this.deathRadius + 1; y <= this.deathRadius + 2; y++) {
        this.layer.setTileAt.cord(this.x + x * 16, this.y + y * 16, 0)
      }
    }
  }
}
