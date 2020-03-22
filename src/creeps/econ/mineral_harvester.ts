// Mineral Harvester: Harvests minerals from pre-determined Extractor
Creep.prototype.harvestMineral = function () {
  let targetExtractor = null;
  let targetMineral = null;
  if (this.memory.targetExtractor !== undefined && this.memory.targetMineral !== undefined) {
    targetExtractor = Game.getObjectById(this.memory.targetExtractor);
    targetMineral = Game.getObjectById(this.memory.targetMineral);
  }
  if (targetExtractor != null && targetMineral != null) {
    if (this.pos.isNearTo(targetMineral)) {
      let mineralTaken = 0;
      if (this.harvest(targetMineral) == OK) {
        mineralTaken = Math.min(this.memory.numWorkParts * HARVEST_POWER, targetMineral.mineralAmount);
        // targetSource.energy -= energyTaken;
      }
      let curCarry = this.store[targetMineral.mineralType];
      curCarry = curCarry == null ? 0 : curCarry;
      if (curCarry + mineralTaken >= this.store.getCapacity(targetMineral.mineralType)) {
        return true;
      }
    } else {
      if (this.moveToI(targetMineral) != OK) {
        this.dismantleNearestWall();
      }
    }
  } else {
    console.log(`${this.name} error mineral`);
  }
  return false;
};
Creep.prototype.runMineralHarvester = function () {
  let targetExtractor = null;
  let targetMineral = null;
  if (this.memory.targetExtractor !== undefined && this.memory.targetMineral !== undefined) {
    targetExtractor = Game.getObjectById(this.memory.targetExtractor);
    targetMineral = Game.getObjectById(this.memory.targetMineral);
  }
  if (targetExtractor != null && targetMineral != null) {
    let target = null;
    target = targetExtractor.room.terminal;
    if (target != null) {
      if (this.pos.isNearTo(target)) {
        this.transfer(target, targetMineral.mineralType);
        return true;
      } else {
        this.moveToI(target);
      }
    }
  }
  return false;
};
