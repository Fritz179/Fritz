function preload() {
  console.log('preload');
  loadSpriteSheet('tiles', {type: 'pacmanTiles', json: false})
  loadSpriteSheets('player', 'end', 'shooter', 'bullet')

  loadMenuSprite('mainMenu')
  loadMenuSprite('levelSelection')

  loadMap('level_0')
}

function setup() {
  createStatus(MainMenu)
  createStatus(LevelSelection)
  createStatus(Play)

  setCurrentStatus('mainMenu')
}

class Play extends Game {
  constructor() {
    super()
    this.camera.settings({w: 480, r: 16 / 9, mode: 'multiple', overflow: 'hidden'})
    this.pre = level => this.maps.setMap(level)

    this.ecs.createSpawners(Shooter, Bullet, Player, End)
    this.listen('onMouse')
  }

  onMouse() {
    console.log(this._getRealX(mouseX), this._getRealY(mouseY));
  }
}
