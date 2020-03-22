// Builder: Builds any objects
Creep.prototype.runBuilder = function () {
  let target = null;
  if (this.memory.builderTarget !== undefined) {
    target = Game.getObjectById(this.memory.builderTarget);
  }
  if (target == null) {
    target = this.pos.findNearestConstructionSite([STRUCTURE_WALL, STRUCTURE_RAMPART]);
  }
  if (target == null && this.room.containerCount() == 0) {
    target = this.pos.findNearestConstructionSite([STRUCTURE_CONTAINER]);
  }
  if (target == null) {
    target = this.pos.findNearestConstructionSite([STRUCTURE_ROAD]);
  }
  if (target == null) {
    target = this.pos.findNearestConstructionSite([STRUCTURE_TOWER, STRUCTURE_EXTENSION]);
  }
  if (target == null) {
    target = this.pos.findNearestConstructionSite([STRUCTURE_CONTAINER]);
  }
  if (target == null) {
    target = this.pos.findNearestConstructionSite();
  }
  if (target == null && !_.isEmpty(Game.constructionSites)) {
    [target] = Object.values(Game.constructionSites);
    this.memory.room = target.pos.roomName;
  }
  if (target != null) {
    this.memory.builderTarget = target.id;
    this.say("building");
    if (this.pos.inRangeTo(target, 3)) {
      this.build(target);
      if (this.store[RESOURCE_ENERGY] - this.memory.numWorkParts * BUILD_POWER <= 0) {
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
