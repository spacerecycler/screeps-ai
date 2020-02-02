StructureLink.prototype.run = function() {
  if (Memory.links[this.id] == null) {
    const source = this.pos.findClosestByRange(FIND_SOURCES);
    if (source != null) {
      const isNearSource = this.pos.inRangeTo(source, 2);
      Memory.links[this.id] = {nearSource: isNearSource};
    }
  }
  if (this.cooldown <= 0 && this.store[RESOURCE_ENERGY] >= this.store.getCapacity(RESOURCE_ENERGY) * 0.9) {
    const links = this.room.find<StructureLink>(FIND_MY_STRUCTURES, {
      filter: (t) => {
        return t.structureType == STRUCTURE_LINK && Memory.links[t.id] != null
          && !Memory.links[t.id].nearSource && t.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
      }
    });
    if (!_.isEmpty(links)) {
      const link = links[0];
      this.transferEnergy(link);
    }
  }
};
StructureLink.prototype.getEnergy = function() {
  return this.store[RESOURCE_ENERGY];
};
StructureLink.prototype.doGiveEnergy = function(creep) {
  return creep.withdraw(this, RESOURCE_ENERGY);
};
