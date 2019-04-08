class MainMenu extends Menu {
  constructor() {
    super()
  }

  onKey(input) {
    switch (input) {
      case 'p': setCurrentStatus('levelSelection'); break;
      case 'o': setCurrentStatus('Options'); break;
    }
  }
}
