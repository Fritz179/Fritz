function createMiddlwere(target, name) {
  const realFun = (target[name] || (() => { })).bind(target)
  const preFun = new Map()
  const postFun = new Map()
  let counter = 0

  function runner(args) {
    let ret = null

    preFun.forEach((value, key) => {
      if (counter % value == 0) {
        const out = key(args)
        if (typeof out != 'undefined') ret = out
      }
    })

    const out = realFun(args)
    if (typeof out != 'undefined') ret = out

    postFun.forEach((value, key) => {
      if (counter % value == 0) {
        const out = key(args, ret)
        if (typeof out != 'undefined') ret = out
      }
    })

    counter++
    return ret
  }

  Object.defineProperty(runner, 'addPre', {
    value: (fun, repeat = 1) => preFun.set(fun.bind(target), repeat)
  })
  Object.defineProperty(runner, 'addPost', {
    value: (fun, repeat = 1) => postFun.set(fun.bind(target), repeat)
  })

  Object.defineProperty(target, name, {
    get() { return runner },
    set(newFun) { realFun = newFun }
  })
}
