class Canvas extends Frame {
  constructor(...args) {
    super(0, 0, 0, 0)

    if (args.length == 1) {
      if (typeof args[0] == 'string') {
        this.sprite = new Context(document.getElementById(args[0]))
      } else {
        this.sprite = args[0]
      }
    } else if (args.length == 2) {
      const canvas = document.createElement('canvas');
      canvas.width = args[0];
      canvas.height = args[1];

      this.sprite = new Context(canvas);
    } else if (args.length != 0) {
      throw new Error('invalid arguments length!!' + args.length)
    }

    if (this.sprite) {
      Object.defineProperty(this, 'w', {
        get() { return this.sprite.canvas.width },
        set(w) { debugger }
      })
      Object.defineProperty(this, 'h', {
        get() { return this.sprite.canvas.height },
        set(w) { debugger }
      })

      this.buffer = true
    }
  }

  // get offsetTop() { return this.yo }
  // get offsetLeft() { return this.xo }
  // get offset() { return {x: this.xo, y: this.yo} }
  //
  // set offsetTop(y) { this.yo = y }
  // set offsetLeft(x) { this.xo = x }
  // set offset({x, y}) { this.xo = x; this.yo = y }
  //
  // setOffset(x, y) { this.xo = x; this.yo = y; return this; }

  // set scaleX(y) { this.xm = x }
  // set scaleY(x) { this.ym = y }
  // set scale({x, y}) { this.xm = x; this.ym = y }
  set size({w, h}) { this.setSize(w, h); }

  // get scaleX() { return this.xm }
  // get scaleY() { return this.ym }
  // get scale() { return {x: this.xm, y: this.ym} }

  get size() { return {w: this.w, h: this.h} }
  get topCtx() { return this.sprite.topCtx }
  get isTopCtx() { return this.topCtx == this.sprite }

  get textSize() { return this.sprite.textSize }
  get textStyle() { return this.sprite.textStyle }
  get textFont() { return this.sprite.textFont }

  setScale(x, y) { return this.setSize(this.w, this.h, x, y); }
  setCtx(ctx) { this.cxt = ctx; this.xm = 1; this.ym = 1; return this; }

  setSize(w, h, rw, rh) {
    if (rw) {
      if (!rh) rh = rw
      this.xm = rw
      this.ym = rh
    }

    if (this.buffer) {
      if (this.sprite != this.topCtx) debugger
      const state = getState(this.topCtx.ctx)
      this.sprite.canvas.width = w / this.xm
      this.sprite.canvas.height = h / this.ym
      this.changed = true
      setState(this.topCtx.ctx, state)
    } else {
      this.w = w / this.xm
      this.h = h / this.ym
    }

    this._spriteChanged = true

    return this
  }

  noSmooth() {
    this.topCtx._noSmooth()
  }

  rotate(a) {
    this.topCtx._rotate(a)
  }

  scale(x, y) {
    this.topCtx._scale(x, y)
  }

  background(...args) {
    this.topCtx._background(getColor(args))
  }

  fill(...args) {
    this.topCtx._fill(getColor(args))
  }

  clear() {
    this.topCtx._clear()
  }

  strokeWeight(w) {
    this.topCtx._strokeWeight(w)
  }

  textFont(f) {
    this.topCtx._textFont(f)
  }

  textSize(s) {
    this.topCtx._textSize(s)
  }

  textS(s) {
    this.topCtx._textSize(s)
  }

  textAlign(w, h) {
    this.topCtx._textAlign(w, h)
  }

  text(txt, x, y) {
    this._text(txt, x, y)
  }

  _text(txt, x, y) {
    this.sprite._text(txt, ...this.multiply([x, y]))
  }

  multiply(args, q = false) {
    if (this instanceof Layer && !(this instanceof Camera)) {
      const {xAlign, yAlign, overflow} = this.cameraMode

      args[0] = (args[0] - (this.x + this.w * xAlign)) * this.xm + this.sprite.w * xAlign
      args[1] = (args[1] - (this.y + this.h * yAlign)) * this.ym + this.sprite.h * yAlign
      if (q) {
        args[2] *= this.xm
        args[3] *= this.ym
      }
    } else {
      // console.log('asdf');
      args[0] = (args[0] - this.x) * this.xm
      args[1] = (args[1] - this.y) * this.ym
      if (q) {
        // console.log(this.xm);
        args[2] *= this.xm
        args[3] *= this.ym
      }
    }

    return args
  }

  rect(...args) {
    if (args.length == 4) {
      this._rect(args)
    } else { // quadru
      this._rect(args.push(args[2]))
    }
  }

  _rect(args) {
    this.sprite._rect(this.multiply(args, true))
  }

  image(canvas, ...val) {
    const {args, options} = separate(val, {trusted: false, hitbox: false})

    if (canvas instanceof Canvas) canvas = canvas.sprite.canvas
    else if (canvas instanceof Context) canvas = canvas.canvas
    this._image(
      canvas,
      args[0] || 0, args[1] || 0,
      args[2] || canvas.w || canvas.width, args[3] || canvas.h || canvas.height,
      args[4] || 0, args[5] || 0,
      args[6] || canvas.w || canvas.width, args[7] || canvas.h || canvas.height,
      options.trusted, options.hitbox
    )
  }

  _image(canvas, ...args) {
    this.sprite._image(canvas, ...this.multiply(args.slice(0, 9), true))
    if (args[9]) {
      this._drawHitbox(args.slice(0, 4).concat(['red']))
    }
  }

  drawHitbox(...args) { this._drawHitbox(args) }
  _drawHitbox(args) { this.sprite._drawHitbox(this.multiply(args, true)) }
}

const valuesToSave = ['strokeStyle', 'fillStyle', 'globalAlpha', 'lineWidth', 'lineCap', 'lineJoin', 'miterLimit', 'lineDashOffset', 'shadowOffsetX', 'shadowOffsetY', 'shadowBlur', 'shadowColor', 'globalCompositeOperation', 'font', 'textAlign', 'textBaseline', 'direction', 'imageSmoothingEnabled']
function getState(ctx) {
  const ret = {}
  valuesToSave.forEach(val => {
    ret[val] = ctx[val]
  })
  return ret
}

function setState(ctx, state) {
  valuesToSave.forEach(val => {
    ctx[val] = state[val]
  })
}