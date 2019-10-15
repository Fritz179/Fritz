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

    createMiddlwere(this, 'onBlockCollsion')

    this.onBlockCollsion.addPre(args => {
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

    // fixedUpdate
    this.fixedUpdate.addPost(() => {
      if (sign(this.movingFor) == sign(this.xv)) {
        this.movingFor += this.xv
      } else {
        this.movingFor = this.xv
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

  onBlockCollsion({solveCollision}) {
    solveCollision()
  }
}
