function initCollision() {
  fritz.collideMapX = entity => {

  }

  fritz.collideMapY = entity => {

  }

  fritz.collideRectRect = (a, b) => {
    return a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1
  }

  fritz.collideCircleCircle = (a, b) => {
    const r = a.r + b.r
    const x = a.x + b.x
    const y = a.y + b.y
    return r * r < x * x + y * y
  }
}
