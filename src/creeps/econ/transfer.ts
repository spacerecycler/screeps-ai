// Transfer: specialized creep that transferes energy from a storage to a link and a tower next to the storage
Creep.prototype.runTransfer = function() {
  if (this.room.storage == null) {
    console.log(`Room has no storage ${this.room.name}`);
    return false;
  }
  const storagePos = this.room.storage.pos;
  const tower = _.head(storagePos.findInRange<StructureTower>(FIND_MY_STRUCTURES, 2,
    {filter: (t) => t.structureType == STRUCTURE_TOWER}));
  if (!this.memory.shouldFillTower && tower.store[RESOURCE_ENERGY] < tower.store.getCapacity(RESOURCE_ENERGY) * 0.9) {
    this.memory.shouldFillTower = true;
  }
  if (this.memory.shouldFillTower && tower.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
    this.memory.shouldFillTower = false;
  }
  const link = _.head(storagePos.findInRange<StructureLink>(FIND_MY_STRUCTURES, 2,
    {filter: (t) => t.structureType == STRUCTURE_LINK}));
  if (!this.pos.isNearTo(this.room.storage)) {
    this.moveToI(this.room.storage);
    return false;
  }
  if (!this.pos.isNearTo(tower)) {
    this.moveToI(tower);
    return false;
  }
  if (link != null && !this.pos.isNearTo(link)) {
    this.moveToI(link);
    return false;
  }
  if (link != null) {
    this.withdraw(link, RESOURCE_ENERGY, 25);
  } else {
    this.withdraw(this.room.storage, RESOURCE_ENERGY, 25);
  }
  if (this.memory.shouldFillTower) {
    this.transfer(tower, RESOURCE_ENERGY);
  } else if (link != null) {
    this.transfer(this.room.storage, RESOURCE_ENERGY);
  }
  return true;
};
