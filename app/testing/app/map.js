class Maps extends Master {
  constructor(parent) {
    super()
    this._status = parent
    this.statusName = parent.statusName
    this.spawners = parent.ecs.spawners
    this.ecs = parent.ecs
    this.camera = parent.camera

    this.chunks = []
    this.chunkWidth = this.chunkHeight = 16
    this.w = this.h = 0
    this.s = 16

    this.updater = []
  }

  tileAt(x, y) {
    //get chunk, cordinate
    const {chunkWidth, chunkHeight} = this
    const chunkX = x / chunkWidth | 0
    const chunkY = y / chunkHeight | 0
    const i = y * chunkWidth + x

    //chenk if chunx exists and is loaded
    if (!this.chunks[chunkX]) return 0
    if (!this.chunks[chunkX][chunkY]) return 0
    if (!this.chunks[chunkX][chunkY].view) return 0

    //get value (*4 for the 32 bit x tile)
    return this.chunks[chunkX][chunkY].view.getUint16(i * 4)
  }

  update(getRealX, getRealY) {
    this._getRealX = getRealX
    this._getRealY = getRealY

    this.chunks.forEach(col => {
      col.forEach(chunk => {
        chunk.update()
      })
    })
  }

  settings(settings = {}) {
    const {type, tileWidth} = settings

    if (tileWidth) this.s = tileWidth
    if (type) this.type = type
  }

  loadChunkAt(chunkX, chunkY, chunk, json) {
    const {chunkWidth, chunkHeight} = chunk
    const {w, h, graphicalMap} = json

    //check if chunk size is right
    if (w != chunkWidth || h != chunkHeight) debugger

    //create view, add the updater
    chunk.buffer = new ArrayBuffer(w * h * 4)
    chunk.view = new DataView(chunk.buffer)
    chunk.tile = new Tile(chunk.view)
    chunk.updater = this.updater

    //set tiles in buffer and draw them
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        let i = y * w + x
        chunk.view.setUint16(i * 4, graphicalMap[i])
        chunk.drawTile(x, y)
      }
    }

    if (!this.chunks[chunkX]) this.chunks[chunkX] = []
    this.chunks[chunkX][chunkY] = chunk

    const {spawners} = p5.prototype

    this.ecs.entities.forEach(e => this.ecs.despawn(e))

    for (key in json.toSpawn) {
      key = key.toLowerCase()
      if (!this.spawners[key]) throw new Error(`failed to load map ${name}, ${key} spawner not found:\n`, spawners)
      json.toSpawn[key].forEach(args => {
        this.spawners[key](...args, this._status)
      })
    }
  }

  unloadChunk(chunk) {

  }

  deleteChunk(chunk) {
    if (!chunk) return
  }
}

class LevelMaps extends Maps {
  constructor(parent) {
    super(parent)

    this.chunk = null
  }

  _setMap(json) {
    //reset chunks
    this.chunks = []

    //create new chunk and parse map
    const chunk = new Chunk(this)
    const parsed = parseMap(json, this.type)

    //update site of map
    const {w, h} = parsed
    this.setSize(w * this.s, h * this.s)
    this.chunkWidth = w
    this.chunkHeight = h

    //set chunk size
    chunk.settings({w, h})
    this.loadChunkAt(0, 0, chunk, parsed)

    this.collisions = sprites.tiles.tilePieces.collision
  }

  setMap(name, options = {}) {
    console.log('loading map: ', name, options);

    if (options.map) this._setMap(options.map)
    else if (originalMapJson[name]) this._setMap(originalMapJson[name])
    else loadMap('name', options, json => this._setMap(json))
  }
}

class ChunkMaps extends Maps {
  constructor(parent) {
    super(parent)

    this.chunks = []

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
    debugger
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
  }

  loadChunk(x, y) {

  }

  unloadChunk(x, y) {

  }

  settings(settings = {}) {
    const {w, h, s, chunkWidth, chunkHeight, preW, preH, postW, postH} = settings

    if (w) this.w = w
    if (h) this.h = h

    if (preW) this.preW = preW
    if (preH) this.preH = preH
    if (postW) this.postW = postW
    if (postH) this.postH = postH

    if (chunkWidth || chunkHeight || s || mapName) {
      if (chunkWidth) this.chunkWidth = chunkWidth
      if (chunkHeight) this.chunkHeight = chunkHeight
      if (s) this.s = s
      this.reloadChunks()
    }
  }
}
