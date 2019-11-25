class Overlay extends FrontLayer {
  constructor(player) {
    super()
    this.updateTimes = 0

    this.player = player
    this.setCameraMode({align: 'right-top', overflow: 'display'})
  }

  update() {
    this.updateTimes++

    const {ups, fps, runTime} = timer
    const {x, y} = this.player
    const f = Math.floor

    this.textSize(50)
    this.textFont('consolas')
    this.textAlign('right', 'top')

    this.setText(`FPS: ${timer.fps}, UPS: ${timer.ups}`, -10, 10)
    this.setText(`X: ${f(x)}, ${f(x / 16)}, ${f(x / 256)}`, -10, 60)
    this.setText(`Y: ${f(y)}, ${f(y / 16)}, ${f(y / 256)}`, -10, 110)
    this.setText(`LAST: ${f(runTime * 100) / 100}ms = ${f(runTime * fps) / 10}%`, -10, 160)
  }
}
