class Chunk extends Canvas {
  constructor(map) {
    super(map.chunkWidth * map.tileSize, map.chunkHeight * map.tileSize)

    this.map = map
    this.tiles = null
    this.tileChanged = true
    this.originalChunk = true
  }

  get changed() { return this.tileChanged || this._posChanged }
  set changed(bool = false) { this.tileChanged = this._posChanged = bool }

  getSprite() {
    return this.sprite
  }

  load(chunk) {
    this.tiles = chunk

    const w = this.map.tileSize

    this.tiles.forEach((tile, i) => {
      const x = i % this.map.chunkWidth
      const y = (i - x) / this.map.chunkWidth
      const sprite = sprites.tiles[tile]

      this.image(sprite, x * w, y * w, w, w)
    })
  }

  unload() {
    if (!this.originalChunk) {
      return this.tiles
    }
  }

  setTileAt(x, y, tile) {
    const i = x + y * this.map.chunkWidth
    this.tiles[abs(i)] = tile

    const w = this.map.tileSize
    const sprite = sprites.tiles[tile]

    this.image(sprite, x * w, y * w, w, w)
    this.tileChanged = true
    this.originalChunk = false
  }
}
