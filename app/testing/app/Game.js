class Game extends Status {
  constructor({type = 'pacman', tileWidth = 16} = {}) {
    super()

    this.gameType = type
    this.maps = new LevelMaps(this)

    this.addUpdateFunction(() => this.maps.update())

    if (type == 'pacman') {
      this.maps.settings({tileWidth, type})

      this.camera.settings({w: 480, r: 16 / 9, mode: 'multiple', overflow: 'hidden'})
      this.camera.addTileLayer()
      this.camera.addSpriteLayer()
    } else {
      throw new Error(`unknown game type: ${type}`)
    }
  }

  get mapX() { return this.cameraX + this.camera.x }
  get mapY() { return this.cameraY + this.camera.y }

  get tileX() { return this.mapX / this.maps.s | 0 }
  get tileY() { return this.mapY / this.maps.s | 0 }
}
