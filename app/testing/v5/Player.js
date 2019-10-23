class Player extends Entity {
  constructor(x, y) {
    super(x, y)
    this.setSize(15, 24)
    this.setSprite('player')

    this.spriteAction = 'idle'
    this.speed = 1
    this.autoDir = true
    this.autoWalk = 10
    this.setDrag(0.8, 0.8)
    this.breakBlock = false
    this.deathRadius = 5
    this.createNew = false
  }

  fixedUpdate({updatePhisics}) {
    updatePhisics()

    this.spriteAction = abs(this.movingFor) > 1 ? 'run' : 'idle'
    if (this.createNew) {
      this.createNew = false
      this.layer.addChild(new Player(this.x + random() * 200 - 100, this.y + random() * 200 - 100))
    }
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
      case 'up': this.ya -= this.speed; break;
      case 'down': this.ya += this.speed; break;
      case 'left': this.xa -= this.speed; break;
      case 'right': this.xa += this.speed; break;
      case 'p': console.log(`x: ${round(this.x)}, y: ${round(this.y)}`); break;
      case 'x': this.collideWithMap = !this.collideWithMap; break;
      case 'c': this.breakBlock = !this.breakBlock; break;
      case 'r': masterLayer.changed = true; break;
      case 'n': this.createNew = true; break;
      case 'b':
        for (let x = -this.deathRadius; x <= this.deathRadius + 1; x++) {
          for (let y = -this.deathRadius + 1; y <= this.deathRadius + 2; y++) {
            this.layer.setTileAt.cord(this.x + x * 16, this.y + y * 16, 0)
          }
        }
        break;
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
