// Filler: Fills objects in room that need energy from containers
Creep.prototype.runFiller = function () {
  let target = null;
  if (!this.room.hasHostileAttacker()) {
    target = this.pos.findNearestFillTarget(STRUCTURE_EXTENSION);
    if (target == null) {
      target = this.pos.findNearestFillTarget(STRUCTURE_SPAWN);
    }
  }
  if (target == null) {
    target = this.pos.findNearestFillTarget(STRUCTURE_TOWER);
  }
  if (
    target == null &&
    this.room.isStorageNotFull() &&
    (this.room.findNotEmptyContainers().length > 0 || this.room.findNotEmptyLinks().length > 0)
  ) {
    target = this.room.storage;
  }
  if (target != null) {
    this.say("filling");
    if (this.pos.isNearTo(target)) {
      const availStorage = target.store.getFreeCapacity(RESOURCE_ENERGY);
      this.transfer(target, RESOURCE_ENERGY);
      if (availStorage >= this.store.getUsedCapacity(RESOURCE_ENERGY)) {
        return true;
      }
    } else {
      this.moveToI(target);
    }
  } else {
    this.idle();
  }
  return false;
};
