class Chunk extends Canvas {
  constructor(map, x, y) {
    super(map.chunkWidth * map.tileWidth, map.chunkHeight * map.tileWidth)

    this.map = map
    this.tiles = null
    this.originalChunk = true

    this.children = new Set()
  }

  getSprite() {
    return this.sprite
  }

  load(chunk) {
    this.tiles = chunk

    const w = this.map.tileWidth

    this.tiles.forEach((tile, i) => {
      const x = i % this.map.chunkWidth
      const y = (i - x) / this.map.chunkWidth
      const sprite = tiles[tile].sprite

      this.image(sprite, x * w, y * w, w, w)
    })
  }

  attach(entity) {
    this.children.add(entity)
    entity.attachments.push(this)
  }

  detach(entity) {
    this.children.delete(entity)
  }

  serialize() {
    const serial = {}

    if (!this.originalChunk) {
      serial.data = this.tiles
    }

    this.children.forEach(child => {
      const serialized = child.serialize()
      child.despawn()

      if (serialized) {
        if (!serial.entities) serial.entities = []
        serial.entities.push({args: serialized, name: child.constructor.name})
      }
    })

    if (Object.keys(serial).length) {
      return serial
    }
  }

  setTileAt(x, y, tile) {
    const i = x + y * this.map.chunkWidth
    this.tiles[abs(i)] = tile

    const w = this.map.tileWidth
    const sprite = tiles[tile].sprite

    this.image(sprite, x * w, y * w, w, w)
    this.changed = true
    this.originalChunk = false
  }
}
