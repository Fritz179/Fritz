const fritz = Object.create(null)

const defaultOptions = {
  addSpriteSheet: {path: '/img', format:'png', json: true},
  loadMap: {path: '/levels'},
  createPool: {},
  createGame: {type: 'pacman', levels: false, tileWidth: 16}
};


(function IIFE(window) {
  'use strict'

  function init() {
    fritz.gameSettings = defaultOptions.createGame;
    //function not stored in fritz, else it would be replaced with 'creategame not called' and it would be callable like game.createGame()
    window.createGame = (settings = {}) => {
      setDefaultOptions(fritz.gameSettings, addDefaultOptions(settings, defaultOptions.createGame))
      console.log('New game instatiated, thanks for using fritz ;-)\n\n', fritz.gameSettings);

      for (var key in fritz) {
        window[key] = fritz[key]
      }
      window.game = window.fritz = fritz

      return fritz
    }
  }

  //if app already initialized, do nothing
  if (window._fritzAppVersion) {
    console.warn('FritzApp already available');
  } else { //start fritz
    window._fritzAppVersion = 1

    init()
    initMap()
    initSprites()
    initEntity()
    initSpawner()
    initCollision()
    initTimer()

    //save all function in window object
    for (var key in fritz) {
      if (typeof window[key] == 'undefined') {
        //actual function will be made available only when createGame is called
        if (typeof fritz[key] == 'function') {
          window[key] = () => { throw new Error(`Cannot call ${key}, game not createt, use createGame`) }
        } else {
          window[key] = fritz[key]
        }
      } else {
        console.log(`in window ${key} is already defined`);
      }
    }
  }
})(window);

function addDefaultOptions(settings, defaults) {
  for (let key in defaults) {
    if (typeof settings[key] == 'undefined') {
      settings[key] = defaults[key]
    }
  }

  return settings
}

function setDefaultOptions(defaults, settings) {
  for (let key in settings) {
    if (typeof defaults[key] != 'undefined') {
      defaults[key] = settings[key]
    } else {
      console.warn(`cannot change default settings, invalid key: ${key} of: `, settings);
    }
  }

  return defaults
}

function createDefaultTexture() {
  let g = createGraphics(16, 16)
  g.noStroke()
  g.fill(0)
  g.rect(0, 0, 8, 8)
  g.rect(8, 8, 16, 16)
  g.fill(255, 0, 255)
  g.rect(8, 0, 16, 8)
  g.rect(0, 8, 8, 16)
  return g
}
