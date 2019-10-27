class Overlay extends Layer {
  constructor(player) {
    super()

    this.player = player
    this.setCameraMode({align: 'right-top', overflow: 'display'})
  }

  getSprite(ctx) {
    this.textSize(50)
    this.textFont('consolas')
    this.textAlign('right', 'top')

    const {x, y} = this.player
    const f = Math.floor

    this.text(`FPS: ${timer.fps}, UPS: ${timer.ups}`, -10, 10)
    this.text(`X: ${f(x)}, ${f(x / 16)}, ${f(x / 256)}`, -10, 60)
    this.text(`Y: ${f(y)}, ${f(y / 16)}, ${f(y / 256)}`, -10, 110)

    return false
  }
}
