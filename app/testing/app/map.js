class MapGame extends Game {
  constructor(parent) {
    super()

    this.chunks = []
    this.chunkWidth = this.chunkHeight = 16
    this.tileWidth = 16

    this.updater = []

    this.addUpdateFunction(() => { this.updateChunks() })
    this.camera.addTileLayer()
    this.camera.addSpriteLayer()
    
  }

  get tileX() { return this.mapX / this.tileWidth | 0 }
  get tileY() { return this.mapY / this.tileWidth | 0 }

  get tile() { return this.tileAt(this.tileX, this.tileY)}
  get block() { return this.blockAt(this.tileX, this.tileY)}
  set tile(tile) { this.setTileAt(this.tileX, this.tileY, tile)}
  set block(block) { this.setBlockAt(this.tileX, this.tileY, block)}

  tileAt(x, y, offset = 0, length = 2) {
    //check if request doesn't overflow
    if (offset + length > 4) throw new Error(`Overflow error!! ${{x, y, offset, length}}`)
    if (offset < 0 || length < 0) throw new Error(`Underflow error!! ${{x, y, offset, length}}`)

    //get chunk, cordinate
    const {chunkWidth, chunkHeight} = this
    let chunkX = x / chunkWidth
    let chunkY = y / chunkHeight
    if (chunkX < 0) chunkX--
    if (chunkY < 0) chunkY--
    chunkX |= 0
    chunkY |= 0

    const i = (y - chunkY * chunkHeight) * chunkWidth + (x - chunkX * chunkWidth)

    //chenk if chunx exists and is loaded
    if (!this.chunks[chunkX]) return 0
    if (!this.chunks[chunkX][chunkY]) return 0
    if (!this.chunks[chunkX][chunkY].view) return 0

    const {view} = this.chunks[chunkX][chunkY]

    //get value (*4 for the 32 bit each tile)
    switch (length) {
      case 1: return view.getUint8(i * 4 + offset); break;
      case 2: return view.getUint16(i * 4 + offset); break;
      case 4: return view.getUint32(i * 4); break;
    }
  }

  blockAt(x, y) {
    const id = this.tileAt(x, y, 0, 1)

    return id
  }

  updateChunks() {
    this.chunks.forEach(col => {
      col.forEach(chunk => {
        chunk.update()
      })
    })
  }

  loadChunkAt(chunkX, chunkY, map) {
    //create new chunk
    const chunk = new Chunk(this)

    const {chunkWidth, chunkHeight} = chunk
    const {w, h, graphicalMap} = map

    //check if chunk size is right
    if (w != chunkWidth || h != chunkHeight) throw new Error(`Invalid chunkWidth!!`)

    //create view, add the updater
    chunk.buffer = new ArrayBuffer(w * h * 4)
    chunk.view = new DataView(chunk.buffer)
    chunk.tile = new Tile(chunk.view)
    chunk.updater = this.updater

    //set tiles in buffer and draw them
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        const i = y * w + x
        chunk.view.setUint16(i * 4, graphicalMap[i])
        chunk.drawTile(x, y)
      }
    }

    //create col if not present
    if (!this.chunks[chunkX]) this.chunks[chunkX] = []
    this.chunks[chunkX][chunkY] = chunk

    for (key in map.toSpawn) {
      key = key.toLowerCase()
      if (!this.ecs.spawners[key]) throw new Error(`failed to load map ${name}, ${key} spawner not found:\n`, spawners)
      map.toSpawn[key].forEach(args => {
        this.ecs.spawners[key](...args, this)
      })
    }
  }

  unloadChunk(chunk) {

  }

  deleteChunk(chunk) {
    if (!chunk) return
  }

  setMap(map) {
    //despawn all old entities
    this.ecs.despawnAll()

    //reset chunks
    this.chunks = []

    //update chunkSize to fit them ap in one chunk
    this.chunkWidth = map.w
    this.chunkHeight = map.h

    //load chunk
    this.loadChunkAt(0, 0, map)

    // TODO: change collision definition
    this.collisions = sprites.tiles.tilePieces.collision
  }
}

class ChunkGame extends MapGame {
  constructor() {
    super()

    this.chunkX = this.chunkY = null
    this.preW = this.preH = 3
    this.postW = this.postH = 4
  }

  update() {
    const {chunkWidth, chunkHeight, preW, preH, postW, postH, chunks, s} = this
    let left = 0, right = 0, top = 0, bottom = 0
    let changed = false

    let {x, y} = this.camera.center
    x = x / s / chunkWidth | 0
    y = y / s / chunkHeight | 0

    if (this.chunkX != x) {
      const dir = Math.sign(x - this.chunkX) //-1 => going left, 1 => going right

      left = x - (dir > 0 ? postW : preW)
      right = x + (dir < 0 ? postW : preW)

      this.chunkX = x
      changed = true
    }

    if (this.chunkY != y) {
      const dir = Math.sign(y - this.chunkY) //-1 => going up, 1 => going down

      top = y - dir > 0 ? postH : preH
      bottom = y + dir < 0 ? postH : preH

      this.chunkY = y
      changed = true
    }

    if (changed) {
      for (let x = left; x <= right; x++) {
        if (!chunks[x]) chunks[x] = []

        for (let y = top; y <= bottom; y++) {
          if (!chunks[x][y]) chunks[x][y] = this.loadChunk(x, y)
        }
      }

      chunks.forEach((col, x) => {
        col.forEach((chunk, y) => {
          if (x < left || x > right || y < top || y > bottom) {
            this.unloadChunk(x, y)
          }
        })
      })
    }

    this.updateChunks()
  }

  settings(settings = {}) {
    const {chunkWidth, chunkHeight, preW, preH, postW, postH} = settings

    if (preW) this.preW = preW
    if (preH) this.preH = preH
    if (postW) this.postW = postW
    if (postH) this.postH = postH

    if (chunkWidth || chunkHeight) {
      if (chunkWidth) this.chunkWidth = chunkWidth
      if (chunkHeight) this.chunkHeight = chunkHeight

      this.chunks = []
    }
  }
}
