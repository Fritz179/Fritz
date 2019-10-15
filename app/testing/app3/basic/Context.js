class Context {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.ctx.imageSmoothingEnabled = false
  }

  get topCtx() { return this.ctx }

  image(...args) {

    let trusted = false
    if (args[args.length - 1] === true) {
      trusted = args.splice(args.length - 1, 1)[0]
    }

    const len = args.length
    if (!len) console.error('Invalid image args, minimun 1!');

    // pars args
    const sprite = args[0]
    const source = sprite.canvas || sprite
    const destination = this.canvas
    let dx = len > 2 ? args[1] : (sprite.x || 0)
    let dy = len > 2 ? args[2] : (sprite.y || 0)
    let dw = len > 4 ? args[3] : (sprite.w || source.width)
    let dh = len > 4 ? args[4] : (sprite.h || source.height)
    let sx = len > 6 ? args[5] : 0
    let sy = len > 6 ? args[6] : 0
    let sw = len > 8 ? args[7] : (sprite.w || source.width)
    let sh = len > 8 ? args[8] : (sprite.h || source.height)
    const xm = sw / dw
    const ym = sh / dh

    if (!trusted) {
      if (sx >= source.width || sy >= source.height) return
      if (dx >= destination.width || dy >= destination.height) return
      if (sx + sw < 0 || sy + sh < 0 || dx + dw < 0 || dy + dh < 0) return

      // optimise source position
      if (sx < 0) {
        dx -= sx * xm
        sx = 0
      }
      if (sy < 0) {
        dy -= sy * ym
        sy = 0
      }

      // optimise destionation position
      if (dx < 0) {
        sx -= dx * xm // sx += Math.abs(dx)
        dx = 0
      }
      if (dy < 0) {
        sy -= dy * ym // sy += Math.abs(dy)
        dy = 0
      }

      if (sx >= source.width || sy >= source.height) return
      // optimise source size
      if (sx + sw > source.width) {
        sw = source.width - sx
        dw = sw / xm
      }
      if (sy + sh > source.height) {
        sh = source.height - sy
        dh = sh / ym
      }

      // optimise destination size
      if (dx + dw > destination.width) {
        dw = destination.width - dx
        sw = dw * xm
      }

      if (dy + dh > destination.height) {
        dh = destination.height - dy
        sh = dh * ym
      }
    }

    const f = Math.floor
    // if (sw != dw || sh != dh || !dw) debugger
    if (dx >= destination.width || dy >= destination.height) debugger
    if (sx + sw < 0 || sy + sh < 0 || dx + dw < 0 || dy + dw < 0) debugger

    this.ctx.drawImage(source, f(sx), f(sy), f(sw), f(sh), f(dx), f(dy), f(dw), f(dh))
  }

  _image(...args) { this.image(...args) }

  _drawHitbox(...args) {

    let {x, y, w, h} = args[0]
    let color = '#515151', stroke = 1

    if (args.length == 2) {
      [color] = args.splice(1)
    } else if (args.length == 3) {
      [color, stroke] = args.splice(1)
    } else if (args.length == 4) {
      [x, y, w, h] = args
    } else if (args.length == 5) {
      [x, y, w, h, color] = args
    } else if (args.length == 6) {
      [x, y, w, h, color, stroke] = args
    } else {
      throw new Error('not enough (o magari trop) params.........')
    }

    const prevWidth = this.ctx.lineWidth
    const prevColor = this.ctx.strokeStyle

    this.ctx.translate(0.5, 0.5)
    this.stroke(color)
    this.strokeWeight(stroke)
    const f = Math.floor
    this.ctx.strokeRect(f(x), f(y), f(w - 1), f(h - 1))
    this.ctx.translate(-0.5, -0.5)

    this.ctx.lineWidth = prevWidth
    this.ctx.strokeStyle = prevColor
  }

  noSmooth() {
    this.canvas.imageSmoothingEnabled = false
  }

  fill(...args) {
    this.ctx.fillStyle = getColor(...args)
  }

  stroke(...args) {
    this.ctx.strokeStyle = getColor(...args)
  }

  strokeWeight(num = 1) {
    this.ctx.lineWidth = num
  }

  rect(x, y, w, h, color, stroke) {
    const {ctx} = this

    if (ctx.lineWidth % 2 == 1) {
      ctx.translate(0.5, 0.5)
    }

    ctx.beginPath()
    ctx.rect(x, y, w, h);
    ctx.closePath()
    ctx.stroke();

    if (ctx.lineWidth % 2 == 1) {
      ctx.translate(-0.5, -0.5)
    }
  }

  rotate(a) {
    this.ctx.rotate(a)
  }

  scale(x, y) {
    this.ctx.scale(x, y)
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  background(...args) {
    const prev = this.ctx.fillStyle

    this.ctx.fillStyle = getColor(...args)
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = prev
  }
}
