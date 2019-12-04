class MapLoader extends TileGame {
  constructor(...args) {
    super(...args)

    this.bufferedChunks = {}
    this.chunkModifiers = {}
    this.mapModifiers = []

    this.blockAdder = this.blockAdder.bind(this)
  }

  chunkLoader(x, y) {
    const id = `${x}_${y}`

    // if chunk was previously offloaded
    if (this.bufferedChunks[id]) {
      return {data: this.bufferedChunks[id]}
    }

    // generate new chunk
    const chunk = {data: this.baseChunkLoader(x, y)}
    if (!this.chunkModifiers[id]) this.chunkModifiers[id] = []

    this.mapModifiers.forEach(modifier => {
      if (modifier.linear) {
        const {pre, done} = modifier

        for (let i = -pre; i <= pre; i++) {
          // if already modified, return
          if (done[x + i]) continue
          done[x + i] = true

          this.runLinearModifier(x + i, modifier)
        }
      } else {

        this.runCrossModifier(modifier)
      }
    })

    this.chunkModifiers[id].forEach(({index, to, hard}) => {
      if (hard || !chunk.data[index]) {
        chunk.data[index] = to
      }
    })

    return chunk
  }

  runLinearModifier(x, {fun, pre, chance, min}) {
    if (!chance) {
      fun(x, blockAdder, getNextPerlin)
    } else {

      // for every tile in chunk
      for (let xTile = x * 16; xTile < x * 16 + 16; xTile++) {
        if (perlinAt(xTile) > chance) {
          let flag = true

          // if it is a candidate, check for a min ditance between other candidates
          if (min) {
            const curr = perlinAt(xTile)
            for (let i = -min; i <= min; i++) {
              if (perlinAt(xTile + i) > curr) {
                // if there is a higher nuber nearby, deny this candidate
                flag = false
                break
              }
            }
          }

          // if it can spawn
          if (flag) {
            fun(xTile, this.blockAdder, generatePerlinNoiseGetter(x))
          }
        }
      }
    }
  }

  runCrossModifier() {

  }

  chunkOffloader(data, x, y) {
    const id = `${x}_${y}`
    this.bufferedChunks[id] = data
  }

  addMapModifier(fun, {linear = false, chance = 0, pre = 0, min = 0}) {
    chance = 1 - 1 / (chance + 1)
    this.mapModifiers.push({fun, done: {}, pre, chance, min, linear})
  }

  baseChunkLoader(x, y) {
    throw new Error('Please add a baseChunkLoader function!!')
  }

  blockAdder({x, y, to, hard = false}) {
    const index = (x % 16 + 16) % 16 + (y % 16 + 16) % 16 * 16
    const chunkX = floor(x / 16), chunkY = floor(y / 16)

    const id = `${chunkX}_${chunkY}`

    if (!this.chunkModifiers[id]) this.chunkModifiers[id] = []
    this.chunkModifiers[id].push({index, to, hard})
  }
}

function perlinAt(num) {
  return perlin[(num % perlin.length + perlin.length) % perlin.length]
}

let generetedNoiseCount = 10
function generatePerlinNoiseGetter(x, y = 1) {
  const i = x * y * generetedNoiseCount++
  let noiseCount = 0

  return (...args) => {
    if (args.length == 0) {
      return perlinAt(i + noiseCount++)
    } else if (args.length == 1) {
      return perlinAt(i + noiseCount++) * args[0]
    } else {
      return perlinAt(i + noiseCount++) * (args[1] - args[0]) + args[0]
    }
  }
}
