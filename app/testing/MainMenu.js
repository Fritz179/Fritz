class MainMenu extends Menu {
  constructor() {
    super()
  }

  onInput(input) {
    switch (input) {
      case 'p': setCurrentStatus('levelSelection'); break;
      case 'o': setCurrentStatus('Options'); break;
    }
  }
}

class MainButton extends Animation {
  constructor() {
    super()
  }
}
