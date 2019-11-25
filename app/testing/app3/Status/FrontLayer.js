class FrontLayer extends Layer {
  constructor() {
    super()

    this.texts = []
    this.textCount = 0

    this.update.addPre(() => {
      this.textCount = 0
    })

    this.getSprite.addPost(() => {
      this.texts.forEach(({text, x, y}) => {
        this.text(text, x, y)
      })
    })
  }

  setText(text, x, y) {
    if (!this.texts[this.textCount] || this.texts[this.textCount].text != text) {
      this.changed = HARD
      this.texts[this.textCount] = {text, x, y}
    }

    this.textCount++
  }

  getSprite() {
    return false
  }
}
