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
  createStatus(Create)

  setCurrentStatus('mainMenu')
}

class Play extends Game {
  constructor() {
    super()
    this.setSize(480, 270)
    this.camera.settings({w: 480, r: 16 / 9, mode: 'auto', overflow: 'hidden'})

    this.pre = level => {
      this.maps.setMap(level)
      masterStatus.setSize(480, 270)
      masterStatus.camera.settings({w: 480, r: 16 / 9, mode: 'multiple'})
    }

    this.post = () => {
      masterStatus.setSize(1920, 1080)
      masterStatus.camera.settings({w: 1920, r: 16 / 9, mode: 'auto'})
    }

    this.ecs.createSpawners(Shooter, Bullet, Player, End)
  }
}

class Create extends Game {
  constructor() {
    super()

    this.ecs.createSpawners(Shooter, Bullet, Player, End)
    this.listen('onMouse')
  }

  onMouse() {
    console.log(this.tileX, this.tileY);
  }
}
