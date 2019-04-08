class LevelSelection extends Menu {
  constructor() {
    super()

    for (let i = 0; i < 100; i++) {
      this.insertButton(new LevelButton(i))
    }
  }

  onKey(input) {
    switch (input) {
      case '0': setCurrentStatus('play', 'level_0'); break;
      case '1': setCurrentStatus('play', 'level_1'); break;
    }
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
  }

  getSprite() {
    return this.sprite
  }
}
