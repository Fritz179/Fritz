class Chunk extends Canvas {
  constructor(map, x, y) {
    super(map.chunkWidth * map.tileSize, map.chunkHeight * map.tileSize)

    this.map = map
    this.tiles = null
    this.originalChunk = true
    this.chunkPos = new Vec2(x, y)
  }

  getSprite() {
    return this.sprite
  }

  load(chunk) {
    this.tiles = chunk

    const w = this.map.tileSize

    this.tiles.forEach((tile, i) => {
      const x = i % this.map.chunkWidth
      const y = (i - x) / this.map.chunkWidth
      const sprite = tiles[tile].sprite

      this.image(sprite, x * w, y * w, w, w)

      // const [chunkX, chunkY] = this.chunkPos
      // this.map.onBlockPlaced(tile, chunkX * 16 + x, chunkY * 16 + y)
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
    const sprite = tiles[tile].sprite

    this.image(sprite, x * w, y * w, w, w)
    this.changed = true
    this.originalChunk = false
  }
}
