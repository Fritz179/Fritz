function createMiddleware(to, name) {
  const capName = capitalize(name)

  const {prototype} = to.constructor
  if (!prototype.hasOwnProperty(`${name}MiddlewareAdded`)) {
    Object.defineProperty(prototype, `${name}MiddlewareAdded`, {value: true})
    // console.log(Object.hasOwnProperty(prototype, `${name}MiddlewareAdded`), to);

    function crawl(obj) {
      if (obj.hasOwnProperty(`${name}Capture`)) {
        funs.unshift(obj[`${name}Capture`])
      }

      if (obj.hasOwnProperty(`${name}Bubble`)) {
        funs.push(obj[`${name}Bubble`])
      }

      // recursive until to the SuperClass is passed
      if (obj.__proto__ != Object.prototype) {
        crawl(obj.__proto__)
      }
    }

    const funs = prototype[name] ? [prototype[name]] : []
    crawl(prototype)

    Object.defineProperty(prototype, name, {
      value: function(args = {}) {
        let ret
        funs.forEach(fun => {
          const out = fun.call(this, args, ret)
          if (typeof out != 'undefined') ret = out
        })

        return ret
      }
    })
  }
}
