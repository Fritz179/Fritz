class LevelSelection extends Menu {
  constructor() {
    super()
  }

  onInput(input) {
    switch (input) {
      case '0': changeStatus('play'); setMap('level_0'); break;
      case '1': changeStatus('play'); setMap('level_1'); break;
    }
  }

  onClick() {

  }

  getSprite() {

  }
}
