const map = {chunks: {}, modifiers: {}}
const mapModifiers = {linear: [], cross: []}

function getChunk(x, y) {
  const id = `${x}_${y}`

  // if chunk was previously offloaded
  if (map.chunks[id]) {
    return {data: map.chunks[id]}
  }

  // generate new chunk
  const chunk = {data: getBaseChunk(x, y)}
  if (!map.modifiers[id]) map.modifiers[id] = []

  // if tree were not generated, generate them, alos for the adjacent
  let noiseCount = 0
  mapModifiers.linear.forEach(({fun, pre, done}) => {
    for (let i = -pre; i <= pre; i++) {

      // if already modified, return
      if (done[x + i]) continue
      done[x + i] = true

      fun(x + i, ({x, y, to}) => {
        const index = (x % 16 + 16) % 16 + (y % 16 + 16) % 16 * 16
        const chunkX = floor(x / 16), chunkY = floor(y / 16)

        const modifiedId = `${chunkX}_${chunkY}`

        if (!map.modifiers[modifiedId]) map.modifiers[modifiedId] = []
        map.modifiers[modifiedId].push({index, to})
      }, (...args) => {
        if (args.length == 0) {
          return noise(x * y + noiseCount++ * 69)
        } else if (args.length == 1) {
          return noise(x * y + noiseCount++ * 69) * args[0]
        } else {
          return noise(x * y + noiseCount++ * 69) * (args[1] - args[0]) + args[0]
        }
      })
    }
  })

  map.modifiers[id].forEach(modifier => {
    chunk.data[modifier.index] = modifier.to
  })

  return chunk
}

function addLinearModifier(fun, pre = 1) {
  mapModifiers.linear.push({fun, done: {}, pre})
}

addLinearModifier(getTreeLocation)

function getTreeLocation(x, add, rnd) {
  let pos = []

  for (let i = -1; i < 17; i++) {
    pos[i] = floor(noise((x * 16 + i) / 20) * 50)
  }

  for (let i = 0; i < 16; i++) {
    if ((pos[i - 1] > pos[i] && pos[i + 1] > pos[i]) || (pos[i - 1] < pos[i] && pos[i + 1] < pos[i])) {
      addTree(x * 16 + i, pos[i])
    }
  }

  function addTree(x, y) {
    const height = floor(rnd(6)) + 2
    let leafBottom = floor(rnd(height / 4)) + 2
    let offset = 1

    for (let i = 0; i < height; i++) {
      add({x, y: y - i, to: 4})
    }

    while (leafBottom < height) {
      for (let i = leafBottom; i < height; i++) {
        add({x: x + offset, y: y - i, to: 5})
        add({x: x - offset, y: y - i, to: 5})
      }

      leafBottom += floor(rnd(2))
      offset++
    }

    leafBottom = height
    const leafTop = leafBottom + floor(rnd(offset * 2)) + 2

    while (offset > 0) {
      for (let i = 1; i < offset; i++) {
        add({x: x + i, y: y - leafBottom, to: 5})
        add({x: x - i, y: y - leafBottom, to: 5})
      }
      add({x: x, y: y - leafBottom, to: 5})

      offset -= floor(rnd(2))
      leafBottom++
    }
  }
}

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
