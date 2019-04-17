class Game extends Status {
  constructor({type = 'pacman', tileWidth = 16} = {}) {
    super()

    this.gameType = type
    this.maps = new Maps(this)

    if (type == 'pacman') {
      this.maps.settings({tileWidth, type})

      this.camera.settings({w: 480, r: 16 / 9, mode: 'multiple', overflow: 'hidden'})
      this.camera.addTileLayer()
      this.camera.addSpriteLayer()
    } else {
      throw new Error(`unknown game type: ${type}`)
    }
  }
}
