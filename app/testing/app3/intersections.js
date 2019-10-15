function pointIsOnRect(a, b) {
  return !(
    a.x < b.x ||
    a.y < b.y ||
    a.x > b.x + (b.w || b.width || 0) ||
    a.y > b.y + (b.h || b.height || 0)
  )
}

function rectIsOnPoint(a, b) {
  return pointIsOnRect(b, a)
}

function pointIsInRange(a, w, h) {
  return !(
    a.x < 0 ||
    a.y < 0 ||
    a.x > w ||
    a.y > h
  )
}
