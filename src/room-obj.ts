RoomObject.prototype.tryRepair = function(mem) {
  let target = null;
  if (mem.repairTarget !== undefined) {
    target = Game.getObjectById<Structure>(mem.repairTarget);
  }
  // logic below to only repair things when they are 90% damaged
  // also cap hitpoints for walls since they have so many
  if (target != null) {
    let max = target.hitsMax;
    if (Array<StructureConstant>(STRUCTURE_WALL, STRUCTURE_RAMPART).includes(target.structureType)) {
      max = this.room == null ? target.hitsMax : Math.min(target.hitsMax, this.room.memory.wallsMax);
    }
    if (target.hits >= max) {
      delete mem.repairTarget;
      target = null;
    }
  }
  if (target == null) {
    target = this.pos.findNearestHurtStructure([STRUCTURE_RAMPART]);
    if (target == null) {
      target = this.pos.findNearestHurtStructure();
    }
    if (target != null) {
      mem.repairTarget = target.id;
    }
  }
  if (target != null) {
    this.doRepair(target);
  }
  return target;
};
RoomObject.prototype.findNearbyHostile = function() {
  return this.pos.findInRange(FIND_HOSTILE_CREEPS, 5);
};
RoomObject.prototype.isHostileNearby = function() {
  return !_.isEmpty(this.findNearbyHostile());
};
RoomObject.prototype.getEnergy = () => {
  console.log("get energy not implemented");
  return 0;
};
RoomObject.prototype.projectedEnergy = function() {
  if (this._projectedEnergy == null) {
    this._projectedEnergy = this.getEnergy();
  }
  return this._projectedEnergy;
};
RoomObject.prototype.giveEnergy = function(creep) {
  let maxPull = creep.store.getFreeCapacity(RESOURCE_ENERGY);
  if (this instanceof Source) {
    maxPull = creep.memory.numWorkParts * HARVEST_POWER;
  }
  let energyTaken = 0;
  if (this.doGiveEnergy(creep) == OK) {
    energyTaken = Math.min(maxPull, this.projectedEnergy());
    this._projectedEnergy = this.projectedEnergy() - energyTaken;
  }
  return energyTaken;
};
RoomObject.prototype.doGiveEnergy = () => {
  console.log("do give energy not implemented");
  return ERR_INVALID_TARGET;
};
