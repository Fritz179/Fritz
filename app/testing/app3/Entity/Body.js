class Body extends Frame {
  constructor(x, y, w, h) {
    super(x, y, w, h)

    this.xv = 0
    this.yv = 0
    this.xa = 0
    this.ya = 0
    this.xd = 1
    this.yd = 1

    this.speed = 5
    this.autoMove = true
    this.collideWithMap = true
    this.collideWithEntities = true
    this.movingFor = 0
    this._minVel = 0.1

    createMiddlwere(this, 'onBlockCollsion', args => {
      args.solveCollision = () => {
        const {side, x, y, s} = args
        switch (side) {
          case 'top': this.y1 = (y + 1) * s; this.yv = 0; break;
          case 'right': this.x2 = x * s; this.xv = 0; break;
          case 'bottom': this.y2 = y * s; this.yv = 0; break;
          case 'left': this.x1 = (x + 1) * s; this.xv = 0; break;
          default: throw new Error('invalid collision side', side, x, y, s, this)
        }
      }
    })

    createMiddlwere(this, 'onUnloadedChunk', args => {
      args.teleportToNearestChunk = () => {
        if (!Object.keys(this.layer.chunks).length) {
          return console.error('No chunk to teleport to!', this);
        }

        const [x, y] = this.layer.ChunkAtCord(...this.frame)

        const chunkX = Object.keys(this.layer.chunks)
          .reduce((prev, curr) => Math.abs(curr - x) < Math.abs(prev - x) ? curr : prev);

        const chunkY = Object.keys(this.layer.chunks[chunkX])
          .reduce((prev, curr) => Math.abs(curr - y) < Math.abs(prev - y) ? curr : prev);

        const w = this.layer.chunkTotalWidth
        const h = this.layer.chunkTotalHeight
        setRectInRect(this, {x: chunkX * w, y: chunkY * h, w, h})

        return true
      }
    })

    this.fixedUpdate.addPre(args => {
      if (sign(this.movingFor) == sign(this.xv)) {
        this.movingFor += this.xv
      } else {
        this.movingFor = this.xv
      }

      args.updatePhisics = () => {
        // add acceleration to velocity
        this.xv += this.xa
        this.yv += this.ya

        //add drag to velocity
        this.xv *= this.xd
        this.yv *= this.yd
        if (abs(this.xv) < this._minVel) this.xv = 0
        if (abs(this.yv) < this._minVel) this.yv = 0

        if (this.collideWithMap && this.layer instanceof TileGame) {
          //check collsison for each axis
          this.x += this.xv
          this.layer.collideMap(this, 1)
          this.y += this.yv
          this.layer.collideMap(this, 2)
        } else {
          // add only velocity to position
          this.x += this.xv
          this.y += this.yv
        }

      }
    })
  }

  set vel({x, y}) { this.xv = x; this.yv = y }
  set acc({x, y}) { this.xa = x; this.ya = y }
  set drag({x, y}) { this.xd = x, this.yd = y }

  get vel() { return {x: this.xv, y: this.yv} }
  get acc() { return {x: this.xa, y: this.ya} }
  get drag() { return {x: this.xd, y: this.yd} }

  setVel(x, y) { this.xv = x; this.yv = y; return this }
  setAcc(x, y) { this.xa = x; this.ya = y; return this }
  setDrag(x, y) { this.xd = x, this.yd = y; return this }

  addVel(x, y) { this.xv += x; this.yv += y; return this }
  addAcc(x, y) { this.xa += x; this.ya += y; return this }
  addDrag(x, y) { this.xd += x; this.yd += y; return this }
  resetVel() { this.xv = 0; this.yv = 0; return this }
  resetAcc() { this.xa = 0; this.ya = 0; return this }
  resetDrag() { this.xd = 1; this.yd = 1; return this }
  resetMovement() { this.resetVel(); return this.resetAcc() }
  resetAll() { this.resetMovement(); return this.resetDrag() }

  fixedUpdate({updatePhisics}) {
    updatePhisics()
  }

  onBlockCollsion({solveCollision}) {
    solveCollision()
  }

  onUnloadedChunk({teleportToNearestChunk}) {
    if (!teleportToNearestChunk()){
      this.despawn()
    }
  }

  despawn() {
    this.layer.deleteChild(this)
  }

  isOnGround() {
    if (!(this.layer instanceof TileGame)) {
      console.error(this, this.layer);
      throw new Error('Cannot be on gorund if parent layer is\'t TileGame')
    }

    const x1 = floor(this.x / 16)
    const x2 = ceil((this.x + this.w) / 16)
    const y = floor((this.y + this.h) / 16)

    let x = x1
    do {
      if (this.layer.collisionTable[this.layer.tileAt(x, y)] & 4) {
        return true
      }
      x++
    } while (x < x2)

    return false
  }
}
