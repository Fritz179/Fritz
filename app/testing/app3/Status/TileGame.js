function addCord(target, name, q = 0) {
  let value
  if (q) {
    value = (...args) => target[name](...args.splice(0, q).map(val => target.cord(val)), ...args)
  } else {
    value = (...args) => target[name](...args.map(val => target.cord(val)))
  }
  Object.defineProperty(target[name], 'cord', {value})
}

class TileGame extends SpriteLayer {
  constructor(...args) {
    super(...args)

    this.chunkWidth = 16
    this.chunkHeight = 16
    this.tileSize = 16
    this.chunks = []

    if (sprites.tiles.collisionTable) {
      this.collisionTable = sprites.tiles.collisionTable
    }

    this._isMap = true
    this._mapWasLoaded = false
    this._autoLoadChunks = false
    this.preW = this.preH = null
    this.postW = this.postH = null

    this.update.addPre(() => {
      let changed = false
      this.forEachChunk((chunk, x, y) => {
        const updated = chunk.update()

        if (updated || chunk.changed) {
          chunk.changed = false
          changed = true
        }
      })

      return this.changed = changed
    })
    this.fixedUpdate.addPre(() => this.forEachChunk(chunk => chunk.fixedUpdate()))

    this.getSprite.addPre(() => {
      this.forEachChunk((chunk, x, y) => {
        const {chunkTotalWidth, chunkTotalHeight} = this

        const sprite = chunk.getSprite(this.sprite)
        if (sprite) {
          this.image(sprite, x * chunkTotalWidth, y * chunkTotalHeight, {hitbox: debugEnabled, trusted: debugEnabled})
        } else if (sprite !== false) {
          console.error('Invalid chunk getSprite return?');
        }
      })
    })

    this.update.addPre(() => {
      if (this._autoLoadChunks) {
        const {chunkTotalWidth, chunkTotalHeight, preW, preH, postW, postH} = this
        const xCenter = floor(this.center.x / chunkTotalWidth)
        const yCenter = floor(this.center.y / chunkTotalHeight)

        // delete all outside chunk
        let deletedChunks = 0
        const minX = xCenter - postW, maxX = xCenter + postW
        const minY = yCenter - postH, maxY = yCenter + postH
        for (let x in this.chunks) {
          const col = this.chunks[x]

          for (let y in col) {
            if (x < minX || x > maxX || y < minY || y > maxY) {
              deletedChunks++
              this.unloadChunkAt(x, y)
            }
          }
        }

        // add new chunks
        let newChunks = 0
        for (let x = xCenter - this.preW; x <= xCenter + this.preW; x++) {
          for (let y = yCenter - this.preH; y <= yCenter + this.preH; y++) {
            if (!this.chunks[x] || !this.chunks[x][y]) {
              newChunks++
              this.loadChunkAt(this.chunkLoader(x, y), x, y)
            }
          }
        }

        // if (debugEnabled && (newChunks || deletedChunks)) {
        //   console.log(`Loaded ${newChunks} chunks and deleted ${deletedChunks} chunks!`);
        // }
      }
    })

    addCord(this, 'tileAt')
    addCord(this, 'allBlocksIn')

    addCord(this, 'setTileAt', 2)
    addCord(this, 'forAllBlocksIn', 4)
  }

  get chunkLength() { return this.chunkWidth * this.chunkHeight }
  get chunkTotalWidth() { return this.chunkWidth * this.tileSize }
  get chunkTotalHeight() { return this.chunkHeight * this.tileSize }
  get chunkTotalLength() { return this.chunkTotalWidth * this.chunkTotalHeight }

  cord(...args) {
    args = args.map(val => floor(val / this.tileSize))
    return args.length == 1 ? args[0] : args
  }

  chunkLoader() {
    throw new Error('Please define a chunkLoader function or use loadMap!!')
  }

  chunkOffloader() {

  }

  isOnMap(entity) {
    return true
  }

  forEachChunk(fun) {
    for (let x in this.chunks) {
      const col = this.chunks[x]

      for (let y in col) {
        fun(col[y], x, y)
      }
    }
  }

  setChunkLoader(...args) {
    this._autoLoadChunks = true
    args = args.map(val => floor(val))

    switch (args.length) {
      case 1:
        this.preW = this.preH = this.postH = this.postW = args[0]
        break;
      case 2:
        this.preW = this.preH = args[0]
        this.postW = this.postH = args[1]
        break;
      case 3:
        this.preW = args[0]
        this.preH = args[1]
        this.postW = this.postH = args[2]
        break;
      case 4:
        [this.preW, this.preH, this.postW, this.postH] = args
        break;
      default:
        throw new Error('Invalid setChunkLoader arguments...')
    }
  }

  loadChunkAt(data, chunkX, chunkY) {
    //create new chunk
    const chunk = new Chunk(this)

    //create col if not present
    if (!this.chunks[chunkX]) this.chunks[chunkX] = []
    this.chunks[chunkX][chunkY] = chunk

    chunk.load(data.map)

    for (key in data.toSpawn) {
      key = key.toLowerCase()
      if (!this.spawners[key]) {
        throw new Error(`failed to load map ${name}, ${key} spawner not found`)
      }
      data.toSpawn[key].forEach(args => {
        this.spawn(new this.map.spawners[key](...args))
      })
    }
  }

  unloadChunkAt(chunkX, chunkY) {
    if (!this.chunks[chunkX]) return -1
    if (!this.chunks[chunkX][chunkY]) return -1

    const data = this.chunks[chunkX][chunkY].unload()
    if (data) {
      this.chunkOffloader(data, chunkX, chunkY)
    }
    delete this.chunks[chunkX][chunkY]

    if (!Object.keys(this.chunks[chunkX]).length) {
      delete this.chunks[chunkX]
    }
  }

  tileAt(x, y) {
    //get chunk, cordinate
    const {chunkWidth, chunkHeight} = this
    const chunkX = floor(x / chunkWidth)
    const chunkY = floor(y / chunkHeight)

    const i = (y - chunkY * chunkHeight) * chunkWidth + (x - chunkX * chunkWidth)

    //chenk if chunx exists and is loaded
    if (!this.chunks[chunkX]) return -1
    if (!this.chunks[chunkX][chunkY]) return -1

    return this.chunks[chunkX][chunkY].tiles[i]
  }

  setTileAt(x, y, tile) {
    //get chunk, cordinate
    const {chunkWidth, chunkHeight} = this
    const chunkX = floor(x / chunkWidth)
    const chunkY = floor(y / chunkHeight)
    x -= chunkX * chunkWidth
    y -= chunkY * chunkHeight

    //chenk if chunx exists and is loaded
    if (!this.chunks[chunkX]) return -1
    if (!this.chunks[chunkX][chunkY]) return -1

    return this.chunks[chunkX][chunkY].setTileAt(x, y, tile)
  }

  collideMap(entity, sides = 3) {
    const {collisionTable, w, h, tileSize} = this

    if (!this.isOnMap(entity)) {
      return 0
    }

    if (sides & 1) {
      // chex x-axis
      let topTile = floor(entity.top / tileSize)
      const bottomTile = ceil(entity.bottom / tileSize)

      if (entity.xv > 0) { // entity is going right
        const xTile = floor(entity.right / tileSize)
        do {
          if (collisionTable[this.tileAt(xTile, topTile)] & 8) {
            entity.onBlockCollsion({side: 'right', x: xTile, y: topTile, s: tileSize})
          }
          topTile++
        } while (topTile < bottomTile)

      } else if (entity.xv < 0) { // entity is going left
        const xTile = floor(entity.left / tileSize)
        do {
          if (collisionTable[this.tileAt(xTile, topTile)] & 2) {
            entity.onBlockCollsion({side: 'left', x: xTile, y: topTile, s: tileSize})
          }
          topTile++
        } while (topTile < bottomTile)
      }
    }

    if (sides & 2) {
      // chex y-axis
      let leftTile = floor(entity.left / tileSize)
      const rightTile = ceil(entity.right / tileSize)

      if (entity.yv > 0) { // entity is going down
        const yTile = floor(entity.bottom / tileSize)
        do {
          if (collisionTable[this.tileAt(leftTile, yTile)] & 1) {
            entity.onBlockCollsion({side: 'bottom', x: leftTile, y: yTile, s: tileSize})
          }
          leftTile++
        } while (leftTile < rightTile)

      } else if (entity.yv < 0) { // entity is going up
        const yTile = floor(entity.top / tileSize)
        do {
          if (collisionTable[this.tileAt(leftTile, yTile)] & 4) {
            entity.onBlockCollsion({side: 'top', x: leftTile, y: yTile, s: tileSize})
          }
          leftTile++
        } while (leftTile < rightTile)
      }
    }
  }

  forAllBlocksIn(x1, y1, x2, y2, fun) {
    let x = x1
    let y = y1

    do {
      do {
        fun(x, y, this.tileAt(x, y))
        y++
      } while (y <= y2);
      x++
    } while (x <= x2);
  }

  allBlocksIn(x1, y1, x2, y2) {
    let x = x1
    const arr = []

    do {
      let y = y1
      do {
        arr.push(this.tileAt(x, y))
        y++
      } while (y <= y2);
      x++
    } while (x <= x2);

    return arr
  }

  loadMap(map) {
    if (Array.isArray(map)) map = {map}

    if (!map.width) map.width = 16
    if ((map.map.length / map.width) % 1 != 0) {
      console.error(map);
      throw new Error('Cannot load map, invalid measures...')
    }

    this.setChunkSize(map.width, map.map.length / map.width)

    this.clearChunks()
    this.loadChunkAt(map, 0, 0)

    this._mapWasLoaded = true
  }

  setChunkSize(w, h) {
    if (this.chunks.length) {
      throw new Error('Cannot change chunkSize while map is loaded')
    }

    if (!h) h = w

    this.chunkWidth = w
    this.chunkHeight = h
  }

  clearChunks(hard = false) {
    if (!hard) {
      this.forEachChunk((chunk, x, y) => {
        this.unloadChunkAt(x, y)
      })
    } else {
      this.chuks = []
    }
  }
}
