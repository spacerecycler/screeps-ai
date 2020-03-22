// Repairer: Repairs objects in a room
Creep.prototype.runRepairer = function () {
  let target = this.tryRepair(this.memory);
  if (target != null) {
    if (this.store[RESOURCE_ENERGY] - this.memory.numWorkParts <= 0) {
      return true;
    }
  }
  if (target == null) {
    const objects = Memory.config.blacklist[this.room.name].map((id) => Game.getObjectById(id));
    [target] = objects.map((t) => (t instanceof Structure ? t : null)).filter((t) => t != null);
    if (target != null) {
      if (this.pos.isNearTo(target)) {
        this.dismantle(target);
      } else {
        this.moveToI(target);
      }
    }
  }
  if (target == null) {
    this.idle();
  }
  return false;
};
