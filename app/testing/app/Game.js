class Game extends Status {
  constructor({type = 'pacman', tileWidth = 16}) {
    super()

    this.gameType = type
    this.maps = new Maps()

    if (type == 'pacman') {
      this.maps.settings({tileWidth, type})

      this.camera.settings({cameraMode: 'auto', cameraOverflow: 'display', ratio: 16 / 9, cameraWidth: 480})
      this.camera.addTileLayer()
      this.camera.addSpriteLayer()

      this.addPreFunction(() => this.camera.noSmooth())
    } else {
      throw new Error(`unknown game type: ${type}`)
    }
  }

}
