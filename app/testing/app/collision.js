p5.prototype.collideRectMap = (rect, maps) => {
  const {collisionMap, w, h, s} = maps

  if (p5.prototype.rectInsideRect(rect, {x1: 0, y1: 0, x2: w * s, y2: h * s})) { //on Map
    //chex x-axis
    let x = 0
    let y = floor(rect.y1 / s)
    let y2 = ceil(rect.y2 / s)

    if (rect.xv > 0) { //right
      x = floor(rect.x2 / s)
      do {
        if (collisionMap[y * w + x] & 8) rect._onMapCollision('right', x, y, s)
        y += 1
      } while (y < y2)

    } else if (rect.xv < 0) { //left
      x = floor(rect.x1 / s)
      do {
        if (collisionMap[y * w + x] & 2) rect._onMapCollision('left', x, y, s)
        y += 1
      } while (y < y2)
    }

    //chex y-axis

    y = 0
    x = floor(rect.x1 / s)
    //console.log(rect.x1, rect.x, x);
    let x2 = ceil(rect.x2 / s)

    if (rect.yv > 0) { //bottom
      y = floor(rect.y2 / s)
      do {
        if (collisionMap[y * w + x] & 1) rect._onMapCollision('bottom', x, y, s)
        x += 1
      } while (x < x2)

    } else if (rect.yv < 0) { //top
      y = floor(rect.y1 / s)
      do {
        if (collisionMap[y * w + x] & 4) rect._onMapCollision('top', x, y, s)
        x += 1
      } while (x < x2)
    }
  }
}

p5.prototype.collideRectRect = (a, b) => {
  return a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1
}

p5.prototype.solveRectRect = (a, b) => {
  throw new Error('// TODO: crea al solveRectRect')
}

p5.prototype.solveRectIRect = (a, b) => {
  if (abs(a.xv) > abs(a.yv)) {
    if (a.xv > 0) a.x2 = b.x1
    else a.x1 = b.x2
    a.xv = 0
  } else {
    if (a.yv > 0) a.y2 = b.y1
    else a.y1 = a.y2
    a.yv = 0
  }
}

p5.prototype.rectInsideRect = (a, b) => {
  return a.x1 > b.x1 && a.x2 < b.x2 && a.y1 > b.y1 && a.y2 < b.y2
}

p5.prototype.collideCircleCircle = (a, b) => {
  const r = a.r + b.r
  const x = a.x + b.x
  const y = a.y + b.y
  return r * r < x * x + y * y
}

p5.prototype.collidePointRect = (a, b) => {
  return a.x < b.x2 && a.x > b.x1 && a.y < b.y2 && a.y > b.y1
}

p5.prototype.realMouseIsOver = entity => {
  return p5.prototype.collidePointRect({x: mouseX, y: mouseY}, {x1: entity.realX, y1: entity.realY, x2: entity.realX2, y2: entity.realY2})
}
