function initTimer() {
  window.draw = () => {
    const {entities, hitboxes, animations} = ecs

    //update all entities
    for (let i = hitboxes.length - 1; i >= 0; i--) {
      hitboxes[i].update()
    }

    for (let i = entities.length - 1; i >= 0; i--) {
      e = entities[i]
      e.xv += e.xa; e.yv += e.ya
      e.x += e.xv; e.y += e.yv
      fritz.collideRectMap(e, true)
      e.fixedUpdate()
      e.update()
    }

    for (let i = animations.length - 1; i >= 0; i--) {
      animations[i].update()
    }

    //collide all with all other
    for (let i = entities.length - 1; i >= 0; i--) {
      for (let j = i - 1; j >= 0; j--) {
        if (fritz.collideRectRect(entities[i], entities[j])) {
          entities[i].onCollisionEntry({collider: entities[j]})
          entities[j].onCollisionEntry({collider: entities[i]})
        }
      }

      for (let j = hitboxes.length - 1; j >= 0; j--) {
        //interact
      }
    }

    updateCanvas()
  }

  if (typeof fixedUpdate == 'function') fixedUpdate()
  if (typeof update == 'funtion') update()
}
