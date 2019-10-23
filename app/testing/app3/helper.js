let preloadCounter = 1

function incrementPreloadCounter(ammount = 1) {
  preloadCounter += ammount

  if (timer.running) {
    timer.stop()
  }
}

function decrementPreloadCounter(ammount = 1) {
  preloadCounter -= ammount

  if (preloadCounter <= 0) {
    if (timer.running) console.error('console.error();');
    else timer.start()
  }
}

function addDefaultOptions(target, source) {
  for (let key in source) {
    if (typeof target[key] == 'undefined') {
      target[key] = source[key]
    }
  }
  return target
}

function addToOptions(target, source) {
  for (let key in source) {
    if (typeof target[key] != 'undefined') {
      target[key] = source[key]
    }
  }
  return target
}

function separate(args, options) {
  if (typeof args[args.length - 1] == 'object') {
    options = addToOptions(options, args.splice(args.length - 1)[0])
  }

  for (let i = args.length - 1; i >= 0; i--) {
    if (typeof args[i] == 'string') {
      if (typeof options[args[i]] == 'undefined') {
        throw new Error(`Invalid argument: ${args[i]}, valid options: ${Object.keys(options).join()}`)
      } else {
        options[args[i]] = true
        args.splice(i, 1)
      }
    }
  }

  return {args, options}
}

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function deCapitalize(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
}

function loadImage(url, callback) {
  if (typeof callback == 'function') {
    return _loadImage(url, callback)
  } else if (callback && typeof callback.callback == 'function') {
    return _loadImage(url, callback.callback)
  } else {
    return new Promise(resolve => {
      _loadImage(url, resolve)
    });
  }
}

function _loadImage(url, callback) {
  const image = new Image();
  image.addEventListener('load', () => {
      callback(image);
  });
  image.src = url;
}

function loadJSON(url, callback) {
  if (typeof callback == 'function') {
    return _loadJSON(url, callback)
  } else if (callback && typeof callback.callback == 'function') {
    return _loadJSON(url, callback.callback)
  } else {
    return new Promise(resolve => {
      _loadJSON(url, resolve)
    });
  }
}

function _loadJSON(url, callback) {
  fetch(url).then(res => {
    res.json().then(json => {
      callback(json)
    })
  })
}

function getColor(args) {
  if (args.length == 1 && typeof args[0] == 'string') return args[0]
  const {r, g, b, a} = getRGBA(...args)
  if (a == 1) return `rgb(${r}, ${g}, ${b})`
  else return `rgba(${r}, ${g}, ${b}, ${a})`
}

function getRGBA(...args) {
  let r, g, b, a

  switch (args.length) {
    case 1: r = g = b = args[0]; a = 1; break;
    case 2: r = g = b = args[0]; a = args[1]; break;
    case 3: r = args[0]; g = args[1]; b = args[2]; a = 1; break;
    case 4: r = args[0]; g = args[1]; b = args[2]; a = args[3]; break;
    default: throw new Error(`Invalid color args len: ${args.length}`)
  }

  return {r, g, b, a}
}
