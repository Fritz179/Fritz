class LevelSelection extends Menu {
  constructor() {
    super()
    this.listen('onKey')

    for (let i = 0; i < 5; i++) {
      this.addButton(new LevelButton(i))
    }
  }

  onKey(input) {
    const int = parseInt(input)

    if (!isNaN(int)) setCurrentStatus('play', `level_${int}`)
  }
}

class LevelButton extends Button {
  constructor(level) {
    super()
    this.level = level

    //set the position depending on the level
    this.setPos(300 + 600 * level, 500)

    //create custon sprite depending on the level it rappresents
    const sprite = this.sprite = createGraphics(300, 200)
    sprite.noSmooth()

    this.setSize(300, 200)

    sprite.background(255, 255, 0)
    sprite.fill(0)
    sprite.ellipse(sprite.width / 2, sprite.height / 2, sprite.height * 0.9)
    sprite.fill(255, 255, 0)
    sprite.textSize(100)
    sprite.textAlign(CENTER, CENTER)
    sprite.text(level, sprite.width / 2, sprite.height / 2)
  }

  onClick() {
    console.log(this.level);
    setCurrentStatus('play', `level_${this.level}`)
  }

  getSprite() {
    return this.sprite
  }
}
