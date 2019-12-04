function generateTree(x, add, rnd) {
  const y = floor(noise((x) / 20) * 50)
  const height = floor(rnd(4)) + 4
  let leafBottom = floor(rnd(0.5, height / 2) + height / 3)
  let offset = 1

  for (let i = 0; i < height; i++) {
    add({x, y: y - i, to: 4})
  }

  while (leafBottom < height) {
    for (let i = leafBottom; i < height; i++) {
      add({x: x + offset, y: y - i, to: 5})
      add({x: x - offset, y: y - i, to: 5})
    }

    leafBottom++
    offset++
  }

  offset = offset > 2 ? offset : 2
  leafBottom = height
  const leafTop = leafBottom + floor(rnd(offset * 2)) + 2

  while (offset > 0) {
    for (let i = 1; i < offset; i++) {
      add({x: x + i, y: y - leafBottom, to: 5})
      add({x: x - i, y: y - leafBottom, to: 5})
    }
    add({x: x, y: y - leafBottom, to: 5})

    offset -= floor(rnd(0.5, 2))
    leafBottom++
  }
}

// function getTreeLocation(x, add, rnd) {
//   let pos = []
//
//   for (let i = -1; i < 17; i++) {
//     pos[i] = floor(noise((x * 16 + i) / 20) * 50)
//   }
//
//   for (let i = 0; i < 16; i++) {
//     if ((pos[i - 1] > pos[i] && pos[i + 1] > pos[i]) || (pos[i - 1] < pos[i] && pos[i + 1] < pos[i])) {
//       generateTree(x * 16 + i, add, rnd)
//     }
//   }
// }

function getBaseChunk(x, y) {
  const data = []

  function tileAt(x, y) {
    let distToTop =  y -noise(x / 20) * 50

    if (distToTop < 0) return 0
    if (distToTop < 1) return 1
    if (distToTop < 4) return 2
    else return 3
  }

  for (let xb = 0; xb < 16; xb++) {
    for (let yb = 0; yb < 16; yb++) {
      data[xb + yb * 16] = tileAt(x * 16 + xb, y * 16 + yb)
    }
  }

  return data
}
