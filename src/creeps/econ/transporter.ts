// Transporter: Transports energy from expansions to owned rooms
Creep.prototype.runTransporter = function() {
  let target = null;
  if (this.memory.transportTarget !== undefined) {
    target = Game.getObjectById(this.memory.transportTarget);
  }
  if (target != null && target.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
    delete this.memory.transportTarget;
    target = null;
  }
  if (target == null) {
    let distance = 255;
    for (const name of Memory.config.rooms) {
      const room = Game.rooms[name];
      if (room != null && room.isMine() && room.isStorageNotFull()) {
        const route = Game.map.findRoute(this.room.name, room.name);
        if (route != ERR_NO_PATH && route.length < distance) {
          distance = route.length;
          target = room.storage == null ? null : room.storage;
        }
      }
    }
    if (target != null) {
      this.memory.transportTarget = target.id;
    }
  }
  if (target == null) {
    const targets = Memory.config.rooms
      .map(n => {
        const room = Game.rooms[n];
        if (room != null && room.isMine()) {
          return room.findNotFullContainers();
        } else {
          return [];
        }
      })
      .reduce((a, b) => a.concat(b), []);
    let curEnergy = CONTAINER_CAPACITY;
    for (const t of targets) {
      if (t.store[RESOURCE_ENERGY] < curEnergy) {
        target = t;
        curEnergy = t.store[RESOURCE_ENERGY];
      }
    }
    if (target != null) {
      this.memory.transportTarget = target.id;
    }
  }
  if (target != null) {
    if (this.pos.isNearTo(target)) {
      this.transfer(target, RESOURCE_ENERGY);
      return true;
    } else {
      this.moveToS(target);
    }
  }
  return false;
};
