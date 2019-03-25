class LevelSelection extends Menu {
  constructor() {
    super()

    this.levels = []
    for (let i = 0; i < 100; i++) {
      const level = createGraphics(150, 100)
      level.background(255, 255, 0)
      level.fill(0)
      level.ellipse(25, 25, 50)
      level.fill(255, 255, 0)
      level.textSize(50)
      level.text(i, 25, 25)
      this.levels[i] = level
    }
  }

  onInput(input) {
    console.log(input);
    switch (input) {
      case '0': setCurrentStatus('play', 'level_0'); break;
      case '1': setCurrentStatus('play', 'level_1'); break;
    }
  }

  onClick() {

  }

  getSprite(canvas) {
    this.levels.forEach((level, i) => {
      canvas.image(level, i * 200, 400)
    })
  }
}

class LevelsButton extends Animation {
  constructor() {
    super()
  }
}
